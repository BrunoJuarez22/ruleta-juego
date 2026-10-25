# Shiny Roulette - Ruleta y Rastreador de Pokémon Shiny

Herramienta web interactiva para cazadores de Pokémon Shiny. Incluye la **Ruleta General con los 1,025 Pokémon existentes (Generaciones 1 a 9)** y **10 Pokédexes Oficiales independientes para entregas de Nintendo Switch y Nintendo 3DS**.

---

## Características Principales

- **Ruleta General y Multi-Pokédex (10 Catálogos Oficiales):**
  - **Ruleta General (Gens 1-9):** 1,025 Pokémon con filtro por generación y disponibilidad multi-juego.
  - **Pokédex de Paldea (Escarlata y Púrpura):** 400 Pokémon con filtros de exclusivos de versión.
  - **Pokédex de Galar (Espada y Escudo):** 400 Pokémon con exclusivos de versión.
  - **Pokédex de Hisui (Leyendas Pokémon: Arceus):** 242 Pokémon de la región de Hisui.
  - **Pokédex de Sinnoh (Diamante Brillante y Perla Reluciente):** 151 Pokémon con exclusivos de versión.
  - **Pokédex de Kanto (Let's Go Pikachu / Eevee):** 153 Pokémon con exclusivos de versión.
  - **Pokédex de Luminalia (Leyendas Pokémon: Z-A):** 232 Pokémon confirmados de Ciudad Luminalia.
  - **Pokédex de Kalos (Pokémon X y Pokémon Y):** 457 Pokémon divididos en Kalos Centro, Costa y Montaña con 32 exclusivos de versión.
  - **Pokédex de Hoenn (Pokémon Rubí Omega y Zafiro Alfa):** 211 Pokémon con 16 exclusivos de versión.
  - **Pokédex de Alola (Pokémon Ultrasol y Ultraluna):** 403 Pokémon distribuidos en sus 4 islas con 40 exclusivos de versión.

- **Insignias Canónicas de Disponibilidad por Juego:**
  - En la Ruleta General, cada Pokémon muestra insignias nítidas indicando en qué entregas de Nintendo Switch está disponible (`SV`, `Z-A`, `SwSh`, `PLA`, `BDSP`, `LGPE`) y en cuántas entregas clásicas (`+CLÁS`).
  - Datos verificados y canónicos cruzados con Pokédexes oficiales, DLCs (*La Máscara Turquesa*, *El Disco Índigo*, *Isla de la Armadura*, *Nieves de la Corona* y *Luminalia Dimensional*) y transferencias oficiales.

- **Guía de Ubicación y Obtención por Juego (Tarjeta Modal Expandible):**
  - Al abrir la tarjeta expandible de cualquier Pokémon (desde la ruleta, la cuadrícula de la matriz, la lista de capturados shiny, el historial de giros, el catálogo modal o el visor del puntero), se muestra dónde y cómo obtener/capturar al Pokémon en cada juego donde está disponible.
  - **Fase 1 (Pokédex de Paldea completa - 400 Pokémon):** Incluye todas las rutas, áreas de Paldea, Noroteo, Biodomo Arándano, niveles, métodos de captura (`SALVAJE`, `EVOLUCIÓN`, `TERAINCURSIONES`, `APARICIÓN MASIVA`, `CRIAR`, `ESPECIAL`, `INTERCAMBIO`) y ubicaciones históricas desde Generación 1 hasta Generación 9.
  - **Fase 2 (Pokédex de Hisui / *Leyendas: Arceus* - 242 Pokémon y Ciudad Luminalia / *Leyendas: Z-A* - 232 Pokémon):** Incluye las regiones de Hisui (`Pradera Obsidiana`, `Pantanal Carmesí`, `Costa Cobalto`, `Ladera Corona`, `Tundra Alba`), distorsiones espaciotemporales, apariciones supermasivas, Pokémon Alfa, Zonas salvajes 1–20 y distritos de Ciudad Luminalia, Zonas salvajes dimensionales (*Luminalia Dimensional*) y todas las formas regionales de Hisui, Alola y Galar.
  - **Fase 3 (Pokédex de Galar / *Espada y Escudo* - 400 Pokémon):** Incluye las rutas 1–10 de Galar, zonas y climas del Área Silvestre, nidos exactos de Incursiones Dinamax y Gigamax, Aventura Dinamax (*Las Nieves de la Corona*), *Isla de la Armadura*, encuentros por Curri y desglose completo de las 16 especies con forma regional de Galar (`[Forma de Galar]` + forma clásica).
  - **Fase 4 (Pokédex de Sinnoh / *Diamante Brillante y Perla Reluciente* - 151 Pokémon, Pokédex de Kanto / *Let's Go Pikachu y Let's Go Eevee* - 153 Pokémon y Pokédex Nacional Completa - 1,025 Pokémon):** Incluye rutas 201–230 de Sinnoh, Grutas del Subsuelo, Árboles de Miel, Pokéradar, Jardín Trofeo, Gran Pantano, Parque Hansa, rutas 1–25 de Kanto, GO Park (`Meltan` y `Melmetal`), las 18 formas regionales de Alola (`[Forma de Alola]` + `[Forma de Kanto]`), Ultraentes y todas las especies de los DLCs de Gen 8 y Gen 9.
  - **Fase 5 (Juegos de Nintendo 3DS: Kalos X/Y - 457 Pokémon, Hoenn RO/ZA - 211 Pokémon y Alola US/UL - 403 Pokémon):** Cobertura exhaustiva de las 3 áreas de Kalos (Centro, Costa, Montaña), rutas y mares de Hoenn, las 4 islas de Alola (Melemele, Akala, Ula-Ula, Poni), Safari Amistad, Ultravuelo, Ruinas del Espacio y Ultramétropolis, cubriendo el **100% de las 1,025 especies de la Pokédex Nacional y las 10 Pokédexes de la aplicación**.
  - Avisos informativos junto a la cuadrícula en cada sección y pestañas rápidas para consultar las ubicaciones de cualquier fase de su línea evolutiva sin salir de la tarjeta.

- **Líneas Evolutivas Interactivas:**
  - Al salir un Pokémon, el resultado muestra a los integrantes de su familia evolutiva en ese juego.
  - Cada miembro cuenta con casilla de verificación y sprite shiny para marcar varios miembros capturados en una misma sesión de caza o crianza.
  - Resolución precisa de IDs regionales y nacionales sin cruces ni discrepancias entre juegos.

- **Gestión de Pendientes y Capturados Shiny:**
  - Los Pokémon obtenidos en la ruleta que no se marquen como capturados pasan automáticamente a la lista de **Pendientes**.
  - Destacado visual prioritario del Pokémon pendiente obtenido en el giro anterior (`★ GIRO ANTERIOR`).
  - Matriz visual interactiva para consultar, filtrar y marcar capturas en cualquier momento.
  - Filtro por tipo en cada Pokédex (ruleta y matriz) que indica cuántos Pokémon de cada tipo te quedan por capturar, ordenado del tipo con más restantes al que menos.
  - Almacenamiento aislado por cada Pokédex (`localStorage`).

- **Sistema de Cuentas y Base de Datos (Modo Híbrido):**
  - Backend en Node.js + Express con base de datos SQLite persistente (`node:sqlite`) y autenticación JWT con contraseñas cifradas con `bcryptjs`.
  - Modo híbrido: Opera de forma local en modo invitado con `localStorage` o sincroniza el progreso en la nube al iniciar sesión.

- **Diseño Geométrico y Modo Día por Defecto:**
  - Modo Claro limpio y de alto contraste por defecto, con opción de alternar a Modo Noche.
  - Estética geométrica profesional con bordes limpios y núcleo central circular.
  - Cero emojis en toda la interfaz (utiliza iconos vectoriales SVG limpios y símbolos tipográficos estándar).

- **Sprites Locales y Funcionamiento Offline (100% Offline-First):**
  - Sprites regulares y shiny almacenados localmente en `assets/sprites/` para eliminar latencias de red.

- **Blindaje Legal y Preparación para Anuncios:**
  - Compatible con Google AdSense, archivo `ads.txt` estándar del IAB Tech Lab, cláusulas de Uso Legítimo (*Fair Use*), aviso de marcas registradas y banner de consentimiento de cookies.

---

## Cómo Ejecutar Localmente

### Opción 1: Con Servidor y Base de Datos Activa (Recomendado)
Para utilizar el sistema de cuentas, inicio de sesión y sincronización en la nube:

```bash
# 1. Instalar dependencias (solo la primera vez)
npm install

# 2. Iniciar el servidor
npm start
```

Abre en tu navegador:
`http://localhost:3000`

### Opción 2: Modo Estático (Invitado Offline)
Si no deseas ejecutar Node.js, abre directamente el archivo `index.html` en tu navegador. Toda la ruleta, catálogos y seguimiento shiny funcionarán guardando los datos en `localStorage`.

---

## Despliegue en Internet

El archivo `server/server.js` sirve tanto la API REST como la aplicación web estática.

### Despliegue en Fly.io (Con Disco Persistente)
La aplicación cuenta con configuración lista en `fly.toml` con disco virtual (`[mounts]`) para que la base de datos SQLite no se reinicie entre despliegues:

```bash
# 1. Iniciar sesión en Fly.io
fly auth login

# 2. Desplegar la aplicación
fly deploy
```

La aplicación se encuentra desplegada públicamente en:
`https://shiny-roulette.fly.dev/`
