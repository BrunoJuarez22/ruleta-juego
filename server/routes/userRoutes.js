/**
 * userRoutes.js — Rutas de Datos y Progreso de Usuario (Capturados, Pendientes, Estado)
 */

const express = require('express');
const { progressRepo } = require('../db');
const { authenticateToken } = require('../auth');

const router = express.Router();

// Todas las rutas de usuario requieren autenticación
router.use(authenticateToken);

// Obtener progreso completo del usuario
router.get('/progress', (req, res) => {
  try {
    const userId = req.user.id;
    const captured = progressRepo.getCaptured(userId);
    const pending = progressRepo.getPending(userId);
    const state = progressRepo.getState(userId);

    return res.json({
      success: true,
      data: {
        captured,
        pending,
        lastSpinPending: state.lastSpinPending,
        theme: state.theme,
        audio: state.audio
      }
    });
  } catch (err) {
    console.error('[USER] Error al obtener progreso:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno al consultar el progreso del usuario.'
    });
  }
});

// Sincronizar / Fusionar datos locales con la nube
router.post('/sync', (req, res) => {
  try {
    const userId = req.user.id;
    const { captured = [], pending = [], lastSpinPending = [], theme, audio } = req.body;

    const consolidated = progressRepo.merge(userId, {
      captured,
      pending,
      lastSpinPending,
      theme,
      audio
    });

    return res.json({
      success: true,
      message: 'Progreso sincronizado con la nube exitosamente.',
      data: consolidated
    });
  } catch (err) {
    console.error('[USER] Error al sincronizar progreso:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno al sincronizar el progreso.'
    });
  }
});

// Registrar captura Shiny (individual o lote de línea evolutiva)
router.post('/capture', (req, res) => {
  try {
    const userId = req.user.id;
    const { pokemon } = req.body;

    const list = Array.isArray(pokemon) ? pokemon : [pokemon];
    progressRepo.addCaptured(userId, list);

    return res.json({
      success: true,
      message: 'Pokémon registrado como capturado en la nube.',
      captured: progressRepo.getCaptured(userId),
      pending: progressRepo.getPending(userId)
    });
  } catch (err) {
    console.error('[USER] Error al registrar captura:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno al registrar la captura.'
    });
  }
});

// Desmarcar captura Shiny (regresar a no capturado)
router.post('/uncapture', (req, res) => {
  try {
    const userId = req.user.id;
    const { numPal } = req.body;

    if (!numPal) {
      return res.status(400).json({ success: false, error: 'numPal es requerido.' });
    }

    progressRepo.removeCaptured(userId, numPal);

    return res.json({
      success: true,
      message: 'Captura eliminada de la nube.',
      captured: progressRepo.getCaptured(userId)
    });
  } catch (err) {
    console.error('[USER] Error al eliminar captura:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno al eliminar la captura.'
    });
  }
});

// Agregar a pendientes (individual o lote)
router.post('/pending', (req, res) => {
  try {
    const userId = req.user.id;
    const { pokemon, lastSpinPending } = req.body;

    if (pokemon) {
      const list = Array.isArray(pokemon) ? pokemon : [pokemon];
      progressRepo.addPending(userId, list);
    }

    if (lastSpinPending !== undefined) {
      const state = progressRepo.getState(userId);
      progressRepo.saveState(userId, {
        lastSpinPending,
        theme: state.theme,
        audio: state.audio
      });
    }

    return res.json({
      success: true,
      pending: progressRepo.getPending(userId),
      state: progressRepo.getState(userId)
    });
  } catch (err) {
    console.error('[USER] Error al actualizar pendientes:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno al actualizar pendientes.'
    });
  }
});

// Eliminar de pendientes
router.post('/remove-pending', (req, res) => {
  try {
    const userId = req.user.id;
    const { numPal } = req.body;

    if (!numPal) {
      return res.status(400).json({ success: false, error: 'numPal es requerido.' });
    }

    progressRepo.removePending(userId, numPal);

    return res.json({
      success: true,
      pending: progressRepo.getPending(userId)
    });
  } catch (err) {
    console.error('[USER] Error al eliminar pendiente:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno al eliminar el pendiente.'
    });
  }
});

// Actualizar estado general (último giro, preferencias)
router.post('/state', (req, res) => {
  try {
    const userId = req.user.id;
    const { lastSpinPending, theme, audio } = req.body;

    progressRepo.saveState(userId, { lastSpinPending, theme, audio });

    return res.json({
      success: true,
      state: progressRepo.getState(userId)
    });
  } catch (err) {
    console.error('[USER] Error al guardar estado:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno al actualizar el estado.'
    });
  }
});

module.exports = router;
