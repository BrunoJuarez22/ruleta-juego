/**
 * api.js — Cliente de API REST y Sincronización en la Nube para Shiny Roulette
 * Proporciona métodos de autenticación (Login, Sign In / Registro) y persistencia en base de datos.
 * Diseñado con tolerancia a fallos: opera en modo offline/invitado si el servidor no está disponible.
 */

(function () {
  'use strict';

  // Configuración de endpoints y persistencia local del token
  const STORAGE_KEY_TOKEN = 'ruleta_jwt_token';
  const STORAGE_KEY_USER = 'ruleta_current_user';
  const STORAGE_KEY_LAST_SYNC = 'ruleta_last_sync_time';

  // Detección dinámica de la URL base del servidor
  function getBaseUrl() {
    // Si se ejecuta mediante el servidor web (http://localhost:3000 o producción)
    if (window.location.protocol.startsWith('http')) {
      return '';
    }
    // Si se ejecuta abriendo el archivo localmente (file://)
    return 'http://localhost:3000';
  }

  const BASE_URL = getBaseUrl();

  // Estado interno
  let isServerOnline = false;
  let listeners = [];

  function notifyChange() {
    listeners.forEach(fn => {
      try { fn(); } catch (e) { console.error('[API] Listener error:', e); }
    });
  }

  // Utilidad de petición HTTP con token JWT automático
  async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const token = getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Si el token expiró o es inválido, cerrar sesión localmente
        if (response.status === 401 || response.status === 403) {
          if (token) {
            logout();
          }
        }
        return {
          ok: false,
          status: response.status,
          error: data.error || `Error HTTP ${response.status}`,
          data
        };
      }

      isServerOnline = true;
      return {
        ok: true,
        status: response.status,
        ...data
      };
    } catch (networkError) {
      isServerOnline = false;
      return {
        ok: false,
        offline: true,
        error: 'No se pudo conectar con el servidor de base de datos. Operando en modo local.'
      };
    }
  }

  // Verificación de salud del servidor
  async function checkHealth() {
    try {
      const res = await fetch(`${BASE_URL}/api/health`, { method: 'GET' });
      if (res.ok) {
        isServerOnline = true;
        return true;
      }
    } catch {
      isServerOnline = false;
    }
    return false;
  }

  // Gestión de Tokens y Almacenamiento Local
  function getToken() {
    try {
      return localStorage.getItem(STORAGE_KEY_TOKEN) || null;
    } catch {
      return null;
    }
  }

  function setToken(token) {
    try {
      if (token) {
        localStorage.setItem(STORAGE_KEY_TOKEN, token);
      } else {
        localStorage.removeItem(STORAGE_KEY_TOKEN);
      }
    } catch (e) {
      console.warn('[API] Error guardando token en localStorage:', e);
    }
  }

  function getCurrentUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function setCurrentUser(user) {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    } catch (e) {
      console.warn('[API] Error guardando usuario:', e);
    }
  }

  function getLastSyncTime() {
    try {
      return localStorage.getItem(STORAGE_KEY_LAST_SYNC) || null;
    } catch {
      return null;
    }
  }

  function setLastSyncTime(isoString) {
    try {
      localStorage.setItem(STORAGE_KEY_LAST_SYNC, isoString || new Date().toISOString());
    } catch {
      // Ignorar
    }
  }

  function isLoggedIn() {
    return Boolean(getToken() && getCurrentUser());
  }

  // Métodos de Autenticación
  async function register(username, email, password) {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });

    if (res.ok && res.token && res.user) {
      setToken(res.token);
      setCurrentUser(res.user);
      setLastSyncTime(new Date().toISOString());
      notifyChange();
    }

    return res;
  }

  async function login(identifier, password) {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });

    if (res.ok && res.token && res.user) {
      setToken(res.token);
      setCurrentUser(res.user);
      setLastSyncTime(new Date().toISOString());
      notifyChange();
    }

    return res;
  }

  function logout() {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_LAST_SYNC);
    notifyChange();
  }

  // Métodos de Sincronización y Progreso
  async function fetchCloudProgress() {
    if (!isLoggedIn()) return { ok: false, error: 'No autenticado.' };
    return await request('/api/user/progress', { method: 'GET' });
  }

  async function syncProgressWithCloud({ captured, pending, lastSpinPending, theme, audio }) {
    if (!isLoggedIn()) return { ok: false, error: 'No autenticado.' };

    const res = await request('/api/user/sync', {
      method: 'POST',
      body: JSON.stringify({
        captured,
        pending,
        lastSpinPending,
        theme,
        audio
      })
    });

    if (res.ok) {
      setLastSyncTime(new Date().toISOString());
      notifyChange();
    }

    return res;
  }

  async function cloudCapture(pokemonList) {
    if (!isLoggedIn()) return { ok: false, guest: true };
    return await request('/api/user/capture', {
      method: 'POST',
      body: JSON.stringify({ pokemon: pokemonList })
    });
  }

  async function cloudUncapture(numPal) {
    if (!isLoggedIn()) return { ok: false, guest: true };
    return await request('/api/user/uncapture', {
      method: 'POST',
      body: JSON.stringify({ numPal })
    });
  }

  async function cloudAddPending(pokemonList, lastSpinPending) {
    if (!isLoggedIn()) return { ok: false, guest: true };
    return await request('/api/user/pending', {
      method: 'POST',
      body: JSON.stringify({ pokemon: pokemonList, lastSpinPending })
    });
  }

  async function cloudRemovePending(numPal) {
    if (!isLoggedIn()) return { ok: false, guest: true };
    return await request('/api/user/remove-pending', {
      method: 'POST',
      body: JSON.stringify({ numPal })
    });
  }

  async function cloudSaveState({ lastSpinPending, theme, audio }) {
    if (!isLoggedIn()) return { ok: false, guest: true };
    return await request('/api/user/state', {
      method: 'POST',
      body: JSON.stringify({ lastSpinPending, theme, audio })
    });
  }

  // Interfaz Global
  window.ShinyAPI = {
    checkHealth,
    isServerOnline: () => isServerOnline,
    isLoggedIn,
    getToken,
    getCurrentUser,
    getLastSyncTime,
    register,
    login,
    logout,
    fetchCloudProgress,
    syncProgressWithCloud,
    cloudCapture,
    cloudUncapture,
    cloudAddPending,
    cloudRemovePending,
    cloudSaveState,
    onAuthChange: (fn) => { listeners.push(fn); }
  };
})();
