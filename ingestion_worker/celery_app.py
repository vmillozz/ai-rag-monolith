import os
from celery import Celery

# Prendiamo l'indirizzo di Redis dalle variabili d'ambiente
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Inizializziamo Celery nominando il modulo 'tasks'
celery_app = Celery(
    "ingestion_tasks",
    broker=REDIS_URL,
    backend=REDIS_URL # Serve per memorizzare lo stato del task (es. SUCCESS, FAILED)
)

# Configurazione opzionale per evitare problemi di serializzazione con pgvector
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Europe/Rome",
    enable_utc=True,
)