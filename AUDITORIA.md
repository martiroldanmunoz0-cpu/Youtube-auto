# Auditoría de la API de YouTube: respuestas para copiar y pegar

Formulario: <https://support.google.com/youtube/contact/yt_api_form>
Elige la opción de **auditoría / "I want to request an audit"** (si pregunta por ampliación de cuota, no hace falta).

El formulario está en inglés: pega las respuestas en inglés. Debajo de cada una va la traducción para que sepas lo que estás enviando.

---

### Datos que tienes que buscar tú
| Campo | Dónde encontrarlo |
|---|---|
| **Project number** / Número de proyecto | Google Cloud → selecciona `youtube-auto` → **Panel / Dashboard** → tarjeta "Información del proyecto" → *Número del proyecto* (solo números) |
| **Project ID** | Misma tarjeta: `youtube-auto-515121` |
| **OAuth Client ID** | Google Auth Platform → Clientes (termina en `.apps.googleusercontent.com`) |
| **Channel URL** | Tu canal Curiosidario → copia la URL del navegador |
| **Email** | El de la cuenta dueña del canal |

---

### Organization / company name
```
Individual creator (no company) – Curiosidario YouTube channel
```
*Creador individual (sin empresa), canal Curiosidario.*

### Website / API client URL
```
https://github.com/martiroldanmunoz0-cpu/Youtube-auto
```

### Privacy policy URL
```
https://github.com/martiroldanmunoz0-cpu/Youtube-auto/blob/main/PRIVACIDAD.md
```

### Describe your API client / How does it use the YouTube API?
```
"Historias Nocturnas" is a private, single-user tool that I use only to manage my own YouTube channel (Curiosidario). It is not offered to other users.

1) Once a week it uses search.list and videos.list to read public statistics (titles, view counts, likes, durations) of popular public Shorts, so I can understand which topics and hook styles are trending. Only public data is read and no personal data of other users is stored.
2) It produces original animated short videos for my channel. I personally review every video and approve the ones I want.
3) Only after my manual approval, it uses videos.insert to upload the approved videos to my own channel as private with a scheduled publishAt date (1–2 videos per day).

The tool only acts on my own channel with my own OAuth authorization. It never uploads without human review, never posts comments, never interacts with other channels and never collects data from viewers.
```
*Traducción: herramienta privada de un solo usuario para gestionar mi propio canal. 1) Una vez por semana lee estadísticas públicas de Shorts populares para ver tendencias, sin guardar datos personales. 2) Genera vídeos animados originales que reviso y apruebo yo. 3) Solo tras mi aprobación, los sube a mi canal programados (1-2 al día). Nunca sube sin revisión humana, no comenta, no interactúa con otros canales ni recoge datos de espectadores.*

### Which API services / endpoints do you use?
```
YouTube Data API v3: search.list, videos.list (chart=mostPopular and by id), videos.insert.
Scopes: youtube.readonly, youtube.upload.
```

### Number of users
```
1 (only me, the channel owner).
```

### How do users authorize your app? / Do you access data of other users?
```
I am the only user. I authorized my own channel once via Google OAuth 2.0. The app does not access any other user's private data; it only reads public video statistics through search.list/videos.list.
```

### How is data stored?
```
Aggregated public statistics (video titles and counts) are stored in my private GitHub repository for weekly analysis. OAuth credentials are stored as encrypted GitHub Actions secrets. No viewer or third-party personal data is stored.
```

### Expected daily quota usage
```
Around 2,000–8,000 units per day on upload days (search: ~12 calls per week; uploads: 1–2 per day). The default 10,000 units/day quota is enough.
```

### Why do you need the audit?
```
To lift the "private-only" restriction on videos uploaded by unverified API projects, so my approved videos can be published automatically at their scheduled time on my own channel.
```

---

### Si te piden capturas o un vídeo de demostración
Pueden pedir que enseñes cómo funciona. Lo más sencillo:
1. Captura del **issue de revisión** con las casillas.
2. Captura de la **página de revisión** con los vídeos.
3. Captura de **YouTube Studio** con un vídeo programado por el sistema.

Si responden pidiendo algo más, reenvíame su email (sin códigos ni claves) y te preparo la respuesta.
