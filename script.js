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
const PALDEA_BY_NAT = new Map();
ALL_PALDEA_POKEMON.forEach(p => {
  PALDEA_BY_NUM.set(p.numPal, p);
  PALDEA_BY_NUM.set(String(parseInt(p.numPal, 10)), p);
  if (p.numNac) {
    PALDEA_BY_NAT.set(p.numNac, p);
    PALDEA_BY_NAT.set(String(parseInt(p.numNac, 10)), p);
  }
});

const ALL_NATIONAL_POKEMON = (window.ALL_NATIONAL_POKEMON || []).map((p, index) => {
  p.color = p.color || getPokemonColor(p, index);
  return p;
});
const NATIONAL_BY_ID = new Map();
ALL_NATIONAL_POKEMON.forEach(p => {
  NATIONAL_BY_ID.set(p.pokemonId, p);
  NATIONAL_BY_ID.set(p.numNac, p);
  NATIONAL_BY_ID.set(String(parseInt(p.numNac, 10)), p);
});

// Datasets canónicos para todos los juegos de Nintendo Switch
const ALL_GALAR_POKEMON = (window.GALAR_POKEMON || []).map((p, index) => {
  p.color = p.color || getPokemonColor(p, index);
  return p;
});
const GALAR_BY_NUM = new Map();
const GALAR_BY_NAT = new Map();
ALL_GALAR_POKEMON.forEach(p => {
  GALAR_BY_NUM.set(p.numGal, p);
  GALAR_BY_NUM.set(String(parseInt(p.numGal, 10)), p);
  if (p.numNac) {
    GALAR_BY_NAT.set(p.numNac, p);
    GALAR_BY_NAT.set(String(parseInt(p.numNac, 10)), p);
  }
});

const ALL_HISUI_POKEMON = (window.HISUI_POKEMON || []).map((p, index) => {
  p.color = p.color || getPokemonColor(p, index);
  return p;
});
const HISUI_BY_NUM = new Map();
const HISUI_BY_NAT = new Map();
ALL_HISUI_POKEMON.forEach(p => {
  HISUI_BY_NUM.set(p.numHis, p);
  HISUI_BY_NUM.set(String(parseInt(p.numHis, 10)), p);
  if (p.numNac) {
    HISUI_BY_NAT.set(p.numNac, p);
    HISUI_BY_NAT.set(String(parseInt(p.numNac, 10)), p);
  }
});

const ALL_SINNOH_POKEMON = (window.SINNOH_POKEMON || []).map((p, index) => {
  p.color = p.color || getPokemonColor(p, index);
  return p;
});
const SINNOH_BY_NUM = new Map();
const SINNOH_BY_NAT = new Map();
ALL_SINNOH_POKEMON.forEach(p => {
  SINNOH_BY_NUM.set(p.numSin, p);
  SINNOH_BY_NUM.set(String(parseInt(p.numSin, 10)), p);
  if (p.numNac) {
    SINNOH_BY_NAT.set(p.numNac, p);
    SINNOH_BY_NAT.set(String(parseInt(p.numNac, 10)), p);
  }
});

const ALL_LETSGO_POKEMON = (window.LETSGO_POKEMON || []).map((p, index) => {
  p.color = p.color || getPokemonColor(p, index);
  return p;
});
const LETSGO_BY_NUM = new Map();
const LETSGO_BY_NAT = new Map();
ALL_LETSGO_POKEMON.forEach(p => {
  LETSGO_BY_NUM.set(p.numKan, p);
  LETSGO_BY_NUM.set(String(parseInt(p.numKan, 10)), p);
  if (p.numNac) {
    LETSGO_BY_NAT.set(p.numNac, p);
    LETSGO_BY_NAT.set(String(parseInt(p.numNac, 10)), p);
  }
});

const ALL_LUMIOSE_POKEMON = (window.LUMIOSE_POKEMON || []).map((p, index) => {
  p.color = p.color || getPokemonColor(p, index);
  return p;
});
const LUMIOSE_BY_NUM = new Map();
const LUMIOSE_BY_NAT = new Map();
ALL_LUMIOSE_POKEMON.forEach(p => {
  LUMIOSE_BY_NUM.set(p.numLum, p);
  LUMIOSE_BY_NUM.set(String(parseInt(p.numLum, 10)), p);
  if (p.numNac) {
    LUMIOSE_BY_NAT.set(p.numNac, p);
    LUMIOSE_BY_NAT.set(String(parseInt(p.numNac, 10)), p);
  }
});

// Catálogos Oficiales de Pokédex disponibles (7 Pokédexes independientes)
const DEX_CONFIGS = {
  general: {
    id: 'general',
    name: 'Ruleta General (Gens 1-9)',
    shortName: 'GENERAL',
    totalCount: 1025,
    matrixTitle: 'MATRIZ GENERAL (1025)',
    catalogTitle: 'CATÁLOGO NACIONAL COMPLETO (1025)',
    getItems: () => ALL_NATIONAL_POKEMON
  },
  paldea: {
    id: 'paldea',
    name: 'Pokédex de Paldea (Escarlata / Púrpura)',
    shortName: 'PALDEA',
    totalCount: 400,
    matrixTitle: 'MATRIZ PALDEA (400)',
    catalogTitle: 'CATÁLOGO POKÉDEX DE PALDEA (400)',
    getItems: () => ALL_PALDEA_POKEMON
  },
  swsh: {
    id: 'swsh',
    name: 'Pokédex de Galar (Espada / Escudo)',
    shortName: 'ESPADA / ESCUDO',
    totalCount: 400,
    matrixTitle: 'MATRIZ GALAR (400)',
    catalogTitle: 'CATÁLOGO POKÉDEX DE GALAR (400)',
    getItems: () => ALL_GALAR_POKEMON
  },
  pla: {
    id: 'pla',
    name: 'Pokédex de Hisui (Leyendas Arceus)',
    shortName: 'LEYENDAS ARCEUS',
    totalCount: 242,
    matrixTitle: 'MATRIZ HISUI (242)',
    catalogTitle: 'CATÁLOGO POKÉDEX DE HISUI (242)',
    getItems: () => ALL_HISUI_POKEMON
  },
  bdsp: {
    id: 'bdsp',
    name: 'Pokédex de Sinnoh (DB / PR)',
    shortName: 'DIAMANTE / PERLA',
    totalCount: 151,
    matrixTitle: 'MATRIZ SINNOH (151)',
    catalogTitle: 'CATÁLOGO POKÉDEX DE SINNOH (151)',
    getItems: () => ALL_SINNOH_POKEMON
  },
  lgpe: {
    id: 'lgpe',
    name: "Pokédex de Kanto (Let's Go P/E)",
    shortName: "LET'S GO",
    totalCount: 153,
    matrixTitle: "MATRIZ KANTO LET'S GO (153)",
    catalogTitle: "CATÁLOGO POKÉDEX LET'S GO (153)",
    getItems: () => ALL_LETSGO_POKEMON
  },
  plza: {
    id: 'plza',
    name: 'Pokédex de Luminalia (Leyendas Z-A)',
    shortName: 'LEYENDAS Z-A',
    totalCount: 232,
    matrixTitle: 'MATRIZ LUMINALIA (232)',
    catalogTitle: 'CATÁLOGO POKÉDEX DE LUMINALIA (232)',
    getItems: () => ALL_LUMIOSE_POKEMON
  }
};

// Contexto activo de Pokédex / Juego (por defecto 'general' como solicitó el usuario)
let currentDexId = localStorage.getItem('ruleta_active_dex') || 'general';

function getActiveDexConfig() {
  return DEX_CONFIGS[currentDexId] || DEX_CONFIGS.general;
}

function getActiveDexFullList() {
  return getActiveDexConfig().getItems();
}

function getPokemonId(pokemon) {
  if (!pokemon) return '';
  switch (currentDexId) {
    case 'paldea':
      return String(pokemon.numPal || pokemon.pokemonId || pokemon.numNac || pokemon.id || '');
    case 'swsh':
      return String(pokemon.numGal || pokemon.pokemonId || pokemon.numNac || pokemon.id || '');
    case 'pla':
      return String(pokemon.numHis || pokemon.pokemonId || pokemon.numNac || pokemon.id || '');
    case 'bdsp':
      return String(pokemon.numSin || pokemon.pokemonId || pokemon.numNac || pokemon.id || '');
    case 'lgpe':
      return String(pokemon.numKan || pokemon.pokemonId || pokemon.numNac || pokemon.id || '');
    case 'plza':
      return String(pokemon.numLum || pokemon.pokemonId || pokemon.numNac || pokemon.id || '');
    default:
      return String(pokemon.pokemonId || pokemon.numNac || pokemon.numPal || pokemon.id || '');
  }
}

function getPokemonDisplayNum(pokemon) {
  if (!pokemon) return '';
  switch (currentDexId) {
    case 'paldea':
      return pokemon.numPal || pokemon.numNac || pokemon.pokemonId || '';
    case 'swsh':
      return pokemon.numGal || pokemon.numNac || pokemon.pokemonId || '';
    case 'pla':
      return pokemon.numHis || pokemon.numNac || pokemon.pokemonId || '';
    case 'bdsp':
      return pokemon.numSin || pokemon.numNac || pokemon.pokemonId || '';
    case 'lgpe':
      return pokemon.numKan || pokemon.numNac || pokemon.pokemonId || '';
    case 'plza':
      return pokemon.numLum || pokemon.numNac || pokemon.pokemonId || '';
    default:
      return pokemon.numNac || pokemon.pokemonId || '';
  }
}

