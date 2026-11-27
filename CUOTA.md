# Ampliar la cuota de la API de YouTube: respuestas para copiar y pegar

Formulario (gratis): <https://support.google.com/youtube/contact/yt_api_form>
Elige **"I want to request a quota extension"** (ampliación de cuota). Tienes que enviarlo tú, con la cuenta de Google dueña del canal.

Pide **30,000 unidades/día** (ahora tienes 10,000 → unos 6 vídeos al día; con 30,000 caben unos 18, de sobra para rehacer y volver a subir sin atascos).

El formulario está en inglés: pega las respuestas en inglés. Debajo de cada una va la traducción.

---

### Datos que tienes que buscar tú
| Campo | Dónde encontrarlo |
|---|---|
| **Project number** | Google Cloud → proyecto `youtube-auto` → **Panel / Dashboard** → tarjeta "Información del proyecto" → *Número del proyecto* |
| **Project ID** | Misma tarjeta: `youtube-auto-515121` |
| **OAuth Client ID** | Google Auth Platform → Clientes (termina en `.apps.googleusercontent.com`) |
| **Channel URL** | Tu canal The Curio Lab → copia la URL del navegador |
| **Email** | El de la cuenta dueña del canal |

---

### Organization / company name
```
Individual creator (no company) – The Curio Lab YouTube channel
```
*Creador individual (sin empresa), canal The Curio Lab.*

### Website / API client URL
```
https://github.com/martiroldanmunoz0-cpu/Youtube-auto
```

### Privacy policy URL
```
https://github.com/martiroldanmunoz0-cpu/Youtube-auto/blob/main/PRIVACIDAD.md
```

### Describe your API client
```
"Curio Lab Publisher" is a private, single-user tool that I use only to manage my own YouTube channel (The Curio Lab, original animated educational videos in English). It is not offered to other users.

It produces original animated videos for my channel (Shorts and long videos). Each video goes through a review step before it is uploaded. Approved videos are uploaded with videos.insert as private with a scheduled publishAt date, added to a playlist of my own channel (playlistItems.insert) and given a custom thumbnail (thumbnails.set). When I fix a mistake in a video, the corrected version is uploaded and the old one is removed from my own channel (videos.delete). Once a week it reads public statistics (videos.list, search.list) to see which topics perform well.

It only acts on my own channel with my own OAuth authorization. It never posts comments, never interacts with other channels and never collects viewer data.
```
*Traducción: herramienta privada de un solo usuario para mi propio canal. Hace vídeos animados originales, se revisan, y los aprobados se suben programados, se añaden a una lista y se les pone miniatura. Si corrijo un vídeo, se sube la versión corregida y se borra la antigua. Una vez por semana lee estadísticas públicas. Solo actúa en mi canal; no comenta, no interactúa con otros canales ni recoge datos de espectadores.*

### Which API services / endpoints do you use?
```
YouTube Data API v3: videos.insert, videos.update, videos.delete, videos.list, thumbnails.set, playlists.list, playlists.insert, playlistItems.list, playlistItems.insert, channels.list, search.list.
Scopes: youtube, youtube.upload, youtube.readonly.
```

### Number of users
```
1 (only me, the channel owner).
```

### Requested quota and why
```
I request 30,000 units per day.

My channel publishes about 3 videos per day (2 Shorts + 1 long video). Each upload costs 1,600 units, plus thumbnails.set, playlist and list calls, so a normal day already uses around 6,000 units. When I correct videos (re-uploading the fixed version and deleting the old one), the default 10,000 units are used up after about 6 uploads, and my approved, scheduled videos are delayed until the next day. 30,000 units/day would let my normal schedule plus corrections run without delays. The tool spreads uploads across the day and never uploads the same content twice.
```
*Traducción: pido 30.000 unidades/día. Publico unos 3 vídeos al día; cada subida cuesta 1.600 unidades más miniatura, lista, etc. (~6.000 en un día normal). Cuando corrijo vídeos, las 10.000 se acaban tras unas 6 subidas y los vídeos aprobados se retrasan un día. Con 30.000 cabe lo normal más las correcciones.*

### How is data stored?
```
OAuth credentials are stored as encrypted GitHub Actions secrets. Aggregated public statistics (video titles and view counts) are stored in my private repository for weekly analysis. No viewer or third-party personal data is stored.
```

---

Si Google contesta pidiendo algo más, reenvíame su email (sin códigos ni claves) y te preparo la respuesta.
