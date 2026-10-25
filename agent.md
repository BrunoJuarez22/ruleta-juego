# AGENT.md — Instrucciones y Directrices para Agentes de IA

Este documento establece las reglas operativas, directrices de diseño, restricciones arquitectónicas y flujos de verificación obligatorios para cualquier agente de IA o desarrollador que trabaje en el repositorio **Shiny Roulette** (`ruleta-juego`).

---

## 1. Principios y Restricciones Inviolables de Diseño

Cualquier cambio de interfaz o estilo debe cumplir estrictamente con los siguientes requisitos definidos por el usuario:

1. **Modo Día por Defecto:**
   - La aplicación siempre debe iniciar en tema claro (`data-theme="light"`).
   - No alternar a modo oscuro de forma predeterminada ni forzarlo a menos que el usuario lo solicite expresamente o exista una preferencia en `localStorage`.

2. **Cero Emojis:**
   - **PROHIBIDO** el uso de emojis en cualquier parte del HTML, CSS, JavaScript o mensajes en pantalla (nada de 🎡, 🔘, ✨, 🌙, ☀️, 🔊, etc.).
   - Utilizar únicamente iconos vectoriales SVG limpios (estilo Lucide/Feather) con trazo uniforme (`stroke-width="2"`), o símbolos tipográficos estándar (como la estrella `★`).

3. **Bordes Rectos y Geométricos (Sin Ondulaciones ni Burbujas):**
   - El estilo visual es sobrio, plano y técnico.
   - Usar `border-radius: 4px`, `3px` o `2px`.
   - **PROHIBIDO** el uso de bordes ondulados, radios excesivos tipo píldora en tarjetas, o estéticas infantiles tipo "burbuja".

4. **Sin Animaciones de Respiración o Pulsación:**
   - **PROHIBIDO** añadir animaciones cíclicas continuas tipo `pulse`, `breath`, oscilaciones de escala o parpadeos infinitos.
   - Las transiciones deben ser instantáneas o cortas (máximo `0.15s` a `0.2s` en hover, clic o apertura modal).

5. **Esfera Central de la Ruleta:**
   - El botón central `#centerSpinHub` es la única excepción circular del diseño principal.
   - Debe mantener obligatoriamente `border-radius: 50%` y estar centrado con exactitud:
     ```css
     position: absolute;
     top: 50%;
     left: 50%;
     transform: translate(-50%, -50%);
     ```
   - Al hacer hover o active, nunca modificar las coordenadas del centro (solo `scale(1.04)` manteniendo `translate(-50%, -50%)`).

6. **Filosofía 100% Offline-First:**
   - Todos los recursos deben cargarse desde rutas locales (`assets/sprites/`, `assets/sprites/shiny/`, `assets/pokeball.svg`).
   - No introducir dependencias de CDNs externos en caliente durante la ejecución del juego.

---

## 2. Pautas Técnicas y de Código

### A. Canvas de la Ruleta (`drawWheel`)
- **Colores por Tipo (`TYPE_COLORS`):** Cada uno de los 400 gajos de la ruleta debe renderizarse con su color de tipo elemental. Nunca permitir que `item.color` o `ctx.fillStyle` quede `undefined` (lo que causaría que el canvas pinte el gajo de negro).
- **Resolución HiDPI:** Utilizar `setupCanvasResolution()` multiplicando por `devicePixelRatio` para evitar pixelado en pantallas Retina o 4K.
- **Física del Giro:** La animación se realiza a 60 FPS con `requestAnimationFrame` mediante la función `easeOutQuart(x)` durante 4800ms.

### B. Matriz Gigante de Paldea (400 Pokémon)
- **Contención de Botones:** En cada `.matrix-card`, los botones `.btn-matrix-toggle` y `.btn-matrix-evo` deben permanecer siempre dentro de la tarjeta.
  - Asegurar `box-sizing: border-box;` y `overflow: hidden;` en `.matrix-card`.
  - `.btn-matrix-toggle` debe tener `min-width: 0; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`.
  - `.btn-matrix-evo` debe tener un ancho fijo compacto (`44px` o `42px`) y `flex-shrink: 0;`.
- **Destacado del Giro Anterior:** El estado `.is-last-spin-pending` es prioritario. Si un Pokémon quedó pendiente en el último giro de la ruleta, debe mostrarse con el borde rojo de 2px, gradiente especial y la etiqueta `★ GIRO ANTERIOR`.
- **Desmarcado de Pendientes:** Las tarjetas en estado `.is-pending` o `.is-last-spin-pending` deben permitir retirar el Pokémon de la lista de pendientes mediante el botón rápido `✕` en la cabecera, el botón `.btn-matrix-unpend` (`DESMARCAR`) en la botonera de la tarjeta y desde el modal de línea evolutiva (`#winnerUnpendModalBtn`).
- **Filtros por Tipo Dinámicos (`#typeFilter` y `#matrixTypeFilter`):** Sus opciones se generan siempre desde `rebuildTypeFilterOptions()` (no codificar listas estáticas). Cada opción debe mostrar `Tipo (N por capturar)` calculado sobre la Pokédex activa, y el orden debe ser de mayor a menor número de Pokémon restantes por capturar. Cualquier nuevo punto de captura/descaptura debe terminar pasando por `updateDashboardViews()` para que los conteos se mantengan actualizados.

