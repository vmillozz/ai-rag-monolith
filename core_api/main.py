from contextlib import asynccontextmanager
from typing import List, Dict
from sqlalchemy import text

from fastapi import FastAPI, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session
from core_api import database
from core_api import models
from core_api import schema
from core_api import services
from celery import Celery
import os
from fastapi.middleware.cors import CORSMiddleware
# Client Celery per inviare compiti al worker in background
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

celery_client = Celery(
    "ingestion_tasks",
    broker=REDIS_URL,
    backend=REDIS_URL  # ← mancava questo
)


@asynccontextmanager
async def lifespan(app: FastAPI):

    with database.engine.connect() as conn:
        conn.execute(
            text("CREATE EXTENSION IF NOT EXISTS vector")
        )
        conn.commit()

    models.Base.metadata.create_all(
        bind=database.engine
    )

    yield

app = FastAPI(
    title="RAG Core API (Microservices)",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://localhost:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def read_root():
    return {"message": "Benvenuto nelle API del Microservizio RAG!"}

@app.get("/documents", response_model=List[schema.DocumentResponse])
def get_documents(db: Session = Depends(database.get_db)):
    docs = db.query(models.Document).all()
    return docs

# CORRETTO: Cambiato il response_model perché l'elaborazione è asincrona
@app.post("/documents/upload", response_model=Dict[str, str])
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db) # Non strettamente necessario qui se non salvi sul momento, ma utile se vuoi validare duplicati
):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Nome file mancante"
        )

    if not file.filename.lower().endswith(".txt"):
        raise HTTPException(
            status_code=400,
            detail="Al momento sono supportati solo file .txt"
        )

    contents = await file.read()
    text_content = contents.decode("utf-8")

    # CORREZIONE CORE: Spediamo il compito a Celery su Redis.
    # Il Worker (ingestion_worker) eseguirà la funzione reale nel suo container.
    try:
        task = celery_client.send_task(
            "process_document_task", 
            args=[file.filename, text_content]
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Errore nell'invio del file alla coda di elaborazione: {str(e)}"
        )

    return {
        "message": "File ricevuto correttamente. Elaborazione in background avviata.",
        "task_id": task.id
    }

@app.post("/chat")
def ask_ai(request: schema.QueryRequest, db: Session = Depends(database.get_db)):
    try:
        query_vector = services.get_ollama_embedding(request.question)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore embedding domanda: {str(e)}")
    
    relevant_chunks = services.search_similar_chunks(db, query_vector, limit=3)
    
    if not relevant_chunks:
        raise HTTPException(status_code=404, detail="Nessun documento trovato nel database per rispondere.")
    
    context_text = "\n---\n".join([str(chunk.text) for chunk in relevant_chunks])
    
    try:
        answer = services.generate_ai_answer(context=context_text, question=request.question)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore generazione AI: {str(e)}")
    
    return {
        "answer": answer,
        "sources": [chunk.text for chunk in relevant_chunks]
    }
@app.get("/tasks/{task_id}")
def get_task_status(task_id: str):
    task_result = celery_client.AsyncResult(task_id)
    return {
        "task_id": task_id,
        "status": task_result.status, # PENDING, SUCCESS, FAILURE
        "result": task_result.result  # Ritorna il dizionario di successo o l'errore
    }