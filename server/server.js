/**
 * server.js — Servidor REST API y Servidor Estático para Shiny Roulette
 * Arquitectura: Node.js + Express + SQLite (node:sqlite) + JWT
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS amplia para permitir tanto orígenes locales como hosting remoto
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parser de cuerpo JSON
app.use(express.json({ limit: '10mb' }));

// Rutas de la API REST
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Verificación de estado / Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Shiny Roulette Server',
    database: 'SQLite (node:sqlite)',
    timestamp: new Date().toISOString()
  });
});

// Servir archivos estáticos del juego desde el directorio raíz
const ROOT_DIR = path.join(__dirname, '..');
app.use(express.static(ROOT_DIR));

// Ruta fallback para el juego web (compatible con Express 5)
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Ruta de API no encontrada.' });
  }
  res.sendFile(path.join(ROOT_DIR, 'index.html'));
});

// Iniciar servidor
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[SHINY ROULETTE] Servidor iniciado con éxito.`);
    console.log(`[SHINY ROULETTE] URL del juego: http://localhost:${PORT}`);
    console.log(`[SHINY ROULETTE] API REST: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
