# ✨ Shiny Roulette - Pokédex de Paldea

Aplicación web interactiva para la ruleta de Pokémon Shiny con los **400 Pokémon oficiales de la Pokédex de Paldea** (Pokémon Escarlata y Pokémon Púrpura).

## 🌟 Características

- **Líneas Evolutivas Interactivas**:
  - Al salir un Pokémon, el resultado muestra automáticamente a **todos los miembros de su familia evolutiva en Paldea** (por ejemplo, para Sprigatito muestra a *Sprigatito*, *Floragato* y *Meowscarada*; para Ralts muestra a *Ralts*, *Kirlia*, *Gardevoir* y *Gallade*; para Eevee muestra a *Eevee* y todas sus evoluciones disponibles).
  - Cada miembro cuenta con una casilla de selección interactiva con su sprite shiny y número de Pokédex.
  - Puedes **marcar varios Pokémon de la misma línea evolutiva como capturados shiny a la vez**, ideal si evolucionas o cazas varios en una misma cadena.
- **Gestión de Pendientes y Capturados Shiny**:
  - Si un Pokémon obtenido en la ruleta **no se marca como capturado shiny**, se guarda automáticamente en la **Lista de Pendientes**.
  - Si marcas uno o varios como shiny capturados, se agregan a tu vitrina de **Capturados Shiny** y se eliminan automáticamente de tus pendientes.
  - En la pestaña de *Pendientes*, tienes la opción de marcar cualquiera de ellos como capturado shiny en cualquier momento.
- **Modo Día por Defecto**:
  - Tema claro limpio y de alto contraste por defecto, con opción de alternar a Modo Noche.
- **Sprites Locales y Oficiales (100% Offline)**:
  - 400 sprites regulares y 400 sprites shiny almacenados localmente en `assets/sprites/`.
- **Geometría Limpia y Núcleo Circular**:
  - Diseño geométrico sin bordes ondulados ni animaciones de respiración.
  - Centro concéntrico circular en la ruleta (`border-radius: 50%`).

- **Sistema de Cuentas y Base de Datos (Híbrido)**:
  - Base de datos SQLite persistente (`node:sqlite`) y backend en Express con autenticación JWT y contraseñas cifradas (`bcryptjs`).
  - Modo híbrido: Opera 100% offline-first en modo invitado con `localStorage` o sincroniza automáticamente con la base de datos al iniciar sesión.
- **Preparado para Monetización y Legalmente Blindado**:
  - Archivo `ads.txt`, contenedor seguro para Google AdSense, aviso de marcas de Nintendo/Creatures/Game Freak, políticas de privacidad y banner de cookies.

## 🚀 Cómo Ejecutar

### Opción 1: Con Servidor y Base de Datos Activa (Recomendado)
Para disfrutar del sistema de cuentas, registro, login y guardado persistente en SQLite:

```bash
# 1. Instalar dependencias (solo la primera vez)
npm install

# 2. Iniciar el servidor
npm start
```

Luego abre en tu navegador:
👉 **`http://localhost:3000`**

### Opción 2: Modo Local Estático (Invitado 100% Offline)
Si no deseas ejecutar Node.js, simplemente haz doble clic en el archivo [index.html](file:///C:/Users/bruno/OneDrive/Desktop/ruleta-juego/index.html). Todo el juego y los 400 Pokémon funcionarán guardando el progreso en tu navegador (`localStorage`).

---

## 🌐 Cómo Hostear Gratis en Internet (Sin Comprar Dominio)

No necesitas comprar un dominio para que cualquier persona acceda a tu ruleta y guarde sus datos. El servidor `server/server.js` sirve tanto la API como la interfaz web.

### Opción 1: Despliegue en Fly.io (Recomendado — Soporta Disco Persistente para SQLite)
Fly.io permite adjuntar un disco duro virtual gratuito (`[mounts]`) de modo que la base de datos `data/shiny_roulette.db` **nunca se borra al reiniciar**:

1. En la terminal de tu computadora:
   ```powershell
   # 1. Iniciar sesión en Fly.io (se abrirá en tu navegador)
   fly auth login

   # 2. Desplegar la aplicación (crea la máquina y el volumen de disco automáticamente)
   fly launch
   ```
2. Fly.io te proporcionará una URL pública gratuita con HTTPS como:
   👉 **`https://shiny-roulette.fly.dev`**

### Opción 2: Despliegue en Render.com (Gratis)
1. Entra en [Render.com](https://render.com) e inicia sesión con GitHub.
2. Haz clic en **New +** > **Web Service** y selecciona tu repositorio `ruleta-juego`.
3. Configura:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Render te asignará automáticamente una URL gratuita (ej. `https://shiny-roulette.onrender.com`).


