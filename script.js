/**
 * Shiny Roulette (Pokédex de Paldea)
 * Mini-Juego Web con Selección de Línea Evolutiva, Modo Día por Defecto y Cero Emojis
 */

const TYPE_COLORS = {
  'Acero': '#64748b',
  'Agua': '#0284c7',
  'Bicho': '#65a30d',
  'Dragón': '#4f46e5',
  'Eléctrico': '#eab308',
  'Fantasma': '#7c3aed',
  'Fuego': '#ea580c',
  'Hada': '#ec4899',
  'Hielo': '#0891b2',
  'Lucha': '#c2410c',
  'Normal': '#78716c',
  'Planta': '#16a34a',
  'Psíquico': '#db2777',
  'Roca': '#a16207',
  'Siniestro': '#334155',
  'Tierra': '#d97706',
  'Veneno': '#9333ea',
  'Volador': '#6366f1'
};

function getPokemonColor(pokemon, index = 0) {
  if (pokemon && pokemon.color) return pokemon.color;
  const mainType = (pokemon && pokemon.types && pokemon.types[0]) || 'Normal';
  if (TYPE_COLORS[mainType]) return TYPE_COLORS[mainType];
  const PALETTE = ['#16a34a', '#ea580c', '#0284c7', '#eab308', '#9333ea', '#ec4899', '#0891b2', '#d97706', '#6366f1'];
  return PALETTE[index % PALETTE.length];
}

const ALL_PALDEA_POKEMON = (window.PALDEA_POKEMON || []).map((p, index) => {
  p.color = p.color || getPokemonColor(p, index);
  return p;
});
const PALDEA_BY_NUM = new Map();
ALL_PALDEA_POKEMON.forEach(p => PALDEA_BY_NUM.set(p.numPal, p));

// Conjuntos oficiales de exclusivos de Paldea
const SCARLET_EXCLUSIVE_SET = new Set([
  '143', '144', '166', '226', '227', '313', '316', '317', '318', '319',
  '337', '338', '370', '371', '372', '376', '377', '378', '379', '380',
  '381', '397', '399'
]);

const VIOLET_EXCLUSIVE_SET = new Set([
  '114', '115', '139', '140', '167', '276', '277', '278', '305', '306',
  '307', '314', '320', '339', '340', '382', '383', '384', '385', '386',
  '387', '398', '400'
]);

function getPokemonGame(pokemon) {
  if (!pokemon) return 'both';
  if (pokemon.game) return pokemon.game;
  const num = pokemon.numPal;
  if (SCARLET_EXCLUSIVE_SET.has(num)) return 'scarlet';
  if (VIOLET_EXCLUSIVE_SET.has(num)) return 'violet';
  return 'both';
}

function getGameBadgeHtml(pokemon, variant = 'normal') {
  const game = getPokemonGame(pokemon);
  let shortLabel = 'AMBOS';
  let fullLabel = 'AMBOS';
  let title = 'Disponible en Pokémon Escarlata y Púrpura';

  if (game === 'scarlet') {
    shortLabel = 'ESC';
    fullLabel = 'ESCARLATA';
    title = 'Exclusivo de Pokémon Escarlata';
  } else if (game === 'violet') {
    shortLabel = 'PÚR';
    fullLabel = 'PÚRPURA';
    title = 'Exclusivo de Pokémon Púrpura';
  }

  const label = (variant === 'mini') ? shortLabel : fullLabel;

  return `<span class="game-badge game-badge-${game} ${variant === 'mini' ? 'game-badge-mini' : ''}" title="${title}">
    <span class="game-dot game-dot-${game}"></span>
    <span class="game-text">${label}</span>
  </span>`;
}

function getWinnerGameBannerHtml(pokemon) {
  const game = getPokemonGame(pokemon);
  let text = 'DISPONIBLE EN AMBOS JUEGOS (ESCARLATA & PÚRPURA)';
  if (game === 'scarlet') {
    text = '★ EXCLUSIVO DE POKÉMON ESCARLATA';
  } else if (game === 'violet') {
    text = '★ EXCLUSIVO DE POKÉMON PÚRPURA';
  }
  return `<div class="winner-game-banner winner-game-${game}">
    <span class="game-dot game-dot-${game}"></span>
    <span>${text}</span>
  </div>`;
}

let items = [...ALL_PALDEA_POKEMON];
let currentRotation = 0;
let isSpinning = false;
let audioEnabled = true;
let currentTheme = 'light'; // Modo día por defecto
let currentWonPokemon = null;
let modalSource = 'wheel'; // 'wheel' | 'pending'

// Conjunto de Pokémon seleccionados en la línea evolutiva del modal
let selectedEvoIds = new Set();

// Contexto activo de Pokédex / Juego (ej. 'paldea', 'general', etc.)
let currentDexId = 'paldea';

function getStorageKey(baseKey, dexId = currentDexId) {
  return `${baseKey}_${dexId}`;
}

function getPokemonId(pokemon) {
  if (!pokemon) return '';
  return String(pokemon.pokemonId || pokemon.numPal || pokemon.numNac || pokemon.id || '');
}

function migrateLocalStorageIfNeeded() {
  try {
    if (localStorage.getItem('shiny_captured') && !localStorage.getItem('shiny_captured_paldea')) {
      localStorage.setItem('shiny_captured_paldea', localStorage.getItem('shiny_captured'));
    }
    if (localStorage.getItem('shiny_pending') && !localStorage.getItem('shiny_pending_paldea')) {
      localStorage.setItem('shiny_pending_paldea', localStorage.getItem('shiny_pending'));
    }
    if (localStorage.getItem('shiny_last_spin_pending') && !localStorage.getItem('shiny_last_spin_pending_paldea')) {
      localStorage.setItem('shiny_last_spin_pending_paldea', localStorage.getItem('shiny_last_spin_pending'));
    }
  } catch (e) {
    console.warn('[STORAGE] Error en migración local:', e);
  }
}

// Listas de seguimiento Shiny y Matriz Gigante
let pendingList = [];
let capturedShinyList = [];
let spinHistory = [];
let lastSpinPendingIds = new Set();
let currentMatrixFilter = 'all';
let matrixSearchQuery = '';

const imageCache = new Map();

// Elementos del DOM
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const centerSpinHub = document.getElementById('centerSpinHub');
const pointerTriangle = document.getElementById('pointerTriangle');
const soundToggleBtn = document.getElementById('soundToggleBtn');
const soundIcon = document.getElementById('soundIcon');
const soundText = document.getElementById('soundText');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');
const themeText = document.getElementById('themeText');
const settingsBtn = document.getElementById('settingsBtn');

// Filtros
const typeFilter = document.getElementById('typeFilter');
const rangeFilter = document.getElementById('rangeFilter');
const randomSubsetBtn = document.getElementById('randomSubsetBtn');
const resetAllPokemonBtn = document.getElementById('resetAllPokemonBtn');
const counterBadge = document.getElementById('counterBadge');
const liveTrackerImg = document.getElementById('liveTrackerImg');
const liveTrackerName = document.getElementById('liveTrackerName');
const liveTrackerBadges = document.getElementById('liveTrackerBadges');

// Tabs y Vistas Dashboard
const tabPendingBtn = document.getElementById('tabPendingBtn');
const tabCapturedBtn = document.getElementById('tabCapturedBtn');
const tabHistoryBtn = document.getElementById('tabHistoryBtn');
const pendingView = document.getElementById('pendingView');
const capturedView = document.getElementById('capturedView');
const historyView = document.getElementById('historyView');
const pendingListEl = document.getElementById('pendingList');
const capturedListEl = document.getElementById('capturedList');
const historyListEl = document.getElementById('historyList');
const pendingCountEl = document.getElementById('pendingCount');
const capturedCountEl = document.getElementById('capturedCount');

// Elementos de la Matriz Gigante Paldea 400
const matrixGrid = document.getElementById('matrixGrid');
const matrixSearchInput = document.getElementById('matrixSearchInput');
const matrixClearSearchBtn = document.getElementById('matrixClearSearchBtn');
const matrixCapturedCount = document.getElementById('matrixCapturedCount');
const matrixCapturedPercent = document.getElementById('matrixCapturedPercent');
const matrixLastSpinCount = document.getElementById('matrixLastSpinCount');
const matrixPendingCount = document.getElementById('matrixPendingCount');
const matrixLastSpinPill = document.getElementById('matrixLastSpinPill');
const chipLastSpinBadge = document.getElementById('chipLastSpinBadge');
const chipPendingBadge = document.getElementById('chipPendingBadge');
const chipCapturedBadge = document.getElementById('chipCapturedBadge');

// Modal Ganador / Línea Evolutiva
const winnerModal = document.getElementById('winnerModal');
const modalCardTag = document.getElementById('modalCardTag');
const winnerDexNum = document.getElementById('winnerDexNum');
const winnerTitle = document.getElementById('winnerTitle');
const winnerTypes = document.getElementById('winnerTypes');
const winnerImg = document.getElementById('winnerImg');
const winnerCaptureShinyBtn = document.getElementById('winnerCaptureShinyBtn');
const winnerCaptureShinyText = document.getElementById('winnerCaptureShinyText');
const winnerWheelActions = document.getElementById('winnerWheelActions');
const winnerPendingActions = document.getElementById('winnerPendingActions');
const winnerSpinAgainBtn = document.getElementById('winnerSpinAgainBtn');
const winnerAcceptBtn = document.getElementById('winnerAcceptBtn');
const winnerCancelPendingBtn = document.getElementById('winnerCancelPendingBtn');
const winnerUnpendModalBtn = document.getElementById('winnerUnpendModalBtn');
const evolutionLineSection = document.getElementById('evolutionLineSection');
const evolutionLineContainer = document.getElementById('evolutionLineContainer');

