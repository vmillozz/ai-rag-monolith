import os
import requests
from sqlalchemy.orm import Session
import models

OLLAMA_BASE = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_URL = f"{OLLAMA_BASE}/api/embeddings"
OLLAMA_CHAT_URL = f"{OLLAMA_BASE}/api/chat"

def get_ollama_embedding(text: str) -> list[float]:
    payload = {
        "model": "nomic-embed-text",
        "prompt": text
    }
    try:
        # Dentro docker userà http://host.docker.internal:11434
        response = requests.post(OLLAMA_URL, json=payload)
        response.raise_for_status()
        return response.json()["embedding"]
    except Exception as e:
        raise RuntimeError(f"Errore nella chiamata a Ollama (Embedding): {e}")

def search_similar_chunks(db: Session, query_vector: list[float], limit: int = 3):
    return db.query(models.DocumentChunk)\
        .order_by(models.DocumentChunk.embedding.l2_distance(query_vector))\
        .limit(limit)\
        .all()

def generate_ai_answer(context: str, question: str) -> str:
    system_prompt = (
        "Sei un assistente aziendale sicuro e preciso. Rispondi alla domanda dell'utente "
        "utilizzando ESCLUSIVAMENTE il contesto fornito. Se il contesto non contiene la risposta, "
        "di' chiaramente che non hai questa informazione nei documenti. Non inventare nulla."
    )
    
    user_content = f"CONTESTO:\n{context}\n\nDOMANDA:\n{question}"

    payload = {
        "model": "llama3",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ],
        "stream": False
    }

    try:
        response = requests.post(OLLAMA_CHAT_URL, json=payload)
        response.raise_for_status()
        return response.json()["message"]["content"]
    except Exception as e:
        raise RuntimeError(f"Errore durante la generazione della risposta AI: {e}")