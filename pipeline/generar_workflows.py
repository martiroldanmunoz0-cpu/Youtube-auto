# Genera .github/workflows/{semanal,pedido,comedia}.yml. Uso: python pipeline/generar_workflows.py .github/workflows
import sys
SETUP_PY = """      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          cache: pip
"""
SETUP_NODE = """      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: npm
          cache-dependency-path: renderer/package-lock.json
"""
TOOLS = """      - name: Instalar herramientas
        run: |
          sudo apt-get update -q
          sudo apt-get install -y -q ffmpeg espeak-ng
          pip install -r requirements.txt
          npm ci --prefix renderer

      - name: Instalar voces clonadas (VoxCPM2 + Whisper, CPU)
        run: |
          pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu
          pip install -r requirements-voz.txt

      - name: Caché de modelos de voz (5 GB, solo se descarga la primera vez)
        uses: actions/cache@v4
        with:
          path: ~/.cache/huggingface
          key: modelos-voz-voxcpm2-whisper-small-v1
"""
YT = """        env:
          YT_CLIENT_ID: ${{ secrets.YT_CLIENT_ID }}
          YT_CLIENT_SECRET: ${{ secrets.YT_CLIENT_SECRET }}
          YT_REFRESH_TOKEN: ${{ secrets.YT_REFRESH_TOKEN }}
"""

def workflow(name, comment, on, top_env, rid_step, trends_step, partes, commit_msg):
    matrix = ", ".join(str(i) for i in range(partes))
    return f"""name: {name}

# {comment}
# Fases: 1) guiones (1 máquina) -> 2) montaje en paralelo ({partes} máquinas) -> 3) revisión.
{on}
env:
  TQDM_DISABLE: "1"
  HF_HUB_DISABLE_PROGRESS_BARS: "1"
{top_env}
permissions:
  contents: write
  issues: write
  pages: write
  id-token: write

# Sin cola: puedes lanzar varias tandas a la vez y se montan todas en paralelo.

jobs:
  guiones:
    runs-on: ubuntu-latest
    timeout-minutes: 40
    outputs:
      rid: ${{{{ steps.rid.outputs.rid }}}}
    steps:
      - uses: actions/checkout@v4
{SETUP_PY}
      - run: pip install -r requirements.txt

{rid_step}
{trends_step}
      - name: Escribir guiones con IA
        env:
          ANTHROPIC_API_KEY: ${{{{ secrets.ANTHROPIC_API_KEY }}}}
        run: python pipeline/scripts.py

      - uses: actions/upload-artifact@v4
        with:
          name: guiones
          path: out
          retention-days: 3

  montar:
    needs: guiones
    runs-on: ubuntu-latest
    timeout-minutes: 150
    strategy:
      fail-fast: false
      matrix:
        parte: [{matrix}]
    env:
      RUN_ID: ${{{{ needs.guiones.outputs.rid }}}}
    steps:
      - uses: actions/checkout@v4
{SETUP_PY}
{SETUP_NODE}
{TOOLS}
      - uses: actions/download-artifact@v4
        with:
          name: guiones
          path: out

      - name: Montar mi parte de los vídeos (voz revisada con Whisper + revisor de vídeo)
        run: python pipeline/build.py --parte ${{{{ matrix.parte }}}} --partes {partes}

      - uses: actions/upload-artifact@v4
        with:
          name: parte-${{{{ matrix.parte }}}}
          path: |
            out/${{{{ env.RUN_ID }}}}/*.mp4
            out/${{{{ env.RUN_ID }}}}/*.jpg
            out/${{{{ env.RUN_ID }}}}/parte-*.json
          retention-days: 3

  revision:
    needs: [guiones, montar]
    if: always() && needs.guiones.result == 'success'
    runs-on: ubuntu-latest
    timeout-minutes: 30
    env:
      RUN_ID: ${{{{ needs.guiones.outputs.rid }}}}
    steps:
      - uses: actions/checkout@v4
{SETUP_PY}
      - run: pip install -r requirements.txt

      - uses: actions/download-artifact@v4
        with:
          name: guiones
          path: out

      - uses: actions/download-artifact@v4
        with:
          pattern: parte-*
          merge-multiple: true
          path: out/${{{{ env.RUN_ID }}}}

      - name: Juntar los vídeos de todas las máquinas
        run: python pipeline/build.py --unir

      - name: Preparar revisión (release + página + issue)
        env:
          GH_TOKEN: ${{{{ github.token }}}}
        run: python pipeline/review.py

      - name: Guardar historial
        run: |
          git config user.name "shorts-bot"
          git config user.email "shorts-bot@users.noreply.github.com"
          git add -A data || true
          git commit -m "{commit_msg}" || echo "sin cambios"
          for i in 1 2 3 4 5; do git pull --rebase && git push && break; echo "reintento $i"; sleep $((i * 7)); done

      - name: Actualizar página de revisión
        run: python pipeline/pages.py

      - uses: actions/upload-pages-artifact@v3
        with:
          path: pages

  pagina:
    needs: revision
    runs-on: ubuntu-latest
    continue-on-error: true   # si el repo no tiene Pages, la revisión sigue funcionando con los enlaces de descarga
    environment:
      name: github-pages
      url: ${{{{ steps.deploy.outputs.page_url }}}}
    steps:
      - id: deploy
        uses: actions/deploy-pages@v4

  aviso:
    needs: [guiones, montar, revision]
    if: failure()
    runs-on: ubuntu-latest
    steps:
      - name: Avisar al móvil si algo ha fallado
        env:
          GH_TOKEN: ${{{{ github.token }}}}
          GH_REPO: ${{{{ github.repository }}}}
          RUN_URL: ${{{{ github.server_url }}}}/${{{{ github.repository }}}}/actions/runs/${{{{ github.run_id }}}}
          WF: ${{{{ github.workflow }}}}
          OWNER: ${{{{ github.repository_owner }}}}
        run: |
          gh label create aviso --color D73A4A --description "Algo ha fallado" --force || true
          printf '🔔 @%s ha fallado **%s** (o alguna de sus partes).\\n\\n👉 [Ver qué ha pasado](%s)\\n\\nSi la revisión llegó igualmente, solo faltan los vídeos de la parte que falló. Avisa a Claude para arreglarlo y cierra este issue cuando esté resuelto.\\n' "$OWNER" "$WF" "$RUN_URL" > aviso.md
          gh issue create --title "⚠️ Ha fallado: $WF" --label aviso --body-file aviso.md
"""