// Modal Catálogo
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const closeSettingsFooterBtn = document.getElementById('closeSettingsFooterBtn');
const pokedexSearch = document.getElementById('pokedexSearch');
const itemsListContainer = document.getElementById('itemsListContainer');

// Canvas Confeti
const confettiCanvas = document.getElementById('confettiCanvas');
const confettiCtx = confettiCanvas.getContext('2d');
let confettiParticles = [];
let confettiAnimationId = null;

// Elementos de Autenticación y Gestión de Cuentas
const userAuthBtn = document.getElementById('userAuthBtn');
const userAuthText = document.getElementById('userAuthText');
const syncIndicatorDot = document.getElementById('syncIndicatorDot');
const authModal = document.getElementById('authModal');
const authModalTitle = document.getElementById('authModalTitle');
const authCloudStatusBadge = document.getElementById('authCloudStatusBadge');
const closeAuthBtn = document.getElementById('closeAuthBtn');
const closeAuthFooterBtn = document.getElementById('closeAuthFooterBtn');
const authGuestTabs = document.getElementById('authGuestTabs');
const tabAuthLogin = document.getElementById('tabAuthLogin');
const tabAuthRegister = document.getElementById('tabAuthRegister');
const authAlertBox = document.getElementById('authAlertBox');
const loginForm = document.getElementById('loginForm');
const loginIdentifier = document.getElementById('loginIdentifier');
const loginPassword = document.getElementById('loginPassword');
const submitLoginBtn = document.getElementById('submitLoginBtn');
const switchToRegisterLink = document.getElementById('switchToRegisterLink');
const registerForm = document.getElementById('registerForm');
const registerUsername = document.getElementById('registerUsername');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');
const registerConfirmPassword = document.getElementById('registerConfirmPassword');
const registerSyncCheck = document.getElementById('registerSyncCheck');
const submitRegisterBtn = document.getElementById('submitRegisterBtn');
const switchToLoginLink = document.getElementById('switchToLoginLink');
const profileView = document.getElementById('profileView');
const profileUsername = document.getElementById('profileUsername');
const profileEmail = document.getElementById('profileEmail');
const profileCapturedCount = document.getElementById('profileCapturedCount');
const profilePendingCount = document.getElementById('profilePendingCount');
const profileLastSync = document.getElementById('profileLastSync');
const profileSyncNowBtn = document.getElementById('profileSyncNowBtn');
const profileLogoutBtn = document.getElementById('profileLogoutBtn');

// ==========================================
// 1. TEMA DÍA / NOCHE (MODO DÍA DEFAULT)
// ==========================================
function initTheme() {
  const saved = localStorage.getItem('ruleta_theme') || 'light';
  setTheme(saved);
}

function setTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('ruleta_theme', theme);

  if (theme === 'light') {
    themeIcon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
    themeText.textContent = 'MODO NOCHE';
  } else {
    themeIcon.innerHTML = `
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    `;
    themeText.textContent = 'MODO DÍA';
  }

  drawWheel(currentRotation);
}

function toggleTheme() {
  setTheme(currentTheme === 'light' ? 'dark' : 'light');
}

// ==========================================
// 2. PRECARGA DE SPRITES
// ==========================================
function preloadAllSprites() {
  ALL_PALDEA_POKEMON.forEach(p => {
    if (p.sprite) {
      const img = new Image();
      img.src = p.sprite;
      imageCache.set(p.sprite, img);
    }
    if (p.shinySprite) {
      const imgS = new Image();
      imgS.src = p.shinySprite;
      imageCache.set(p.shinySprite, imgS);
    }
    if (p.image && !p.image.startsWith('http')) {
      const imgA = new Image();
      imgA.src = p.image;
      imageCache.set(p.image, imgA);
    }
  });
}

// ==========================================
// 3. AUDIO (WEB AUDIO API)
// ==========================================
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function updateSoundUI() {
  if (audioEnabled) {
    soundIcon.innerHTML = `
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    `;
    soundText.textContent = 'SONIDO: ACTIVO';
  } else {
    soundIcon.innerHTML = `
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <line x1="23" y1="9" x2="17" y2="15"></line>
      <line x1="17" y1="9" x2="23" y2="15"></line>
    `;
    soundText.textContent = 'SONIDO: SILENCIO';
  }
}

function playTickSound() {
  if (!audioEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600 + Math.random() * 80, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, audioCtx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.03);
  } catch (e) {}
}

function playVictoryFanfare() {
  if (!audioEnabled || !audioCtx) return;
  try {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      const startTime = audioCtx.currentTime + idx * 0.12;
      const duration = 0.35;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.24, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch (e) {}
}

// ==========================================
// 4. RENDERIZADO DE LA RULETA EN CANVAS
// ==========================================
function setupCanvasResolution() {
  const dpr = window.devicePixelRatio || 1;
  const size = 500;

  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.resetTransform?.();
  ctx.scale(dpr, dpr);
}

function drawWheel(rotationDegrees = 0) {
  const size = 500;
  const center = size / 2;
  const radius = center - 20;
  const numItems = items.length;
  if (numItems === 0) return;

  const sliceAngle = (2 * Math.PI) / numItems;
  const rotationRad = (rotationDegrees * Math.PI) / 180;

  ctx.clearRect(0, 0, size, size);

  // Aro exterior
  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, radius + 12, 0, 2 * Math.PI);
  const outerGrad = ctx.createRadialGradient(center, center, radius - 5, center, center, radius + 13);
  if (currentTheme === 'dark') {
    outerGrad.addColorStop(0, '#1e293b');
    outerGrad.addColorStop(0.5, '#e11d48');
    outerGrad.addColorStop(0.8, '#f43f5e');
    outerGrad.addColorStop(1, '#881337');
  } else {
    outerGrad.addColorStop(0, '#475569');
    outerGrad.addColorStop(0.5, '#dc2626');
    outerGrad.addColorStop(0.8, '#f87171');
    outerGrad.addColorStop(1, '#991b1b');
  }
  ctx.fillStyle = outerGrad;
  ctx.fill();
  ctx.restore();

  // Luces perimetrales
  const totalBulbs = 24;
  for (let b = 0; b < totalBulbs; b++) {
    const bulbAngle = (b * (2 * Math.PI / totalBulbs));
    const bx = center + (radius + 6) * Math.cos(bulbAngle);
    const by = center + (radius + 6) * Math.sin(bulbAngle);
    const isLit = (Math.floor(rotationDegrees / 15) + b) % 2 === 0;

    ctx.save();
    ctx.beginPath();
    ctx.arc(bx, by, 3, 0, 2 * Math.PI);
    ctx.fillStyle = isLit ? '#ffffff' : (currentTheme === 'dark' ? '#4c0519' : '#fee2e2');
    ctx.fill();
    ctx.restore();
  }

  // Gajos rotados
  ctx.save();
  ctx.translate(center, center);
  ctx.rotate(rotationRad);

  const shouldDrawContent = numItems <= 32;

  for (let i = 0; i < numItems; i++) {
    const item = items[i];
    const startAngle = i * sliceAngle;
    const endAngle = (i + 1) * sliceAngle;
    const midAngle = startAngle + sliceAngle / 2;

    const sliceColor = item.color || getPokemonColor(item, i);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = sliceColor;
    ctx.fill();

    if (numItems <= 60) {
      ctx.lineWidth = numItems <= 20 ? 1.5 : 0.8;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.stroke();

      const pegX = radius * Math.cos(startAngle);
      const pegY = radius * Math.sin(startAngle);
      ctx.save();
      ctx.beginPath();
      ctx.arc(pegX, pegY, 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();
    }

    if (shouldDrawContent) {
      ctx.save();
      ctx.rotate(midAngle);

      const badgeDistance = radius * 0.72;
      ctx.beginPath();
      ctx.arc(badgeDistance, 0, 18, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.stroke();

      const img = imageCache.get(item.sprite);
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, badgeDistance - 16, -16, 32, 32);
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 10px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.numPal ? `#${item.numPal}` : String(i + 1), badgeDistance, 0);
      }

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 4;
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let displayName = item.name;
      if (displayName.length > 13) displayName = displayName.substring(0, 11) + '…';
      ctx.fillText(displayName, radius * 0.42, 0);

      ctx.restore();
    }
  }

  ctx.restore();

  // Núcleo central circular
  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, 44, 0, 2 * Math.PI);
  ctx.fillStyle = currentTheme === 'dark' ? '#0f172a' : '#ffffff';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = currentTheme === 'dark' ? '#334155' : '#cbd5e1';
  ctx.stroke();
  ctx.restore();

  updateLivePointerTracker(rotationDegrees);
}

function getActivePokemonAtRotation(rotationDegrees) {
  const numItems = items.length;
  if (numItems === 0) return null;
  const sliceAngle = 360 / numItems;
  const pointerAngle = 270;

  let A = (pointerAngle - (rotationDegrees % 360)) % 360;
  if (A < 0) A += 360;

  const index = Math.floor(A / sliceAngle) % numItems;
  return { item: items[index], index };
}

let lastTrackedIndex = -1;