function getPokemonByAnyId(id) {
  if (!id) return null;
  const idStr = String(id).trim();
  const numInt = parseInt(idStr, 10);
  if (isNaN(numInt)) return null;

  const numIntStr = String(numInt);
  const pad3 = numIntStr.padStart(3, '0');
  const pad4 = numIntStr.padStart(4, '0');
  const isExplicitNational = idStr.length === 4;

  // 1. Si estamos en Ruleta General (Gens 1-9), la fuente canónica es el catálogo Nacional
  if (currentDexId === 'general') {
    const nat = NATIONAL_BY_ID.get(pad4) || NATIONAL_BY_ID.get(numIntStr);
    if (nat) return nat;
  }

  // 2. Si es una búsqueda explícitamente nacional de 4 dígitos (ej. "0001", "0152", "0906"):
  if (isExplicitNational) {
    let natInDex = null;
    if (currentDexId === 'paldea') natInDex = PALDEA_BY_NAT.get(pad4) || PALDEA_BY_NAT.get(numIntStr);
    else if (currentDexId === 'swsh') natInDex = GALAR_BY_NAT.get(pad4) || GALAR_BY_NAT.get(numIntStr);
    else if (currentDexId === 'pla') natInDex = HISUI_BY_NAT.get(pad4) || HISUI_BY_NAT.get(numIntStr);
    else if (currentDexId === 'bdsp') natInDex = SINNOH_BY_NAT.get(pad4) || SINNOH_BY_NAT.get(numIntStr);
    else if (currentDexId === 'lgpe') natInDex = LETSGO_BY_NAT.get(pad4) || LETSGO_BY_NAT.get(numIntStr);
    else if (currentDexId === 'plza') natInDex = LUMIOSE_BY_NAT.get(pad4) || LUMIOSE_BY_NAT.get(numIntStr);

    if (natInDex) return natInDex;

    const nat = NATIONAL_BY_ID.get(pad4) || NATIONAL_BY_ID.get(numIntStr);
    if (nat) return nat;
  }

  // 3. Búsqueda por número regional en la Pokédex activa (1 a 3 dígitos)
  if (currentDexId === 'paldea') {
    const found = PALDEA_BY_NUM.get(pad3) || PALDEA_BY_NUM.get(numIntStr);
    if (found) return found;
  } else if (currentDexId === 'swsh') {
    const found = GALAR_BY_NUM.get(pad3) || GALAR_BY_NUM.get(numIntStr);
    if (found) return found;
  } else if (currentDexId === 'pla') {
    const found = HISUI_BY_NUM.get(pad3) || HISUI_BY_NUM.get(numIntStr);
    if (found) return found;
  } else if (currentDexId === 'bdsp') {
    const found = SINNOH_BY_NUM.get(pad3) || SINNOH_BY_NUM.get(numIntStr);
    if (found) return found;
  } else if (currentDexId === 'lgpe') {
    const found = LETSGO_BY_NUM.get(pad3) || LETSGO_BY_NUM.get(numIntStr);
    if (found) return found;
  } else if (currentDexId === 'plza') {
    const found = LUMIOSE_BY_NUM.get(pad3) || LUMIOSE_BY_NUM.get(numIntStr);
    if (found) return found;
  }

  // 4. Respaldo general: catálogo Nacional
  const nat = NATIONAL_BY_ID.get(pad4) || NATIONAL_BY_ID.get(numIntStr);
  if (nat) return nat;

  // 5. Último recurso: otros catálogos regionales
  return PALDEA_BY_NUM.get(pad3) || GALAR_BY_NUM.get(pad3) || HISUI_BY_NUM.get(pad3) ||
         SINNOH_BY_NUM.get(pad3) || LETSGO_BY_NUM.get(pad3) || LUMIOSE_BY_NUM.get(pad3) || null;
}

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

// Conjuntos oficiales de exclusivos de Espada y Escudo (Nº Nacional)
const SWORD_EXCLUSIVE_SET = new Set([
  '83', '865', '273', '274', '275', '303', '338', '539', '554', '555', '559', '560',
  '574', '575', '576', '627', '628', '633', '634', '635', '684', '685',
  '766', '776', '782', '783', '784', '841', '874', '888'
]);

const SHIELD_EXCLUSIVE_SET = new Set([
  '77', '78', '222', '864', '246', '247', '248', '270', '271', '272', '302', '337',
  '453', '454', '538', '577', '578', '579', '629', '630', '682', '683', '704', '705', '706',
  '765', '780', '842', '875', '889'
]);

// Conjuntos oficiales de exclusivos de Diamante Brillante y Perla Reluciente (Nº Nacional)
const DIAMOND_EXCLUSIVE_SET = new Set(['122', '198', '408', '409', '430', '434', '435', '439', '483']);
const PEARL_EXCLUSIVE_SET = new Set(['185', '200', '410', '411', '429', '431', '432', '438', '484']);

// Conjuntos oficiales de exclusivos de Let's Go Pikachu y Eevee (Nº Nacional)
const PIKACHU_EXCLUSIVE_SET = new Set(['27', '28', '43', '44', '45', '56', '57', '58', '59', '88', '89', '123']);
const EEVEE_EXCLUSIVE_SET = new Set(['23', '24', '37', '38', '52', '53', '69', '70', '71', '109', '110', '127']);

function getPokemonGame(pokemon) {
  if (!pokemon) return 'both';
  if (pokemon.game) return pokemon.game;

  const natId = String(parseInt(pokemon.numNac || pokemon.pokemonId || '0', 10));

  if (currentDexId === 'paldea') {
    const num = pokemon.numPal;
    if (num && SCARLET_EXCLUSIVE_SET.has(String(parseInt(num, 10)))) return 'scarlet';
    if (num && VIOLET_EXCLUSIVE_SET.has(String(parseInt(num, 10)))) return 'violet';
    return 'both';
  }

  if (currentDexId === 'swsh') {
    if (SWORD_EXCLUSIVE_SET.has(natId)) return 'sword';
    if (SHIELD_EXCLUSIVE_SET.has(natId)) return 'shield';
    return 'both';
  }

  if (currentDexId === 'bdsp') {
    if (DIAMOND_EXCLUSIVE_SET.has(natId)) return 'diamond';
    if (PEARL_EXCLUSIVE_SET.has(natId)) return 'pearl';
    return 'both';
  }

  if (currentDexId === 'lgpe') {
    if (PIKACHU_EXCLUSIVE_SET.has(natId)) return 'pikachu';
    if (EEVEE_EXCLUSIVE_SET.has(natId)) return 'eevee';
    return 'both';
  }

  if (currentDexId === 'pla') {
    return 'hisui';
  }

  if (currentDexId === 'plza') {
    return 'lumina';
  }

  return 'both';
}

