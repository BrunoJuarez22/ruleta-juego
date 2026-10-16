# MEMORY.md — Shiny Roulette (Pokédex de Paldea)

Este documento registra la memoria técnica, el contexto de negocio, las decisiones arquitectónicas y el historial de evolución del proyecto **Shiny Roulette**. Debe consultarse en cada sesión para garantizar la coherencia y continuidad de los desarrollos.

---

## 1. Visión General del Proyecto

- **Nombre:** Shiny Roulette (Pokédex de Paldea).
- **Ubicación local:** `C:\Users\bruno\OneDrive\Desktop\ruleta-juego`.
- **Propósito:** Mini-juego web interactivo de ruleta enfocado en dinámicas de *Shiny Hunting* para los 400 Pokémon oficiales de la Pokédex de Paldea (*Pokémon Escarlata y Púrpura*).
- **Filosofía de Ejecución:** **100% Offline-First y Latencia Cero**. Todo el contenido (datos, 400 sprites estándar, 400 sprites shiny y audio sintetizado) funciona localmente sin depender de conexiones de red externas en tiempo de ejecución.

---

## 2. Arquitectura de Archivos

```
ruleta-juego/
├── assets/
│   ├── pokeball.svg              # Icono SVG para Pokéball y núcleo central
│   ├── sprites/                  # Sprites locales estándar (PNG offline, incluye 10250 y 10253)
│   │   ├── 1.png ... 10253.png
│   │   └── shiny/                # Sprites shiny locales (PNG offline, incluye 10250 y 10253)
│   │       ├── 1.png ... 10253.png
│   └── artwork/                  # Ilustraciones oficiales en alta resolución locales
│       ├── 10250.png, 10253.png
│       └── shiny/                # Ilustraciones shiny locales
├── data/                         # Almacenamiento SQLite persistente local (.gitignored)
│   └── shiny_roulette.db         # Base de datos SQLite
├── server/                       # Backend REST API
│   ├── db.js                     # Repositorio y conexión node:sqlite / esquemas
│   ├── auth.js                   # Middleware JWT y generación de tokens
│   ├── server.js                 # Servidor Express, CORS y servicio estático
│   └── routes/
│       ├── authRoutes.js         # Registro, Login y /me
│       └── userRoutes.js         # Progreso, capturas, sincronización y estado
├── index.html                    # Estructura semántica, controles, modales y matriz
├── style.css                     # Sistema de diseño, variables CSS, temas día/noche y auth
├── api.js                        # Cliente frontend para API REST, JWT y sincronización
├── script.js                     # Motor de ruleta (Canvas 2D), Web Audio API, matriz y lógica shiny
├── paldea_data.js                # Definición de window.PALDEA_POKEMON (400 registros completos)
├── paldea_pokemon.json           # Base de datos canónica de Paldea en formato JSON
├── all_data.js                   # Definición de window.ALL_NATIONAL_POKEMON (1025 Pokémon de Gens 1 a 9)
├── all_pokemon.json              # Base de datos canónica Nacional de 1025 Pokémon con disponibilidad de juegos
├── package.json                  # Dependencias de backend (express, bcryptjs, jsonwebtoken, cors)
├── Dockerfile                    # Imagen de contenedor Node 22 para despliegue en Fly.io
├── .dockerignore                 # Exclusiones de build de contenedor
├── fly.toml                      # Manifiesto de Fly.io con volumen persistente para SQLite
├── ads.txt                       # Archivo de autorización de inventario publicitario (IAB Tech Lab)
├── README.md                     # Documentación general para usuarios
├── memory.md                     # Memoria del proyecto, arquitectura y changelog
└── agent.md                      # Directrices operativas y de estilo para agentes de IA
```

---

## 3. Historial de Decisiones y Evolución (Changelog)

1. **Ruleta Básica Inicial:**
   - Creación del canvas interactivo de 500x500 con física de giro basada en `easeOutQuart` y duración de 4800ms.
   - Puntero superior en 270° con animación de rebote y sonidos de clic generados por osciladores de la Web Audio API.