### C. Modales, Guía de Ubicaciones por Juego y Control de Parpadeo
- Antes de abrir el modal del Pokémon ganador o de la línea evolutiva, asegurarse de que el contenido del modal anterior esté limpio (`clearModalContent()`).
- Utilizar precarga con `Image.decode()` sobre la imagen nueva antes de añadir la clase `.active`, impidiendo que el navegador pinte el fotograma del Pokémon previo.
- **Acceso Universal al Modal (`#winnerModal`):** Cualquier tarjeta o fila de Pokémon en la aplicación (cuadrícula `.matrix-card`, lista de capturados `.shiny-card-item`, historial `.history-item`, catálogo `.item-row` y `.live-tracker-card`) debe permitir abrir `openEvolutionLineModal(pokemon, 'matrix')` al hacer clic fuera de los botones de acción rápida. `#winnerModal` debe mantener `z-index: 1100` para poder abrirse encima de `#settingsModal`.
- **Guía de Ubicaciones por Juego (`#winnerLocationsSection`):**
  - Los datos de ubicación se almacenan de forma 100% local (`locations` en `paldea_pokemon.json` y `paldea_data.js` en Fase 1, y progresivamente en el resto de Pokédexes).
  - `resolvePokemonLocations(pokemon)` debe cruzar siempre `PALDEA_BY_NUM` y `PALDEA_BY_NAT` para que los Pokémon con ubicaciones registradas las muestren sin importar qué Pokédex (`general`, `paldea`, `swsh`, `pla`, `bdsp`, `lgpe`, `plza`) esté activa.
  - Conservar visible el aviso informativo `.grid-location-notice` junto a la cuadrícula en cada sección para recordar al usuario que puede consultar dónde obtener cada Pokémon haciendo clic en su tarjeta.

### D. Arquitectura de Backend, Cuentas y Modo Híbrido
- **Tolerancia a Fallos y Modo Invitado:** La aplicación nunca debe romperse si el servidor backend no está corriendo o no hay internet. Siempre debe conservar su capacidad 100% offline-first operando sobre `localStorage`.
- **Sincronización Asíncrona:** Cuando el usuario tiene una sesión activa, el guardado en la nube se ejecuta en segundo plano sin bloquear el hilo principal ni la animación de la ruleta.
- **Seguridad y Cifrado:** Nunca almacenar contraseñas en texto plano (usar `bcryptjs` con salt 10). Las peticiones autenticadas deben usar `Authorization: Bearer <token>`.
- **Aislamiento Multi-Pokedex / Multi-Juego:** Cada apartado o juego (Ruleta General, Paldea, etc.) opera bajo un identificador `dexId`. Cualquier guardado en SQLite o `localStorage` debe conservar las capturas, pendientes y estados estrictamente aislados por `dexId` (`shiny_captured_${dexId}`, `UNIQUE(user_id, dex_id, pokemon_id)`), impidiendo que las partidas de diferentes juegos colisionen o se sobreescriban.

### E. Directrices de Publicidad, Monetización y Blindaje Legal (AdSense & IP)
- **Separación de Tráfico Seguro:** Prohibido ubicar bloques de anuncios inmediatamente contiguos o superpuestos a los controles interactivos de alta frecuencia (como el botón central de giro `#centerSpinHub` o los botones de captura). Mantener siempre la separación vertical segura para evitar clics accidentales penalizables por AdSense.
- **Etiquetado Obligatorio de Anuncios:** Todo espacio publicitario debe conservar la etiqueta visible `PUBLICIDAD` conforme a las directrices de la política de Google AdSense.
- **Integridad del Archivo `ads.txt`:** El archivo `ads.txt` debe residir siempre en la raíz pública del sitio web (`/ads.txt`) conforme a la especificación oficial del IAB Tech Lab.
- **Preservación de Avisos Legales:** Nunca remover ni ocultar las atribuciones de marca a Nintendo, Creatures y Game Freak en el pie de página ni en el modal `#legalModal`.
- **Cookies y Privacidad:** Cualquier adición de scripts publicitarios o de telemetría debe integrarse respetando el banner de consentimiento `#cookieConsentBanner` y las opciones de revocación de usuario.

---

## 3. Protocolo de Verificación Obligatorio

Antes de dar por concluida cualquier tarea o responder al usuario, el agente debe ejecutar las siguientes comprobaciones:

1. **Validación de Sintaxis JavaScript:**
   ```powershell
   node --check "C:\Users\bruno\OneDrive\Desktop\ruleta-juego\script.js"
   node --check "C:\Users\bruno\OneDrive\Desktop\ruleta-juego\api.js"
   node --check "C:\Users\bruno\OneDrive\Desktop\ruleta-juego\paldea_data.js"
   node --check "C:\Users\bruno\OneDrive\Desktop\ruleta-juego\server\server.js"
   ```
   Todos los comandos deben finalizar con código de salida `0` sin ningún error ni advertencia.

2. **Comprobación Visual y de Carga:**
   ```powershell
   Start-Process "C:\Users\bruno\OneDrive\Desktop\ruleta-juego\index.html"
   ```
   Verificar que la ruleta muestre su arco multicolor completo, la esfera central permanezca en su eje, y la matriz de 400 Pokémon no sufra desbordamientos de botones ni elementos rotos.

3. **Mantenimiento Obligatorio de Documentación (`memory.md` y `agent.md`):**
   - **Regla Estricta:** Tras CADA tarea, corrección, adición funcional o ajuste visual/técnico realizado en el proyecto, es obligatorio revisar y actualizar los archivos de documentación (`memory.md` y, si procede, `agent.md`).
   - `memory.md`: Registrar cualquier nueva funcionalidad, corrección de bugs, cambios en el changelog o alteraciones en estructuras de datos/localStorage.
   - `agent.md`: Reflejar cualquier nueva regla operativa, restricción impuesta por el usuario o pauta arquitectónica.
   - Ninguna tarea se considera completa sin esta sincronización documental al cierre.

