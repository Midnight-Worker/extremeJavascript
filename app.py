import webview
import time
import threading

from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

ROOT = Path(__file__).resolve().parent


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def snapshot():
    return {
        p: p.stat().st_mtime_ns
        for p in ROOT.rglob("*")
        if p.is_file() and p.suffix in (".html", ".css", ".js")
    }


def hotreload(window):
    previous = snapshot()

    while True:
        time.sleep(0.5)
        current = snapshot()

        if current != previous:
            previous = current
            print("Änderung erkannt – Reload!")
            window.evaluate_js("location.reload()")


# Lokalen Server starten
handler = partial(Handler, directory=str(ROOT))
server = ThreadingHTTPServer(("127.0.0.1", 0), handler)

threading.Thread(
    target=server.serve_forever,
    daemon=True
).start()

url = f"http://127.0.0.1:{server.server_port}/index.html"

# Webview starten
window = webview.create_window(
    "Extreme JavaScript",
    url,
    width=1800,
    height=1080
)

try:
    webview.start(hotreload, window, debug=False)
finally:
    server.shutdown()
    server.server_close()
