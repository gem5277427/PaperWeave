#!/usr/bin/env python3
"""PaperWeave desktop window.

Runs the existing local server in a background thread and opens the UI in a
native WebView window (Edge WebView2 on Windows). No browser tab, no console.
"""

import argparse
import ctypes
import functools
import os
import sys
import tempfile
import threading
from http.server import ThreadingHTTPServer

from . import server

sys.dont_write_bytecode = True

# Keep WebView2's temporary profile inside the app folder instead of the CWD.
_TMP = server.DATA_DIR / ".tmp"
try:
    _TMP.mkdir(parents=True, exist_ok=True)
    if os.access(_TMP, os.W_OK):
        tempfile.tempdir = str(_TMP)
except OSError:
    pass

_MUTEX = None


def acquire_single_instance() -> bool:
    """Keep one desktop window per Windows session; ignore failures elsewhere."""
    global _MUTEX
    try:
        kernel32 = ctypes.windll.kernel32
        _MUTEX = kernel32.CreateMutexW(None, False, "PaperWeaveDesktopApp")
        return kernel32.GetLastError() != 183  # ERROR_ALREADY_EXISTS
    except Exception:
        return True


def show_error(message: str) -> None:
    try:
        ctypes.windll.user32.MessageBoxW(0, message, "PaperWeave", 0x10)
    except Exception:
        print(message, file=sys.stderr)


def start_server(port: int = 0):
    """Start PaperWeave's HTTP/API server on localhost and return (httpd, port)."""
    ThreadingHTTPServer.allow_reuse_address = True
    handler = functools.partial(server.Handler, directory=str(server.WEB_ROOT))
    httpd = ThreadingHTTPServer(("127.0.0.1", port), handler)
    httpd.daemon_threads = True
    thread = threading.Thread(target=httpd.serve_forever, name="paperweave-server", daemon=True)
    thread.start()
    return httpd, httpd.server_address[1]


def main() -> int:
    parser = argparse.ArgumentParser(description="Open PaperWeave in a desktop window.")
    parser.add_argument("--port", type=int, default=0, help="local port (default: pick a free one)")
    parser.add_argument("--smoke", action="store_true", help="open and close automatically for testing")
    parser.add_argument("--debug", action="store_true", help="enable WebView devtools")
    args = parser.parse_args()

    if not acquire_single_instance():
        show_error("PaperWeave 桌面窗口已经在运行，请切换到已打开的窗口。")
        return 0

    try:
        import webview
    except ImportError:
        show_error(
            "缺少 pywebview。\n\n"
            "请在项目文件夹运行：\n"
            "uv sync\n\n"
            "然后运行 uv run paperweave-desktop 或双击 PaperWeave.bat。"
        )
        return 1

    try:
        httpd, port = start_server(args.port)
    except OSError as exc:
        show_error(f"无法启动本地服务：{exc}")
        return 1

    url = f"http://127.0.0.1:{port}/index.html"
    icon = server.WEB_ROOT / "assets" / "paperweave.ico"
    window = webview.create_window(
        "PaperWeave · 脉络",
        url,
        width=1440,
        height=960,
        min_size=(1024, 700),
        background_color="#F3EFE6",
        text_select=True,
        zoomable=True,
    )
    if args.smoke:
        threading.Timer(8.0, window.destroy).start()

    try:
        webview.start(
            gui="edgechromium" if sys.platform == "win32" else None,
            debug=args.debug,
            private_mode=True,
            icon=str(icon) if icon.exists() else None,
        )
    except Exception as exc:
        show_error(f"桌面窗口启动失败：{exc}")
        return 1
    finally:
        httpd.shutdown()
        httpd.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