function updateLivePointerTracker(rotationDegrees) {
  const active = getActivePokemonAtRotation(rotationDegrees);
  if (!active || !active.item) return;

  if (active.index !== lastTrackedIndex) {
    lastTrackedIndex = active.index;
    const p = active.item;

    liveTrackerName.textContent = `#${p.numPal} ${p.name}`;

    if (p.sprite) {
      liveTrackerImg.src = p.sprite;
    }

    const gameBadge = getGameBadgeHtml(p, 'normal');
    const typeBadges = (p.types || []).map(t => 
      `<span class="type-badge type-${t}">${t}</span>`
    ).join('');

    liveTrackerBadges.innerHTML = `${gameBadge}${typeBadges}`;
  }
}

// ==========================================
// 5. LÓGICA DE GIRO
// ==========================================
function spinWheel() {
  if (isSpinning || items.length < 2) return;

  clearModalContent();
  initAudio();
  isSpinning = true;
  spinBtn.disabled = true;
  centerSpinHub.disabled = true;

  const numItems = items.length;
  const sliceAngle = 360 / numItems;
  const pointerAngle = 270;

  const targetIndex = Math.floor(Math.random() * numItems);
  const jitterOffset = (Math.random() - 0.5) * 0.7;
  const targetAngle = (targetIndex + 0.5 + jitterOffset) * sliceAngle;

  const fullRotations = 5 + Math.floor(Math.random() * 3);

  let targetRotationMod = (pointerAngle - targetAngle) % 360;
  if (targetRotationMod < 0) targetRotationMod += 360;

  const currentMod = currentRotation % 360;
  const deltaDegrees = ((targetRotationMod - currentMod + 360) % 360) + (fullRotations * 360);

  const startRot = currentRotation;
  const duration = 4800;
  const startTime = performance.now();

  const tickStep = numItems > 40 ? Math.ceil(numItems / 36) : 1;
  let lastPegGroup = -1;

  function easeOutQuart(x) {
    return 1 - Math.pow(1 - x, 4);
  }

  function animate(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuart(progress);

    currentRotation = startRot + deltaDegrees * easedProgress;

    const currentPeg = Math.floor((currentRotation % 360) / sliceAngle);
    const currentPegGroup = Math.floor(currentPeg / tickStep);
    if (currentPegGroup !== lastPegGroup) {
      lastPegGroup = currentPegGroup;
      playTickSound();
      triggerPointerBounce();
    }

    drawWheel(currentRotation);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isSpinning = false;
      spinBtn.disabled = false;
      centerSpinHub.disabled = false;
      onWheelStopped(targetIndex);
    }
  }

  requestAnimationFrame(animate);
}

function triggerPointerBounce() {
  pointerTriangle.classList.remove('tick-bounce');
  void pointerTriangle.offsetWidth;
  pointerTriangle.classList.add('tick-bounce');
}

function clearModalContent() {
  winnerImg.style.visibility = 'hidden';
  winnerImg.style.opacity = '0';
  winnerImg.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E';
  winnerTitle.textContent = '';
  winnerDexNum.textContent = '';
  const winnerGameBanner = document.getElementById('winnerGameBanner');
  if (winnerGameBanner) winnerGameBanner.innerHTML = '';
  winnerTypes.innerHTML = '';
  evolutionLineContainer.innerHTML = '';
  selectedEvoIds.clear();
}

function closeWinnerModal() {
  winnerModal.classList.remove('active');
  currentWonPokemon = null;
  setTimeout(() => {
    if (!winnerModal.classList.contains('active')) {
      clearModalContent();
    }
  }, 200);
}

function onWheelStopped(targetIndex) {
  const winner = items[targetIndex];
  if (!winner) return;

  // Sincronizar tracker en vivo con el ganador final de forma exacta
  lastTrackedIndex = targetIndex;
  liveTrackerName.textContent = `#${winner.numPal} ${winner.name}`;
  if (winner.sprite) liveTrackerImg.src = winner.sprite;
  liveTrackerBadges.innerHTML = `
    ${getGameBadgeHtml(winner, 'normal')}
    ${(winner.types || []).map(t => `<span class="type-badge type-${t}">${t}</span>`).join('')}
  `;

  playVictoryFanfare();
  startConfetti();
  addHistoryItem(winner);

  setTimeout(() => {
    openEvolutionLineModal(winner, 'wheel');
  }, 300);
}

// ==========================================
// 6. MODAL DE LÍNEA EVOLUTIVA (RULETA & PENDIENTES)
// ==========================================
function openEvolutionLineModal(pokemon, source = 'wheel') {
  if (!pokemon) return;

  const fullPokemon = PALDEA_BY_NUM.get(pokemon.numPal) || pokemon;
  currentWonPokemon = fullPokemon;
  modalSource = source;

  // 1. Ocultar la imagen anterior inmediatamente para evitar parpadeos del Pokémon previo
  winnerImg.style.visibility = 'hidden';
  winnerImg.style.opacity = '0';

  // 2. Actualizar textos, número, banner de juego y tipos del nuevo Pokémon
  winnerDexNum.textContent = `Nº PALDEA: #${fullPokemon.numPal} · NAC: #${fullPokemon.numNac}`;
  winnerTitle.textContent = fullPokemon.name;
  const winnerGameBanner = document.getElementById('winnerGameBanner');
  if (winnerGameBanner) {
    winnerGameBanner.innerHTML = getWinnerGameBannerHtml(fullPokemon);
  }
  winnerTypes.innerHTML = (fullPokemon.types || []).map(t => 
    `<span class="type-badge type-${t}">${t}</span>`
  ).join('');

  // 3. Configurar interfaz según el origen (Ruleta vs Matriz / Pendientes)
  if (source === 'wheel') {
    if (modalCardTag) modalCardTag.textContent = 'OBJETIVO SHINY RULETA';
    if (winnerWheelActions) winnerWheelActions.style.display = 'flex';
  } else {
    const isPend = pendingList.some(p => p.numPal === fullPokemon.numPal) || lastSpinPendingIds.has(fullPokemon.numPal);
    if (modalCardTag) modalCardTag.textContent = isPend ? 'CAPTURAR O DESMARCAR PENDIENTE' : 'CAPTURAR LÍNEA EVOLUTIVA';
    if (winnerWheelActions) winnerWheelActions.style.display = 'none';
    if (winnerPendingActions) winnerPendingActions.style.display = 'flex';
    if (winnerUnpendModalBtn) {
      winnerUnpendModalBtn.style.display = isPend ? 'inline-flex' : 'none';
    }
  }

  // 4. Renderizar selector de línea evolutiva
  renderEvolutionLineSelector(fullPokemon, source);

  // 5. Cargar y decodificar la nueva imagen antes de mostrar el modal
  const newSrc = fullPokemon.image || fullPokemon.shinySprite || fullPokemon.sprite || 'assets/pokeball.svg';

  let isModalOpened = false;
  const displayModalWithNewImage = () => {
    if (isModalOpened) return;
    isModalOpened = true;
    winnerImg.src = newSrc;
    winnerImg.style.visibility = 'visible';
    winnerImg.style.opacity = '1';
    winnerModal.classList.add('active');
  };

  const tempImg = new Image();
  tempImg.src = newSrc;

  if (tempImg.decode) {
    tempImg.decode().then(() => {
      displayModalWithNewImage();
    }).catch(() => {
      winnerImg.src = fullPokemon.shinySprite || fullPokemon.sprite || 'assets/pokeball.svg';
      displayModalWithNewImage();
    });
  } else {
    tempImg.onload = displayModalWithNewImage;
    tempImg.onerror = () => {
      winnerImg.src = fullPokemon.shinySprite || fullPokemon.sprite || 'assets/pokeball.svg';
      displayModalWithNewImage();
    };
  }

  // Respaldo de seguridad máximo para garantizar apertura del modal
  setTimeout(displayModalWithNewImage, 180);
}

function renderEvolutionLineSelector(pokemon, source = 'wheel') {
  evolutionLineContainer.innerHTML = '';
  selectedEvoIds.clear();

  const fullPokemon = PALDEA_BY_NUM.get(pokemon.numPal) || pokemon;
  const lineIds = (fullPokemon.evolutionLine && fullPokemon.evolutionLine.length > 0)
    ? fullPokemon.evolutionLine
    : [fullPokemon.numPal];

  const members = lineIds.map(id => PALDEA_BY_NUM.get(id)).filter(Boolean);

  // Por defecto, el Pokémon abierto está seleccionado
  selectedEvoIds.add(fullPokemon.numPal);

  members.forEach(m => {
    const isTarget = (m.numPal === fullPokemon.numPal);
    const isAlreadyCaptured = capturedShinyList.some(c => c.numPal === m.numPal);

    let statusLabel = '';
    if (isAlreadyCaptured) {
      statusLabel = 'CAPTURADO';
    } else if (isTarget) {
      statusLabel = (source === 'wheel' ? 'RULETA' : 'PENDIENTE');
    }

    const card = document.createElement('label');
    card.className = 'evo-card' + (selectedEvoIds.has(m.numPal) ? ' selected' : '') + (isAlreadyCaptured ? ' already-captured' : '');

    card.innerHTML = `
      <input type="checkbox" class="evo-checkbox" value="${m.numPal}" ${selectedEvoIds.has(m.numPal) ? 'checked' : ''}>
      <img src="${m.shinySprite || m.sprite}" class="evo-thumb" alt="${m.name}" title="Forma Shiny" onerror="this.src='assets/pokeball.svg'">
      <div class="evo-card-info">
        <span class="evo-card-num">#${m.numPal}</span>
        <span class="evo-card-name">${m.name}</span>
        ${getGameBadgeHtml(m, 'mini')}
      </div>
      <span class="evo-status-badge">${statusLabel}</span>
    `;

    const checkbox = card.querySelector('.evo-checkbox');
    const badge = card.querySelector('.evo-status-badge');

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        selectedEvoIds.add(m.numPal);
        card.classList.add('selected');
        if (!isAlreadyCaptured) badge.textContent = 'SHINY';
      } else {
        selectedEvoIds.delete(m.numPal);
        card.classList.remove('selected');
        if (!isAlreadyCaptured) {
          badge.textContent = isTarget ? (source === 'wheel' ? 'RULETA' : 'PENDIENTE') : '';
        }
      }
      updateCaptureButtonText();
    });

    evolutionLineContainer.appendChild(card);
  });

  updateCaptureButtonText();
}