2. **Integración Completa de Paldea (400 Pokémon):**
   - Incorporación de los 400 Pokémon oficiales de la Pokédex de Paldea con nombres en español, números de Paldea (#001-#400), números Nacionales (#0001-#1010) y tipos elementales.

3. **Descarga de Sprites Locales Offline:**
   - Descarga local de los 400 sprites estándar y 400 sprites shiny en `assets/sprites/` y `assets/sprites/shiny/`.
   - Implementación de `imageCache` en memoria y precarga anticipada (`preloadAllSprites`) para eliminar cualquier lag de red.

4. **Sincronización a 60 FPS del Live Tracker:**
   - Cálculo trigonométrico en tiempo real (`getActivePokemonAtRotation`) para actualizar el Live Tracker en cada fotograma del giro mientras la ruleta rueda.

5. **Restricciones Visuales Estrictas impuestas por el Usuario:**
   - **Modo Día por Defecto:** La paleta clara es la inicial (`currentTheme = 'light'`).
   - **Cero Emojis:** Prohibidos en toda la interfaz. Se emplean iconos vectoriales SVG limpios y caracteres tipográficos estándar como la estrella `★`.
   - **Sin bordes ondulados ni burbujas:** Estética geométrica profesional con bordes nítidos (`border-radius: 4px` o `3px`).
   - **Sin animaciones de respiración/pulsación:** Eliminadas todas las transiciones infinitas cíclicas (`pulse`, `breath`).
   - **Esfera Central Circular y Centrada:** El botón `#centerSpinHub` debe conservar siempre `border-radius: 50%` y `transform: translate(-50%, -50%)`, permaneciendo fijo en el eje central de la ruleta.

6. **Sistema de Seguimiento Shiny (Capturados vs Pendientes):**
   - Al detenerse la ruleta, el usuario puede marcar el Pokémon como **Capturado Shiny** o enviarlo a la lista de **Pendientes**.
   - Persistencia completa en `localStorage` con contadores dinámicos.

7. **Selector de Línea Evolutiva en Modal Ganador:**
   - Inyección del árbol evolutivo en los 400 registros (`evolutionLine`).
   - El modal ganador permite marcar con casillas de verificación múltiples miembros de la misma familia evolutiva (ej. capturar Sprigatito, Floragato y Meowscarada en un único giro si se cazó la línea entera).

8. **Selector de Línea Evolutiva en Pendientes:**
   - El botón `CAPTURADO SHINY` de cualquier tarjeta pendiente abre el modal configurado para pendientes (`openEvolutionLineModal(pokemon, 'pending')`), permitiendo marcar fases de la línea y cancelando sin obligar a girar la ruleta.

9. **Eliminación de Parpadeo del Pokémon Previo:**
   - Problema detectado: Al volver a girar y detenerse en un nuevo Pokémon, por un instante se apreciaba el sprite del Pokémon anterior debido a la decodificación asíncrona de `<img>`.
   - Solución: Se creó `clearModalContent()` para vaciar el modal al cerrar y al iniciar el giro, y se integró precarga con `Image.decode()` para activar el modal (`.active`) únicamente cuando el nuevo mapa de bits esté 100% procesado.

10. **Transformación de Pendientes a Matriz Gigante (400 Pokémon):**
    - La vista de pendientes se sustituyó por una matriz completa de los 400 Pokémon de Paldea.
    - **Resaltado especial:** Los Pokémon pendientes del último giro se distinguen con la clase `.is-last-spin-pending` (borde rojo de 2px, gradiente, etiqueta `★ GIRO ANTERIOR` y botón de captura prioritario).
    - Inclusión de barra de estadísticas (total de capturados, porcentaje, pendientes del giro anterior), buscador en tiempo real y chips de filtrado.

11. **Corrección de Colores de la Ruleta:**
    - Se resolvió un error donde la ruleta se pintaba completamente negra por falta del atributo `color` en los datos serializados.
    - Se integró el mapa `TYPE_COLORS` para los 18 tipos elementales tanto en los archivos de datos (`paldea_data.js`, `paldea_pokemon.json`) como en `script.js` con la función de respaldo `getPokemonColor()`.

12. **Ajuste y Contención de Botones en la Matriz:**
    - Se solucionó el desbordamiento del botón `LÍNEA` en las tarjetas de la matriz aplicando `minmax(136px, 1fr)` en `.matrix-grid`, `box-sizing: border-box`, `overflow: hidden` en `.matrix-card`, y anchos fijos proporcionados (`btn-matrix-toggle` flexible con `min-width: 0` y `btn-matrix-evo` con `44px`).

13. **Sistema de Cuentas, Autenticación y Base de Datos (SQLite + Express + JWT + Modo Híbrido):**
    - Se desarrolló un backend REST modular en Node.js + Express con base de datos SQLite nativa (`node:sqlite`) alojada en `data/shiny_roulette.db`.
    - Autenticación segura con cifrado `bcryptjs` (salt 10) y tokens de sesión JWT (`jsonwebtoken`) válidos por 30 días.
    - Endpoints de API:
      - `POST /api/auth/register`: Creación de cuenta con verificación de duplicados y asignación de token.
      - `POST /api/auth/login`: Autenticación por usuario o correo.
      - `GET /api/auth/me`: Validación del perfil de la sesión activa.
      - `GET /api/user/progress`: Consulta del estado y capturas guardadas en la base de datos.
      - `POST /api/user/sync`: Fusión inteligente sin pérdidas entre el progreso del usuario como invitado y los datos en la nube.
      - `POST /api/user/capture`: Guardado atómico de capturas individuales o lotes de líneas evolutivas.
      - `POST /api/user/uncapture`: Eliminación de capturas de la base de datos.
      - `POST /api/user/pending`: Registro y actualización de Pokémon pendientes y del último giro.
    - **Modo Híbrido (100% Offline-First con Nube Opcional):** Si no hay servidor o el usuario no ha iniciado sesión, el juego funciona exactamente igual guardando localmente en `localStorage`. Si inicia sesión, el progreso se sincroniza en segundo plano y se refleja en cualquier dispositivo.
    - **Interfaz de Usuario:** Botón de cuenta en la cabecera con indicador de estado (verde conectado, gris local, azul sincronizando) y modal `#authModal` con pestañas de Login, Registro y Panel de Perfil de Entrenador. Se respetan estrictamente las directrices: cero emojis (iconos SVG limpios), bordes rectos (4px/3px), sin animaciones infinitas de pulsación y modo día por defecto.

14. **Corrección de Assets para Formas Regionales de Paldea (Wooper y Tauros):**
    - **Problema Detectado:** Las entradas de **Wooper de Paldea** (#053 Paldea, tipo Veneno/Tierra) y **Tauros de Paldea** (#223 Paldea, tipo Lucha) estaban apuntando erróneamente a los sprites e ilustraciones de sus formas estándar originales (Johto #194, Wooper azul; y Kanto #128, Tauros marrón).
    - **Descarga e Integración de Formas Oficiales de Paldea:**
      - Wooper de Paldea: Se descargaron `assets/sprites/10253.png` (marrón con branquias óseas púrpuras), `assets/sprites/shiny/10253.png`, `assets/artwork/10253.png` e ilustración shiny.
      - Tauros de Paldea (Combat Breed): Se descargaron `assets/sprites/10250.png` (negro carbón con melena y cuernos Paldea), `assets/sprites/shiny/10250.png`, `assets/artwork/10250.png` e ilustración shiny.
    - **Garantía Retroactiva y Offline-First:**
      - Se sobrescribieron también `assets/sprites/194.png`, `assets/sprites/shiny/194.png`, `assets/sprites/128.png` y `assets/sprites/shiny/128.png` con las formas de Paldea, garantizando que capturas previas en `localStorage` o cachés locales también muestren la forma correcta.
      - Se actualizaron `paldea_pokemon.json` y `paldea_data.js` con las nuevas rutas locales y remotas.
      - Se actualizó el motor de precarga y fallback de modales en `script.js` para precargar ilustraciones locales.

15. **Desmarcado desde la Sección de Pendientes y Limpieza de Encabezado:**
    - **Desmarcado de Pendientes (`removePending`):** Se habilitó la opción de retirar Pokémon del estado pendiente directamente desde la matriz y desde el modal:
      - Botón `DESMARCAR` en la botonera de acciones de cada tarjeta que tenga estado pendiente (`isPending` o `isLastSpin`).
      - Botón rápido `✕` integrado en el distintivo de cabecera de la tarjeta (`.btn-card-unpend`).
      - Botón `DESMARCAR DE PENDIENTE` en el modal de selección de línea evolutiva si el Pokémon activo se encuentra pendiente.
      - Sincronización inmediata con `localStorage` y emisión asíncrona a la base de datos en la nube (`POST /api/user/remove-pending`).
    - **Limpieza del Título:** Se retiró el subtítulo secundario *"Caza de Pokémon Shiny · Pokédex de Paldea"* de la cabecera principal (`.title-group`), dejando únicamente el título nítido y estilizado: `SHINY ROULETTE`.

16. **Preparación para Monetización por Anuncios (Google AdSense) y Blindaje Legal (Copyright & Fair Use):**
    - **Estrategia y Protección contra Reclamaciones de Propiedad Intelectual:**
      - El proyecto implementa la estrategia estándar de los principales sitios comunitarios de referencia (como Serebii, Smogon y Pokémon Showdown):
        1. **Herramienta 100% gratuita:** No se vende ni cobra por ningún activo de Nintendo ni de The Pokémon Company. La publicidad sufraga costes de servidor, computación y mantenimiento técnico.
        2. **Marca y dominio independientes:** El proyecto se denomina *"Shiny Roulette"*, sin usurpar marcas registradas en el nombre de la herramienta ni inducir a confusión comercial.
        3. **Atribución visible de marcas:** Pie de página (`.app-footer`) con declaración explícita: *"Pokémon y todos los nombres, marcas y activos gráficos son propiedad de Nintendo Co., Ltd., Creatures Inc. y Game Freak Inc."*
        4. **Amparo en Uso Legítimo (Fair Use / 17 U.S.C. § 107):** Declaración de fines educativos, recreativos y de catalogación documental para la comunidad de jugadores.
        5. **Procedimiento formal DMCA:** Sección y buzón directo (`dmca@shinyroulette.local`) con compromiso de retirada de material en 24-48h sin litigios.
    - **Preparación Técnica para Google AdSense / Redes Publicitarias:**
      - **Archivo `ads.txt`:** Implementado en la raíz del proyecto conforme al estándar del IAB Tech Lab (`google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`).
      - **Contenedor publicitario seguro (`.ad-placement-section`):** Caja para banner responsive de 728x90 ubicada debajo de los controles principales y antes de la matriz, debidamente señalizada con la etiqueta `PUBLICIDAD` para evitar infracciones de clics involuntarios (invalid clicks).
      - **Modal Legal Integral (`#legalModal`):** Cuatro paneles interactivos:
        - *Copyright & DMCA*: Declaración legal, atribución de marcas y protocolo de retirada.
        - *Privacidad (AdSense/GDPR)*: Divulgación de cookies DART/DoubleClick de terceros requerida contractualmente por Google AdSense, y derechos de los usuarios.
        - *Términos de Servicio*: Condiciones de uso de la herramienta.
        - *Gestión de Cookies*: Información sobre cookies técnicas vs publicitarias.
      - **Banner de Consentimiento de Cookies (`#cookieConsentBanner`):** Banner fijo inferior conforme a GDPR/ePrivacy/CCPA con opciones "ACEPTAR TODAS" y "SÓLO ESENCIALES", persistido en `localStorage` (`ruleta_cookies_accepted`).
      - **Estilo y Coherencia:** Totalmente integrado con el sistema de diseño: cero emojis (iconos SVG limpios), bordes rectos (4px/3px), sin animaciones infinitas de pulsación y adaptativo a temas claro/oscuro.

17. **Verificación Operativa de la Base de Datos y Guía de Despliegue sin Dominio:**
    - **Estado de SQLite:** Base de datos activa y verificada en `data/shiny_roulette.db` con tablas `users`, `user_captured`, `user_pending` y `user_state`.
    - **Arquitectura Fullstack Unificada:** `server/server.js` sirve simultáneamente las rutas de API REST (`/api/auth`, `/api/user`, `/api/health`) y los archivos estáticos de la aplicación mediante `express.static(ROOT_DIR)`.
    - **Detección Dinámica de URL en Frontend (`api.js`):** Detecta automáticamente si se ejecuta bajo protocolo HTTP/HTTPS (usando rutas relativas `/api/...`) o vía archivo local `file://` (apuntando a `http://localhost:3000`), permitiendo el despliegue directo en cualquier servicio en la nube (Render, Railway, Koyeb) sin requerir configuración manual de dominio ni variables de entorno adicionales.

18. **Creación de Repositorio Git y Publicación en GitHub:**
    - **Repositorio Oficial:** Publicado con éxito en GitHub bajo la cuenta del usuario: `https://github.com/BrunoJuarez22/ruleta-juego`.
    - **Rama Principal:** `main`.
    - **Contenido Sincronizado:** Todo el código fuente, backend Express, esquemas SQLite, 400 sprites regulares y 400 shiny offline, ilustraciones de alta resolución locales (incluyendo Wooper y Tauros de Paldea), assets SVG, archivo normativo `ads.txt`, políticas de privacidad y documentación completa.
    - **Seguridad en `.gitignore`:** Exclusión garantizada de `node_modules/`, bases de datos SQLite locales (`*.db`, `*.db-wal`, `*.db-shm`) y variables `.env`. Se preserva la carpeta `data/` con `data/.gitkeep`.

19. **Infraestructura de Despliegue en Fly.io con Disco Persistente para SQLite:**
    - **Configuración de Contenedor:** Creación de `Dockerfile` (Node 22 Alpine) optimizado para producción y `.dockerignore` para excluir artefactos pesados o temporales.
    - **Configuración de Fly (`fly.toml`):** Configurado con puerto interno `3000`, HTTPS forzado y sección `[mounts]` con volumen persistente (`roulette_data`) montado en `/app/data`.
    - **Protección contra Sobrecostes por Tráfico:** Integración de límites duros de concurrencia (`soft_limit = 20`, `hard_limit = 25`) en `[http_service.concurrency]` y contención de 1 máquina máxima para evitar escalados automáticos o cobros sorpresivos por tráfico anómalo.
    - **Persistencia de Base de Datos:** Garantiza que el archivo `data/shiny_roulette.db` no se pierda ante reinicios o suspensión por inactividad de máquinas virtuales.
    - **Herramienta CLI:** Instalación de `flyctl` en `$HOME/.fly/bin/` y adición al `PATH` del sistema.

20. **Despliegue Exitoso en Producción (Fly.io):**
    - **URL Pública en Vivo:** `https://shiny-roulette.fly.dev` operativa con certificado SSL/HTTPS activo y latencia mínima.
    - **Verificación de Healthcheck:** `GET /api/health` responde con HTTP 200 y confirma la base de datos `SQLite (node:sqlite)` operativa.
    - **Verificación de Inventario Publicitario:** `GET /ads.txt` responde con HTTP 200 y sirve la especificación de editor para monetización.
    - **Integración Continua (CI/CD):** Flujo de trabajo de GitHub Actions generado en `.github/workflows/fly-deploy.yml` para despliegues continuos.

21. **Distintivos y Filtros de Exclusividad de Juego (Escarlata vs Púrpura):**
    - **Clasificación Oficial de los 400 Pokémon:**
      - **Exclusivos de Escarlata (23 Pokémon):** Drifloon (#143), Drifblim (#144), Armarouge (#166), Stunky (#226), Skuntank (#227), Oranguru (#313), Larvitar (#316), Pupitar (#317), Tyranitar (#318), Stonjourner (#319), Skrelp (#337), Dragalge (#338), Deino (#370), Zweilous (#371), Hydreigon (#372), Paradojas Pasadas: Colmilargo (#376), Colagrito (#377), Furioseta (#378), Melenaleteo (#379), Reptalada (#380), Pelarena (#381), Bramaluna (#397), y Koraidon (#399).
      - **Exclusivos de Púrpura (23 Pokémon):** Misdreavus (#114), Mismagius (#115), Gulpin (#139), Swalot (#140), Ceruledge (#167), Bagon (#276), Shelgon (#277), Salamence (#278), Dreepy (#305), Drakloak (#306), Dragapult (#307), Passimian (#314), Eiscue (#320), Clauncher (#339), Clawitzer (#340), Paradojas Futuras: Ferrodada (#382), Ferrosaco (#383), Ferropalmas (#384), Ferrocuello (#385), Ferropolilla (#386), Ferropúas (#387), Ferropaladín (#398), y Miraidon (#400).
      - **Ambos Juegos (354 Pokémon):** Los restantes 354 Pokémon disponibles en ambas ediciones.
    - **Visualización Integral en Todos los Puntos Clave de la Aplicación:**
      - **Live Pointer Tracker:** Distintivo rectangular nítido (`ESCARLATA` / `PÚRPURA` / `AMBOS`) junto a los tipos del Pokémon al que apunta la aguja en tiempo real.
      - **Modal Ganador / Línea Evolutiva:**
        - Banner superior destacado con indicador de punto de color (`★ EXCLUSIVO DE POKÉMON ESCARLATA`, `★ EXCLUSIVO DE POKÉMON PÚRPURA`, o `DISPONIBLE EN AMBOS JUEGOS`).
        - Distintivos mini (`ESC`, `PÚR`, `AMB`) dentro de cada tarjeta de miembro evolutivo (`.evo-card`).
      - **Matriz Paldea 400:** Distintivo mini nítido en la cabecera izquierda de cada una de las 400 tarjetas (`.matrix-card-header`).
      - **Capturados Shiny:** Distintivo mini en la fila de metadatos (`.shiny-meta-row`).
      - **Historial de Giros:** Distintivo mini dentro de cada chip de giro reciente (`.history-item`).
      - **Explorador Pokédex:** Distintivo mini junto a los tipos en cada fila de resultados (`.item-row`).
    - **Filtros por Juego:**
      - Selector de rango principal (`#rangeFilter`): Opciones `EXCLUSIVOS ESCARLATA (23)` y `EXCLUSIVOS PÚRPURA (23)` para girar únicamente con Pokémon exclusivos.
      - Barra de chips de la matriz: Nuevos botones `ESCARLATA (23)`, `PÚRPURA (23)` y `AMBOS (354)`.
      - Buscador global y de matriz: Soporte para buscar `escarlata`, `purpura`, `púrpura` o `ambos`.
    - **Estilo Visual:** Cero emojis; puntos vectoriales CSS circulares (`.game-dot`), bordes rectos nítidos (2-3px), paleta oficial (rojo escarlata `#e11d48`, violeta púrpura `#7c3aed`, neutro slate `#64748b`) con soporte impecable en Modo Día y Modo Noche.

22. **Optimización Integral de SEO, Google Search Console y Posicionamiento de Marca:**
    - **Nombre de Marca y Título Canónico:** Establecimiento estricto de `<title>Shiny Roulette</title>` en lugar de títulos largos para consolidar el nombre de la página en el índice de Google y fragmentos de búsqueda.
    - **Datos Estructurados Schema.org (JSON-LD):**
      - `WebSite` schema (`@type: WebSite` con `name: "Shiny Roulette"` y alias `alternateName: ["ShinyRoulette", "Shiny Roulette Paldea"]`) conforme a la especificación oficial de Google para Site Names en resultados de búsqueda.
      - `WebApplication` schema (`@type: WebApplication`) especificando categoría `GameApplication`, requisitos HTML5/JS y costo gratuito.
    - **Metadatos y Rastreo:**
      - Metadatos primarios: `description`, `keywords`, `author`, `application-name`, `apple-mobile-web-app-title`, `theme-color: #dc2626`.
      - Directivas de rastreo: `<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">` y `googlebot`.
      - Etiqueta placeholder identificada para verificación por meta tag de Google Search Console (`<meta name="google-site-verification" content="...">`).
      - URL Canónica: `<link rel="canonical" href="https://shiny-roulette.fly.dev/">`.
    - **Social Media & Open Graph:**
      - Open Graph: `og:site_name`, `og:title`, `og:description`, `og:type: website`, `og:url`, `og:image` y `og:locale: es_ES`.
      - Twitter Cards: `twitter:card: summary`, `twitter:title`, `twitter:description`, `twitter:image`.
    - **Verificación de Google Search Console:** Etiqueta `<meta name="google-site-verification" content="-FtLYsysW5d6oZYMjUdbwnlk8n7ugT7FrNaqd-8XGmY">` integrada en el `<head>` para validación instantánea de propiedad en Search Console.
    - **Archivos de Indexación en la Raíz:**
      - `robots.txt`: Configurado para permitir indexación global (`Allow: /`), bloquear endpoints privados de API (`Disallow: /api/`), y declarar la ruta al sitemap (`Sitemap: https://shiny-roulette.fly.dev/sitemap.xml`).
      - `sitemap.xml`: Archivo XML conforme al estándar sitemaps.org con frecuencia de cambio diaria y prioridad máxima 1.0 para indexación rápida.

23. **Ocultación Limpia del Bloque Publicitario (Enfoque en Experiencia y Crecimiento de Usuarios):**
    - **Visibilidad y Espacio Cero:** Se ocultó el contenedor `.ad-placement-section` mediante `display: none !important; margin: 0; padding: 0; height: 0; overflow: hidden;` tanto en `style.css` como con estilo inline en `index.html`.
    - **Preservación de Estructura Técnica:** Todo el marcado HTML, IDs (`#adBannerBottom`), etiquetas semánticas y comentarios para los scripts de Google AdSense se mantienen 100% intactos en el código fuente para una activación instantánea a futuro cuando la audiencia esté consolidada.
    - **Banner de Cookies Neutralizado:** Se suavizó la redacción del banner de consentimiento para enfocarlo en "Privacidad y Preferencias" (guardado de capturas, analítica y rendimiento) en lugar de mencionar explícitamente publicidad.
    - **Archivos Legales y de Monetización Preservados:** `ads.txt` en la raíz y las políticas legales en `#legalModal` permanecen completamente operativos para salvaguardar la cuenta y el cumplimiento normativo.

24. **Arquitectura Multi-Pokedex y Persistencia Aislada por Juego/Contexto (Fase 1 del Plan de Expansión):**
    - **Objetivo:** Sentar las bases para la expansión hacia todas las generaciones (1 a 9) y futuros apartados independientes por juego (Ruleta General, Escarlata/Púrpura, Leyendas Z-A, etc.), asegurando que una misma cuenta de usuario y el almacenamiento local conserven registros, matrices, capturas y pendientes 100% aislados por cada juego sin mezclas.
    - **Evolución del Esquema SQLite (`server/db.js`):**
      - Migración transparente y sin pérdida de datos en `initDatabaseSchema()`. Si las tablas existentes carecían de `dex_id`, se migran automáticamente preservando todos los registros anteriores bajo el contexto `'paldea'`.
      - **`user_captured`:** Incorpora `dex_id TEXT NOT NULL DEFAULT 'paldea'` y `pokemon_id TEXT NOT NULL`, con restricción de unicidad aislada: `UNIQUE(user_id, dex_id, pokemon_id)`.
      - **`user_pending`:** Incorpora `dex_id TEXT NOT NULL DEFAULT 'paldea'` y `pokemon_id TEXT NOT NULL`, con restricción de unicidad aislada: `UNIQUE(user_id, dex_id, pokemon_id)`.
      - **`user_dex_state`:** Nueva tabla para persistir el estado específico de cada juego/ruleta (`user_id`, `dex_id`, `last_spin_pending`, `updated_at`, `PRIMARY KEY(user_id, dex_id)`).
      - **`user_state`:** Almacena preferencias globales de usuario y el contexto activo (`current_dex TEXT DEFAULT 'paldea'`).
      - **Índices de Alto Rendimiento:** `idx_captured_user_dex` y `idx_pending_user_dex` sobre `(user_id, dex_id)`.
    - **Endpoints de Backend (`server/routes/userRoutes.js`):**
      - Todos los endpoints (`/progress`, `/sync`, `/capture`, `/uncapture`, `/pending`, `/remove-pending`, `/state`) aceptan y procesan el parámetro `dexId` (predeterminado `'paldea'`).
    - **Cliente Frontend (`api.js`):**
      - Adaptación de todas las funciones de sincronización y mutación (`fetchCloudProgress`, `syncProgressWithCloud`, `cloudCapture`, `cloudUncapture`, `cloudAddPending`, `cloudRemovePending`, `cloudSaveState`) para enviar `dexId`.
    - **Persistencia Local y Migración Automática (`script.js`):**
      - Llaves dinámicas con prefijo de contexto: `shiny_captured_${dexId}`, `shiny_pending_${dexId}`, `shiny_last_spin_pending_${dexId}`.
      - Función `migrateLocalStorageIfNeeded()` para transferir datos heredados de `shiny_captured` a `shiny_captured_paldea` en el primer arranque, manteniendo compatibilidad bidireccional.
      - Función universal `getPokemonId(pokemon)` para indexar Pokémon tanto por número regional como nacional o identificador único.

25. **Dataset Canónico Nacional de 1025 Pokémon y Descarga Completa de Sprites Offline (Fase 2):**
    - **Dataset Completo de 1 a 1025 (`all_pokemon.json` y `all_data.js`):**
      - Generación canónica a partir de los datos oficiales de PokéAPI para los 1025 Pokémon de la Pokédex Nacional (Generaciones 1 a 9: Kanto 151, Johto 100, Hoenn 135, Sinnoh 107, Teselia 156, Kalos 72, Alola 88, Galar 96, Paldea 120).
      - Metadatos normalizados: nombres oficiales en español, tipos elementales en español, asignación cromática hex según `TYPE_COLORS`, líneas evolutivas nacionales completas e identificación de los juegos principales donde cada especie está disponible (`games`: RB, Y, GS, C, RS, E, FRLG, DP, Pt, HGSS, BW, B2W2, XY, ORAS, SM, USUM, LGPE, SwSh, BDSP, PLA, SV, PLZA).
      - Precarga en el cliente a través de `window.ALL_NATIONAL_POKEMON` mediante `all_data.js` integrado en `index.html`.
    - **Descarga Masiva de Sprites Offline (100% Offline-First):**
      - Descarga de los 625 sprites estándar restantes (`assets/sprites/1.png` a `1025.png`) y 625 sprites shiny (`assets/sprites/shiny/1.png` a `1025.png`).
      - Total de archivos en disco: 1,027 sprites regulares y 1,027 sprites shiny (incluyendo las formas de Paldea Tauros #10250 y Wooper #10253). Cero dependencias de red en tiempo de ejecución.

26. **Selector de Pokédex / Juego e Interfaz Multi-Dex Dinámica (Fase 3):**
    - **Selector Multi-Dex con Píldoras Nítidas:**
      - Nueva sección de navegación accesible (`.dex-selection-section`) ubicada estratégicamente debajo del encabezado principal.
      - Píldoras de selección interactiva: `RULETA GENERAL (1025)` (estrella dorada `★`, seleccionada por defecto como solicitó el usuario) y `PALDEA (ESC / PÚR) (400)` (punto de gradiente escarlata/púrpura).
      - Conmutación en caliente fluida mediante `switchDexContext(dexId)` sin recarga de página: redibuja la ruleta al instante (1025 vs 400 gajos), conmuta la matriz, actualiza contadores y títulos dinámicos (`#tabPendingTitle`, `#catalogModalTitle`, `#matrixTotalCount`, `#resetAllBtnText`).
    - **Filtros Adaptativos y Reconstrucción Dinámica:**
      - En Ruleta General:
        - Selector de rango (`#rangeFilter`) con opciones por Generación (`GEN 1: KANTO` a `GEN 9: PALDEA`) y disponibilidad (`DISPONIBLE EN ESC/PÚR (S/V)`, `CONFIRMADO LEYENDAS Z-A`).
        - Chips de matriz dinámicos para Gens 1 a 9 con conteos oficiales y juegos destacados (`EN S/V`, `EN Z-A`).
      - En Pokédex de Paldea:
        - Mantiene rangos clásicos (`INICIALES`, `#001-#100`...`#301-#400`, `PARADOJAS`) y chips exclusivos (`ESCARLATA (23)`, `PÚRPURA (23)`, `AMBOS (354)`).
    - **Visualización Universal de Juegos Disponibles y Formato de Número:**
      - Helper unificado `getPokemonDisplayNum(pokemon)`: muestra `#0001` - `#1025` en General y `#001` - `#400` en Paldea sin valores `undefined`.
      - En Ruleta General: el modal ganador despliega fila de chips vectoriales (`.winner-game-general`, `.game-chips-row`) indicando los juegos donde cada Pokémon puede capturarse o transferirse, con resaltado visual para S/V y Legends Z-A.
      - Live Pointer Tracker, historial de giros, modal evolutivo y catálogo Pokédex adaptados a ambos contextos.
27. **Integración Completa de Todos los Juegos de Nintendo Switch (Fase 4):**
    - **7 Pokédexes Oficiales e Independientes:**
      1. **Ruleta General (Gens 1-9):** 1,025 Pokémon (`dexId: 'general'`).
      2. **Paldea (Escarlata / Púrpura):** 400 Pokémon (`dexId: 'paldea'`).
      3. **Galar (Espada / Escudo):** 400 Pokémon (`dexId: 'swsh'`, `numGal` #001 a #400).
      4. **Hisui (Leyendas Arceus):** 242 Pokémon (`dexId: 'pla'`, `numHis` #001 a #242).
      5. **Sinnoh (Diamante Brillante / Perla Reluciente):** 151 Pokémon (`dexId: 'bdsp'`, `numSin` #001 a #151).
      6. **Kanto (Let's Go Pikachu / Eevee):** 153 Pokémon (`dexId: 'lgpe'`, `numKan` #001 a #153).
      7. **Ciudad Luminalia (Leyendas Z-A):** 232 Pokémon (`dexId: 'plza'`, `numLum` #001 a #232).
    - **Datasets y Lookup Multi-Dimensional (`switch_pokemon.json` y `switch_data.js`):**
      - Generados e integrados en el cliente en `window.GALAR_POKEMON`, `window.HISUI_POKEMON`, `window.SINNOH_POKEMON`, `window.LETSGO_POKEMON`, `window.LUMIOSE_POKEMON`.
      - Indexación por número regional (`BY_NUM`) y número nacional (`BY_NAT`) para resolución instantánea y sin ambigüedad en ruleta, matriz y selectores de líneas evolutivas.
    - **Determinación Oficial de Exclusivos por Pareja de Juegos:**
      - **SwSh:** 29 exclusivos de Espada (Sirfetch'd, Zacian, Darumaka Galar, Farfetch'd Galar, etc.), 29 exclusivos de Escudo (Cursola, Zamazenta, Ponyta Galar, Rapidash Galar, etc.) y 342 comunes.
      - **BDSP:** 7 exclusivos de Diamante Brillante (Cranidos, Rampardos, Stunky, Skuntank, Murkrow, Honchkrow, Dialga), 7 exclusivos de Perla Reluciente (Shieldon, Bastiodon, Glameow, Purugly, Misdreavus, Mismagius, Palkia) y 137 comunes.
      - **LGPE:** 12 exclusivos de Let's Go Pikachu (Sandshrew, Oddish, Mankey, Growlithe, Grimer, Scyther y sus evoluciones), 12 exclusivos de Let's Go Eevee (Ekans, Vulpix, Meowth, Bellsprout, Koffing, Pinsir y sus evoluciones) y 129 comunes.
      - **PLA y PLZA:** Pokédex regional única con badges canónicos de Hisui y Luminalia.
    - **Filtros Dinámicos, Matriz Adaptativa y Banners:**
      - Selector de rango (`#rangeFilter`) adaptado a cada juego (iniciales, bloques numéricos, exclusivos y formas regionales).
      - Chips de filtro en la matriz (`#matrixFilterChips`) con botones dedicados por juego (`ESPADA`, `ESCUDO`, `DIAMANTE`, `PERLA`, `PIKACHU`, `EEVEE`, `HISUI`, `LUMINALIA`).
      - Banners temáticos en modal ganador y badges vectoriales (`.game-badge`, `.winner-game-banner`) con soporte completo en Modo Día (predeterminado) y Modo Noche.
    - **Aislamiento Estricto y Sincronización en Nube:**
      - Cada Pokédex cuenta con su propio almacenamiento en `localStorage` (`shiny_captured_${dexId}`, `shiny_pending_${dexId}`, `shiny_last_spin_pending_${dexId}`).
      - Sincronización en SQLite particionada por `user_id` y `dex_id` (`user_captured`, `user_pending`, `user_dex_state`).
      - 100% verificado con suite de pruebas automáticas en scratch (`test_switch_integration.js`).

---

## 4. Estructuras de Datos y Persistencia

### Modelo de Datos del Pokémon (Nacional / General)
```json
{
  "pokemonId": "0001",
  "numNac": "0001",
  "numPal": null,
  "name": "Bulbasaur",
  "generation": 1,
  "types": ["Planta", "Veneno"],
  "color": "#16a34a",
  "sprite": "assets/sprites/1.png",
  "remoteSprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
  "shinySprite": "assets/sprites/shiny/1.png",
  "image": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
  "chainId": 1,
  "evolutionLine": ["0001", "0002", "0003"],
  "games": ["RB", "Y", "GS", "C", "FRLG", "HGSS", "XY", "LGPE", "SwSh", "BDSP", "SV", "PLZA"]
}
```

### Modelo de Datos del Pokémon (Paldea)
```json
{
  "pokemonId": "001",
  "numPal": "001",
  "numNac": "0906",
  "name": "Sprigatito",
  "types": ["Planta"],
  "color": "#16a34a",
  "sprite": "assets/sprites/906.png",
  "remoteSprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/906.png",
  "image": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/906.png",
  "shinySprite": "assets/sprites/shiny/906.png",
  "chainId": 478,
  "evolutionLine": ["001", "002", "003"],
  "game": "both"
}
```

### Esquema de Base de Datos Relacional (SQLite Multi-Dex)
- **`users`:** `id` (INTEGER PK), `username` (TEXT UNIQUE NOCASE), `email` (TEXT UNIQUE NOCASE), `password_hash` (TEXT), `created_at`, `updated_at`.
- **`user_captured`:** `id` (INTEGER PK), `user_id` (FK users), `dex_id` (TEXT, ej. 'paldea', 'general'), `pokemon_id` (TEXT), `num_pal` (TEXT), `num_nac` (TEXT), `name` (TEXT), `types` (TEXT JSON), `color` (TEXT), `sprite` (TEXT), `shiny_sprite` (TEXT), `captured_at`. `UNIQUE(user_id, dex_id, pokemon_id)`.
- **`user_pending`:** `id` (INTEGER PK), `user_id` (FK users), `dex_id` (TEXT), `pokemon_id` (TEXT), `num_pal` (TEXT), `num_nac` (TEXT), `name` (TEXT), `types` (TEXT JSON), `color` (TEXT), `sprite` (TEXT), `shiny_sprite` (TEXT), `added_at`. `UNIQUE(user_id, dex_id, pokemon_id)`.
- **`user_dex_state`:** `user_id` (FK users), `dex_id` (TEXT), `last_spin_pending` (TEXT JSON), `updated_at`. `PRIMARY KEY(user_id, dex_id)`.
- **`user_state`:** `user_id` (PK FK users), `current_dex` (TEXT), `last_spin_pending` (TEXT JSON legado), `theme_pref` (TEXT), `audio_pref` (INTEGER), `updated_at`.

### Llaves de `localStorage`
- `ruleta_theme`: `'light'` (predeterminado) o `'dark'`.
- `ruleta_audio`: `'true'` o `'false'`.
- `shiny_captured_${dexId}`: Arreglo JSON de Pokémon capturados en el contexto activo (ej. `shiny_captured_paldea`, `shiny_captured_general`).
- `shiny_pending_${dexId}`: Arreglo JSON de Pokémon pendientes en el contexto activo.
- `shiny_last_spin_pending_${dexId}`: Arreglo JSON de IDs del giro anterior en el contexto activo.
- `ruleta_jwt_token`: Token JWT de autenticación para llamadas a la API REST.
- `ruleta_current_user`: Objeto JSON con el perfil del usuario autenticado (`id`, `username`, `email`).
- `ruleta_last_sync_time`: Marca de tiempo ISO de la última sincronización exitosa con la base de datos.
- `ruleta_cookies_accepted`: `'all'` o `'essential'`. Preferencia de cookies publicitarias y de terceros según el consentimiento del usuario.


---

## 5. Tabla de Colores Oficiales por Tipo (`TYPE_COLORS`)

| Tipo | Color Hex | Tipo | Color Hex |
| :--- | :--- | :--- | :--- |
| **Planta** | `#16a34a` | **Eléctrico** | `#eab308` |
| **Fuego** | `#ea580c` | **Hielo** | `#0891b2` |
| **Agua** | `#0284c7` | **Lucha** | `#c2410c` |
| **Bicho** | `#65a30d` | **Veneno** | `#9333ea` |
| **Normal** | `#78716c` | **Tierra** | `#d97706` |
| **Volador** | `#6366f1` | **Psíquico** | `#db2777` |
| **Roca** | `#a16207` | **Fantasma** | `#7c3aed` |
| **Dragón** | `#4f46e5` | **Siniestro** | `#334155` |
| **Acero** | `#64748b` | **Hada** | `#ec4899` |

---

## 6. Protocolo de Trabajo y Actualización Continua

- **Regla Mandataria:** Tras **cada** tarea, corrección, ajuste estético u operación realizada en el proyecto, el agente o desarrollador debe revisar y actualizar obligatoriamente `memory.md` (y `agent.md` si se modificaron directrices operativas o de diseño).
- **Objetivo:** Mantener una memoria técnica viva y precisa que garantice continuidad total, cero pérdida de contexto y cumplimiento riguroso de las preferencias del usuario a lo largo de todas las sesiones de desarrollo.

