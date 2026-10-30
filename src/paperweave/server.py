#!/usr/bin/env python3
"""PaperWeave local server.

Serves the static app and stores the notebook in ./data/paperweave.json.
Only binds to 127.0.0.1; there is no external upload and no dependency beyond
the Python standard library.
"""

import argparse
import functools
import json
import os
import shutil
import sys
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

from . import __version__

PACKAGE_DIR = Path(__file__).resolve().parent
WEB_ROOT = PACKAGE_DIR / "web"
# 源码布局下 data/ 在项目根目录（src/paperweave 的上两级）；安装后回落到当前工作目录
PROJECT_ROOT = PACKAGE_DIR.parents[1] if PACKAGE_DIR.parent.name == "src" else Path.cwd()
FROZEN = bool(getattr(sys, "frozen", False))
DATA_ROOT = Path(sys.executable).resolve().parent if FROZEN else PROJECT_ROOT
DATA_DIR = DATA_ROOT / "data"
DATA_FILE = DATA_DIR / "paperweave.json"
BACKUP_FILE = DATA_DIR / "paperweave.bak.json"
MAX_BODY = 16 * 1024 * 1024
LOCK = threading.Lock()


def read_data_bytes():
    with LOCK:
        if not DATA_FILE.exists():
            return None
        return DATA_FILE.read_bytes()


def write_data_bytes(raw):
    try:
        payload = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ValueError("body is not valid UTF-8 JSON") from exc

    if not isinstance(payload, dict):
        raise TypeError("body must be a JSON object")
    for key in ("papers", "links", "ideas"):
        if not isinstance(payload.get(key), list):
            raise TypeError(f"body.{key} must be an array")
    if not isinstance(payload.get("profile"), dict):
        raise TypeError("body.profile must be an object")

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    text = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    encoded = text.encode("utf-8")

    with LOCK:
        if DATA_FILE.exists():
            try:
                shutil.copy2(DATA_FILE, BACKUP_FILE)
            except OSError:
                pass
        tmp = DATA_FILE.with_suffix(".json.tmp")
        tmp.write_text(text, encoding="utf-8")
        os.replace(tmp, DATA_FILE)
    return len(encoded)


def data_meta():
    with LOCK:
        exists = DATA_FILE.exists()
        size = DATA_FILE.stat().st_size if exists else 0
        mtime = DATA_FILE.stat().st_mtime if exists else 0
    return {"file": "data/paperweave.json", "exists": exists, "bytes": size, "mtime": mtime}


class Handler(SimpleHTTPRequestHandler):
    server_version = f"PaperWeave/{__version__}"

    def _safe_path(self):
        path = unquote(urlparse(self.path).path).replace("\\", "/")
        while "//" in path:
            path = path.replace("//", "/")
        return path if path.startswith("/") else "/" + path

    def _not_found(self):
        self._json(404, {"error": "not found"})

    def end_headers(self):
        if self._safe_path().startswith("/api/"):
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        path = self._safe_path()
        if path == "/api/health":
            self._json(200, {"ok": True, **data_meta()})
            return
        if path == "/api/data":
            try:
                raw = read_data_bytes()
            except OSError as exc:
                self._json(503, {"error": f"cannot read data file: {exc}"})
                return
            if raw is None:
                self.send_response(204)
                self.end_headers()
                return
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(raw)))
            self.end_headers()
            try:
                self.wfile.write(raw)
            except BrokenPipeError:
                pass
            return
        super().do_GET()

    def do_PUT(self):
        if self._safe_path() != "/api/data":
            self._not_found()
            return
        self._receive_data()

    def do_POST(self):
        # sendBeacon() can only POST; treat it as a normal save.
        if self._safe_path() != "/api/data":
            self._not_found()
            return
        self._receive_data()

    def _receive_data(self):
        if self.headers.get("X-PaperWeave") != "1":
            self._json(403, {"error": "missing X-PaperWeave header"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        if length <= 0:
            self._json(400, {"error": "empty body"})
            return
        if length > MAX_BODY:
            self._json(413, {"error": "body too large"})
            return
        raw = self.rfile.read(length)
        try:
            size = write_data_bytes(raw)
        except (TypeError, ValueError) as exc:
            self._json(400, {"error": str(exc)})
            return
        except OSError as exc:
            self._json(503, {"error": f"cannot write data file: {exc}"})
            return
        self._json(200, {"ok": True, "bytes": size, **data_meta()})

    def _json(self, code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        try:
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionAbortedError, ConnectionResetError):
            pass

    def log_message(self, fmt, *args):
        if sys.stderr is None:
            return
        try:
            sys.stderr.write("[paperweave] " + (fmt % args) + "\n")
        except (BrokenPipeError, ConnectionAbortedError, ConnectionResetError):
            pass


def main():
    parser = argparse.ArgumentParser(description="Run the PaperWeave local server.")
    parser.add_argument("--port", type=int, default=8765, help="port to listen on (default: 8765)")
    parser.add_argument("--host", default="127.0.0.1", help="host to bind (default: 127.0.0.1)")
    args = parser.parse_args()

    handler = functools.partial(Handler, directory=str(WEB_ROOT))
    ThreadingHTTPServer.allow_reuse_address = True
    try:
        httpd = ThreadingHTTPServer((args.host, args.port), handler)
    except OSError as exc:
        print(f"[PaperWeave] Cannot start on {args.host}:{args.port}: {exc}", file=sys.stderr)
        print("[PaperWeave] Another server may already be using this port.", file=sys.stderr)
        raise SystemExit(1)

    httpd.daemon_threads = True
    print(f"[PaperWeave] serving {WEB_ROOT}")
    print(f"[PaperWeave] data file: {DATA_FILE}")
    print(f"[PaperWeave] open http://{args.host}:{args.port}")
    print("[PaperWeave] press Ctrl+C to stop", flush=True)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[PaperWeave] stopped", flush=True)
    finally:
        httpd.server_close()


if __name__ == "__main__":
    main()