function updateCaptureButtonText() {
  const count = selectedEvoIds.size;
  if (count === 0) {
    winnerCaptureShinyText.textContent = (modalSource === 'wheel') 
      ? 'NINGUNO SELECCIONADO (GUARDAR PENDIENTE)' 
      : 'NINGUNO SELECCIONADO (CERRAR)';
  } else if (count === 1) {
    winnerCaptureShinyText.textContent = 'MARCAR 1 SHINY CAPTURADO';
  } else {
    winnerCaptureShinyText.textContent = `MARCAR ${count} SHINYS CAPTURADOS`;
  }
}

// ==========================================
// 7. GESTIÓN DE PENDIENTES Y CAPTURADOS SHINY
// ==========================================
function loadShinyTracking(dexId = currentDexId) {
  migrateLocalStorageIfNeeded();
  try {
    pendingList = JSON.parse(localStorage.getItem(getStorageKey('shiny_pending', dexId)) || '[]');
    capturedShinyList = JSON.parse(localStorage.getItem(getStorageKey('shiny_captured', dexId)) || '[]');
    const savedLastSpin = JSON.parse(localStorage.getItem(getStorageKey('shiny_last_spin_pending', dexId)) || '[]');
    lastSpinPendingIds = new Set(savedLastSpin);
  } catch (e) {
    pendingList = [];
    capturedShinyList = [];
    lastSpinPendingIds = new Set();
  }
  updateDashboardViews();
}

function saveShinyTracking(dexId = currentDexId) {
  localStorage.setItem(getStorageKey('shiny_pending', dexId), JSON.stringify(pendingList));
  localStorage.setItem(getStorageKey('shiny_captured', dexId), JSON.stringify(capturedShinyList));
  localStorage.setItem(getStorageKey('shiny_last_spin_pending', dexId), JSON.stringify([...lastSpinPendingIds]));

  // Mantener compatibilidad retroactiva con claves sin prefijo si estamos en Paldea
  if (dexId === 'paldea') {
    localStorage.setItem('shiny_pending', JSON.stringify(pendingList));
    localStorage.setItem('shiny_captured', JSON.stringify(capturedShinyList));
    localStorage.setItem('shiny_last_spin_pending', JSON.stringify([...lastSpinPendingIds]));
  }
  updateDashboardViews();
}

function updateDashboardViews() {
  renderPaldeaMatrix();
  renderCapturedList();
}

function markMultipleAsShinyCaptured(pokemonList) {
  if (!pokemonList || pokemonList.length === 0) return;
  const nowStr = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const idsToRemove = new Set();

  pokemonList.forEach(pokemon => {
    if (!pokemon) return;
    const pokeId = getPokemonId(pokemon);
    idsToRemove.add(pokeId);
    lastSpinPendingIds.delete(pokeId);
    if (!capturedShinyList.some(p => getPokemonId(p) === pokeId || p.numPal === pokemon.numPal)) {
      capturedShinyList.unshift({
        pokemonId: pokeId,
        numPal: pokemon.numPal || pokeId,
        numNac: pokemon.numNac || '',
        name: pokemon.name,
        types: pokemon.types,
        sprite: pokemon.sprite,
        shinySprite: pokemon.shinySprite,
        evolutionLine: pokemon.evolutionLine,
        time: nowStr
      });
    }
  });

  // Quitar de pendientes los que ahora son capturados
  pendingList = pendingList.filter(p => !idsToRemove.has(getPokemonId(p)) && !idsToRemove.has(p.numPal));
  saveShinyTracking();

  // Sincronizar con la base de datos en la nube si hay sesión activa
  if (window.ShinyAPI && window.ShinyAPI.isLoggedIn()) {
    window.ShinyAPI.cloudCapture(pokemonList, currentDexId).catch(err => {
      console.warn('[CLOUD] Sincronización diferida:', err);
    });
  }
}

function markAsShinyCaptured(pokemon) {
  markMultipleAsShinyCaptured([pokemon]);
}

function removeShinyCaptured(pokemon) {
  if (!pokemon) return;
  const pokeId = getPokemonId(pokemon);
  capturedShinyList = capturedShinyList.filter(p => getPokemonId(p) !== pokeId && p.numPal !== pokeId);
  saveShinyTracking();

  // Sincronizar desmarcado en la base de datos en la nube
  if (window.ShinyAPI && window.ShinyAPI.isLoggedIn()) {
    window.ShinyAPI.cloudUncapture(pokeId, currentDexId).catch(err => {
      console.warn('[CLOUD] Sincronización diferida:', err);
    });
  }
}

