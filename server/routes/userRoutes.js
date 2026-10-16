/**
 * userRoutes.js — Rutas de Datos y Progreso de Usuario (Capturados, Pendientes, Estado)
 */

const express = require('express');
const { progressRepo } = require('../db');
const { authenticateToken } = require('../auth');

const router = express.Router();

// Todas las rutas de usuario requieren autenticación
router.use(authenticateToken);

// Obtener progreso completo del usuario para un dex específico
router.get('/progress', (req, res) => {
  try {
    const userId = req.user.id;
    const dexId = req.query.dex || req.query.dexId || 'paldea';
    const captured = progressRepo.getCaptured(userId, dexId);
    const pending = progressRepo.getPending(userId, dexId);
    const state = progressRepo.getState(userId, dexId);

    return res.json({
      success: true,
      data: {
        dexId,
        captured,
        pending,
        lastSpinPending: state.lastSpinPending,
        currentDex: state.currentDex,
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

// Sincronizar / Fusionar datos locales con la nube para un dex específico
router.post('/sync', (req, res) => {
  try {
    const userId = req.user.id;
    const { dexId = 'paldea', captured = [], pending = [], lastSpinPending = [], theme, audio, currentDex } = req.body;

    const consolidated = progressRepo.merge(userId, {
      dexId,
      captured,
      pending,
      lastSpinPending,
      theme,
      audio,
      currentDex
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

// Registrar captura Shiny (individual o lote de línea evolutiva) en el dex activo
router.post('/capture', (req, res) => {
  try {
    const userId = req.user.id;
    const { dexId = 'paldea', pokemon } = req.body;

    const list = Array.isArray(pokemon) ? pokemon : [pokemon];
    progressRepo.addCaptured(userId, list, dexId);

    return res.json({
      success: true,
      message: 'Pokémon registrado como capturado en la nube.',
      dexId,
      captured: progressRepo.getCaptured(userId, dexId),
      pending: progressRepo.getPending(userId, dexId)
    });
  } catch (err) {
    console.error('[USER] Error al registrar captura:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno al registrar la captura.'
    });
  }
});

// Desmarcar captura Shiny (regresar a no capturado) en el dex activo
router.post('/uncapture', (req, res) => {
  try {
    const userId = req.user.id;
    const { dexId = 'paldea', numPal, pokemonId } = req.body;
    const targetId = pokemonId || numPal;

    if (!targetId) {
      return res.status(400).json({ success: false, error: 'pokemonId o numPal es requerido.' });
    }

    progressRepo.removeCaptured(userId, targetId, dexId);

    return res.json({
      success: true,
      message: 'Captura eliminada de la nube.',
      dexId,
      captured: progressRepo.getCaptured(userId, dexId)
    });
  } catch (err) {
    console.error('[USER] Error al eliminar captura:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno al eliminar la captura.'
    });
  }
});

// Agregar a pendientes (individual o lote) en el dex activo
router.post('/pending', (req, res) => {
  try {
    const userId = req.user.id;
    const { dexId = 'paldea', pokemon, lastSpinPending } = req.body;

    if (pokemon) {
      const list = Array.isArray(pokemon) ? pokemon : [pokemon];
      progressRepo.addPending(userId, list, dexId);
    }

    if (lastSpinPending !== undefined) {
      const state = progressRepo.getState(userId, dexId);
      progressRepo.saveState(userId, {
        dexId,
        lastSpinPending,
        theme: state.theme,
        audio: state.audio,
        currentDex: state.currentDex
      });
    }

    return res.json({
      success: true,
      dexId,
      pending: progressRepo.getPending(userId, dexId),
      state: progressRepo.getState(userId, dexId)
    });
  } catch (err) {
    console.error('[USER] Error al actualizar pendientes:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno al actualizar pendientes.'
    });
  }
});

// Eliminar de pendientes en el dex activo
router.post('/remove-pending', (req, res) => {
  try {
    const userId = req.user.id;
    const { dexId = 'paldea', numPal, pokemonId } = req.body;
    const targetId = pokemonId || numPal;

    if (!targetId) {
      return res.status(400).json({ success: false, error: 'pokemonId o numPal es requerido.' });
    }

    progressRepo.removePending(userId, targetId, dexId);

    return res.json({
      success: true,
      dexId,
      pending: progressRepo.getPending(userId, dexId)
    });
  } catch (err) {
    console.error('[USER] Error al eliminar pendiente:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno al eliminar el pendiente.'
    });
  }
});

// Actualizar estado general (último giro, preferencias) para un dex específico
router.post('/state', (req, res) => {
  try {
    const userId = req.user.id;
    const { dexId = 'paldea', lastSpinPending, theme, audio, currentDex } = req.body;

    progressRepo.saveState(userId, { dexId, lastSpinPending, theme, audio, currentDex });

    return res.json({
      success: true,
      dexId,
      state: progressRepo.getState(userId, dexId)
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
