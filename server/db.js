/**
 * db.js — Gestor de Base de Datos SQLite para Shiny Roulette
 * Utiliza 'node:sqlite' nativo de Node.js v22 con almacenamiento persistente en archivo.
 */

const fs = require('fs');
const path = require('path');

// Directorio y ruta de la base de datos
const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_PATH = path.join(DATA_DIR, 'shiny_roulette.db');

let db = null;

try {
  const { DatabaseSync } = require('node:sqlite');
  db = new DatabaseSync(DB_PATH);
  // Activar claves foráneas y modo WAL para alto rendimiento y concurrencia
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');
} catch (err) {
  console.error('[DB] Error al inicializar node:sqlite:', err);
  throw err;
}

// Inicialización del Esquema DDL
function initDatabaseSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL COLLATE NOCASE,
      email TEXT UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_captured (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      num_pal TEXT NOT NULL,
      num_nac TEXT,
      name TEXT NOT NULL,
      types TEXT,
      color TEXT,
      sprite TEXT,
      shiny_sprite TEXT,
      captured_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, num_pal)
    );

    CREATE TABLE IF NOT EXISTS user_pending (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      num_pal TEXT NOT NULL,
      num_nac TEXT,
      name TEXT NOT NULL,
      types TEXT,
      color TEXT,
      sprite TEXT,
      shiny_sprite TEXT,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, num_pal)
    );

    CREATE TABLE IF NOT EXISTS user_state (
      user_id INTEGER PRIMARY KEY,
      last_spin_pending TEXT DEFAULT '[]',
      theme_pref TEXT DEFAULT 'light',
      audio_pref INTEGER DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_captured_user ON user_captured(user_id);
    CREATE INDEX IF NOT EXISTS idx_pending_user ON user_pending(user_id);
  `);
}

initDatabaseSchema();

// Métodos de Usuario
const userRepo = {
  findByUsername(username) {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username) || null;
  },

  findByEmail(email) {
    if (!email) return null;
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) || null;
  },

  findById(id) {
    const stmt = db.prepare('SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?');
    return stmt.get(id) || null;
  },

  create({ username, email, passwordHash }) {
    const stmt = db.prepare(`
      INSERT INTO users (username, email, password_hash)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(username, email || null, passwordHash);
    const userId = Number(result.lastInsertRowid);

    // Inicializar estado por defecto
    const stateStmt = db.prepare(`
      INSERT INTO user_state (user_id, last_spin_pending, theme_pref, audio_pref)
      VALUES (?, '[]', 'light', 1)
    `);
    stateStmt.run(userId);

    return this.findById(userId);
  }
};

