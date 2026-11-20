# Puesta en marcha (una sola vez, ~30 minutos)

Necesitas tres cosas: **GitHub** (donde vive y se ejecuta todo), una **clave de Claude** (escribe los guiones) y **acceso a tu canal de YouTube** (analiza y sube). La voz, la animación y la música son gratis.

---

## 1. GitHub

1. Crea un repositorio nuevo y sube esta carpeta.
2. **Settings → Actions → General → Workflow permissions** → marca **Read and write permissions** → Save.
3. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
   - Si el repo es **privado** y tu plan de GitHub es gratuito, Pages no está disponible. No pasa nada: en el issue de revisión tendrás enlaces de descarga en lugar de la página con los vídeos.

## 2. Clave de Claude (guiones)

1. Entra en <https://console.anthropic.com> → **API Keys** → *Create key*.
2. Añade algo de saldo (con 5 $ tienes para varias semanas: cada semana cuesta aprox. 1–2 $).
3. En GitHub: **Settings → Secrets and variables → Actions → New repository secret**
   - Nombre: `ANTHROPIC_API_KEY` · Valor: la clave.

## 3. Acceso a YouTube

### 3.1 Proyecto de Google Cloud
1. <https://console.cloud.google.com> → crea un proyecto (p. ej. `shorts-factory`).
2. **APIs y servicios → Biblioteca** → busca **YouTube Data API v3** → *Habilitar*.
3. **APIs y servicios → Pantalla de consentimiento OAuth** (o *Google Auth Platform*):
   - Tipo de usuario: **Externo**. Nombre de la app y tu email.
   - En *Usuarios de prueba*, añade el email de la cuenta dueña del canal.
   - ⚠️ Después pulsa **Publicar app** (pasar a *En producción*). Si la dejas en *Prueba*, el permiso caduca cada 7 días y la automatización deja de funcionar. Google mostrará un aviso de "app no verificada" al autorizar: es normal porque la app es tuya. Pulsa *Configuración avanzada → Ir a…*.
4. **Credenciales → Crear credenciales → ID de cliente de OAuth**:
   - Tipo: **Aplicación web**.
   - URI de redireccionamiento autorizado: `https://developers.google.com/oauthplayground`
   - Copia el **ID de cliente** y el **secreto**.

### 3.2 Conseguir el "refresh token" (sin instalar nada)
1. Abre <https://developers.google.com/oauthplayground>.
2. Rueda dentada ⚙️ (arriba a la derecha) → marca **Use your own OAuth credentials** → pega ID y secreto.
3. En el cuadro *Input your own scopes* pega (separados por espacio):
   ```
   https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly
   ```
4. **Authorize APIs** → entra con la cuenta del canal → elige el canal → permite.
5. **Exchange authorization code for tokens** → copia el **Refresh token**.

### 3.3 Guardar los secretos en GitHub
| Secreto | Valor |
|---|---|
| `YT_CLIENT_ID` | ID de cliente |
| `YT_CLIENT_SECRET` | Secreto del cliente |
| `YT_REFRESH_TOKEN` | Refresh token |

### 3.4 ⚠️ Auditoría de la API (importante para publicar en público)
YouTube deja **en privado** los vídeos subidos por la API desde proyectos nuevos **sin auditar**, aunque estén programados. Para quitar esa limitación:
- Rellena el formulario de auditoría: <https://support.google.com/youtube/contact/yt_api_form> (gratuito; suele tardar unos días o semanas).
- Mientras tanto el sistema funciona igual: los vídeos aprobados se suben a tu canal en privado con su título, descripción y etiquetas. Solo tienes que abrir **YouTube Studio → Contenido** y cambiar cada uno a *Programado* (un par de toques desde el móvil).

## 4. Primera prueba

1. **Actions → "Prueba (vídeo de ejemplo)" → Run workflow**. En 3–4 minutos tendrás en *Artifacts* un vídeo de ejemplo con la voz real. Sirve para comprobar que todo funciona; no usa ni YouTube ni Claude.
2. **Actions → "Generar vídeos de la semana" → Run workflow**. Tarda unos 30–40 minutos y al terminar abre un **issue** "Revisión de vídeos…".

---

# Tu rutina semanal (5 minutos)

1. **El lunes por la mañana** te llega un aviso de GitHub con el issue de revisión (activa las notificaciones de la app de GitHub).
2. Abre la página de vídeos (enlace en el issue) y mira cada uno.
3. Marca las casillas de los que te gusten y **cierra el issue**.
4. Se programan solos en YouTube, **repartidos por igual en la semana** (1 al día; si se acumulan muchos, 2 o 3 como máximo, separados al menos 2 horas) y sin mover los ya programados. Horas (España): entre semana 19:00 (con 2: 14:00 y 20:30; con 3: 13:30, 18:00 y 21:30); fin de semana 12:00 (con 2: 12:00 y 19:30; con 3: 11:00, 16:30 y 20:30). Se cambian en `config.yaml` → `publicacion.horas`. El sistema te comenta en el issue el enlace de cada vídeo y su fecha.

¿No te convence ninguno o quieres otra tanda? *Actions → Generar vídeos de la semana → Run workflow* y sale una nueva.

# Pedido especial (vídeos sobre lo que tú quieras)

1. **Actions → «Pedido especial» → Run workflow**.
2. En el cuadro de texto escribe lo que quieres, como se lo dirías a una persona. Por ejemplo:
   *«Qué pasaría si ganaras un millón de euros cada día y tuvieras que gastarlo o lo pierdes todo»*.
3. Elige cuántas versiones quieres (3 por defecto) → **Run workflow**.
4. En 10–15 minutos te llega un issue **«Pedido especial: …»** con las versiones: mismo tema, pero con otro gancho, otros diálogos y otras escenas.
5. Se aprueba igual: marcas las casillas y cierras el issue. Se programan detrás de los que ya tengas en cola.

# Comedia GTA (sketches de humor)

1. **Actions → «Comedia GTA» → Run workflow**.
2. **Tema** (opcional): déjalo vacío y la IA elige según lo que más funciona de GTA 6 en YouTube, o escribe uno, p. ej. *«el amigo que siempre llama a la policía sin querer»*.
3. Elige cuántos sketches (3 por defecto) → **Run workflow**.
4. En 15–20 minutos te llega un issue **«Comedia: …»**. Se aprueba igual que los demás.

Personajes, escenarios, voces y nivel de palabrotas se ajustan en `config.yaml`, sección `comedia`.

# Ajustes (`config.yaml`)

- `canal.handle` / `canal.nombre`: tu @ y nombre para la tarjeta final.
- `analisis.busquedas` / `analisis.regiones`: qué y dónde analiza cada semana.
- `generacion.videos_por_semana`: cuántos genera (por defecto 10, para que puedas descartar).
- `voz.voz`: otras voces gratuitas: `es-MX-JorgeNeural`, `es-ES-ElviraNeural`, `es-MX-DaliaNeural`, `es-AR-TomasNeural`…
- `publicacion.horas`: horas de publicación.

# Costes

| Parte | Coste |
|---|---|
| GitHub Actions | gratis (repos privados: 2.000 min/mes incluidos; se usan ~150) |
| Voz (Edge TTS), animación, música | gratis |
| API de YouTube | gratis (cuota diaria; si se agota, el sistema sigue al día siguiente) |
| Claude (análisis + 10 guiones) | ~1–2 $ por semana |
