# 1. Usa un'immagine ufficiale di Python leggera
FROM python:3.11-slim

# 2. Imposta la cartella di lavoro all'interno del container
WORKDIR /app

# 3. Installa le dipendenze di sistema necessarie per compilare alcune librerie Python (come psycopg2)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 4. Copia il file dei requisiti e installa le librerie Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copia tutto il resto del codice sorgente nella cartella /app del container
COPY . .

# 6. Esponi la porta 8000 (quella su cui girerà FastAPI)
EXPOSE 8000

# 7. Comando per avviare l'applicazione dentro il container
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]