// Métodos de Progreso y Datos Shiny
const progressRepo = {
  getCaptured(userId) {
    const stmt = db.prepare(`
      SELECT num_pal AS numPal, num_nac AS numNac, name, types, color, sprite, shiny_sprite AS shinySprite, captured_at AS capturedAt
      FROM user_captured
      WHERE user_id = ?
      ORDER BY id ASC
    `);
    const rows = stmt.all(userId);
    return rows.map(r => ({
      ...r,
      types: r.types ? JSON.parse(r.types) : []
    }));
  },

  getPending(userId) {
    const stmt = db.prepare(`
      SELECT num_pal AS numPal, num_nac AS numNac, name, types, color, sprite, shiny_sprite AS shinySprite, added_at AS addedAt
      FROM user_pending
      WHERE user_id = ?
      ORDER BY id ASC
    `);
    const rows = stmt.all(userId);
    return rows.map(r => ({
      ...r,
      types: r.types ? JSON.parse(r.types) : []
    }));
  },

  getState(userId) {
    const stmt = db.prepare('SELECT last_spin_pending, theme_pref, audio_pref FROM user_state WHERE user_id = ?');
    const row = stmt.get(userId);
    if (!row) {
      return { lastSpinPending: [], theme: 'light', audio: true };
    }
    let lastSpinPending = [];
    try {
      lastSpinPending = JSON.parse(row.last_spin_pending || '[]');
    } catch {
      lastSpinPending = [];
    }
    return {
      lastSpinPending,
      theme: row.theme_pref || 'light',
      audio: Boolean(row.audio_pref)
    };
  },

  saveState(userId, { lastSpinPending, theme, audio }) {
    const existing = db.prepare('SELECT user_id FROM user_state WHERE user_id = ?').get(userId);
    const lastSpinStr = JSON.stringify(lastSpinPending || []);
    const themeVal = theme || 'light';
    const audioVal = audio === false ? 0 : 1;

    if (existing) {
      const stmt = db.prepare(`
        UPDATE user_state
        SET last_spin_pending = ?, theme_pref = ?, audio_pref = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `);
      stmt.run(lastSpinStr, themeVal, audioVal, userId);
    } else {
      const stmt = db.prepare(`
        INSERT INTO user_state (user_id, last_spin_pending, theme_pref, audio_pref)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run(userId, lastSpinStr, themeVal, audioVal);
    }
  },

  addCaptured(userId, pokemonList) {
    if (!Array.isArray(pokemonList) || pokemonList.length === 0) return;

    const insertCap = db.prepare(`
      INSERT INTO user_captured (user_id, num_pal, num_nac, name, types, color, sprite, shiny_sprite, captured_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, num_pal) DO UPDATE SET
        captured_at = excluded.captured_at
    `);

    const removePend = db.prepare(`
      DELETE FROM user_pending WHERE user_id = ? AND num_pal = ?
    `);

    for (const poke of pokemonList) {
      const typesStr = JSON.stringify(poke.types || []);
      const capturedAt = poke.capturedAt || new Date().toISOString();
      insertCap.run(
        userId,
        poke.numPal,
        poke.numNac || '',
        poke.name,
        typesStr,
        poke.color || '',
        poke.sprite || '',
        poke.shinySprite || '',
        capturedAt
      );
      // Regla de negocio: al ser capturado se retira de pendientes
      removePend.run(userId, poke.numPal);
    }
  },

  removeCaptured(userId, numPal) {
    const stmt = db.prepare('DELETE FROM user_captured WHERE user_id = ? AND num_pal = ?');
    stmt.run(userId, numPal);
  },

  addPending(userId, pokemonList) {
    if (!Array.isArray(pokemonList) || pokemonList.length === 0) return;

    // Solo agregar a pendientes si no está ya capturado
    const isCaptured = db.prepare('SELECT 1 FROM user_captured WHERE user_id = ? AND num_pal = ?');
    const insertPend = db.prepare(`
      INSERT INTO user_pending (user_id, num_pal, num_nac, name, types, color, sprite, shiny_sprite, added_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, num_pal) DO NOTHING
    `);

    for (const poke of pokemonList) {
      if (!isCaptured.get(userId, poke.numPal)) {
        const typesStr = JSON.stringify(poke.types || []);
        const addedAt = poke.addedAt || new Date().toISOString();
        insertPend.run(
          userId,
          poke.numPal,
          poke.numNac || '',
          poke.name,
          typesStr,
          poke.color || '',
          poke.sprite || '',
          poke.shinySprite || '',
          addedAt
        );
      }
    }
  },

  removePending(userId, numPal) {
    const stmt = db.prepare('DELETE FROM user_pending WHERE user_id = ? AND num_pal = ?');
    stmt.run(userId, numPal);
  },

  merge(userId, { captured = [], pending = [], lastSpinPending = [], theme, audio }) {
    // 1. Fusionar capturados
    if (captured && captured.length > 0) {
      this.addCaptured(userId, captured);
    }

    // 2. Fusionar pendientes
    if (pending && pending.length > 0) {
      this.addPending(userId, pending);
    }

    // 3. Actualizar estado
    this.saveState(userId, { lastSpinPending, theme, audio });

    // Devolver estado final consolidado
    return {
      captured: this.getCaptured(userId),
      pending: this.getPending(userId),
      ...this.getState(userId)
    };
  }
};

module.exports = {
  db,
  userRepo,
  progressRepo
};
