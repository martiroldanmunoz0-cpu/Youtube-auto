# Formulario de cuota de YouTube: todo en orden, para copiar y pegar

Marca cada sección (la casilla de su título) y rellénala antes de pasar a la siguiente. No recargues la página: se borra todo.

## Sección 1: Tipo de solicitud
- Elige: **ampliación de cuota** (quota extension).

## Sección 2: Organización y contacto
- Nombre de la organización: `The Curio Lab`
- Sitio web: `https://github.com/martiroldanmunoz0-cpu/Youtube-auto`
- Tipo: **Desarrollador independiente o propietario unipersonal**
- Contacto técnico: el mismo que el principal (tu nombre y tu correo)

## Sección 3: Modelo de negocio y contactos de Google
- Describe el trabajo de tu organización:
```
I am an independent creator. I run one YouTube channel, The Curio Lab: original animated educational videos in English about science, history and "what if" questions, published as Shorts and long videos.

Value for viewers: short, clear, fact-checked explanations of curious topics, with original animation, narration and visuals. Every video is reviewed by me before it is published.

Curio Lab Publisher is my private tool to manage this one channel. It uploads the videos I approve as scheduled private videos, sets their thumbnails and adds them to my playlists, so I can publish on a steady schedule without uploading by hand. I am its only user. It does not serve other creators, it is not sold, and the channel does not use third-party content, music or brands.
```
- Monetización: **Otra forma** → `The tool is not monetized. I only use it for my own channel.`
- Representante de Google: **No**
- IDs del propietario del contenido, URL del canal en ese bloque e IDs de Google Ads: **vacíos**

## Sección 4: Clientes de API
- Nombre del cliente de API: `Curio Lab Publisher`
- ¿Contiene "YouTube"?: **No**
- Política de privacidad: `https://github.com/martiroldanmunoz0-cpu/Youtube-auto/blob/main/PRIVACIDAD.md`
- Términos: `https://github.com/martiroldanmunoz0-cpu/Youtube-auto/blob/main/TERMINOS.md`
- ¿Acceso público?: **No**
- Usuario, contraseña y URL de la cuenta demo: **vacíos**
- Aceptación obligatoria: **marcada**
- Instrucciones especiales de acceso:
```
No demo account: Curio Lab Publisher is a private, internal tool with a single user (the channel owner). It has no login screen and is not available to other users. The full upload sequence, architecture diagram and user flow are attached in Section 6.
```

## Sección 5: Casos de uso y cuota
- Número de proyecto: los dígitos de "Te damos la bienvenida" en Google Cloud (no `youtube-auto-515121`)
- Categoría: solo **Subida de vídeos y gestión de cuentas**
- ¿OAuth 2.0?: **Sí**
- Volumen de uso: la opción más baja (menos de 10.000 solicitudes)
- Documentación obligatoria:
  - Política de privacidad → `1_politica_privacidad.png`
  - Página principal → `2_pagina_principal.png`
  - Términos → `3_terminos.png`
- Documentación condicional → `4_subida_programados.png`
- Endpoints (marca solo estos): search.list, videos.insert, videos.update, videos.delete, videos.list, thumbnails.set, playlists.list, playlists.insert, playlistItems.list, playlistItems.insert, channels.list
- Cuota total: **Por encima de la cuota predeterminada** → `15000`
```
This total covers every endpoint except videos.insert and search.list. Each day the tool sets a custom thumbnail on each uploaded video (thumbnails.set, 50 units each), adds it to a playlist on my own channel (playlistItems.insert, 50), checks upload and processing status (videos.list), updates metadata and schedules (videos.update, 50) and removes old versions that I replace with corrected ones (videos.delete, 50). With about 3 to 15 uploads a day, this comes to roughly 2,000 to 5,000 units on busy days. 15,000 units leave a safety margin, so a fix or a retry never blocks my scheduled uploads.
```
- videos.insert → `25000`
```
Each upload costs 1,600 units. My channel publishes about 3 original animated videos per day (2 Shorts and 1 long video). Every video is reviewed before upload. When I find a mistake, I re-upload the corrected version and delete the old one, so on correction days I need 10 to 15 uploads. The default quota stops after 6 uploads, and my approved videos are then delayed by a day. 25,000 units allow about 15 uploads per day. The tool spreads uploads across the day and never uploads the same content twice.
```
- search.list (si sale) → `2000`
```
Used once a week to read public statistics of popular videos in my topic (100 units per call, about 20 calls), so I can choose which educational topics to make next. No data about viewers is collected.
```

## Sección 6: Pruebas y documentación
- Diagrama de la arquitectura → `5_diagrama_arquitectura.png`
- Diagramas de flujo de usuarios → `6_diagrama_flujo_usuarios.png`
- Otros materiales complementarios → `7_secuencia_subida.pdf`

## Sección 7: Declaraciones y envío
- Marca todas las casillas, resuelve el captcha y pulsa **Enviar**.
