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

// Inicialización del Esquema DDL con soporte multi-dex / multi-juego
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

    CREATE TABLE IF NOT EXISTS user_state (
      user_id INTEGER PRIMARY KEY,
      current_dex TEXT DEFAULT 'paldea',
      last_spin_pending TEXT DEFAULT '[]',
      theme_pref TEXT DEFAULT 'light',
      audio_pref INTEGER DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_dex_state (
      user_id INTEGER NOT NULL,
      dex_id TEXT NOT NULL DEFAULT 'paldea',
      last_spin_pending TEXT DEFAULT '[]',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(user_id, dex_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Migración o creación de user_captured con contexto dex_id y pokemon_id
  const capturedCols = db.prepare("PRAGMA table_info(user_captured)").all();
  if (capturedCols.length === 0) {
    db.exec(`
      CREATE TABLE user_captured (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        dex_id TEXT NOT NULL DEFAULT 'paldea',
        pokemon_id TEXT NOT NULL,
        num_pal TEXT,
        num_nac TEXT,
        name TEXT NOT NULL,
        types TEXT,
        color TEXT,
        sprite TEXT,
        shiny_sprite TEXT,
        captured_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, dex_id, pokemon_id)
      );
    `);
  } else if (!capturedCols.some(c => c.name === 'dex_id')) {
    db.exec(`
      ALTER TABLE user_captured RENAME TO user_captured_old;
      CREATE TABLE user_captured (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        dex_id TEXT NOT NULL DEFAULT 'paldea',
        pokemon_id TEXT NOT NULL,
        num_pal TEXT,
        num_nac TEXT,
        name TEXT NOT NULL,
        types TEXT,
        color TEXT,
        sprite TEXT,
        shiny_sprite TEXT,
        captured_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, dex_id, pokemon_id)
      );
      INSERT INTO user_captured (id, user_id, dex_id, pokemon_id, num_pal, num_nac, name, types, color, sprite, shiny_sprite, captured_at)
      SELECT id, user_id, 'paldea', num_pal, num_pal, num_nac, name, types, color, sprite, shiny_sprite, captured_at
      FROM user_captured_old;
      DROP TABLE user_captured_old;
    `);
  }

  // Migración o creación de user_pending con contexto dex_id y pokemon_id
  const pendingCols = db.prepare("PRAGMA table_info(user_pending)").all();
  if (pendingCols.length === 0) {
    db.exec(`
      CREATE TABLE user_pending (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        dex_id TEXT NOT NULL DEFAULT 'paldea',
        pokemon_id TEXT NOT NULL,
        num_pal TEXT,
        num_nac TEXT,
        name TEXT NOT NULL,
        types TEXT,
        color TEXT,
        sprite TEXT,
        shiny_sprite TEXT,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, dex_id, pokemon_id)
      );
    `);
  } else if (!pendingCols.some(c => c.name === 'dex_id')) {
    db.exec(`
      ALTER TABLE user_pending RENAME TO user_pending_old;
      CREATE TABLE user_pending (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        dex_id TEXT NOT NULL DEFAULT 'paldea',
        pokemon_id TEXT NOT NULL,
        num_pal TEXT,
        num_nac TEXT,
        name TEXT NOT NULL,
        types TEXT,
        color TEXT,
        sprite TEXT,
        shiny_sprite TEXT,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, dex_id, pokemon_id)
      );
      INSERT INTO user_pending (id, user_id, dex_id, pokemon_id, num_pal, num_nac, name, types, color, sprite, shiny_sprite, added_at)
      SELECT id, user_id, 'paldea', num_pal, num_pal, num_nac, name, types, color, sprite, shiny_sprite, added_at
      FROM user_pending_old;
      DROP TABLE user_pending_old;
    `);
  }

  // Comprobar columna current_dex en user_state
  const stateCols = db.prepare("PRAGMA table_info(user_state)").all();
  if (stateCols.length > 0 && !stateCols.some(c => c.name === 'current_dex')) {
    try {
      db.exec("ALTER TABLE user_state ADD COLUMN current_dex TEXT DEFAULT 'paldea';");
    } catch {}
  }

  // Poblar user_dex_state con datos preexistentes si procede
  try {
    db.exec(`
      INSERT OR IGNORE INTO user_dex_state (user_id, dex_id, last_spin_pending, updated_at)
      SELECT user_id, 'paldea', last_spin_pending, updated_at FROM user_state;
    `);
  } catch {}

  // Índices para consultas de alta velocidad aisladas por dex_id
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_captured_user_dex ON user_captured(user_id, dex_id);
    CREATE INDEX IF NOT EXISTS idx_pending_user_dex ON user_pending(user_id, dex_id);
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
      INSERT INTO user_state (user_id, current_dex, last_spin_pending, theme_pref, audio_pref)
      VALUES (?, 'paldea', '[]', 'light', 1)
    `);
    stateStmt.run(userId);

    const dexStmt = db.prepare(`
      INSERT INTO user_dex_state (user_id, dex_id, last_spin_pending)
      VALUES (?, 'paldea', '[]')
    `);
    dexStmt.run(userId);

    return this.findById(userId);
  }
};

// Métodos de Progreso y Datos Shiny (Aislados por dex_id)
const progressRepo = {
  getCaptured(userId, dexId = 'paldea') {
    const stmt = db.prepare(`
      SELECT pokemon_id AS pokemonId, num_pal AS numPal, num_nac AS numNac, name, types, color, sprite, shiny_sprite AS shinySprite, captured_at AS capturedAt
      FROM user_captured
      WHERE user_id = ? AND dex_id = ?
      ORDER BY id ASC
    `);
    const rows = stmt.all(userId, dexId);
    return rows.map(r => ({
      ...r,
      types: r.types ? JSON.parse(r.types) : []
    }));
  },

  getPending(userId, dexId = 'paldea') {
    const stmt = db.prepare(`
      SELECT pokemon_id AS pokemonId, num_pal AS numPal, num_nac AS numNac, name, types, color, sprite, shiny_sprite AS shinySprite, added_at AS addedAt
      FROM user_pending
      WHERE user_id = ? AND dex_id = ?
      ORDER BY id ASC
    `);
    const rows = stmt.all(userId, dexId);
    return rows.map(r => ({
      ...r,
      types: r.types ? JSON.parse(r.types) : []
    }));
  },

  getState(userId, dexId = 'paldea') {
    const userState = db.prepare('SELECT current_dex, theme_pref, audio_pref FROM user_state WHERE user_id = ?').get(userId);
    const dexRow = db.prepare('SELECT last_spin_pending FROM user_dex_state WHERE user_id = ? AND dex_id = ?').get(userId, dexId);

    let lastSpinPending = [];
    if (dexRow && dexRow.last_spin_pending) {
      try {
        lastSpinPending = JSON.parse(dexRow.last_spin_pending);
      } catch {
        lastSpinPending = [];
      }
    }

    return {
      dexId,
      lastSpinPending,
      currentDex: (userState && userState.current_dex) ? userState.current_dex : dexId,
      theme: (userState && userState.theme_pref) ? userState.theme_pref : 'light',
      audio: (userState && userState.audio_pref !== undefined) ? Boolean(userState.audio_pref) : true
    };
  },

  saveState(userId, { dexId = 'paldea', lastSpinPending, theme, audio, currentDex }) {
    const existing = db.prepare('SELECT user_id FROM user_state WHERE user_id = ?').get(userId);
    const themeVal = theme || 'light';
    const audioVal = audio === false ? 0 : 1;
    const curDex = currentDex || dexId || 'paldea';

    if (existing) {
      const stmt = db.prepare(`
        UPDATE user_state
        SET current_dex = COALESCE(?, current_dex), theme_pref = ?, audio_pref = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `);
      stmt.run(curDex, themeVal, audioVal, userId);
    } else {
      const stmt = db.prepare(`
        INSERT INTO user_state (user_id, current_dex, theme_pref, audio_pref)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run(userId, curDex, themeVal, audioVal);
    }

    if (lastSpinPending !== undefined) {
      const lastSpinStr = JSON.stringify(lastSpinPending || []);
      const existingDex = db.prepare('SELECT user_id FROM user_dex_state WHERE user_id = ? AND dex_id = ?').get(userId, dexId);
      if (existingDex) {
        db.prepare(`
          UPDATE user_dex_state
          SET last_spin_pending = ?, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ? AND dex_id = ?
        `).run(lastSpinStr, userId, dexId);
      } else {
        db.prepare(`
          INSERT INTO user_dex_state (user_id, dex_id, last_spin_pending)
          VALUES (?, ?, ?)
        `).run(userId, dexId, lastSpinStr);
      }
    }
  },

  addCaptured(userId, pokemonList, dexId = 'paldea') {
    if (!Array.isArray(pokemonList) || pokemonList.length === 0) return;

    const insertCap = db.prepare(`
      INSERT INTO user_captured (user_id, dex_id, pokemon_id, num_pal, num_nac, name, types, color, sprite, shiny_sprite, captured_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, dex_id, pokemon_id) DO UPDATE SET
        captured_at = excluded.captured_at
    `);

    const removePend = db.prepare(`
      DELETE FROM user_pending WHERE user_id = ? AND dex_id = ? AND (pokemon_id = ? OR num_pal = ?)
    `);

    for (const poke of pokemonList) {
      const pokeId = String(poke.pokemonId || poke.numPal || poke.numNac || poke.id);
      const typesStr = JSON.stringify(poke.types || []);
      const capturedAt = poke.capturedAt || new Date().toISOString();
      insertCap.run(
        userId,
        dexId,
        pokeId,
        poke.numPal || pokeId,
        poke.numNac || '',
        poke.name,
        typesStr,
        poke.color || '',
        poke.sprite || '',
        poke.shinySprite || '',
        capturedAt
      );
      removePend.run(userId, dexId, pokeId, pokeId);
    }
  },

  removeCaptured(userId, pokemonId, dexId = 'paldea') {
    const pokeId = String(pokemonId);
    const stmt = db.prepare('DELETE FROM user_captured WHERE user_id = ? AND dex_id = ? AND (pokemon_id = ? OR num_pal = ?)');
    stmt.run(userId, dexId, pokeId, pokeId);
  },

  addPending(userId, pokemonList, dexId = 'paldea') {
    if (!Array.isArray(pokemonList) || pokemonList.length === 0) return;

    const isCaptured = db.prepare('SELECT 1 FROM user_captured WHERE user_id = ? AND dex_id = ? AND (pokemon_id = ? OR num_pal = ?)');
    const insertPend = db.prepare(`
      INSERT INTO user_pending (user_id, dex_id, pokemon_id, num_pal, num_nac, name, types, color, sprite, shiny_sprite, added_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, dex_id, pokemon_id) DO NOTHING
    `);

    for (const poke of pokemonList) {
      const pokeId = String(poke.pokemonId || poke.numPal || poke.numNac || poke.id);
      if (!isCaptured.get(userId, dexId, pokeId, pokeId)) {
        const typesStr = JSON.stringify(poke.types || []);
        const addedAt = poke.addedAt || new Date().toISOString();
        insertPend.run(
          userId,
          dexId,
          pokeId,
          poke.numPal || pokeId,
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

  removePending(userId, pokemonId, dexId = 'paldea') {
    const pokeId = String(pokemonId);
    const stmt = db.prepare('DELETE FROM user_pending WHERE user_id = ? AND dex_id = ? AND (pokemon_id = ? OR num_pal = ?)');
    stmt.run(userId, dexId, pokeId, pokeId);
  },

  merge(userId, { dexId = 'paldea', captured = [], pending = [], lastSpinPending = [], theme, audio, currentDex }) {
    if (captured && captured.length > 0) {
      this.addCaptured(userId, captured, dexId);
    }

    if (pending && pending.length > 0) {
      this.addPending(userId, pending, dexId);
    }

    this.saveState(userId, { dexId, lastSpinPending, theme, audio, currentDex });

    return {
      dexId,
      captured: this.getCaptured(userId, dexId),
      pending: this.getPending(userId, dexId),
      ...this.getState(userId, dexId)
    };
  }
};

module.exports = {
  db,
  userRepo,
  progressRepo
};