function markAsPending(pokemon) {
  if (!pokemon) return;
  const pokeId = getPokemonId(pokemon);

  if (capturedShinyList.some(p => getPokemonId(p) === pokeId || p.numPal === pokeId)) {
    return;
  }

  if (!pendingList.some(p => getPokemonId(p) === pokeId || p.numPal === pokeId)) {
    pendingList.unshift({
      pokemonId: pokeId,
      numPal: pokemon.numPal || pokeId,
      numNac: pokemon.numNac || '',
      name: pokemon.name,
      types: pokemon.types,
      sprite: pokemon.sprite,
      shinySprite: pokemon.shinySprite,
      evolutionLine: pokemon.evolutionLine,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    saveShinyTracking();

    // Sincronizar pendiente en la base de datos en la nube
    if (window.ShinyAPI && window.ShinyAPI.isLoggedIn()) {
      window.ShinyAPI.cloudAddPending([pokemon], [...lastSpinPendingIds], currentDexId).catch(err => {
        console.warn('[CLOUD] Sincronización diferida:', err);
      });
    }
  }
}

function removePending(pokemon) {
  if (!pokemon) return;
  const pokeId = getPokemonId(pokemon);
  pendingList = pendingList.filter(p => getPokemonId(p) !== pokeId && p.numPal !== pokeId);
  lastSpinPendingIds.delete(pokeId);
  lastSpinPendingIds.delete(pokemon.numPal);
  saveShinyTracking();

  // Sincronizar eliminación de pendiente en la nube si hay sesión activa
  if (window.ShinyAPI && window.ShinyAPI.isLoggedIn()) {
    window.ShinyAPI.cloudRemovePending(pokeId, currentDexId).catch(err => {
      console.warn('[CLOUD] Sincronización diferida al quitar pendiente:', err);
    });
  }
}

// ==========================================
// 8. MATRIZ GIGANTE DE PALDEA (400 POKÉMON)
// ==========================================
function updateMatrixToolbarStats(capturedSet, pendingSet) {
  const capCount = capturedSet.size;
  const lastSpinCount = [...lastSpinPendingIds].filter(id => !capturedSet.has(id)).length;
  const pendCount = pendingSet.size;
  const percent = ((capCount / ALL_PALDEA_POKEMON.length) * 100).toFixed(1);

  if (matrixCapturedCount) matrixCapturedCount.textContent = capCount;
  if (matrixCapturedPercent) matrixCapturedPercent.textContent = `(${percent}%)`;
  if (matrixLastSpinCount) matrixLastSpinCount.textContent = lastSpinCount;
  if (matrixPendingCount) matrixPendingCount.textContent = pendCount;

  if (chipLastSpinBadge) chipLastSpinBadge.textContent = lastSpinCount;
  if (chipPendingBadge) chipPendingBadge.textContent = pendCount;
  if (chipCapturedBadge) chipCapturedBadge.textContent = capCount;

  if (pendingCountEl) pendingCountEl.textContent = pendCount;
  if (capturedCountEl) capturedCountEl.textContent = capCount;
}

function renderPaldeaMatrix() {
  if (!matrixGrid) return;
  matrixGrid.innerHTML = '';

  const q = matrixSearchQuery.toLowerCase().trim();
  const capturedSet = new Set(capturedShinyList.map(c => c.numPal));
  const pendingSet = new Set(pendingList.map(p => p.numPal));

  updateMatrixToolbarStats(capturedSet, pendingSet);

  const filtered = ALL_PALDEA_POKEMON.filter(p => {
    // Filtro por texto de búsqueda
    if (q) {
      const matchName = p.name.toLowerCase().includes(q);
      const matchNum = p.numPal.includes(q) || (p.numNac && p.numNac.includes(q));
      const matchType = p.types && p.types.some(t => t.toLowerCase().includes(q));
      const g = getPokemonGame(p);
      const matchGame = (q === 'escarlata' && g === 'scarlet') ||
                        (q === 'purpura' && g === 'violet') ||
                        (q === 'púrpura' && g === 'violet') ||
                        (q === 'ambos' && g === 'both');
      if (!matchName && !matchNum && !matchType && !matchGame) return false;
    }

    // Filtro por pestaña de estado o edición
    const isCaptured = capturedSet.has(p.numPal);
    const isLastSpin = lastSpinPendingIds.has(p.numPal) && !isCaptured;
    const isPending = pendingSet.has(p.numPal) && !isCaptured;

    if (currentMatrixFilter === 'last-spin') {
      return isLastSpin;
    } else if (currentMatrixFilter === 'pending') {
      return isPending || isLastSpin;
    } else if (currentMatrixFilter === 'captured') {
      return isCaptured;
    } else if (currentMatrixFilter === 'uncaptured') {
      return !isCaptured;
    } else if (currentMatrixFilter === 'scarlet') {
      return getPokemonGame(p) === 'scarlet';
    } else if (currentMatrixFilter === 'violet') {
      return getPokemonGame(p) === 'violet';
    } else if (currentMatrixFilter === 'both') {
      return getPokemonGame(p) === 'both';
    }
    return true;
  });

  if (filtered.length === 0) {
    matrixGrid.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1; padding: 30px 10px;">No se encontraron Pokémon con los filtros actuales.</div>';
    return;
  }

  const fragment = document.createDocumentFragment();

  filtered.forEach(p => {
    const isCaptured = capturedSet.has(p.numPal);
    const isLastSpin = lastSpinPendingIds.has(p.numPal) && !isCaptured;
    const isPending = !isLastSpin && pendingSet.has(p.numPal) && !isCaptured;
    const isPendingOrLastSpin = isPending || isLastSpin;
    const hasEvo = (p.evolutionLine && p.evolutionLine.length > 1);

    let statusClass = '';
    let badgeHtml = '';
    let displaySprite = p.sprite || 'assets/pokeball.svg';

    if (isCaptured) {
      statusClass = 'is-captured';
      badgeHtml = '<span class="matrix-tag tag-shiny">★ SHINY</span>';
      displaySprite = p.shinySprite || p.sprite || 'assets/pokeball.svg';
    } else if (isLastSpin) {
      statusClass = 'is-last-spin-pending';
      badgeHtml = `
        <div class="matrix-tag-group">
          <span class="matrix-tag tag-last-spin">★ GIRO ANTERIOR</span>
          <button class="btn-card-unpend" title="Quitar de pendientes" aria-label="Quitar de pendientes">
            <svg class="icon-svg-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>`;
    } else if (isPending) {
      statusClass = 'is-pending';
      badgeHtml = `
        <div class="matrix-tag-group">
          <span class="matrix-tag tag-pending">PENDIENTE</span>
          <button class="btn-card-unpend" title="Quitar de pendientes" aria-label="Quitar de pendientes">
            <svg class="icon-svg-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>`;
    }

    const card = document.createElement('div');
    card.className = `matrix-card ${statusClass}`;
    card.dataset.num = p.numPal;

    card.innerHTML = `
      <div class="matrix-card-header">
        <div class="matrix-header-left">
          <span class="matrix-num">#${p.numPal}</span>
          ${getGameBadgeHtml(p, 'mini')}
        </div>
        ${badgeHtml}
      </div>
      <div class="matrix-thumb-container">
        <img src="${displaySprite}" class="matrix-thumb" alt="${p.name}" loading="lazy" onerror="this.src='assets/pokeball.svg'">
      </div>
      <div class="matrix-name" title="${p.name}">${p.name}</div>
      <div class="matrix-types">
        ${(p.types || []).map(t => `<span class="type-badge-mini type-${t}">${t}</span>`).join('')}
      </div>
      <div class="matrix-actions">
        <div class="matrix-actions-row">
          <button class="btn-matrix-toggle ${isCaptured ? 'is-desmarcar' : 'is-capturar'}" title="${isCaptured ? 'Desmarcar de Shiny' : 'Marcar como Shiny capturado'}">
            ${isCaptured ? 'DESMARCAR' : 'CAPTURAR'}
          </button>
          ${hasEvo ? `<button class="btn-matrix-evo" title="Seleccionar miembros de la línea evolutiva">LÍNEA</button>` : ''}
        </div>
        ${isPendingOrLastSpin ? `<button class="btn-matrix-unpend" title="Desmarcar y quitar de pendientes">DESMARCAR</button>` : ''}
      </div>
    `;

    const toggleBtn = card.querySelector('.btn-matrix-toggle');
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isCaptured) {
        removeShinyCaptured(p);
      } else {
        markAsShinyCaptured(p);
        playVictoryFanfare();
      }
    });

    if (hasEvo) {
      const evoBtn = card.querySelector('.btn-matrix-evo');
      evoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEvolutionLineModal(p, 'matrix');
      });
    }

    if (isPendingOrLastSpin) {
      const unpendBtn = card.querySelector('.btn-matrix-unpend');
      if (unpendBtn) {
        unpendBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          removePending(p);
        });
      }
      const cardUnpendBadge = card.querySelector('.btn-card-unpend');
      if (cardUnpendBadge) {
        cardUnpendBadge.addEventListener('click', (e) => {
          e.stopPropagation();
          removePending(p);
        });
      }
    }

    fragment.appendChild(card);
  });

  matrixGrid.appendChild(fragment);
}

function renderCapturedList() {
  capturedListEl.innerHTML = '';
  if (capturedShinyList.length === 0) {
    capturedListEl.innerHTML = '<div class="empty-state">Aún no has registrado ningún Pokémon shiny capturado.</div>';
    return;
  }

  capturedShinyList.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'shiny-card-item is-captured';
    const mainType = (item.types && item.types[0]) || 'Normal';
    card.innerHTML = `
      <img src="${item.shinySprite || item.sprite || 'assets/pokeball.svg'}" class="shiny-thumb" alt="${item.name}" title="Forma Shiny" onerror="this.src='assets/pokeball.svg'">
      <div class="shiny-item-info">
        <div class="shiny-meta-row">
          <span class="shiny-dex-num">#${item.numPal}</span>
          ${getGameBadgeHtml(item, 'mini')}
        </div>
        <span class="shiny-item-name">${item.name}</span>
        <span class="type-badge type-${mainType}">${mainType}</span>
        <span class="shiny-item-date">${item.time || ''}</span>
      </div>
      <div class="shiny-item-actions">
        <button class="btn-mini-action remove-btn" title="Quitar de capturados">DESMARCAR</button>
      </div>
    `;

    card.querySelector('.remove-btn').addEventListener('click', () => {
      capturedShinyList.splice(index, 1);
      saveShinyTracking();
    });

    capturedListEl.appendChild(card);
  });
}

// ==========================================
// 8. CONFETI
// ==========================================
function setupConfettiCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

function startConfetti() {
  setupConfettiCanvas();
  confettiParticles = [];
  const colors = ['#d97706', '#f59e0b', '#dc2626', '#2563eb', '#16a34a', '#9333ea'];

  for (let i = 0; i < 85; i++) {
    confettiParticles.push({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 120,
      y: window.innerHeight / 2 - 50,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.8) * 18,
      size: Math.random() * 7 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 8,
      opacity: 1,
      gravity: 0.35,
    });
  }

  if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);

  let frameCount = 0;
  function updateConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    frameCount++;

    for (let i = 0; i < confettiParticles.length; i++) {
      const p = confettiParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.rotation += p.vRot;

      if (frameCount > 80) p.opacity -= 0.015;

      if (p.opacity > 0) {
        confettiCtx.save();
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate((p.rotation * Math.PI) / 180);
        confettiCtx.globalAlpha = Math.max(0, p.opacity);
        confettiCtx.fillStyle = p.color;
        confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        confettiCtx.restore();
      }
    }

    if (frameCount < 150) {
      confettiAnimationId = requestAnimationFrame(updateConfetti);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confettiAnimationId = null;
    }
  }

  confettiAnimationId = requestAnimationFrame(updateConfetti);
}

