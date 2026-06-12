# 1. Usa un'immagine ufficiale di Python leggera
FROM python:3.11-slim

# 2. Imposta la cartella di lavoro interna al container
WORKDIR /app

# 3. Installa le dipendenze di sistema necessarie a Python per compilare pacchetti come psycopg2
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 4. Copia il requirements.txt che sta nella cartella principale (gestito dal contesto di build del docker-compose)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copia tutto il codice della cartella delle API nel container
COPY . .
WORKDIR /app/core_api

# 6. Esponi la porta di FastAPI
EXPOSE 8000

# 7. Comando per avviare il server web delle API
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]