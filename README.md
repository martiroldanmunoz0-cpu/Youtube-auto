# Historias Nocturnas (Shorts Factory)

> 🔒 [**Política de privacidad**](PRIVACIDAD.md) · 📄 [**Términos del servicio**](TERMINOS.md) · ▶️ Usa los **Servicios de API de YouTube** · Canal: [Curiosidario (@curiosdiario)](https://www.youtube.com/@curiosdiario)
>
> Al usar esta herramienta aceptas los [Términos de servicio de YouTube](https://www.youtube.com/t/terms) y la [Política de privacidad de Google](https://policies.google.com/privacy).

Fábrica automática de YouTube Shorts animados, todos con la misma estética (ilustración vectorial nocturna, narrador en off y subtítulos palabra a palabra).

```
Lunes (automático)                                Tú (5 min)             Automático
┌──────────────┐  ┌─────────────┐  ┌───────────┐  ┌──────────────┐      ┌──────────────────┐
│ 1. Tendencias│→ │ 2. Guiones  │→ │ 3. Vídeos │→ │ 4. Revisión  │ ───→ │ 5. Programación  │
│ API YouTube  │  │ Claude      │  │ voz+anim. │  │ issue + web  │  OK  │ 1-2/día YouTube  │
└──────────────┘  └─────────────┘  └───────────┘  └──────────────┘      └──────────────────┘
```

👉 **Primera vez:** sigue [CONFIGURACION.md](CONFIGURACION.md).

🎯 **Vídeo a la carta:** *Actions → Pedido especial → Run workflow*, escribe lo que quieres y te genera 3 versiones distintas.

## Estructura

| Carpeta | Qué hace |
|---|---|
| `pipeline/trends.py` | Busca los Shorts con más vistas/día de la semana (búsquedas + tendencias por país) |
| `pipeline/scripts.py` | Claude analiza patrones de gancho y escribe guiones divididos en planos |
| `pipeline/voice.py` | Voz gratuita (Edge TTS) con tiempos por palabra |
| `pipeline/soundtrack.py` | Música ambiente y efectos generados por código (sin copyright) |
| `pipeline/build.py` | Monta cada vídeo |
| `pipeline/review.py` | Release con los vídeos, página de revisión e issue con casillas |
| `pipeline/publish.py` | Sube y programa los aprobados |
| `pipeline/pages.py` | Web de revisión con las últimas tandas (semanales y pedidos) |
| `renderer/` | Motor de animación (Node + Canvas): 21 escenas, cámaras, transiciones, subtítulos |
| `renderer/scenes/catalog.json` | Catálogo de escenas que puede usar la IA |
| `config.yaml` | Ajustes del canal |

## Probar en local

```bash
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
npm ci --prefix renderer
.venv/bin/python pipeline/build.py --story examples/demo_story.json --out out/prueba
```

Previsualizar escenas sin audio: `node renderer/render.mjs timeline.json hoja.png --stills 8`.

## Añadir escenas nuevas

1. Dibuja la escena en `renderer/scenes/*.mjs` (`setup` + `draw`).
2. Regístrala en `renderer/scenes/index.mjs`.
3. Descríbela en `renderer/scenes/catalog.json` para que la IA sepa usarla.
