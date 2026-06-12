import os
import requests
from database import SessionLocal
import models
from celery_app import celery_app # La configurazione di Celery fatta nei passaggi precedenti

OLLAMA_BASE = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_URL = f"{OLLAMA_BASE}/api/embeddings"

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 100) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks

def get_ollama_embedding(text: str) -> list[float]:
    payload = {
        "model": "nomic-embed-text",
        "prompt": text
    }
    response = requests.post(OLLAMA_URL, json=payload)
    response.raise_for_status()
    return response.json()["embedding"]

# Questo è il task effettivo che viene chiamato asincronamente tramite Redis
@celery_app.task(name="process_document_task")
def process_document_task(filename: str, content: str):
    db = SessionLocal()
    try:
        # 1. Salva il documento principale
        db_doc = models.Document(filename=filename, content=content)
        db.add(db_doc)
        db.commit()
        db.refresh(db_doc)

        # 2. Divide in pezzi
        text_chunks = chunk_text(content)

        # 3. Genera embeddings e salva i chunks
        for chunk_content in text_chunks:
            embedding_vector = get_ollama_embedding(chunk_content)
            db_chunk = models.DocumentChunk(
                document_id=db_doc.id,
                text=chunk_content,
                embedding=embedding_vector
            )
            db.add(db_chunk)
        
        db.commit()
        return {"status": "success", "document_id": db_doc.id}
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        db.close()