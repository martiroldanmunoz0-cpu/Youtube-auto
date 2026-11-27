"""Pone en YouTube la portada de un vídeo ya subido (lo usa el workflow «Cambiar portada»)."""
import json
import sys
from pathlib import Path

from googleapiclient.http import MediaFileUpload

from common import youtube_client

vid_id, img = sys.argv[1], Path(sys.argv[2])
cola = json.loads((Path(__file__).parent.parent / "data/queue.json").read_text())
items = [q for q in cola if q.get("id") == vid_id and q.get("youtube_id")]
if not items:
    print(f"{vid_id}: aún no está en YouTube; la portada nueva se pondrá al publicarlo.")
    sys.exit(0)
yt = youtube_client()
for q in items:
    yt.thumbnails().set(videoId=q["youtube_id"], media_body=MediaFileUpload(str(img), mimetype="image/jpeg")).execute()
    print(f"🖼️ Miniatura cambiada en YouTube: {q['youtube_id']} ({vid_id})")
