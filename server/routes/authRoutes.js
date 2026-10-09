/**
 * authRoutes.js — Rutas de Autenticación (Registro, Login, Sesión actual)
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { userRepo } = require('../db');
const { generateToken, authenticateToken } = require('../auth');

const router = express.Router();

// Registro de Usuario
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validaciones
    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'El nombre de usuario debe tener al menos 3 caracteres.'
      });
    }

    const cleanUsername = username.trim();
    if (!/^[a-zA-Z0-9_\-\.]+$/.test(cleanUsername)) {
      return res.status(400).json({
        success: false,
        error: 'El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos.'
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres.'
      });
    }

    const cleanEmail = email && typeof email === 'string' && email.trim() ? email.trim() : null;

    // Comprobar si el usuario ya existe
    const existingUser = userRepo.findByUsername(cleanUsername);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'El nombre de usuario ya está registrado. Por favor elige otro o inicia sesión.'
      });
    }

    if (cleanEmail) {
      const existingEmail = userRepo.findByEmail(cleanEmail);
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          error: 'El correo electrónico ya está registrado con otra cuenta.'
        });
      }
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear en base de datos
    const newUser = userRepo.create({
      username: cleanUsername,
      email: cleanEmail,
      passwordHash
    });

    // Generar token JWT
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Cuenta creada exitosamente.',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.created_at
      }
    });
  } catch (err) {
    console.error('[AUTH] Error en registro:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor al crear la cuenta.'
    });
  }
});

// Inicio de Sesión
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Debes ingresar tu usuario/correo y contraseña.'
      });
    }

    const cleanIdentifier = identifier.trim();

    // Buscar por username o por email
    let user = userRepo.findByUsername(cleanIdentifier);
    if (!user && cleanIdentifier.includes('@')) {
      user = userRepo.findByEmail(cleanIdentifier);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario o contraseña incorrectos.'
      });
    }

    // Comparar contraseña cifrada
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Usuario o contraseña incorrectos.'
      });
    }

    // Generar token
    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Inicio de sesión correcto.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    console.error('[AUTH] Error en login:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor al iniciar sesión.'
    });
  }
});

// Obtener datos del usuario actual
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = userRepo.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado.'
      });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    console.error('[AUTH] Error en /me:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor.'
    });
  }
});

module.exports = router;
