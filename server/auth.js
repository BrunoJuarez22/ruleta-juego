/**
 * auth.js — Middleware de Autenticación JWT y utilidades de Tokens
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'shiny-roulette-jwt-secret-paldea-2026';
const TOKEN_EXPIRY = '30d';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token de autenticación no proporcionado. Inicia sesión.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Sesión expirada o token inválido. Vuelve a iniciar sesión.'
      });
    }
    req.user = decoded;
    next();
  });
}

module.exports = {
  generateToken,
  authenticateToken,
  JWT_SECRET
};
