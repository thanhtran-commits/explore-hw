import http.server, functools, sys, os
ROOT = sys.argv[1]
HEAD = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>\n'
class H(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, '.js': 'application/javascript; charset=utf-8', '.html': 'text/html; charset=utf-8', '.webp': 'image/webp'}
    def log_message(self, *a): pass
    def do_GET(self):
        if self.path.split('?')[0] in ('/', '/index.html'):   # same wrapping as the Dockerfile
            body = (HEAD + open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read() + '\n</body></html>\n').encode()
            self.send_response(200); self.send_header('Content-Type', 'text/html; charset=utf-8'); self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body); return
        return super().do_GET()
http.server.ThreadingHTTPServer(('127.0.0.1', 8766), functools.partial(H, directory=ROOT)).serve_forever()
