"""(Opcional) Obtener el refresh token de YouTube desde tu ordenador.

Alternativa al OAuth Playground explicado en CONFIGURACION.md.
  pip install google-auth-oauthlib
  python pipeline/auth_youtube.py client_secret.json
Abre el navegador, eliges tu canal y te imprime el YT_REFRESH_TOKEN.
"""
import sys

from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = [
    "https://www.googleapis.com/auth/youtube",           # gestionar vídeos (cambiar la fecha de publicación)
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
]

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit("Uso: python pipeline/auth_youtube.py client_secret.json")
    flow = InstalledAppFlow.from_client_secrets_file(sys.argv[1], SCOPES)
    creds = flow.run_local_server(port=0, prompt="consent", access_type="offline")
    print("\nGuarda esto como secreto YT_REFRESH_TOKEN en GitHub:\n")
    print(creds.refresh_token)
    print("\nY también YT_CLIENT_ID =", creds.client_id)
