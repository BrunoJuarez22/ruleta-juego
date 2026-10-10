# Dockerfile optimizado para Shiny Roulette en Fly.io
FROM node:22-alpine

WORKDIR /app

# Copiar manifiestos de paquetes e instalar dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copiar el código fuente completo
COPY . .

# Asegurar que el directorio de datos persistentes exista
RUN mkdir -p /app/data

# Puerto del servidor
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Arrancar el servidor Node.js
CMD ["npm", "start"]
