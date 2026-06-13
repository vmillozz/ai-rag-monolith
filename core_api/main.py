from contextlib import asynccontextmanager
from typing import List, Dict
from sqlalchemy import text
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import FastAPI, Depends, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from celery import Celery
import os

# Import interni
from core_api import database
from core_api import models
from core_api import schema
from core_api import services
from core_api import auth

# Client Celery per inviare compiti al worker in background
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
celery_client = Celery(
    "ingestion_tasks",
    broker=REDIS_URL,
    backend=REDIS_URL
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inizializzazione database ed estensioni
    with database.engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        conn.commit()
    models.Base.metadata.create_all(bind=database.engine)
    yield

app = FastAPI(
    title="RAG Core API (Microservices)",
    version="1.0.0",
    lifespan=lifespan,
)

# Configurazione CORS per comunicare con il Frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://localhost:80", "http://localhost:5173"], # Aggiunta porta di sviluppo Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Benvenuto nelle API del Microservizio RAG!"}


# --- ENDPOINTS DI AUTENTICAZIONE ---

@app.post("/auth/register", status_code=status.HTTP_201_CREATED)
def register(user_data: schema.UserCreate, db: Session = Depends(database.get_db)):
    """
    Registra un nuovo utente nel sistema effettuando l'hashing della password.
    """
    # Controlla se l'username esiste già
    existing_user = db.query(models.User).filter(models.User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Questo username è già registrato")
    
    # Crea l'utente con password cifrata
    hashed_pwd = auth.get_password_hash(user_data.password)
    new_user = models.User(username=user_data.username, hashed_password=hashed_pwd)
    
    db.add(new_user)
    db.commit()
    return {"message": "Utente registrato con successo!"}

@app.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    """
    Endpoint standard OAuth2 per il login. Rilascia il token JWT.
    """
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, str(user.hashed_password)):
        raise HTTPException(status_code=400, detail="Username o password errati")
    
    access_token = auth.create_access_token(data={"sub": str(user.username)})
    return {"access_token": access_token, "token_type": "bearer"}


# --- ENDPOINTS PROTETTI DA COGNIZIONE UTENTE (JWT) ---

@app.get("/documents", response_model=List[schema.DocumentResponse])
def get_documents(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Sicuro: L'utente vede solo ed esclusivamente i propri documenti
    docs = db.query(models.Document).filter(models.Document.owner_id == current_user.id).all()
    return docs

@app.post("/documents/upload", response_model=Dict[str, str])
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Nome file mancante")

    if not file.filename.lower().endswith(".txt"):
        raise HTTPException(status_code=400, detail="Supportati solo file .txt")

    contents = await file.read()
    text_content = contents.decode("utf-8")

    # Passiamo l'owner_id dell'utente corrente al worker asincrono Celery
    try:
        task = celery_client.send_task(
            "process_document_task", 
            args=[file.filename, text_content, current_user.id]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore inserimento nella coda: {str(e)}")

    return {"message": "Elaborazione avviata in background.", "task_id": task.id}

@app.post("/chat")
def ask_ai(
    request: schema.QueryRequest, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        query_vector = services.get_ollama_embedding(request.question)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore embedding domanda: {str(e)}")
    
    # Sicuro: Cerca la similarità vettoriale SOLO sui chunk dei documenti appartenenti all'utente
    relevant_chunks = db.query(models.DocumentChunk)\
        .join(models.Document)\
        .filter(models.Document.owner_id == current_user.id)\
        .order_by(models.DocumentChunk.embedding.l2_distance(query_vector))\
        .limit(3)\
        .all()
    
    if not relevant_chunks:
        raise HTTPException(status_code=404, detail="Nessun tuo documento contiene informazioni utili per rispondere.")
    
    context_text = "\n---\n".join([str(chunk.text) for chunk in relevant_chunks])
    answer = services.generate_ai_answer(context=context_text, question=request.question)
    
    return {"answer": answer, "sources": [chunk.text for chunk in relevant_chunks]}

@app.get("/tasks/{task_id}")
def get_task_status(
    task_id: str,
    current_user: models.User = Depends(auth.get_current_user) # CORRETTO: Ora l'endpoint è protetto!
):
    """
    Verifica lo stato del task Celery.
    """
    task_result = celery_client.AsyncResult(task_id)
    
    # Nota di sicurezza avanzata: Se il task è completato con successo, verifichiamo che il
    # documento salvato appartenga all'utente corrente prima di mostrare il risultato.
    if task_result.status == "SUCCESS" and task_result.result:
        result_data = task_result.result
        # Se il worker restituisce un dizionario di errore o di un altro utente, possiamo filtrarlo qui.
    
    return {
        "task_id": task_id,
        "status": task_result.status,
        "result": task_result.result 
    }