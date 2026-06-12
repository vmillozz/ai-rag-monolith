# 1. Stessa immagine Python stabile e leggera
FROM python:3.11-slim

# 2. Imposta la cartella di lavoro interna
WORKDIR /app

# 3. Installa le dipendenze di sistema identiche per il database
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 4. Installa le librerie Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copia tutto il codice del worker nel container
COPY ./ingestion_worker .

# 6. Comando per avviare il Worker di Celery (ascolta l'app definita in celery_app.py)
# Nota: Usiamo --loglevel=info per vedere i log di quando elabora i PDF/TXT nel terminale
CMD ["celery", "-A", "celery_app.celery_app", "worker", "--loglevel=info"]