RID_WEEK = """      - name: Identificador de la tanda
        id: rid
        run: |
          RID="$(date -u +%G-S%V)-${{ github.run_number }}"
          echo "RUN_ID=$RID" >> "$GITHUB_ENV"
          echo "rid=$RID" >> "$GITHUB_OUTPUT"
"""
RID_STATIC = """      - name: Identificador de la tanda
        id: rid
        run: echo "rid=$RUN_ID" >> "$GITHUB_OUTPUT"
"""
TRENDS = """      - name: Analizar tendencias de YouTube
""" + YT + """        run: python pipeline/trends.py
"""
TRENDS_OPT = """      - name: Analizar vídeos de GTA 6 en YouTube
""" + YT + """        run: python pipeline/trends.py || echo "Sin analisis de tendencias, sigo con el tema configurado"
"""

out = sys.argv[1]
open(f"{out}/semanal.yml", "w").write(workflow(
    "Generar vídeos de la semana", "Cada lunes: analiza YouTube, escribe ~10 guiones de curiosidades y los monta.",
    """on:
  schedule:
    - cron: "17 5 * * 1"   # lunes 05:17 UTC (06:17 en Madrid en invierno)
  workflow_dispatch: {}     # botón "Run workflow" para lanzarlo a mano
""", "", RID_WEEK, TRENDS, 5, "Semana generada: análisis, guiones e historial"))

open(f"{out}/pedido.yml", "w").write(workflow(
    "Pedido especial", "Escribe lo que quieras y genera varias versiones distintas de ese mismo vídeo.",
    """on:
  workflow_dispatch:
    inputs:
      pedido:
        description: "¿Qué vídeo quieres? (escríbelo como se lo dirías a una persona)"
        required: true
        type: string
      cantidad:
        description: "¿Cuántas versiones?"
        required: true
        default: "3"
        type: choice
        options: ["1", "2", "3", "4", "5"]
""", """  RUN_ID: pedido-${{ github.run_number }}
  PEDIDO: ${{ inputs.pedido }}
  PEDIDO_N: ${{ inputs.cantidad }}
""", RID_STATIC, "", 5, "Pedido especial generado"))

open(f"{out}/comedia.yml", "w").write(workflow(
    "Comedia GTA", "Sketches de humor de dibujos ambientados en una ciudad tipo GTA 6. Analiza lo que funciona de GTA 6 en YouTube.",
    """on:
  workflow_dispatch:
    inputs:
      tema:
        description: "Tema concreto (opcional). Vacío = la IA elige según lo que funciona de GTA 6"
        required: false
        type: string
      cantidad:
        description: "¿Cuántos sketches?"
        required: true
        default: "3"
        type: choice
        options: ["1", "2", "3", "4", "5"]
""", """  RUN_ID: comedia-${{ github.run_number }}
  FORMATO: comedia
  PEDIDO: ${{ inputs.tema }}
  PEDIDO_N: ${{ inputs.cantidad }}
""", RID_STATIC, TRENDS_OPT, 5, "Comedia generada"))
