# Shiny Roulette - Ruleta y Rastreador de Pokémon Shiny

Herramienta web interactiva para cazadores de Pokémon Shiny. Incluye la **Ruleta General con los 1,025 Pokémon existentes (Generaciones 1 a 9)** y **7 Pokédexes Oficiales independientes para todos los juegos de Nintendo Switch**.

---

## Características Principales

- **Ruleta General y Multi-Pokédex (7 Catálogos Oficiales):**
  - **Ruleta General (Gens 1-9):** 1,025 Pokémon con filtro por generación y disponibilidad multi-juego.
  - **Pokédex de Paldea (Escarlata y Púrpura):** 400 Pokémon con filtros de exclusivos de versión.
  - **Pokédex de Galar (Espada y Escudo):** 400 Pokémon con exclusivos de versión.
  - **Pokédex de Hisui (Leyendas Pokémon: Arceus):** 242 Pokémon de la región de Hisui.
  - **Pokédex de Sinnoh (Diamante Brillante y Perla Reluciente):** 151 Pokémon con exclusivos de versión.
  - **Pokédex de Kanto (Let's Go Pikachu / Eevee):** 153 Pokémon con exclusivos de versión.
  - **Pokédex de Luminalia (Leyendas Pokémon: Z-A):** 232 Pokémon confirmados de Ciudad Luminalia.

- **Insignias Canónicas de Disponibilidad por Juego:**
  - En la Ruleta General, cada Pokémon muestra insignias nítidas indicando en qué entregas de Nintendo Switch está disponible (`SV`, `Z-A`, `SwSh`, `PLA`, `BDSP`, `LGPE`) y en cuántas entregas clásicas (`+CLÁS`).
  - Datos verificados y canónicos cruzados con Pokédexes oficiales, DLCs (*La Máscara Turquesa*, *El Disco Índigo*, *Isla de la Armadura*, *Nieves de la Corona* y *Luminalia Dimensional*) y transferencias oficiales.

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
