# STAGE 1: Compilazione del codice React
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamo solo i file dei pacchetti per sfruttare la cache di Docker
COPY package*.json ./
RUN npm install

# Copiamo tutto il resto del codice ed eseguiamo la build
COPY . .
RUN npm run build

# STAGE 2: Server Nginx per servire i file statici
FROM nginx:1.25-alpine

# Copiamo i file compilati dallo STAGE 1 (builder) nella cartella pubblica di Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiamo una configurazione personalizzata di Nginx per gestire il routing di React
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]