function getGameBadgeHtml(pokemon, variant = 'normal') {
  if (!pokemon) return '';

  if (currentDexId === 'paldea') {
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

  if (currentDexId === 'swsh') {
    const game = getPokemonGame(pokemon);
    let shortLabel = 'AMBOS';
    let fullLabel = 'AMBOS';
    let title = 'Disponible en Pokémon Espada y Escudo';

    if (game === 'sword') {
      shortLabel = 'ESP';
      fullLabel = 'ESPADA';
      title = 'Exclusivo de Pokémon Espada';
    } else if (game === 'shield') {
      shortLabel = 'ESC';
      fullLabel = 'ESCUDO';
      title = 'Exclusivo de Pokémon Escudo';
    }

    const label = (variant === 'mini') ? shortLabel : fullLabel;

    return `<span class="game-badge game-badge-${game} ${variant === 'mini' ? 'game-badge-mini' : ''}" title="${title}">
      <span class="game-dot game-dot-${game}"></span>
      <span class="game-text">${label}</span>
    </span>`;
  }

  if (currentDexId === 'bdsp') {
    const game = getPokemonGame(pokemon);
    let shortLabel = 'AMBOS';
    let fullLabel = 'AMBOS';
    let title = 'Disponible en Diamante Brillante y Perla Reluciente';

    if (game === 'diamond') {
      shortLabel = 'DB';
      fullLabel = 'DIAMANTE';
      title = 'Exclusivo de Diamante Brillante';
    } else if (game === 'pearl') {
      shortLabel = 'PR';
      fullLabel = 'PERLA';
      title = 'Exclusivo de Perla Reluciente';
    }

    const label = (variant === 'mini') ? shortLabel : fullLabel;

    return `<span class="game-badge game-badge-${game} ${variant === 'mini' ? 'game-badge-mini' : ''}" title="${title}">
      <span class="game-dot game-dot-${game}"></span>
      <span class="game-text">${label}</span>
    </span>`;
  }

  if (currentDexId === 'lgpe') {
    const game = getPokemonGame(pokemon);
    let shortLabel = 'AMBOS';
    let fullLabel = 'AMBOS';
    let title = "Disponible en Let's Go, Pikachu! y Let's Go, Eevee!";

    if (game === 'pikachu') {
      shortLabel = 'LGP';
      fullLabel = 'PIKACHU';
      title = "Exclusivo de Pokémon: Let's Go, Pikachu!";
    } else if (game === 'eevee') {
      shortLabel = 'LGE';
      fullLabel = 'EEVEE';
      title = "Exclusivo de Pokémon: Let's Go, Eevee!";
    }

    const label = (variant === 'mini') ? shortLabel : fullLabel;

    return `<span class="game-badge game-badge-${game} ${variant === 'mini' ? 'game-badge-mini' : ''}" title="${title}">
      <span class="game-dot game-dot-${game}"></span>
      <span class="game-text">${label}</span>
    </span>`;
  }

  if (currentDexId === 'pla') {
    const shortLabel = 'HISUI';
    const fullLabel = 'HISUI';
    const title = 'Pokédex de Hisui (Leyendas Pokémon: Arceus)';
    const label = (variant === 'mini') ? shortLabel : fullLabel;

    return `<span class="game-badge game-badge-hisui ${variant === 'mini' ? 'game-badge-mini' : ''}" title="${title}">
      <span class="game-dot game-dot-hisui"></span>
      <span class="game-text">${label}</span>
    </span>`;
  }

  if (currentDexId === 'plza') {
    const shortLabel = 'Z-A';
    const fullLabel = 'LUMINALIA';
    const title = 'Pokédex de Ciudad Luminalia (Leyendas Pokémon: Z-A)';
    const label = (variant === 'mini') ? shortLabel : fullLabel;

    return `<span class="game-badge game-badge-lumina ${variant === 'mini' ? 'game-badge-mini' : ''}" title="${title}">
      <span class="game-dot game-dot-lumina"></span>
      <span class="game-text">${label}</span>
    </span>`;
  }

  // Ruleta General (Gens 1 a 9)
  if (variant === 'mini') {
    return getPokemonGamesBadgesHtml(pokemon);
  }

  // Variante normal para Live Pointer Tracker
  const tooltip = getPokemonGamesTooltipText(pokemon);
  return `<div class="tracker-games-row" title="Disponible en: ${tooltip}">
    <span class="tracker-games-label">JUEGOS:</span>
    ${getPokemonGamesBadgesHtml(pokemon)}
  </div>`;
}

const GAME_NAMES_MAP = {
  'SV': 'Escarlata / Púrpura',
  'SV-DLC': 'Escarlata / Púrpura (DLC)',
  'PLZA': 'Leyendas Z-A',
  'PLZA-DLC': 'Leyendas Z-A (DLC)',
  'SwSh': 'Espada / Escudo',
  'SwSh-DLC': 'Espada / Escudo (DLC)',
  'PLA': 'Leyendas Arceus',
  'BDSP': 'Diamante B. / Perla R.',
  'LGPE': "Let's Go Pikachu / Eevee",
  'SM': 'Sol / Luna',
  'USUM': 'Ultrasol / Ultraluna',
  'XY': 'X / Y',
  'ORAS': 'Rubí Omega / Zafiro Alfa',
  'BW': 'Negro / Blanco',
  'B2W2': 'Negro 2 / Blanco 2',
  'DP': 'Diamante / Perla',
  'Pt': 'Platino',
  'HGSS': 'HeartGold / SoulSilver',
  'RS': 'Rubí / Zafiro',
  'E': 'Esmeralda',
  'FRLG': 'Rojo Fuego / Verde Hoja',
  'GS': 'Oro / Plata',
  'C': 'Cristal',
  'RB': 'Rojo / Azul',
  'Y': 'Amarillo'
};

const SWITCH_GAME_DEFS = [
  { code: 'SV', dlc: 'SV-DLC', label: 'SV', name: 'Pokémon Escarlata y Púrpura', cls: 'pill-sv' },
  { code: 'PLZA', dlc: 'PLZA-DLC', label: 'Z-A', name: 'Leyendas Pokémon: Z-A', cls: 'pill-plza' },
  { code: 'SwSh', dlc: 'SwSh-DLC', label: 'SwSh', name: 'Pokémon Espada y Escudo', cls: 'pill-swsh' },
  { code: 'PLA', label: 'PLA', name: 'Leyendas Pokémon: Arceus', cls: 'pill-pla' },
  { code: 'BDSP', label: 'BDSP', name: 'Pokémon Diamante B. y Perla R.', cls: 'pill-bdsp' },
  { code: 'LGPE', label: 'LGPE', name: "Pokémon Let's Go Pikachu / Eevee", cls: 'pill-lgpe' }
];

const ALL_SWITCH_GAME_CODES = ['SV', 'SV-DLC', 'PLZA', 'PLZA-DLC', 'SwSh', 'SwSh-DLC', 'PLA', 'BDSP', 'LGPE'];

function resolvePokemonGames(pokemon) {
  if (!pokemon) return [];
  const natKey = pokemon.numNac || (currentDexId === 'general' ? pokemon.pokemonId : '');
  if (natKey) {
    const numInt = parseInt(natKey, 10);
    if (!isNaN(numInt)) {
      const pad4 = String(numInt).padStart(4, '0');
      const canonicalNat = NATIONAL_BY_ID.get(pad4) || NATIONAL_BY_ID.get(String(numInt));
      if (canonicalNat && Array.isArray(canonicalNat.games) && canonicalNat.games.length > 0) {
        return canonicalNat.games;
      }
    }
  }
  return Array.isArray(pokemon.games) ? pokemon.games : [];
}

function getPokemonGamesTooltipText(pokemon) {
  if (!pokemon) return '';
  const games = resolvePokemonGames(pokemon);
  return games.map(g => GAME_NAMES_MAP[g] || g).join(', ');
}

function getPokemonGamesBadgesHtml(pokemon) {
  if (!pokemon) return '';
  const games = resolvePokemonGames(pokemon);
  const pills = [];

  for (const def of SWITCH_GAME_DEFS) {
    const isAvail = games.includes(def.code) || (def.dlc && games.includes(def.dlc));
    if (isAvail) {
      pills.push(`<span class="game-pill ${def.cls}" title="Disponible en ${def.name}">${def.label}</span>`);
    }
  }

  const classicCount = games.filter(c => !ALL_SWITCH_GAME_CODES.includes(c)).length;
  if (classicCount > 0) {
    pills.push(`<span class="game-pill pill-retro" title="También disponible en ${classicCount} entregas clásicas (Gens 1 a 7)">+CLÁS</span>`);
  }

  const tooltip = getPokemonGamesTooltipText(pokemon);
  return `<div class="games-pill-group" title="Juegos disponibles: ${tooltip}">${pills.join('')}</div>`;
}

function getWinnerGameBannerHtml(pokemon) {
  if (!pokemon) return '';

  if (currentDexId === 'paldea') {
    const game = getPokemonGame(pokemon);
    let text = 'DISPONIBLE EN AMBOS JUEGOS (ESCARLATA & PÚRPURA)';
    if (game === 'scarlet') {
      text = '★ EXCLUSIVO DE POKÉMON ESCARLATA';
    } else if (game === 'violet') {
      text = '★ EXCLUSIVO DE POKÉMON PÚRPURA';
    }
    return `<div id="winnerGameBanner" class="winner-game-banner winner-game-${game}">
      <span class="game-dot game-dot-${game}"></span>
      <span>${text}</span>
    </div>`;
  }

  if (currentDexId === 'swsh') {
    const game = getPokemonGame(pokemon);
    let text = 'DISPONIBLE EN AMBOS JUEGOS (ESPADA & ESCUDO)';
    if (game === 'sword') {
      text = '★ EXCLUSIVO DE POKÉMON ESPADA';
    } else if (game === 'shield') {
      text = '★ EXCLUSIVO DE POKÉMON ESCUDO';
    }
    return `<div id="winnerGameBanner" class="winner-game-banner winner-game-${game}">
      <span class="game-dot game-dot-${game}"></span>
      <span>${text}</span>
    </div>`;
  }

  if (currentDexId === 'bdsp') {
    const game = getPokemonGame(pokemon);
    let text = 'DISPONIBLE EN AMBOS JUEGOS (DIAMANTE & PERLA)';
    if (game === 'diamond') {
      text = '★ EXCLUSIVO DE DIAMANTE BRILLANTE';
    } else if (game === 'pearl') {
      text = '★ EXCLUSIVO DE PERLA RELUCIENTE';
    }
    return `<div id="winnerGameBanner" class="winner-game-banner winner-game-${game}">
      <span class="game-dot game-dot-${game}"></span>
      <span>${text}</span>
    </div>`;
  }

  if (currentDexId === 'lgpe') {
    const game = getPokemonGame(pokemon);
    let text = "DISPONIBLE EN AMBOS JUEGOS (PIKACHU & EEVEE)";
    if (game === 'pikachu') {
      text = "★ EXCLUSIVO DE POKÉMON: LET'S GO, PIKACHU!";
    } else if (game === 'eevee') {
      text = "★ EXCLUSIVO DE POKÉMON: LET'S GO, EEVEE!";
    }
    return `<div id="winnerGameBanner" class="winner-game-banner winner-game-${game}">
      <span class="game-dot game-dot-${game}"></span>
      <span>${text}</span>
    </div>`;
  }

  if (currentDexId === 'pla') {
    return `<div id="winnerGameBanner" class="winner-game-banner winner-game-hisui">
      <span class="game-dot game-dot-hisui"></span>
      <span>★ POKÉDEX OFICIAL DE HISUI (LEYENDAS ARCEUS)</span>
    </div>`;
  }

  if (currentDexId === 'plza') {
    return `<div id="winnerGameBanner" class="winner-game-banner winner-game-lumina">
      <span class="game-dot game-dot-lumina"></span>
      <span>★ POKÉDEX OFICIAL DE LUMINALIA (LEYENDAS Z-A)</span>
    </div>`;
  }

  // Ruleta General: Mostrar listado completo de juegos agrupados por consola / generación
  const games = resolvePokemonGames(pokemon);
  if (games.length === 0) {
    return `<div id="winnerGameBanner" class="winner-game-banner winner-game-both">
      <span class="game-dot game-dot-both"></span>
      <span>GENERACIÓN ${pokemon.generation || 1}</span>
    </div>`;
  }

  const switchGames = games.filter(g => ALL_SWITCH_GAME_CODES.includes(g));
  const classicGames = games.filter(g => !ALL_SWITCH_GAME_CODES.includes(g));

  const renderChip = (g) => {
    let highlightClass = '';
    if (g === 'SV' || g === 'SV-DLC') highlightClass = 'highlight-sv';
    else if (g === 'PLZA' || g === 'PLZA-DLC') highlightClass = 'highlight-plza';
    else if (g === 'SwSh' || g === 'SwSh-DLC') highlightClass = 'highlight-swsh';
    else if (g === 'PLA') highlightClass = 'highlight-pla';
    else if (g === 'BDSP') highlightClass = 'highlight-bdsp';
    else if (g === 'LGPE') highlightClass = 'highlight-lgpe';
    const name = GAME_NAMES_MAP[g] || g;
    return `<span class="game-chip-tag ${highlightClass}" title="${name}">${name}</span>`;
  };

  const switchChipsHtml = switchGames.map(renderChip).join('');
  const classicChipsHtml = classicGames.map(g => `<span class="game-chip-tag tag-retro" title="${GAME_NAMES_MAP[g] || g}">${g}</span>`).join('');

  return `<div id="winnerGameBanner" class="winner-game-banner winner-game-general">
    <div class="winner-banner-section">
      <div class="banner-section-title">★ DISPONIBLE EN NINTENDO SWITCH:</div>
      <div class="game-chips-row">${switchChipsHtml || '<span class="text-muted">Ninguno</span>'}</div>
    </div>
    ${classicChipsHtml ? `
      <div class="winner-banner-section classic-section">
        <div class="banner-section-title">★ ENTREGAS CLÁSICAS (${classicGames.length}):</div>
        <div class="game-chips-row">${classicChipsHtml}</div>
      </div>
    ` : ''}
  </div>`;
}

let items = [];
let currentRotation = 0;
let isSpinning = false;
let audioEnabled = true;
let currentTheme = 'light'; // Modo día por defecto
let currentWonPokemon = null;
let modalSource = 'wheel'; // 'wheel' | 'pending'

// Conjunto de Pokémon seleccionados en la línea evolutiva del modal
let selectedEvoIds = new Set();

function getStorageKey(baseKey, dexId = currentDexId) {
  return `${baseKey}_${dexId}`;
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
let currentMatrixTypeFilter = 'all';
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
const matrixTypeFilter = document.getElementById('matrixTypeFilter');
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
  const list = getActiveDexFullList();
  list.forEach(p => {
    if (p.sprite && !imageCache.has(p.sprite)) {
      const img = new Image();
      img.src = p.sprite;
      imageCache.set(p.sprite, img);
    }
    if (p.shinySprite && !imageCache.has(p.shinySprite)) {
      const imgS = new Image();
      imgS.src = p.shinySprite;
      imageCache.set(p.shinySprite, imgS);
    }
    if (p.image && !p.image.startsWith('http') && !imageCache.has(p.image)) {
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
        const dispNum = getPokemonDisplayNum(item);
        ctx.fillText(dispNum ? `#${dispNum}` : String(i + 1), badgeDistance, 0);
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
    const dispNum = getPokemonDisplayNum(p);
    liveTrackerName.textContent = `#${dispNum} ${p.name}`;

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
  const dispNum = getPokemonDisplayNum(winner);
  liveTrackerName.textContent = `#${dispNum} ${winner.name}`;
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

  const fullPokemon = getPokemonByAnyId(getPokemonId(pokemon)) || pokemon;
  currentWonPokemon = fullPokemon;
  modalSource = source;

  // 1. Ocultar la imagen anterior inmediatamente para evitar parpadeos del Pokémon previo
  winnerImg.style.visibility = 'hidden';
  winnerImg.style.opacity = '0';

  // 2. Actualizar textos, número, banner de juego y tipos del nuevo Pokémon
  if (currentDexId === 'paldea') {
    winnerDexNum.textContent = `Nº PALDEA: #${fullPokemon.numPal || fullPokemon.numNac} · NAC: #${fullPokemon.numNac || fullPokemon.numPal}`;
  } else if (currentDexId === 'swsh') {
    winnerDexNum.textContent = `Nº GALAR: #${fullPokemon.numGal || fullPokemon.numNac} · NAC: #${fullPokemon.numNac || fullPokemon.numGal}`;
  } else if (currentDexId === 'pla') {
    winnerDexNum.textContent = `Nº HISUI: #${fullPokemon.numHis || fullPokemon.numNac} · NAC: #${fullPokemon.numNac || fullPokemon.numHis}`;
  } else if (currentDexId === 'bdsp') {
    winnerDexNum.textContent = `Nº SINNOH: #${fullPokemon.numSin || fullPokemon.numNac} · NAC: #${fullPokemon.numNac || fullPokemon.numSin}`;
  } else if (currentDexId === 'lgpe') {
    winnerDexNum.textContent = `Nº KANTO: #${fullPokemon.numKan || fullPokemon.numNac} · NAC: #${fullPokemon.numNac || fullPokemon.numKan}`;
  } else if (currentDexId === 'plza') {
    winnerDexNum.textContent = `Nº LUMINALIA: #${fullPokemon.numLum || fullPokemon.numNac} · NAC: #${fullPokemon.numNac || fullPokemon.numLum}`;
  } else {
    const genText = fullPokemon.generation ? ` · GENERACIÓN ${fullPokemon.generation}` : '';
    winnerDexNum.textContent = `Nº NACIONAL: #${fullPokemon.numNac || fullPokemon.numPal || getPokemonId(fullPokemon)}${genText}`;
  }
  winnerTitle.textContent = fullPokemon.name;
  const winnerGameBanner = document.getElementById('winnerGameBanner');
  if (winnerGameBanner) {
    winnerGameBanner.outerHTML = getWinnerGameBannerHtml(fullPokemon);
  }
  winnerTypes.innerHTML = (fullPokemon.types || []).map(t => 
    `<span class="type-badge type-${t}">${t}</span>`
  ).join('');

  // 3. Configurar interfaz según el origen (Ruleta vs Matriz / Pendientes)
  const pokeId = getPokemonId(fullPokemon);
  if (source === 'wheel') {
    if (modalCardTag) modalCardTag.textContent = 'OBJETIVO SHINY RULETA';
    if (winnerWheelActions) winnerWheelActions.style.display = 'flex';
  } else {
    const isPend = isPokemonPending(fullPokemon) || isPokemonLastSpin(fullPokemon);
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

  const fullPokemon = getPokemonByAnyId(getPokemonId(pokemon)) || pokemon;
  const currentPokeId = getPokemonId(fullPokemon);
  const lineIds = (fullPokemon.evolutionLine && fullPokemon.evolutionLine.length > 0)
    ? fullPokemon.evolutionLine
    : [currentPokeId];

  const members = lineIds.map(id => getPokemonByAnyId(id)).filter(Boolean);

  // Por defecto, el Pokémon abierto está seleccionado
  selectedEvoIds.add(currentPokeId);

  members.forEach(m => {
    const mId = getPokemonId(m);
    const isTarget = (mId === currentPokeId || (m.numNac && m.numNac === fullPokemon.numNac));
    const isAlreadyCaptured = isPokemonCaptured(m);

    let statusLabel = '';
    if (isAlreadyCaptured) {
      statusLabel = 'CAPTURADO';
    } else if (isTarget) {
      statusLabel = (source === 'wheel' ? 'RULETA' : 'PENDIENTE');
    }

    const card = document.createElement('label');
    card.className = 'evo-card' + (selectedEvoIds.has(mId) ? ' selected' : '') + (isAlreadyCaptured ? ' already-captured' : '');

    card.innerHTML = `
      <input type="checkbox" class="evo-checkbox" value="${mId}" ${selectedEvoIds.has(mId) ? 'checked' : ''}>
      <img src="${m.shinySprite || m.sprite}" class="evo-thumb" alt="${m.name}" title="Forma Shiny" onerror="this.src='assets/pokeball.svg'">
      <div class="evo-card-info">
        <span class="evo-card-num">#${getPokemonDisplayNum(m)}</span>
        <span class="evo-card-name">${m.name}</span>
        ${getGameBadgeHtml(m, 'mini')}
      </div>
      <span class="evo-status-badge">${statusLabel}</span>
    `;

    const checkbox = card.querySelector('.evo-checkbox');
    const badge = card.querySelector('.evo-status-badge');

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        selectedEvoIds.add(mId);
        card.classList.add('selected');
        if (!isAlreadyCaptured) badge.textContent = 'SHINY';
      } else {
        selectedEvoIds.delete(mId);
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
function isPokemonCaptured(p, capSet) {
  if (!p) return false;
  const set = capSet || new Set(capturedShinyList.map(c => getPokemonId(c)));
  const pid = getPokemonId(p);
  return set.has(pid) ||
    (p.numPal && set.has(p.numPal)) ||
    (p.numGal && set.has(p.numGal)) ||
    (p.numHis && set.has(p.numHis)) ||
    (p.numSin && set.has(p.numSin)) ||
    (p.numKan && set.has(p.numKan)) ||
    (p.numLum && set.has(p.numLum)) ||
    (p.numNac && set.has(p.numNac));
}

function isPokemonLastSpin(p) {
  if (!p) return false;
  const pid = getPokemonId(p);
  return lastSpinPendingIds.has(pid) ||
    (p.numPal && lastSpinPendingIds.has(p.numPal)) ||
    (p.numGal && lastSpinPendingIds.has(p.numGal)) ||
    (p.numHis && lastSpinPendingIds.has(p.numHis)) ||
    (p.numSin && lastSpinPendingIds.has(p.numSin)) ||
    (p.numKan && lastSpinPendingIds.has(p.numKan)) ||
    (p.numLum && lastSpinPendingIds.has(p.numLum)) ||
    (p.numNac && lastSpinPendingIds.has(p.numNac));
}

function isPokemonPending(p, pendSet) {
  if (!p) return false;
  const set = pendSet || new Set(pendingList.map(item => getPokemonId(item)));
  const pid = getPokemonId(p);
  return set.has(pid) ||
    (p.numPal && set.has(p.numPal)) ||
    (p.numGal && set.has(p.numGal)) ||
    (p.numHis && set.has(p.numHis)) ||
    (p.numSin && set.has(p.numSin)) ||
    (p.numKan && set.has(p.numKan)) ||
    (p.numLum && set.has(p.numLum)) ||
    (p.numNac && set.has(p.numNac));
}

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
  rebuildTypeFilterOptions();
  renderPaldeaMatrix();
  renderCapturedList();
}

// ==========================================
// FILTRO POR TIPO CON CONTEO DE RESTANTES
// ==========================================
// Calcula, para la Pokédex activa, cuántos Pokémon de cada tipo existen y cuántos
// quedan por capturar. Los Pokémon de doble tipo cuentan en ambos tipos.
// Orden: más restantes por capturar primero; desempate por total y luego alfabético.
function getTypeRemainingStats() {
  const capturedSet = new Set(capturedShinyList.map(c => getPokemonId(c)));
  const statsMap = new Map();
  let totalRemaining = 0;

  getActiveDexFullList().forEach(p => {
    const captured = isPokemonCaptured(p, capturedSet);
    if (!captured) totalRemaining++;
    (p.types || []).forEach(t => {
      if (!statsMap.has(t)) statsMap.set(t, { type: t, total: 0, remaining: 0 });
      const s = statsMap.get(t);
      s.total++;
      if (!captured) s.remaining++;
    });
  });

  const stats = [...statsMap.values()].sort((a, b) =>
    (b.remaining - a.remaining) || (b.total - a.total) || a.type.localeCompare(b.type, 'es')
  );
  return { stats, totalRemaining };
}

function fillTypeSelect(selectEl, stats, totalRemaining) {
  if (!selectEl) return 'all';
  const previous = selectEl.value || 'all';
  const options = [`<option value="all">TODOS LOS TIPOS (${totalRemaining} por capturar)</option>`];
  stats.forEach(s => {
    options.push(`<option value="${s.type}">${s.type} (${s.remaining} por capturar)</option>`);
  });
  selectEl.innerHTML = options.join('');
  const stillExists = previous === 'all' || stats.some(s => s.type === previous);
  selectEl.value = stillExists ? previous : 'all';
  return selectEl.value;
}

// Reconstruye los selectores de tipo de la ruleta (#typeFilter) y de la matriz
// (#matrixTypeFilter) conservando la selección actual cuando sigue siendo válida.
function rebuildTypeFilterOptions() {
  const { stats, totalRemaining } = getTypeRemainingStats();

  const prevWheelType = typeFilter ? typeFilter.value : 'all';
  const newWheelType = fillTypeSelect(typeFilter, stats, totalRemaining);
  if (prevWheelType !== newWheelType && !isSpinning) applyFilters();

  currentMatrixTypeFilter = fillTypeSelect(matrixTypeFilter, stats, totalRemaining);
}

function markMultipleAsShinyCaptured(pokemonList) {
  if (!pokemonList || pokemonList.length === 0) return;
  const nowStr = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  pokemonList.forEach(pokemon => {
    if (!pokemon) return;
    const pokeId = getPokemonId(pokemon);

    lastSpinPendingIds.delete(pokeId);
    if (pokemon.numPal) lastSpinPendingIds.delete(pokemon.numPal);
    if (pokemon.numGal) lastSpinPendingIds.delete(pokemon.numGal);
    if (pokemon.numHis) lastSpinPendingIds.delete(pokemon.numHis);
    if (pokemon.numSin) lastSpinPendingIds.delete(pokemon.numSin);
    if (pokemon.numKan) lastSpinPendingIds.delete(pokemon.numKan);
    if (pokemon.numLum) lastSpinPendingIds.delete(pokemon.numLum);
    if (pokemon.numNac) lastSpinPendingIds.delete(pokemon.numNac);

    if (!isPokemonCaptured(pokemon)) {
      capturedShinyList.unshift({
        pokemonId: pokeId,
        numPal: pokemon.numPal || '',
        numGal: pokemon.numGal || '',
        numHis: pokemon.numHis || '',
        numSin: pokemon.numSin || '',
        numKan: pokemon.numKan || '',
        numLum: pokemon.numLum || '',
        numNac: pokemon.numNac || '',
        name: pokemon.name,
        types: pokemon.types,
        sprite: pokemon.sprite,
        shinySprite: pokemon.shinySprite,
        evolutionLine: pokemon.evolutionLine,
        games: pokemon.games || [],
        game: getPokemonGame(pokemon),
        time: nowStr
      });
    }
  });

  // Quitar de pendientes los que ahora son capturados
  pendingList = pendingList.filter(p => !isPokemonCaptured(p));
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
  capturedShinyList = capturedShinyList.filter(p => {
    return getPokemonId(p) !== pokeId && !(pokemon.numNac && p.numNac === pokemon.numNac);
  });
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

  if (isPokemonCaptured(pokemon)) {
    return;
  }

  if (!isPokemonPending(pokemon)) {
    pendingList.unshift({
      pokemonId: pokeId,
      numPal: pokemon.numPal || '',
      numGal: pokemon.numGal || '',
      numHis: pokemon.numHis || '',
      numSin: pokemon.numSin || '',
      numKan: pokemon.numKan || '',
      numLum: pokemon.numLum || '',
      numNac: pokemon.numNac || '',
      name: pokemon.name,
      types: pokemon.types,
      sprite: pokemon.sprite,
      shinySprite: pokemon.shinySprite,
      evolutionLine: pokemon.evolutionLine,
      games: pokemon.games || [],
      game: getPokemonGame(pokemon),
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
  pendingList = pendingList.filter(p => {
    return getPokemonId(p) !== pokeId && !(pokemon.numNac && p.numNac === pokemon.numNac);
  });
  lastSpinPendingIds.delete(pokeId);
  if (pokemon.numPal) lastSpinPendingIds.delete(pokemon.numPal);
  if (pokemon.numGal) lastSpinPendingIds.delete(pokemon.numGal);
  if (pokemon.numHis) lastSpinPendingIds.delete(pokemon.numHis);
  if (pokemon.numSin) lastSpinPendingIds.delete(pokemon.numSin);
  if (pokemon.numKan) lastSpinPendingIds.delete(pokemon.numKan);
  if (pokemon.numLum) lastSpinPendingIds.delete(pokemon.numLum);
  if (pokemon.numNac) lastSpinPendingIds.delete(pokemon.numNac);
  saveShinyTracking();

  // Sincronizar eliminación de pendiente en la nube si hay sesión activa
  if (window.ShinyAPI && window.ShinyAPI.isLoggedIn()) {
    window.ShinyAPI.cloudRemovePending(pokeId, currentDexId).catch(err => {
      console.warn('[CLOUD] Sincronización diferida al quitar pendiente:', err);
    });
  }
}

// ==========================================
// 8. MATRIZ GIGANTE Y SEGUIMIENTO (MULTI-DEX)
// ==========================================
function updateMatrixToolbarStats(capturedSet, pendingSet) {
  const capCount = capturedSet.size;
  const lastSpinCount = [...lastSpinPendingIds].filter(id => !capturedSet.has(id)).length;
  const pendCount = pendingSet.size;
  const total = getActiveDexFullList().length || 1;
  const percent = ((capCount / total) * 100).toFixed(1);

  if (matrixCapturedCount) matrixCapturedCount.textContent = capCount;
  if (matrixCapturedPercent) matrixCapturedPercent.textContent = `(${percent}%)`;
  if (matrixLastSpinCount) matrixLastSpinCount.textContent = lastSpinCount;
  if (matrixPendingCount) matrixPendingCount.textContent = pendCount;

  const chipLast = document.getElementById('chipLastSpinBadge');
  const chipPend = document.getElementById('chipPendingBadge');
  const chipCap = document.getElementById('chipCapturedBadge');
  if (chipLast) chipLast.textContent = lastSpinCount;
  if (chipPend) chipPend.textContent = pendCount;
  if (chipCap) chipCap.textContent = capCount;

  if (pendingCountEl) pendingCountEl.textContent = pendCount;
  if (capturedCountEl) capturedCountEl.textContent = capCount;
}

function renderPaldeaMatrix() {
  if (!matrixGrid) return;
  matrixGrid.innerHTML = '';

  const q = matrixSearchQuery.toLowerCase().trim();
  const capturedSet = new Set(capturedShinyList.map(c => getPokemonId(c)));
  const pendingSet = new Set(pendingList.map(p => getPokemonId(p)));

  updateMatrixToolbarStats(capturedSet, pendingSet);

  const fullList = getActiveDexFullList();

  const filtered = fullList.filter(p => {
    const isCaptured = isPokemonCaptured(p, capturedSet);
    const isLastSpin = isPokemonLastSpin(p) && !isCaptured;
    const isPending = isPokemonPending(p, pendingSet) && !isCaptured;

    // Filtro por texto de búsqueda
    if (q) {
      const matchName = p.name.toLowerCase().includes(q);
      const dispNum = getPokemonDisplayNum(p);
      const matchNum = dispNum.includes(q) || (p.numNac && p.numNac.includes(q)) || (p.pokemonId && p.pokemonId.includes(q));
      const matchType = p.types && p.types.some(t => t.toLowerCase().includes(q));

      let matchGame = false;
      if (currentDexId === 'paldea') {
        const g = getPokemonGame(p);
        matchGame = (q === 'escarlata' && g === 'scarlet') ||
                    (q === 'purpura' && g === 'violet') ||
                    (q === 'púrpura' && g === 'violet') ||
                    (q === 'ambos' && g === 'both');
      } else if (currentDexId === 'swsh') {
        const g = getPokemonGame(p);
        matchGame = (q === 'espada' && g === 'sword') ||
                    (q === 'escudo' && g === 'shield') ||
                    (q === 'ambos' && g === 'both');
      } else if (currentDexId === 'bdsp') {
        const g = getPokemonGame(p);
        matchGame = (q === 'diamante' && g === 'diamond') ||
                    (q === 'perla' && g === 'pearl') ||
                    (q === 'ambos' && g === 'both');
      } else if (currentDexId === 'lgpe') {
        const g = getPokemonGame(p);
        matchGame = (q === 'pikachu' && g === 'pikachu') ||
                    (q === 'eevee' && g === 'eevee') ||
                    (q === 'ambos' && g === 'both');
      } else if (currentDexId === 'pla') {
        matchGame = q === 'hisui' || q === 'arceus' || q === 'leyendas';
      } else if (currentDexId === 'plza') {
        matchGame = q === 'luminalia' || q === 'za' || q === 'z-a';
      } else {
        const gamesList = resolvePokemonGames(p);
        matchGame = gamesList.some(g => g.toLowerCase().includes(q) || (GAME_NAMES_MAP[g] || '').toLowerCase().includes(q));
        if (!matchGame && p.generation) {
          matchGame = q === `gen ${p.generation}` || q === `gen${p.generation}` || q === `generacion ${p.generation}` || q === `generación ${p.generation}`;
        }
      }

      if (!matchName && !matchNum && !matchType && !matchGame) return false;
    }

    // Filtro por tipo elemental (selector de la matriz)
    if (currentMatrixTypeFilter !== 'all' && !(p.types || []).includes(currentMatrixTypeFilter)) {
      return false;
    }

    // Filtros por pestaña de estado o edición
    if (currentMatrixFilter === 'last-spin') {
      return isLastSpin;
    } else if (currentMatrixFilter === 'pending') {
      return isPending || isLastSpin;
    } else if (currentMatrixFilter === 'captured') {
      return isCaptured;
    } else if (currentMatrixFilter === 'uncaptured') {
      return !isCaptured;
    }

    if (currentDexId === 'paldea') {
      if (currentMatrixFilter === 'scarlet') return getPokemonGame(p) === 'scarlet';
      if (currentMatrixFilter === 'violet') return getPokemonGame(p) === 'violet';
      if (currentMatrixFilter === 'both') return getPokemonGame(p) === 'both';
    } else if (currentDexId === 'swsh') {
      if (currentMatrixFilter === 'sword') return getPokemonGame(p) === 'sword';
      if (currentMatrixFilter === 'shield') return getPokemonGame(p) === 'shield';
      if (currentMatrixFilter === 'both') return getPokemonGame(p) === 'both';
    } else if (currentDexId === 'bdsp') {
      if (currentMatrixFilter === 'diamond') return getPokemonGame(p) === 'diamond';
      if (currentMatrixFilter === 'pearl') return getPokemonGame(p) === 'pearl';
      if (currentMatrixFilter === 'both') return getPokemonGame(p) === 'both';
    } else if (currentDexId === 'lgpe') {
      if (currentMatrixFilter === 'pikachu') return getPokemonGame(p) === 'pikachu';
      if (currentMatrixFilter === 'eevee') return getPokemonGame(p) === 'eevee';
      if (currentMatrixFilter === 'both') return getPokemonGame(p) === 'both';
    } else if (currentDexId === 'pla') {
      if (currentMatrixFilter === 'hisui') return true;
    } else if (currentDexId === 'plza') {
      if (currentMatrixFilter === 'lumina') return true;
    } else {
      // General
      if (currentMatrixFilter === 'gen1') return p.generation === 1;
      if (currentMatrixFilter === 'gen2') return p.generation === 2;
      if (currentMatrixFilter === 'gen3') return p.generation === 3;
      if (currentMatrixFilter === 'gen4') return p.generation === 4;
      if (currentMatrixFilter === 'gen5') return p.generation === 5;
      if (currentMatrixFilter === 'gen6') return p.generation === 6;
      if (currentMatrixFilter === 'gen7') return p.generation === 7;
      if (currentMatrixFilter === 'gen8') return p.generation === 8;
      if (currentMatrixFilter === 'gen9') return p.generation === 9;
      if (currentMatrixFilter === 'game_sv') {
        const g = resolvePokemonGames(p);
        return g.includes('SV') || g.includes('SV-DLC');
      }
      if (currentMatrixFilter === 'game_plza') {
        const g = resolvePokemonGames(p);
        return g.includes('PLZA') || g.includes('PLZA-DLC');
      }
    }

    return true;
  });

  if (filtered.length === 0) {
    matrixGrid.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1; padding: 30px 10px;">No se encontraron Pokémon con los filtros actuales.</div>';
    return;
  }

  const fragment = document.createDocumentFragment();

  filtered.forEach(p => {
    const pokeId = getPokemonId(p);
    const isCaptured = isPokemonCaptured(p, capturedSet);
    const isLastSpin = isPokemonLastSpin(p) && !isCaptured;
    const isPending = !isLastSpin && isPokemonPending(p, pendingSet) && !isCaptured;
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
    card.dataset.num = pokeId;

    const displayNum = getPokemonDisplayNum(p);

    card.innerHTML = `
      <div class="matrix-card-header">
        <div class="matrix-header-left">
          <span class="matrix-num">#${displayNum}</span>
          ${currentDexId === 'general' ? `<span class="matrix-gen-badge">GEN ${p.generation || 1}</span>` : getGameBadgeHtml(p, 'mini')}
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
      ${currentDexId === 'general' ? `
        <div class="matrix-games-row" title="Disponible en: ${getPokemonGamesTooltipText(p)}">
          ${getPokemonGamesBadgesHtml(p)}
        </div>
      ` : ''}
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
    capturedListEl.innerHTML = '<div class="empty-state">Aún no has registrado ningún Pokémon shiny capturado en esta Pokédex.</div>';
    return;
  }

  capturedShinyList.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'shiny-card-item is-captured';
    const mainType = (item.types && item.types[0]) || 'Normal';
    const dispNum = getPokemonDisplayNum(item);

    card.innerHTML = `
      <img src="${item.shinySprite || item.sprite || 'assets/pokeball.svg'}" class="shiny-thumb" alt="${item.name}" title="Forma Shiny" onerror="this.src='assets/pokeball.svg'">
      <div class="shiny-item-info">
        <div class="shiny-meta-row">
          <span class="shiny-dex-num">#${dispNum}</span>
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
      removeShinyCaptured(item);
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
    pokemonId: getPokemonId(item),
    numPal: item.numPal || '',
    numNac: item.numNac || '',
    displayNum: getPokemonDisplayNum(item),
    name: item.name,
    types: item.types,
    sprite: item.sprite,
    games: item.games || [],
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
    const dispNum = hist.displayNum || getPokemonDisplayNum(hist);
    chip.innerHTML = `
      <img src="${hist.sprite || 'assets/pokeball.svg'}" alt="${hist.name}" onerror="this.src='assets/pokeball.svg'">
      <span>#${dispNum} <strong>${hist.name}</strong></span>
      <span class="type-badge type-${mainType}">${mainType}</span>
      ${getGameBadgeHtml(hist, 'mini')}
    `;
    historyListEl.appendChild(chip);
  });
}

// ==========================================
// 10. RECONSTRUCCIÓN DINÁMICA DE FILTROS & REGLAS
// ==========================================
function rebuildRangeFilterOptions(dexId = currentDexId) {
  if (!rangeFilter) return;
  if (dexId === 'paldea') {
    rangeFilter.innerHTML = `
      <option value="all">TODOS (#001 - #400)</option>
      <option value="starters">INICIALES (#001 - #024)</option>
      <option value="1-100">#001 - #100</option>
      <option value="101-200">#101 - #200</option>
      <option value="201-300">#201 - #300</option>
      <option value="301-400">#301 - #400</option>
      <option value="paradox">PARADOJAS (#376 - #400)</option>
      <option value="scarlet">EXCLUSIVOS ESCARLATA (23)</option>
      <option value="violet">EXCLUSIVOS PÚRPURA (23)</option>
      <option value="both">DISPONIBLE EN AMBOS (354)</option>
    `;
  } else if (dexId === 'swsh') {
    rangeFilter.innerHTML = `
      <option value="all">TODOS (#001 - #400)</option>
      <option value="starters">INICIALES (#001 - #009)</option>
      <option value="1-100">#001 - #100</option>
      <option value="101-200">#101 - #200</option>
      <option value="201-300">#201 - #300</option>
      <option value="301-400">#301 - #400</option>
      <option value="sword">EXCLUSIVOS ESPADA (29)</option>
      <option value="shield">EXCLUSIVOS ESCUDO (29)</option>
      <option value="both">DISPONIBLE EN AMBOS (342)</option>
    `;
  } else if (dexId === 'pla') {
    rangeFilter.innerHTML = `
      <option value="all">TODOS (#001 - #242)</option>
      <option value="starters">INICIALES (#001 - #009)</option>
      <option value="1-50">#001 - #050</option>
      <option value="51-100">#051 - #100</option>
      <option value="101-150">#101 - #150</option>
      <option value="151-200">#151 - #200</option>
      <option value="201-242">#201 - #242</option>
      <option value="hisui_forms">FORMAS REGIONALES DE HISUI</option>
    `;
  } else if (dexId === 'bdsp') {
    rangeFilter.innerHTML = `
      <option value="all">TODOS (#001 - #151)</option>
      <option value="starters">INICIALES (#001 - #009)</option>
      <option value="1-50">#001 - #050</option>
      <option value="51-100">#051 - #100</option>
      <option value="101-151">#101 - #151</option>
      <option value="diamond">EXCLUSIVOS DIAMANTE (7)</option>
      <option value="pearl">EXCLUSIVOS PERLA (7)</option>
      <option value="both">DISPONIBLE EN AMBOS (137)</option>
    `;
  } else if (dexId === 'lgpe') {
    rangeFilter.innerHTML = `
      <option value="all">TODOS (#001 - #153)</option>
      <option value="starters">INICIALES (#001 - #009)</option>
      <option value="1-50">#001 - #050</option>
      <option value="51-100">#051 - #100</option>
      <option value="101-153">#101 - #153</option>
      <option value="pikachu">EXCLUSIVOS PIKACHU (12)</option>
      <option value="eevee">EXCLUSIVOS EEVEE (12)</option>
      <option value="both">DISPONIBLE EN AMBOS (129)</option>
    `;
  } else if (dexId === 'plza') {
    rangeFilter.innerHTML = `
      <option value="all">TODOS (#001 - #232)</option>
      <option value="starters">INICIALES (#001 - #009)</option>
      <option value="1-80">#001 - #080</option>
      <option value="81-160">#081 - #160</option>
      <option value="161-232">#161 - #232</option>
      <option value="kalos_natives">NATIVOS DE KALOS (GEN 6)</option>
    `;
  } else {
    rangeFilter.innerHTML = `
      <option value="all">TODOS (#0001 - #1025)</option>
      <option value="gen1">GEN 1: KANTO (#0001 - #0151)</option>
      <option value="gen2">GEN 2: JOHTO (#0152 - #0251)</option>
      <option value="gen3">GEN 3: HOENN (#0252 - #0386)</option>
      <option value="gen4">GEN 4: SINNOH (#0387 - #0493)</option>
      <option value="gen5">GEN 5: TESELIA / UNOVA (#0494 - #0649)</option>
      <option value="gen6">GEN 6: KALOS (#0650 - #0721)</option>
      <option value="gen7">GEN 7: ALOLA (#0722 - #0809)</option>
      <option value="gen8">GEN 8: GALAR / HISUI (#0810 - #0905)</option>
      <option value="gen9">GEN 9: PALDEA (#0906 - #1025)</option>
    `;
  }
  rangeFilter.value = 'all';
}

function rebuildMatrixFilterChips(dexId = currentDexId) {
  const container = document.getElementById('matrixFilterChips');
  if (!container) return;

  const config = getActiveDexConfig();
  const total = config.totalCount;
  currentMatrixFilter = 'all';

  let specificChipsHtml = '';

  if (dexId === 'paldea') {
    specificChipsHtml = `
      <button class="matrix-chip chip-game-scarlet" data-matrix-filter="scarlet">ESCARLATA (23)</button>
      <button class="matrix-chip chip-game-violet" data-matrix-filter="violet">PÚRPURA (23)</button>
      <button class="matrix-chip chip-game-both" data-matrix-filter="both">AMBOS (354)</button>
    `;
  } else if (dexId === 'swsh') {
    specificChipsHtml = `
      <button class="matrix-chip chip-game-sword" data-matrix-filter="sword">ESPADA (29)</button>
      <button class="matrix-chip chip-game-shield" data-matrix-filter="shield">ESCUDO (29)</button>
      <button class="matrix-chip chip-game-both" data-matrix-filter="both">AMBOS (342)</button>
    `;
  } else if (dexId === 'bdsp') {
    specificChipsHtml = `
      <button class="matrix-chip chip-game-diamond" data-matrix-filter="diamond">DIAMANTE (7)</button>
      <button class="matrix-chip chip-game-pearl" data-matrix-filter="pearl">PERLA (7)</button>
      <button class="matrix-chip chip-game-both" data-matrix-filter="both">AMBOS (137)</button>
    `;
  } else if (dexId === 'lgpe') {
    specificChipsHtml = `
      <button class="matrix-chip chip-game-pikachu" data-matrix-filter="pikachu">PIKACHU (12)</button>
      <button class="matrix-chip chip-game-eevee" data-matrix-filter="eevee">EEVEE (12)</button>
      <button class="matrix-chip chip-game-both" data-matrix-filter="both">AMBOS (129)</button>
    `;
  } else if (dexId === 'pla') {
    specificChipsHtml = `
      <button class="matrix-chip chip-game-hisui" data-matrix-filter="hisui">HISUI (242)</button>
    `;
  } else if (dexId === 'plza') {
    specificChipsHtml = `
      <button class="matrix-chip chip-game-lumina" data-matrix-filter="lumina">LUMINALIA (232)</button>
    `;
  } else {
    // Ruleta General (Gens 1 a 9)
    specificChipsHtml = `
      <button class="matrix-chip chip-gen" data-matrix-filter="gen1">GEN 1 (151)</button>
      <button class="matrix-chip chip-gen" data-matrix-filter="gen2">GEN 2 (100)</button>
      <button class="matrix-chip chip-gen" data-matrix-filter="gen3">GEN 3 (135)</button>
      <button class="matrix-chip chip-gen" data-matrix-filter="gen4">GEN 4 (107)</button>
      <button class="matrix-chip chip-gen" data-matrix-filter="gen5">GEN 5 (156)</button>
      <button class="matrix-chip chip-gen" data-matrix-filter="gen6">GEN 6 (72)</button>
      <button class="matrix-chip chip-gen" data-matrix-filter="gen7">GEN 7 (88)</button>
      <button class="matrix-chip chip-gen" data-matrix-filter="gen8">GEN 8 (96)</button>
      <button class="matrix-chip chip-gen" data-matrix-filter="gen9">GEN 9 (120)</button>
    `;
  }

  container.innerHTML = `
    <button class="matrix-chip active" data-matrix-filter="all">TODOS (${total})</button>
    <button class="matrix-chip chip-last-spin" data-matrix-filter="last-spin">
      <span>GIRO ANTERIOR</span>
      <span id="chipLastSpinBadge" class="chip-badge">0</span>
    </button>
    <button class="matrix-chip" data-matrix-filter="pending">
      <span>PENDIENTES</span>
      <span id="chipPendingBadge" class="chip-badge">0</span>
    </button>
    <button class="matrix-chip" data-matrix-filter="captured">
      <span>CAPTURADOS</span>
      <span id="chipCapturedBadge" class="chip-badge">0</span>
    </button>
    <button class="matrix-chip" data-matrix-filter="uncaptured">POR CAPTURAR</button>
    ${specificChipsHtml}
  `;

  const chips = container.querySelectorAll('[data-matrix-filter]');
  chips.forEach(btn => {
    btn.addEventListener('click', () => {
      chips.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMatrixFilter = btn.dataset.matrixFilter || 'all';
      renderPaldeaMatrix();
    });
  });
}

function applyFilters() {
  if (isSpinning) return;
  const selectedType = typeFilter ? typeFilter.value : 'all';
  const selectedRange = rangeFilter ? rangeFilter.value : 'all';

  let filtered = [...getActiveDexFullList()];

  if (selectedType !== 'all') {
    filtered = filtered.filter(p => p.types && p.types.includes(selectedType));
  }

  if (selectedRange !== 'all') {
    if (currentDexId === 'paldea') {
      if (selectedRange === 'starters') {
        filtered = filtered.filter(p => parseInt(p.numPal || '999', 10) <= 24);
      } else if (selectedRange === '1-100') {
        filtered = filtered.filter(p => { const n = parseInt(p.numPal || '0', 10); return n >= 1 && n <= 100; });
      } else if (selectedRange === '101-200') {
        filtered = filtered.filter(p => { const n = parseInt(p.numPal || '0', 10); return n >= 101 && n <= 200; });
      } else if (selectedRange === '201-300') {
        filtered = filtered.filter(p => { const n = parseInt(p.numPal || '0', 10); return n >= 201 && n <= 300; });
      } else if (selectedRange === '301-400') {
        filtered = filtered.filter(p => { const n = parseInt(p.numPal || '0', 10); return n >= 301 && n <= 400; });
      } else if (selectedRange === 'paradox') {
        filtered = filtered.filter(p => parseInt(p.numPal || '0', 10) >= 376);
      } else if (selectedRange === 'scarlet') {
        filtered = filtered.filter(p => getPokemonGame(p) === 'scarlet');
      } else if (selectedRange === 'violet') {
        filtered = filtered.filter(p => getPokemonGame(p) === 'violet');
      } else if (selectedRange === 'both') {
        filtered = filtered.filter(p => getPokemonGame(p) === 'both');
      }
    } else if (currentDexId === 'swsh') {
      if (selectedRange === 'starters') {
        filtered = filtered.filter(p => parseInt(p.numGal || '999', 10) <= 9);
      } else if (selectedRange === '1-100') {
        filtered = filtered.filter(p => { const n = parseInt(p.numGal || '0', 10); return n >= 1 && n <= 100; });
      } else if (selectedRange === '101-200') {
        filtered = filtered.filter(p => { const n = parseInt(p.numGal || '0', 10); return n >= 101 && n <= 200; });
      } else if (selectedRange === '201-300') {
        filtered = filtered.filter(p => { const n = parseInt(p.numGal || '0', 10); return n >= 201 && n <= 300; });
      } else if (selectedRange === '301-400') {
        filtered = filtered.filter(p => { const n = parseInt(p.numGal || '0', 10); return n >= 301 && n <= 400; });
      } else if (selectedRange === 'sword') {
        filtered = filtered.filter(p => getPokemonGame(p) === 'sword');
      } else if (selectedRange === 'shield') {
        filtered = filtered.filter(p => getPokemonGame(p) === 'shield');
      } else if (selectedRange === 'both') {
        filtered = filtered.filter(p => getPokemonGame(p) === 'both');
      }
    } else if (currentDexId === 'pla') {
      if (selectedRange === 'starters') {
        filtered = filtered.filter(p => parseInt(p.numHis || '999', 10) <= 9);
      } else if (selectedRange === '1-50') {
        filtered = filtered.filter(p => { const n = parseInt(p.numHis || '0', 10); return n >= 1 && n <= 50; });
      } else if (selectedRange === '51-100') {
        filtered = filtered.filter(p => { const n = parseInt(p.numHis || '0', 10); return n >= 51 && n <= 100; });
      } else if (selectedRange === '101-150') {
        filtered = filtered.filter(p => { const n = parseInt(p.numHis || '0', 10); return n >= 101 && n <= 150; });
      } else if (selectedRange === '151-200') {
        filtered = filtered.filter(p => { const n = parseInt(p.numHis || '0', 10); return n >= 151 && n <= 200; });
      } else if (selectedRange === '201-242') {
        filtered = filtered.filter(p => { const n = parseInt(p.numHis || '0', 10); return n >= 201 && n <= 242; });
      } else if (selectedRange === 'hisui_forms') {
        filtered = filtered.filter(p => (p.name || '').includes('Hisui') || (p.name || '').includes('hisui'));
      }
    } else if (currentDexId === 'bdsp') {
      if (selectedRange === 'starters') {
        filtered = filtered.filter(p => parseInt(p.numSin || '999', 10) <= 9);
      } else if (selectedRange === '1-50') {
        filtered = filtered.filter(p => { const n = parseInt(p.numSin || '0', 10); return n >= 1 && n <= 50; });
      } else if (selectedRange === '51-100') {
        filtered = filtered.filter(p => { const n = parseInt(p.numSin || '0', 10); return n >= 51 && n <= 100; });
      } else if (selectedRange === '101-151') {
        filtered = filtered.filter(p => { const n = parseInt(p.numSin || '0', 10); return n >= 101 && n <= 151; });
      } else if (selectedRange === 'diamond') {
        filtered = filtered.filter(p => getPokemonGame(p) === 'diamond');
      } else if (selectedRange === 'pearl') {
        filtered = filtered.filter(p => getPokemonGame(p) === 'pearl');
      } else if (selectedRange === 'both') {
        filtered = filtered.filter(p => getPokemonGame(p) === 'both');
      }
    } else if (currentDexId === 'lgpe') {
      if (selectedRange === 'starters') {
        filtered = filtered.filter(p => parseInt(p.numKan || '999', 10) <= 9);
      } else if (selectedRange === '1-50') {
        filtered = filtered.filter(p => { const n = parseInt(p.numKan || '0', 10); return n >= 1 && n <= 50; });
      } else if (selectedRange === '51-100') {
        filtered = filtered.filter(p => { const n = parseInt(p.numKan || '0', 10); return n >= 51 && n <= 100; });
      } else if (selectedRange === '101-153') {
        filtered = filtered.filter(p => { const n = parseInt(p.numKan || '0', 10); return n >= 101 && n <= 153; });
      } else if (selectedRange === 'pikachu') {
        filtered = filtered.filter(p => getPokemonGame(p) === 'pikachu');
      } else if (selectedRange === 'eevee') {
        filtered = filtered.filter(p => getPokemonGame(p) === 'eevee');
      } else if (selectedRange === 'both') {
        filtered = filtered.filter(p => getPokemonGame(p) === 'both');
      }
    } else if (currentDexId === 'plza') {
      if (selectedRange === 'starters') {
        filtered = filtered.filter(p => parseInt(p.numLum || '999', 10) <= 9);
      } else if (selectedRange === '1-80') {
        filtered = filtered.filter(p => { const n = parseInt(p.numLum || '0', 10); return n >= 1 && n <= 80; });
      } else if (selectedRange === '81-160') {
        filtered = filtered.filter(p => { const n = parseInt(p.numLum || '0', 10); return n >= 81 && n <= 160; });
      } else if (selectedRange === '161-232') {
        filtered = filtered.filter(p => { const n = parseInt(p.numLum || '0', 10); return n >= 161 && n <= 232; });
      } else if (selectedRange === 'kalos_natives') {
        filtered = filtered.filter(p => p.generation === 6);
      }
    } else {
      // Ruleta General
      if (selectedRange === 'gen1') filtered = filtered.filter(p => p.generation === 1);
      else if (selectedRange === 'gen2') filtered = filtered.filter(p => p.generation === 2);
      else if (selectedRange === 'gen3') filtered = filtered.filter(p => p.generation === 3);
      else if (selectedRange === 'gen4') filtered = filtered.filter(p => p.generation === 4);
      else if (selectedRange === 'gen5') filtered = filtered.filter(p => p.generation === 5);
      else if (selectedRange === 'gen6') filtered = filtered.filter(p => p.generation === 6);
      else if (selectedRange === 'gen7') filtered = filtered.filter(p => p.generation === 7);
      else if (selectedRange === 'gen8') filtered = filtered.filter(p => p.generation === 8);
      else if (selectedRange === 'gen9') filtered = filtered.filter(p => p.generation === 9);
      else if (selectedRange === 'game_sv') filtered = filtered.filter(p => {
        const g = resolvePokemonGames(p);
        return g.includes('SV') || g.includes('SV-DLC');
      });
      else if (selectedRange === 'game_plza') filtered = filtered.filter(p => {
        const g = resolvePokemonGames(p);
        return g.includes('PLZA') || g.includes('PLZA-DLC');
      });
    }
  }

  items = filtered.length >= 2 ? filtered : [...getActiveDexFullList()];
  if (counterBadge) counterBadge.textContent = `${items.length} POKÉMON`;
  lastTrackedIndex = -1;
  drawWheel(currentRotation);
}

function selectRandomSubset(count = 16) {
  if (isSpinning) return;
  const full = getActiveDexFullList();
  const shuffled = [...full].sort(() => Math.random() - 0.5);
  items = shuffled.slice(0, Math.min(count, full.length));
  items.sort((a, b) => parseInt(getPokemonDisplayNum(a) || '0', 10) - parseInt(getPokemonDisplayNum(b) || '0', 10));

  if (typeFilter) typeFilter.value = 'all';
  if (rangeFilter) rangeFilter.value = 'all';
  if (counterBadge) counterBadge.textContent = `${items.length} ALEATORIOS`;
  lastTrackedIndex = -1;
  drawWheel(currentRotation);
}

function resetAllPokemon() {
  if (isSpinning) return;
  if (typeFilter) typeFilter.value = 'all';
  if (rangeFilter) rangeFilter.value = 'all';
  items = [...getActiveDexFullList()];
  if (counterBadge) counterBadge.textContent = `${items.length} POKÉMON`;
  lastTrackedIndex = -1;
  drawWheel(currentRotation);
}

// ==========================================
// 11. EXPLORADOR POKÉDEX
// ==========================================
function renderPokedexModalList(filterQuery = '') {
  itemsListContainer.innerHTML = '';
  const q = filterQuery.toLowerCase().trim();
  const fullList = getActiveDexFullList();

  const results = fullList.filter(p => {
    if (!q) return true;
    const pokeId = getPokemonId(p);
    const dispNum = getPokemonDisplayNum(p);
    const matchName = p.name.toLowerCase().includes(q);
    const matchNum = dispNum.includes(q) || (p.numNac && p.numNac.includes(q)) || (p.numPal && p.numPal.includes(q)) || pokeId.includes(q);
    const matchType = p.types && p.types.some(t => t.toLowerCase().includes(q));

    let matchGame = false;
    if (currentDexId === 'paldea') {
      const g = getPokemonGame(p);
      matchGame = (q === 'escarlata' && g === 'scarlet') ||
                  (q === 'purpura' && g === 'violet') ||
                  (q === 'púrpura' && g === 'violet') ||
                  (q === 'ambos' && g === 'both');
    } else if (currentDexId === 'swsh') {
      const g = getPokemonGame(p);
      matchGame = (q === 'espada' && g === 'sword') ||
                  (q === 'escudo' && g === 'shield') ||
                  (q === 'ambos' && g === 'both');
    } else if (currentDexId === 'bdsp') {
      const g = getPokemonGame(p);
      matchGame = (q === 'diamante' && g === 'diamond') ||
                  (q === 'perla' && g === 'pearl') ||
                  (q === 'ambos' && g === 'both');
    } else if (currentDexId === 'lgpe') {
      const g = getPokemonGame(p);
      matchGame = (q === 'pikachu' && g === 'pikachu') ||
                  (q === 'eevee' && g === 'eevee') ||
                  (q === 'ambos' && g === 'both');
    } else if (currentDexId === 'pla') {
      matchGame = q === 'hisui' || q === 'arceus' || q === 'leyendas';
    } else if (currentDexId === 'plza') {
      matchGame = q === 'luminalia' || q === 'za' || q === 'z-a';
    } else {
      const gamesList = resolvePokemonGames(p);
      matchGame = gamesList.some(g => g.toLowerCase().includes(q) || (GAME_NAMES_MAP[g] || '').toLowerCase().includes(q));
      if (!matchGame && p.generation) {
        matchGame = q === `gen ${p.generation}` || q === `gen${p.generation}`;
      }
    }

    return matchName || matchNum || matchType || matchGame;
  });

  if (results.length === 0) {
    itemsListContainer.innerHTML = '<div style="padding: 15px; color: var(--text-muted); text-align: center;">Sin coincidencias encontradas.</div>';
    return;
  }

  const limit = Math.min(results.length, 100);
  for (let i = 0; i < limit; i++) {
    const p = results[i];
    const isCaptured = isPokemonCaptured(p);
    const dispNum = getPokemonDisplayNum(p);

    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <img src="${isCaptured ? (p.shinySprite || p.sprite) : p.sprite}" class="pokedex-row-thumb" alt="${p.name}" loading="lazy" onerror="this.src='assets/pokeball.svg'">
      <span class="item-row-num">#${dispNum}</span>
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
// 12. GESTIÓN MULTI-POKÉDEX / JUEGOS
// ==========================================
function switchDexContext(newDexId) {
  if (isSpinning) return;
  if (!DEX_CONFIGS[newDexId]) newDexId = 'general';

  currentDexId = newDexId;
  localStorage.setItem('ruleta_active_dex', newDexId);

  // Actualizar botones de todas las píldoras
  const pills = document.querySelectorAll('.dex-pill[data-dex]');
  pills.forEach(pill => {
    const isActive = pill.dataset.dex === newDexId;
    pill.classList.toggle('active', isActive);
    pill.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  const config = getActiveDexConfig();

  // Títulos dinámicos
  const tabPendingTitle = document.getElementById('tabPendingTitle');
  if (tabPendingTitle) tabPendingTitle.textContent = config.matrixTitle;

  const catalogModalTitle = document.getElementById('catalogModalTitle');
  if (catalogModalTitle) catalogModalTitle.textContent = config.catalogTitle;

  const matrixTotalCount = document.getElementById('matrixTotalCount');
  if (matrixTotalCount) matrixTotalCount.textContent = config.totalCount;

  const resetAllBtnText = document.getElementById('resetAllBtnText');
  if (resetAllBtnText) resetAllBtnText.textContent = `VER LOS ${config.totalCount}`;

  // Reconstruir opciones de filtros
  rebuildRangeFilterOptions(currentDexId);
  rebuildMatrixFilterChips(currentDexId);

  // Resetear filtros
  if (typeFilter) typeFilter.value = 'all';
  if (matrixTypeFilter) matrixTypeFilter.value = 'all';
  currentMatrixTypeFilter = 'all';
  if (matrixSearchInput) {
    matrixSearchInput.value = '';
    matrixSearchQuery = '';
    if (matrixClearSearchBtn) matrixClearSearchBtn.style.display = 'none';
  }

  // Cargar lista completa del dex activo
  items = [...getActiveDexFullList()];
  if (counterBadge) counterBadge.textContent = `${items.length} POKÉMON`;

  currentRotation = 0;
  lastTrackedIndex = -1;

  // Precargar sprites del dex activo
  preloadAllSprites();

  // Cargar datos de seguimiento aislados (localStorage y nube)
  loadShinyTracking(currentDexId);

  // Redibujar ruleta y tracker
  drawWheel(currentRotation);
  updateLivePointerTracker(currentRotation);

  // Si el usuario está autenticado, sincronizar datos con la nube para el dex activo
  if (window.ShinyAPI && window.ShinyAPI.isLoggedIn()) {
    syncCloudData(false);
  }
}

// ==========================================
// 13. INICIALIZACIÓN & EVENTOS
// ==========================================
function initApp() {
  initTheme();
  setupCanvasResolution();
  updateSoundUI();
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

  // Selector Multi-Dex (Píldoras para todos los juegos de Switch)
  const dexPills = document.querySelectorAll('.dex-pill[data-dex]');
  dexPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const targetDex = pill.dataset.dex;
      if (targetDex) switchDexContext(targetDex);
    });
  });

  // Inicializar contexto de Pokédex activo (por defecto 'general' o el guardado)
  switchDexContext(localStorage.getItem('ruleta_active_dex') || 'general');

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
        const p = getPokemonByAnyId(id);
        if (p) selectedPokemonList.push(p);
      });
      markMultipleAsShinyCaptured(selectedPokemonList);

      if (modalSource === 'wheel') {
        const wonId = currentWonPokemon ? getPokemonId(currentWonPokemon) : '';
        if (currentWonPokemon && !selectedEvoIds.has(wonId)) {
          markAsPending(currentWonPokemon);
          lastSpinPendingIds = new Set([wonId]);
          saveShinyTracking();
        } else {
          lastSpinPendingIds.clear();
          saveShinyTracking();
        }
      }
      playVictoryFanfare();
    } else if (modalSource === 'wheel' && currentWonPokemon) {
      const wonId = getPokemonId(currentWonPokemon);
      markAsPending(currentWonPokemon);
      lastSpinPendingIds = new Set([wonId]);
      saveShinyTracking();
    }
    closeWinnerModal();
  });

  // 2. Girar de Nuevo (guarda ganador en pendientes del giro anterior)
  winnerSpinAgainBtn.addEventListener('click', () => {
    if (currentWonPokemon) {
      const wonId = getPokemonId(currentWonPokemon);
      markAsPending(currentWonPokemon);
      lastSpinPendingIds = new Set([wonId]);
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
      const wonId = getPokemonId(currentWonPokemon);
      markAsPending(currentWonPokemon);
      lastSpinPendingIds = new Set([wonId]);
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
        const wonId = getPokemonId(currentWonPokemon);
        markAsPending(currentWonPokemon);
        lastSpinPendingIds = new Set([wonId]);
        saveShinyTracking();
      }
      closeWinnerModal();
    }
  });

  // Eventos de la Matriz Gigante Paldea 400
  if (matrixTypeFilter) {
    matrixTypeFilter.addEventListener('change', (e) => {
      currentMatrixTypeFilter = e.target.value || 'all';
      renderPaldeaMatrix();
    });
  }

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

  if (matrixLastSpinPill) {
    matrixLastSpinPill.style.cursor = 'pointer';
    matrixLastSpinPill.addEventListener('click', () => {
      const allChips = document.querySelectorAll('[data-matrix-filter]');
      allChips.forEach(b => {
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


