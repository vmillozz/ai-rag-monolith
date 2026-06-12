# Enterprise RAG AI Assistant (Microservices Architecture)

Questo progetto implementa una soluzione **SaaS B2B di Smart Search & Retrieval-Augmented Generation (RAG)** aziendale, progettata per consentire alle imprese di interrogare i propri documenti riservati in totale sicurezza, nel pieno rispetto del **GDPR**, grazie all'integrazione di modelli AI completamente locali.

## 🏗️ Architettura del Sistema
L'applicazione è stata migrata da un'architettura monolitica a una struttura a **microservizi disaccoppiati e asincroni** per garantire scalabilità e resilienza:

* **Core API (FastAPI):** Gestisce il traffico HTTP, l'autenticazione, le sessioni di chat AI e la ricerca semantica sul database.
* **Ingestion Worker (Celery + Redis):** Microservizio dedicato all'elaborazione pesante in background (chunking dei documenti e generazione degli embeddings tramite Ollama).
* **Vector Database (PostgreSQL + pgvector):** Unico database sia per i dati relazionali dell'applicazione sia per la memorizzazione dei vettori (768 dimensioni).
* **Local AI Engine (Ollama):** Esegue localmente i modelli `nomic-embed-text` (embeddings) e `llama3` (generazione risposte).

## 🚀 Tecnologie Utilizzate
* **Backend:** Python, FastAPI, SQLAlchemy
* **Asincronicità & Code:** Celery, Redis
* **Database:** PostgreSQL, pgvector
* **AI/LLM:** Ollama (Llama 3, Nomic Embed)
* **DevOps:** Docker, Docker Compose, GitHub Actions (CI/CD)

## 🛠️ Come Avviare il Progetto in Locale

### Prerequisiti
1. Docker e Docker Compose installati.
2. Ollama installato ed avviato sulla macchina host con i seguenti modelli scaricati:
   ```bash
   ollama pull nomic-embed-text
   ollama pull llama3