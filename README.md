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
---

## 💻 Parte 2: Il Frontend (React + TypeScript + Tailwind)

Per il mercato italiano, saper strutturare un frontend pulito e tipato in **TypeScript** fa un'enorme differenza. Non serve creare decine di pagine; bastano **due viste principali**:
1.  **Dashboard di Ingestione:** Un'area di caricamento drag-and-drop per i file `.txt` che mostra la lista dei documenti e lo stato di avanzamento del task di Celery.
2.  **Interfaccia Chat:** Una chat in stile ChatGPT per interrogare l'AI, completa di indicazione delle **fonti** utilizzate per generare la risposta.

Ecco lo scheletro della struttura delle cartelle per il tuo frontend (da mettere in una cartella parallela chiamata `frontend/`):

```text
frontend/
├── src/
│   ├── components/
│   │   ├── ChatWindow.tsx       # Finestra di chat con messaggi dell'utente e dell'AI
│   │   ├── DocumentUploader.tsx # Drag and drop per caricare i file
│   │   └── SourceBadge.tsx      # Mostra i chunk di testo usati come fonte
│   ├── services/
│   │   └── api.ts               # Chiamate Axios/Fetch verso http://localhost:8000
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── tailwind.config.js