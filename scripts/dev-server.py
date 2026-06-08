#!/usr/bin/env python3
"""Local static server with clean public URLs (/blog -> blog.html)."""
import http.server
import os
import socketserver

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(os.environ.get("PORT", "8080"))

PUBLIC_PAGES = {
    "about",
    "packages",
    "inquiry",
    "gallery",
    "videos",
    "blog",
    "blog-post",
    "careers",
    "contact",
}


class CleanUrlHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        path_only = self.path.split("?", 1)[0].split("#", 1)[0]
        route = path_only.strip("/")

        if route in PUBLIC_PAGES:
            suffix = self.path[len(path_only) :]
            self.path = "/" + route + ".html" + suffix

        return super().do_GET()


if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CleanUrlHandler) as httpd:
        print("Serving %s at http://localhost:%s/ (clean URLs enabled)" % (ROOT, PORT))
        httpd.serve_forever()