// ==========================================
// 9. HISTORIAL
// ==========================================
function addHistoryItem(item) {
  spinHistory.unshift({
    numPal: item.numPal,
    name: item.name,
    types: item.types,
    sprite: item.sprite,
    game: getPokemonGame(item),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  if (spinHistory.length > 8) spinHistory.pop();
  renderHistory();
}

function renderHistory() {
  historyListEl.innerHTML = '';
  if (spinHistory.length === 0) {
    historyListEl.innerHTML = '<span class="history-empty">Sin giros recientes en esta sesión.</span>';
    return;
  }

  spinHistory.forEach(hist => {
    const chip = document.createElement('div');
    chip.className = 'history-item';
    const mainType = (hist.types && hist.types[0]) || 'Normal';
    chip.innerHTML = `
      <img src="${hist.sprite || 'assets/pokeball.svg'}" alt="${hist.name}" onerror="this.src='assets/pokeball.svg'">
      <span>#${hist.numPal} <strong>${hist.name}</strong></span>
      <span class="type-badge type-${mainType}">${mainType}</span>
      ${getGameBadgeHtml(hist, 'mini')}
    `;
    historyListEl.appendChild(chip);
  });
}

// ==========================================
// 10. FILTROS
// ==========================================
function applyFilters() {
  if (isSpinning) return;
  const selectedType = typeFilter.value;
  const selectedRange = rangeFilter.value;

  let filtered = [...ALL_PALDEA_POKEMON];

  if (selectedType !== 'all') {
    filtered = filtered.filter(p => p.types && p.types.includes(selectedType));
  }

  if (selectedRange === 'starters') {
    filtered = filtered.filter(p => parseInt(p.numPal, 10) <= 24);
  } else if (selectedRange === '1-100') {
    filtered = filtered.filter(p => {
      const n = parseInt(p.numPal, 10);
      return n >= 1 && n <= 100;
    });
  } else if (selectedRange === '101-200') {
    filtered = filtered.filter(p => {
      const n = parseInt(p.numPal, 10);
      return n >= 101 && n <= 200;
    });
  } else if (selectedRange === '201-300') {
    filtered = filtered.filter(p => {
      const n = parseInt(p.numPal, 10);
      return n >= 201 && n <= 300;
    });
  } else if (selectedRange === '301-400') {
    filtered = filtered.filter(p => {
      const n = parseInt(p.numPal, 10);
      return n >= 301 && n <= 400;
    });
  } else if (selectedRange === 'paradox') {
    filtered = filtered.filter(p => parseInt(p.numPal, 10) >= 376);
  } else if (selectedRange === 'scarlet') {
    filtered = filtered.filter(p => getPokemonGame(p) === 'scarlet');
  } else if (selectedRange === 'violet') {
    filtered = filtered.filter(p => getPokemonGame(p) === 'violet');
  } else if (selectedRange === 'both') {
    filtered = filtered.filter(p => getPokemonGame(p) === 'both');
  }

  items = filtered.length >= 2 ? filtered : [...ALL_PALDEA_POKEMON];
  counterBadge.textContent = `${items.length} POKÉMON`;
  lastTrackedIndex = -1;
  drawWheel(currentRotation);
}

function selectRandomSubset(count = 16) {
  if (isSpinning) return;
  const shuffled = [...ALL_PALDEA_POKEMON].sort(() => Math.random() - 0.5);
  items = shuffled.slice(0, count);
  items.sort((a, b) => parseInt(a.numPal, 10) - parseInt(b.numPal, 10));

  typeFilter.value = 'all';
  rangeFilter.value = 'all';
  counterBadge.textContent = `${items.length} ALEATORIOS`;
  lastTrackedIndex = -1;
  drawWheel(currentRotation);
}

function resetAllPokemon() {
  if (isSpinning) return;
  typeFilter.value = 'all';
  rangeFilter.value = 'all';
  items = [...ALL_PALDEA_POKEMON];
  counterBadge.textContent = `${items.length} POKÉMON`;
  lastTrackedIndex = -1;
  drawWheel(currentRotation);
}

// ==========================================
// 11. EXPLORADOR POKÉDEX
// ==========================================
function renderPokedexModalList(filterQuery = '') {
  itemsListContainer.innerHTML = '';
  const q = filterQuery.toLowerCase().trim();

  const results = ALL_PALDEA_POKEMON.filter(p => {
    if (!q) return true;
    const g = getPokemonGame(p);
    const matchGame = (q === 'escarlata' && g === 'scarlet') ||
                      (q === 'purpura' && g === 'violet') ||
                      (q === 'púrpura' && g === 'violet') ||
                      (q === 'ambos' && g === 'both');
    return p.name.toLowerCase().includes(q) ||
           p.numPal.includes(q) ||
           (p.types && p.types.some(t => t.toLowerCase().includes(q))) ||
           matchGame;
  });

  if (results.length === 0) {
    itemsListContainer.innerHTML = '<div style="padding: 15px; color: var(--text-muted); text-align: center;">Sin coincidencias encontradas.</div>';
    return;
  }

  const limit = Math.min(results.length, 100);
  for (let i = 0; i < limit; i++) {
    const p = results[i];
    const isCaptured = capturedShinyList.some(c => c.numPal === p.numPal);
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <img src="${isCaptured ? (p.shinySprite || p.sprite) : p.sprite}" class="pokedex-row-thumb" alt="${p.name}" loading="lazy" onerror="this.src='assets/pokeball.svg'">
      <span class="item-row-num">#${p.numPal}</span>
      <span class="item-row-name">${p.name} ${isCaptured ? '★' : ''}</span>
      <div style="display: flex; gap: 4px; align-items: center;">
        ${(p.types || []).map(t => `<span class="type-badge type-${t}">${t}</span>`).join('')}
        ${getGameBadgeHtml(p, 'mini')}
      </div>
    `;
    itemsListContainer.appendChild(row);
  }

  if (results.length > limit) {
    const more = document.createElement('div');
    more.style.textAlign = 'center';
    more.style.padding = '8px';
    more.style.color = 'var(--text-muted)';
    more.style.fontSize = '0.78rem';
    more.textContent = `... Y ${results.length - limit} POKÉMON MÁS. USA EL BUSCADOR PARA FILTRAR.`;
    itemsListContainer.appendChild(more);
  }
}

// ==========================================
// 12. INICIALIZACIÓN & EVENTOS
// ==========================================
function initApp() {
  initTheme();
  setupCanvasResolution();
  preloadAllSprites();
  loadShinyTracking();
  updateSoundUI();
  drawWheel(currentRotation);
  renderHistory();

  // Giro
  spinBtn.addEventListener('click', spinWheel);
  centerSpinHub.addEventListener('click', spinWheel);

  window.addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.code === 'Enter') && !isSpinning) {
      if (winnerModal.classList.contains('active') || settingsModal.classList.contains('active')) return;
      e.preventDefault();
      spinWheel();
    }
  });

  // Tema
  themeToggleBtn.addEventListener('click', toggleTheme);

  // Filtros
  typeFilter.addEventListener('change', applyFilters);
  rangeFilter.addEventListener('change', applyFilters);
  randomSubsetBtn.addEventListener('click', () => selectRandomSubset(16));
  resetAllPokemonBtn.addEventListener('click', resetAllPokemon);

  // Sonido
  soundToggleBtn.addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    updateSoundUI();
  });

  // Dashboard Tabs
  tabPendingBtn.addEventListener('click', () => {
    tabPendingBtn.classList.add('active');
    tabCapturedBtn.classList.remove('active');
    tabHistoryBtn.classList.remove('active');
    pendingView.classList.add('active');
    capturedView.classList.remove('active');
    historyView.classList.remove('active');
  });

  tabCapturedBtn.addEventListener('click', () => {
    tabCapturedBtn.classList.add('active');
    tabPendingBtn.classList.remove('active');
    tabHistoryBtn.classList.remove('active');
    capturedView.classList.add('active');
    pendingView.classList.remove('active');
    historyView.classList.remove('active');
  });

  tabHistoryBtn.addEventListener('click', () => {
    tabHistoryBtn.classList.add('active');
    tabPendingBtn.classList.remove('active');
    tabCapturedBtn.classList.remove('active');
    historyView.classList.add('active');
    pendingView.classList.remove('active');
    capturedView.classList.remove('active');
  });

  // Modal Ganador / Línea Evolutiva Acciones
  // 1. Marcar Seleccionados como Shiny
  winnerCaptureShinyBtn.addEventListener('click', () => {
    if (selectedEvoIds.size > 0) {
      const selectedPokemonList = [];
      selectedEvoIds.forEach(id => {
        const p = PALDEA_BY_NUM.get(id);
        if (p) selectedPokemonList.push(p);
      });
      markMultipleAsShinyCaptured(selectedPokemonList);

      if (modalSource === 'wheel') {
        // Si el ganador de la ruleta no fue marcado como shiny, guardarlo como pendiente del giro anterior
        if (currentWonPokemon && !selectedEvoIds.has(currentWonPokemon.numPal)) {
          markAsPending(currentWonPokemon);
          lastSpinPendingIds = new Set([currentWonPokemon.numPal]);
          saveShinyTracking();
        } else {
          lastSpinPendingIds.clear();
          saveShinyTracking();
        }
      }
      playVictoryFanfare();
    } else if (modalSource === 'wheel' && currentWonPokemon) {
      // Si ninguno fue seleccionado desde la ruleta, guardar el ganador como pendiente del giro anterior
      markAsPending(currentWonPokemon);
      lastSpinPendingIds = new Set([currentWonPokemon.numPal]);
      saveShinyTracking();
    }
    closeWinnerModal();
  });

  // 2. Girar de Nuevo (guarda ganador en pendientes del giro anterior)
  winnerSpinAgainBtn.addEventListener('click', () => {
    if (currentWonPokemon) {
      markAsPending(currentWonPokemon);
      lastSpinPendingIds = new Set([currentWonPokemon.numPal]);
      saveShinyTracking();
    }
    closeWinnerModal();
    setTimeout(() => {
      spinWheel();
    }, 200);
  });

  // 3. Aceptar / Guardar Pendiente y Cerrar (ruleta)
  winnerAcceptBtn.addEventListener('click', () => {
    if (currentWonPokemon) {
      markAsPending(currentWonPokemon);
      lastSpinPendingIds = new Set([currentWonPokemon.numPal]);
      saveShinyTracking();
    }
    closeWinnerModal();
  });

  // 4. Cancelar o Desmarcar (abierto desde matriz o pendientes)
  if (winnerUnpendModalBtn) {
    winnerUnpendModalBtn.addEventListener('click', () => {
      if (currentWonPokemon) {
        removePending(currentWonPokemon);
      }
      closeWinnerModal();
    });
  }

  if (winnerCancelPendingBtn) {
    winnerCancelPendingBtn.addEventListener('click', () => {
      closeWinnerModal();
    });
  }

  // Si se cierra el modal haciendo clic fuera
  winnerModal.addEventListener('click', (e) => {
    if (e.target === winnerModal) {
      if (modalSource === 'wheel' && currentWonPokemon) {
        markAsPending(currentWonPokemon);
        lastSpinPendingIds = new Set([currentWonPokemon.numPal]);
        saveShinyTracking();
      }
      closeWinnerModal();
    }
  });

  // Eventos de la Matriz Gigante Paldea 400
  if (matrixSearchInput) {
    matrixSearchInput.addEventListener('input', (e) => {
      matrixSearchQuery = e.target.value;
      if (matrixClearSearchBtn) {
        matrixClearSearchBtn.style.display = matrixSearchQuery ? 'flex' : 'none';
      }
      renderPaldeaMatrix();
    });
  }

  if (matrixClearSearchBtn) {
    matrixClearSearchBtn.addEventListener('click', () => {
      matrixSearchInput.value = '';
      matrixSearchQuery = '';
      matrixClearSearchBtn.style.display = 'none';
      renderPaldeaMatrix();
    });
  }

  const matrixFilterBtns = document.querySelectorAll('[data-matrix-filter]');
  matrixFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      matrixFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMatrixFilter = btn.dataset.matrixFilter || 'all';
      renderPaldeaMatrix();
    });
  });

  if (matrixLastSpinPill) {
    matrixLastSpinPill.style.cursor = 'pointer';
    matrixLastSpinPill.addEventListener('click', () => {
      matrixFilterBtns.forEach(b => {
        if (b.dataset.matrixFilter === 'last-spin') {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
      currentMatrixFilter = 'last-spin';
      renderPaldeaMatrix();
    });
  }

  // Modal Catálogo
  settingsBtn.addEventListener('click', () => {
    pokedexSearch.value = '';
    renderPokedexModalList();
    settingsModal.classList.add('active');
  });

  closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('active');
  });

  closeSettingsFooterBtn.addEventListener('click', () => {
    settingsModal.classList.remove('active');
  });

  pokedexSearch.addEventListener('input', (e) => {
    renderPokedexModalList(e.target.value);
  });

  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.remove('active');
    }
  });

  window.addEventListener('resize', () => {
    setupCanvasResolution();
    drawWheel(currentRotation);
    setupConfettiCanvas();
  });

  // Inicializar Módulo de Cuentas y Base de Datos
  initAuthModule();

  // Inicializar Módulo Legal, Políticas y Consentimiento de Cookies
  initLegalAndCookieModule();

  // Comprobación de salud del servidor y sincronización en segundo plano
  if (window.ShinyAPI) {
    window.ShinyAPI.checkHealth().then(online => {
      if (online && window.ShinyAPI.isLoggedIn()) {
        syncCloudData(false);
      }
      updateAuthUI();
    });
  }
}

// ==========================================
// 10. MÓDULO DE AUTENTICACIÓN Y CUENTAS EN LA NUBE
// ==========================================
function initAuthModule() {
  if (!userAuthBtn) return;

  // Actualizar estado inicial de la interfaz
  updateAuthUI();

  // Suscribirse a cambios de estado de autenticación
  if (window.ShinyAPI) {
    window.ShinyAPI.onAuthChange(() => {
      updateAuthUI();
    });
  }

  // Apertura y Cierre de Modal
  userAuthBtn.addEventListener('click', openAuthModal);
  if (closeAuthBtn) closeAuthBtn.addEventListener('click', closeAuthModal);
  if (closeAuthFooterBtn) closeAuthFooterBtn.addEventListener('click', closeAuthModal);

  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) closeAuthModal();
    });
  }

  // Alternancia de Pestañas (Login / Registro)
  if (tabAuthLogin) {
    tabAuthLogin.addEventListener('click', () => switchAuthTab('login'));
  }
  if (tabAuthRegister) {
    tabAuthRegister.addEventListener('click', () => switchAuthTab('register'));
  }
  if (switchToRegisterLink) {
    switchToRegisterLink.addEventListener('click', () => switchAuthTab('register'));
  }
  if (switchToLoginLink) {
    switchToLoginLink.addEventListener('click', () => switchAuthTab('login'));
  }

  // Envío de Formularios
  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginSubmit);
  }
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegisterSubmit);
  }

  // Acciones de Perfil
  if (profileSyncNowBtn) {
    profileSyncNowBtn.addEventListener('click', () => syncCloudData(true));
  }
  if (profileLogoutBtn) {
    profileLogoutBtn.addEventListener('click', handleLogout);
  }
}

function updateAuthUI() {
  const isLogged = window.ShinyAPI && window.ShinyAPI.isLoggedIn();

  if (isLogged) {
    const user = window.ShinyAPI.getCurrentUser() || { username: 'ENTRENADOR' };
    const usernameUpper = (user.username || 'ENTRENADOR').toUpperCase();

    if (userAuthText) userAuthText.textContent = `★ ${usernameUpper}`;
    if (syncIndicatorDot) {
      syncIndicatorDot.className = 'sync-dot online';
      syncIndicatorDot.title = `Sesión iniciada: ${user.username} · Nube sincronizada`;
    }

    if (authModalTitle) authModalTitle.textContent = 'PERFIL DE ENTRENADOR';
    if (authCloudStatusBadge) {
      authCloudStatusBadge.textContent = `CONECTADO: ${usernameUpper}`;
      authCloudStatusBadge.classList.add('is-online');
    }

    if (authGuestTabs) authGuestTabs.style.display = 'none';
    if (loginForm) loginForm.classList.remove('active');
    if (registerForm) registerForm.classList.remove('active');

    if (profileView) {
      profileView.style.display = 'flex';
      if (profileUsername) profileUsername.textContent = usernameUpper;
      if (profileEmail) profileEmail.textContent = user.email || 'Sin correo vinculado';
      if (profileCapturedCount) profileCapturedCount.textContent = capturedShinyList.length;
      if (profilePendingCount) profilePendingCount.textContent = pendingList.length;

      const lastSync = window.ShinyAPI.getLastSyncTime();
      if (profileLastSync) {
        profileLastSync.textContent = lastSync 
          ? new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          : 'Recién iniciada';
      }
    }
  } else {
    if (userAuthText) userAuthText.textContent = 'CUENTA';
    if (syncIndicatorDot) {
      syncIndicatorDot.className = 'sync-dot offline';
      syncIndicatorDot.title = 'Modo local (invitado)';
    }

    if (authModalTitle) authModalTitle.textContent = 'GESTIÓN DE CUENTA';
    if (authCloudStatusBadge) {
      authCloudStatusBadge.textContent = 'MODO LOCAL (INVITADO)';
      authCloudStatusBadge.classList.remove('is-online');
    }

    if (authGuestTabs) authGuestTabs.style.display = 'flex';
    if (profileView) profileView.style.display = 'none';

    // Asegurar que una pestaña esté visible
    if (tabAuthRegister && tabAuthRegister.classList.contains('active')) {
      if (registerForm) registerForm.classList.add('active');
      if (loginForm) loginForm.classList.remove('active');
    } else {
      if (tabAuthLogin) tabAuthLogin.classList.add('active');
      if (loginForm) loginForm.classList.add('active');
      if (registerForm) registerForm.classList.remove('active');
    }
  }
}

function openAuthModal() {
  clearAuthAlert();
  updateAuthUI();
  if (authModal) authModal.classList.add('active');
}

function closeAuthModal() {
  if (authModal) authModal.classList.remove('active');
  clearAuthAlert();
}

function switchAuthTab(tab) {
  clearAuthAlert();
  if (tab === 'login') {
    if (tabAuthLogin) tabAuthLogin.classList.add('active');
    if (tabAuthRegister) tabAuthRegister.classList.remove('active');
    if (loginForm) loginForm.classList.add('active');
    if (registerForm) registerForm.classList.remove('active');
  } else {
    if (tabAuthRegister) tabAuthRegister.classList.add('active');
    if (tabAuthLogin) tabAuthLogin.classList.remove('active');
    if (registerForm) registerForm.classList.add('active');
    if (loginForm) loginForm.classList.remove('active');
  }
}

function showAuthAlert(message, type = 'error') {
  if (!authAlertBox) return;
  authAlertBox.textContent = message;
  authAlertBox.className = `auth-alert ${type}`;
  authAlertBox.style.display = 'flex';
}

function clearAuthAlert() {
  if (!authAlertBox) return;
  authAlertBox.textContent = '';
  authAlertBox.style.display = 'none';
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  clearAuthAlert();

  const id = loginIdentifier ? loginIdentifier.value.trim() : '';
  const pw = loginPassword ? loginPassword.value : '';

  if (!id || !pw) {
    showAuthAlert('Debes completar usuario/correo y contraseña.', 'error');
    return;
  }

  if (submitLoginBtn) {
    submitLoginBtn.disabled = true;
    const span = submitLoginBtn.querySelector('span');
    if (span) span.textContent = 'VERIFICANDO...';
  }

  const res = await window.ShinyAPI.login(id, pw);

  if (submitLoginBtn) {
    submitLoginBtn.disabled = false;
    const span = submitLoginBtn.querySelector('span');
    if (span) span.textContent = 'INICIAR SESIÓN';
  }

  if (!res.ok) {
    showAuthAlert(res.error || 'Credenciales incorrectas.', 'error');
  } else {
    showAuthAlert('¡Sesión iniciada con éxito! Sincronizando datos con la nube...', 'success');
    if (loginPassword) loginPassword.value = '';
    await syncCloudData(false);
    updateAuthUI();
    setTimeout(() => {
      clearAuthAlert();
    }, 1200);
  }
}

async function handleRegisterSubmit(e) {
  e.preventDefault();
  clearAuthAlert();

  const username = registerUsername ? registerUsername.value.trim() : '';
  const email = registerEmail ? registerEmail.value.trim() : '';
  const password = registerPassword ? registerPassword.value : '';
  const confirmPassword = registerConfirmPassword ? registerConfirmPassword.value : '';
  const doSync = registerSyncCheck ? registerSyncCheck.checked : true;

  if (!username || !password) {
    showAuthAlert('Nombre de usuario y contraseña son requeridos.', 'error');
    return;
  }

  if (password.length < 6) {
    showAuthAlert('La contraseña debe tener un mínimo de 6 caracteres.', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showAuthAlert('Las contraseñas no coinciden.', 'error');
    return;
  }

  if (submitRegisterBtn) {
    submitRegisterBtn.disabled = true;
    const span = submitRegisterBtn.querySelector('span');
    if (span) span.textContent = 'CREANDO CUENTA...';
  }

  const res = await window.ShinyAPI.register(username, email, password);

  if (submitRegisterBtn) {
    submitRegisterBtn.disabled = false;
    const span = submitRegisterBtn.querySelector('span');
    if (span) span.textContent = 'CREAR CUENTA Y GUARDAR';
  }

  if (!res.ok) {
    showAuthAlert(res.error || 'No se pudo crear la cuenta.', 'error');
  } else {
    showAuthAlert('¡Cuenta creada y registrada en la base de datos con éxito!', 'success');
    if (registerPassword) registerPassword.value = '';
    if (registerConfirmPassword) registerConfirmPassword.value = '';

    if (doSync) {
      await syncCloudData(false);
    }
    updateAuthUI();
    setTimeout(() => {
      clearAuthAlert();
    }, 1200);
  }
}

function handleLogout() {
  if (window.ShinyAPI) {
    window.ShinyAPI.logout();
  }
  showAuthAlert('Sesión cerrada. Regresando a Modo Local (Invitado).', 'info');
  updateAuthUI();
}

async function syncCloudData(manual = false) {
  if (!window.ShinyAPI || !window.ShinyAPI.isLoggedIn()) return;

  if (syncIndicatorDot) {
    syncIndicatorDot.className = 'sync-dot syncing';
  }

  try {
    const payload = {
      dexId: currentDexId,
      captured: capturedShinyList,
      pending: pendingList,
      lastSpinPending: [...lastSpinPendingIds],
      theme: currentTheme,
      audio: audioEnabled,
      currentDex: currentDexId
    };

    const res = await window.ShinyAPI.syncProgressWithCloud(payload);
    if (res.ok && res.data) {
      if (Array.isArray(res.data.captured)) {
        capturedShinyList = res.data.captured;
      }
      if (Array.isArray(res.data.pending)) {
        pendingList = res.data.pending;
      }
      if (Array.isArray(res.data.lastSpinPending)) {
        lastSpinPendingIds = new Set(res.data.lastSpinPending);
      }
      saveShinyTracking(currentDexId);

      if (profileLastSync) {
        profileLastSync.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }

      if (manual) {
        showAuthAlert('Progreso sincronizado con la nube exitosamente.', 'success');
      }
    } else if (manual) {
      showAuthAlert(res.error || 'No se pudo sincronizar el progreso.', 'error');
    }
  } catch (err) {
    console.warn('[CLOUD] Error sincronizando:', err);
    if (manual) {
      showAuthAlert('Error de red al sincronizar con el servidor.', 'error');
    }
  } finally {
    if (syncIndicatorDot) {
      syncIndicatorDot.className = window.ShinyAPI.isLoggedIn() ? 'sync-dot online' : 'sync-dot offline';
    }
  }
}

// ==========================================
// 11. MÓDULO LEGAL, POLÍTICAS Y CONSENTIMIENTO DE COOKIES
// ==========================================
function initLegalAndCookieModule() {
  const legalModal = document.getElementById('legalModal');
  const closeLegalBtn = document.getElementById('closeLegalBtn');
  const closeLegalFooterBtn = document.getElementById('closeLegalFooterBtn');
  const cookieConsentBanner = document.getElementById('cookieConsentBanner');
  const acceptCookiesBtn = document.getElementById('acceptCookiesBtn');
  const rejectCookiesBtn = document.getElementById('rejectCookiesBtn');
  const cookiePrivacyLink = document.getElementById('cookiePrivacyLink');
  const toggleAdCookiesBtn = document.getElementById('toggleAdCookiesBtn');

  const footerBtnCopyright = document.getElementById('footerBtnCopyright');
  const footerBtnPrivacy = document.getElementById('footerBtnPrivacy');
  const footerBtnTerms = document.getElementById('footerBtnTerms');
  const footerBtnCookies = document.getElementById('footerBtnCookies');

  const tabLegalCopyright = document.getElementById('tabLegalCopyright');
  const tabLegalPrivacy = document.getElementById('tabLegalPrivacy');
  const tabLegalTerms = document.getElementById('tabLegalTerms');
  const tabLegalCookies = document.getElementById('tabLegalCookies');

  const panelLegalCopyright = document.getElementById('panelLegalCopyright');
  const panelLegalPrivacy = document.getElementById('panelLegalPrivacy');
  const panelLegalTerms = document.getElementById('panelLegalTerms');
  const panelLegalCookies = document.getElementById('panelLegalCookies');

  const tabs = [
    { btn: tabLegalCopyright, panel: panelLegalCopyright },
    { btn: tabLegalPrivacy, panel: panelLegalPrivacy },
    { btn: tabLegalTerms, panel: panelLegalTerms },
    { btn: tabLegalCookies, panel: panelLegalCookies }
  ];

  function switchLegalTab(targetPanel) {
    tabs.forEach(t => {
      if (t.panel === targetPanel) {
        if (t.btn) t.btn.classList.add('active');
        if (t.panel) t.panel.classList.add('active');
      } else {
        if (t.btn) t.btn.classList.remove('active');
        if (t.panel) t.panel.classList.remove('active');
      }
    });
  }

  function openLegalModal(panel) {
    if (panel) switchLegalTab(panel);
    if (legalModal) legalModal.classList.add('active');
  }

  function closeLegalModal() {
    if (legalModal) legalModal.classList.remove('active');
  }

  // Eventos de apertura desde el pie de página
  if (footerBtnCopyright) footerBtnCopyright.addEventListener('click', () => openLegalModal(panelLegalCopyright));
  if (footerBtnPrivacy) footerBtnPrivacy.addEventListener('click', () => openLegalModal(panelLegalPrivacy));
  if (footerBtnTerms) footerBtnTerms.addEventListener('click', () => openLegalModal(panelLegalTerms));
  if (footerBtnCookies) footerBtnCookies.addEventListener('click', () => openLegalModal(panelLegalCookies));

  // Eventos de pestañas internas del modal
  if (tabLegalCopyright) tabLegalCopyright.addEventListener('click', () => switchLegalTab(panelLegalCopyright));
  if (tabLegalPrivacy) tabLegalPrivacy.addEventListener('click', () => switchLegalTab(panelLegalPrivacy));
  if (tabLegalTerms) tabLegalTerms.addEventListener('click', () => switchLegalTab(panelLegalTerms));
  if (tabLegalCookies) tabLegalCookies.addEventListener('click', () => switchLegalTab(panelLegalCookies));

  // Cerrar modal
  if (closeLegalBtn) closeLegalBtn.addEventListener('click', closeLegalModal);
  if (closeLegalFooterBtn) closeLegalFooterBtn.addEventListener('click', closeLegalModal);
  if (legalModal) {
    legalModal.addEventListener('click', (e) => {
      if (e.target === legalModal) closeLegalModal();
    });
  }

  // Banner de Consentimiento de Cookies (Google AdSense / GDPR)
  const consentSaved = localStorage.getItem('ruleta_cookies_accepted');
  if (!consentSaved && cookieConsentBanner) {
    setTimeout(() => {
      cookieConsentBanner.style.display = 'block';
    }, 600);
  }

  if (acceptCookiesBtn) {
    acceptCookiesBtn.addEventListener('click', () => {
      localStorage.setItem('ruleta_cookies_accepted', 'all');
      if (cookieConsentBanner) cookieConsentBanner.style.display = 'none';
    });
  }

  if (rejectCookiesBtn) {
    rejectCookiesBtn.addEventListener('click', () => {
      localStorage.setItem('ruleta_cookies_accepted', 'essential');
      if (cookieConsentBanner) cookieConsentBanner.style.display = 'none';
    });
  }

  if (cookiePrivacyLink) {
    cookiePrivacyLink.addEventListener('click', () => {
      openLegalModal(panelLegalPrivacy);
    });
  }

  if (toggleAdCookiesBtn) {
    toggleAdCookiesBtn.addEventListener('click', () => {
      const current = localStorage.getItem('ruleta_cookies_accepted') || 'essential';
      const next = current === 'all' ? 'essential' : 'all';
      localStorage.setItem('ruleta_cookies_accepted', next);
      alert(next === 'all' 
        ? 'Preferencia actualizada: Anuncios personalizados HABILITADOS.' 
        : 'Preferencia actualizada: Solo cookies técnicas esenciales activas (anuncios genéricos no personalizados).'
      );
    });
  }
}

document.addEventListener('DOMContentLoaded', initApp);


