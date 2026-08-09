#!/usr/bin/env python3
"""UZI-Skill 本地 Web 客户端入口。

用法:
    python client.py              # http://127.0.0.1:8787
    python client.py --port 9000
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).parent.resolve()
sys.path.insert(0, str(ROOT / "client"))

from server import run_server  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="UZI-Skill 本地 Web 客户端")
    parser.add_argument("--host", default="127.0.0.1", help="绑定地址（默认 127.0.0.1）")
    parser.add_argument("--port", type=int, default=8787, help="端口（默认 8787）")
    parser.add_argument("--no-browser", action="store_true", help="不自动打开浏览器")
    args = parser.parse_args()
    run_server(host=args.host, port=args.port, open_browser=not args.no_browser)


if __name__ == "__main__":
    main()
