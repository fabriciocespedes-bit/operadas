# -*- coding: utf-8 -*-
"""Servidor local de la presentación, sin caché.

El navegador guarda en caché los archivos estáticos y puede seguir mostrando
una versión anterior después de regenerar los datos. Este servidor manda
siempre no-store para evitarlo.

Uso:  python servidor.py [puerto]
"""
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PUERTO = int(sys.argv[1]) if len(sys.argv) > 1 else 8777
RAIZ = os.path.dirname(os.path.abspath(__file__))


class SinCache(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=RAIZ, **k)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def send_head(self):
        # desactiva las respuestas 304 basadas en fecha de modificación
        self.headers.replace_header("If-Modified-Since", "") \
            if "If-Modified-Since" in self.headers else None
        if "If-None-Match" in self.headers:
            del self.headers["If-None-Match"]
        return super().send_head()

    def log_message(self, fmt, *args):
        if "404" in (fmt % args):
            return
        super().log_message(fmt, *args)


if __name__ == "__main__":
    srv = ThreadingHTTPServer(("127.0.0.1", PUERTO), SinCache)
    print(f"Presentación en http://localhost:{PUERTO}")
    print(f"Sirviendo {RAIZ}")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
