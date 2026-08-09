#!/usr/bin/env python3
"""UZI-Skill local web client — stdlib only (v2 · full API surface).

Endpoints:
  GET  /api/health                服务健康 + 环境信息
  GET  /api/reports               历史报告列表
  GET  /api/cache                 缓存股票总览（.cache/*/synthesis.json 摘要）
  GET  /api/stocks/{ticker}       单股结构化数据（synthesis + dimensions + panel 统计）
  GET  /api/panel/{ticker}        panel.json 全文（66 评委）
  GET  /api/dimensions/{ticker}   dimensions.json（22 维评分）
  GET  /api/raw/{ticker}?dims=..  raw_data 指定维度（白名单，避免大文件全传）
  GET  /api/jobs                  任务列表（含运行中/排队/历史）
  GET  /api/jobs/{id}?since=N     任务增量日志轮询
  POST /api/jobs/{id}/cancel      取消任务
  GET  /api/commands              commands/*.md 命令文档列表
  GET  /api/commands/{name}       命令文档内容（text/markdown）
  GET  /api/skills                skills 目录元信息
  POST /api/analyze               提交分析任务（single/versus/portfolio + depth/school/options）
  GET  /reports/{rel}             托管报告 HTML（路径穿越防护）
  *    静态资源                    client/static/（前端构建产物）

健壮性：全部 API 返回 JSON；路径穿越防护；任务进程隔离 + 可取消；
并发限制（默认 2）；损坏缓存容错；CORS 允许 dev 直连。
"""
from __future__ import annotations

import json
import os
import re
import signal
import subprocess
import sys
import tempfile
import threading
import time
import uuid
import webbrowser
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, urlparse

CLIENT_DIR = Path(__file__).parent.resolve()
STATIC_DIR = CLIENT_DIR / "static"
# Electron 打包：UZI_ENGINE_ROOT 指向 resources/engine（含 run.py / skills / commands）
_engine_root = os.environ.get("UZI_ENGINE_ROOT")
if _engine_root:
    ROOT_DIR = Path(_engine_root).resolve()
else:
    ROOT_DIR = CLIENT_DIR.parent
SCRIPTS_DIR = ROOT_DIR / "skills" / "deep-analysis" / "scripts"
# 报告目录：Electron 打包版可用 UZI_REPORTS_DIR 指向可写的用户数据目录
_reports_dir_env = os.environ.get("UZI_REPORTS_DIR")
REPORTS_DIR = Path(_reports_dir_env).resolve() if _reports_dir_env else SCRIPTS_DIR / "reports"
CACHE_DIR = SCRIPTS_DIR / ".cache"
COMMANDS_DIR = ROOT_DIR / "commands"
SKILLS_DIR = ROOT_DIR / "skills"
JOBS_DIR = CLIENT_DIR / "data" / "jobs"  # 任务历史持久化目录

MAX_CONCURRENT_JOBS = int(os.environ.get("UZI_MAX_JOBS", "2"))
_MAX_LOG = 500_000
_PERSIST_LOG_MAX = 300_000  # 落盘时日志截断上限
_MAX_LOADED_JOBS = 100      # 启动时最多加载到内存的历史任务数（磁盘文件全保留）
_SAVE_EVERY_N_APPEND = 25   # 日志追加每 N 次落盘一次（节流）

_jobs: dict[str, dict[str, Any]] = {}
_jobs_lock = threading.Lock()


def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# ───────────────────────────── 安全校验 ─────────────────────────────

def _safe_ticker(raw: str) -> str:
    t = (raw or "").strip()
    if not t or len(t) > 32:
        raise ValueError("请输入有效股票代码或中文名（≤32 字）")
    if re.search(r"[;&|<>`$\\]", t):
        raise ValueError("股票代码含非法字符")
    return t


def _safe_report_rel(rel: str) -> str:
    rel = rel.replace("\\", "/").lstrip("/")
    if ".." in rel.split("/"):
        raise ValueError("bad path")
    return rel


def _safe_cache_ticker(ticker: str) -> Path:
    """解析 .cache/{ticker} 目录，防穿越。"""
    t = (ticker or "").strip().replace("/", "").replace("\\", "")
    if not t or len(t) > 40 or t in (".", ".."):
        raise ValueError("无效的 ticker")
    return CACHE_DIR / t


# ───────────────────────────── 数据读取（容错） ─────────────────────────────

def _read_json_file(fp: Path) -> dict[str, Any] | None:
    try:
        if not fp.exists():
            return None
        data = json.loads(fp.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else None
    except (json.JSONDecodeError, OSError):
        return None


def _synthesis(ticker_dir: Path) -> dict[str, Any] | None:
    return _read_json_file(ticker_dir / "synthesis.json")


def _dimensions(ticker_dir: Path) -> dict[str, Any] | None:
    return _read_json_file(ticker_dir / "dimensions.json")


def _panel(ticker_dir: Path) -> dict[str, Any] | None:
    return _read_json_file(ticker_dir / "panel.json")


def _list_reports(limit: int = 40) -> list[dict[str, Any]]:
    if not REPORTS_DIR.exists():
        return []
    items: list[dict[str, Any]] = []
    for d in sorted(REPORTS_DIR.iterdir(), key=lambda p: p.stat().st_mtime, reverse=True):
        if not d.is_dir():
            continue
        standalone = d / "full-report-standalone.html"
        full = d / "full-report.html"
        html = standalone if standalone.exists() else full if full.exists() else None
        if html is None:
            continue
        ticker, _, date = d.name.partition("_")
        items.append({
            "id": d.name,
            "ticker": ticker or d.name,
            "date": date or "",
            "mtime": datetime.fromtimestamp(d.stat().st_mtime).strftime("%Y-%m-%d %H:%M"),
            "size_kb": html.stat().st_size // 1024,
            "url": f"/reports/{d.name}/{html.name}",
            "standalone": html.name.endswith("standalone.html"),
        })
        if len(items) >= limit:
            break
    return items


def _list_cache_stocks() -> list[dict[str, Any]]:
    """.cache/ 下所有含 synthesis.json 的股票，附评分摘要。"""
    if not CACHE_DIR.exists():
        return []
    out: list[dict[str, Any]] = []
    for d in sorted(CACHE_DIR.iterdir(), key=lambda p: p.stat().st_mtime, reverse=True):
        if not d.is_dir() or d.name.startswith("_") or not (d / "synthesis.json").exists():
            continue
        syn = _synthesis(d)
        if not syn:
            continue
        out.append({
            "ticker": syn.get("ticker") or d.name,
            "name": syn.get("name") or d.name,
            "overall_score": syn.get("overall_score"),
            "verdict_label": syn.get("verdict_label"),
            "fundamental_score": syn.get("fundamental_score"),
            "panel_consensus": syn.get("panel_consensus"),
            "style": syn.get("style_label_cn") or syn.get("detected_style"),
            "agent_reviewed": bool(syn.get("agent_reviewed")),
            "school_lock": syn.get("school_lock"),
            "mtime": datetime.fromtimestamp(d.stat().st_mtime).strftime("%Y-%m-%d %H:%M"),
            "has_panel": bool(_panel(d)),
            "has_dimensions": bool(_dimensions(d)),
        })
    return out


def _panel_summary(panel: dict[str, Any] | None) -> dict[str, Any]:
    """从 panel.json 提取轻量统计（投票分布/流派/顶底评委）。"""
    if not panel:
        return {}
    inv = panel.get("investors") or []
    by_signal: dict[str, int] = {}
    for i in inv:
        s = i.get("signal") or "?"
        by_signal[s] = by_signal.get(s, 0) + 1
    active = [i for i in inv if i.get("signal") != "skip" and (i.get("score") or 0) > 0]
    top = sorted(active, key=lambda x: -(x.get("score") or 0))[:3]
    bottom = sorted(active, key=lambda x: x.get("score") or 0)[:3]
    return {
        "n_investors": len(inv),
        "signal_distribution": by_signal,
        "vote_distribution": panel.get("vote_distribution"),
        "panel_consensus": panel.get("panel_consensus"),
        "school_scores": panel.get("school_scores"),
        "top_bull": [{"name": i.get("name"), "score": i.get("score"), "headline": (i.get("headline") or "")[:80]} for i in top],
        "top_bear": [{"name": i.get("name"), "score": i.get("score"), "headline": (i.get("headline") or "")[:80]} for i in bottom],
    }


# ───────────────────────────── 任务执行 ─────────────────────────────

def _append_log(job: dict[str, Any], chunk: str) -> None:
    job["log"] = (job.get("log") or "") + chunk
    if len(job["log"]) > _MAX_LOG:
        job["log"] = job["log"][-_MAX_LOG:]
    job["updated_at"] = _now()
    # 节流落盘：每 N 次追加保存一次（日志实时性 vs IO 开销平衡）
    job["_append_count"] = job.get("_append_count", 0) + 1
    if job.get("_append_count", 0) % _SAVE_EVERY_N_APPEND == 0:
        _save_job(job["id"])


# ───────────────────────────── 任务持久化 ─────────────────────────────

def _save_job(job_id: str) -> None:
    """原子写任务到磁盘（调用方需持有 _jobs_lock 或任务已终结）。"""
    job = _jobs.get(job_id)
    if not job:
        return
    try:
        JOBS_DIR.mkdir(parents=True, exist_ok=True)
        payload = dict(job)
        payload.pop("cancel_requested", None)
        payload.pop("pid", None)
        log = payload.get("log") or ""
        if len(log) > _PERSIST_LOG_MAX:
            payload["log"] = log[-_PERSIST_LOG_MAX:]
            payload["log_truncated"] = True
        tmp = JOBS_DIR / f".{job_id}.tmp"
        tmp.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
        os.replace(tmp, JOBS_DIR / f"{job_id}.json")
    except OSError:
        pass  # 持久化失败不阻塞任务执行


def _load_jobs() -> None:
    """启动时加载历史任务；重启前 running/queued 的任务标记为中断。"""
    if not JOBS_DIR.exists():
        return
    files = sorted(JOBS_DIR.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True)
    loaded = 0
    for fp in files:
        if fp.name.startswith("."):
            continue
        try:
            job = json.loads(fp.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        if not isinstance(job, dict) or not job.get("id"):
            continue
        stale = job.get("status") in ("running", "queued", "cancelling")
        if stale:
            job["status"] = "error"
            job["error"] = "服务重启，任务中断"
            job["finished_at"] = job.get("finished_at") or _now()
        job.pop("cancel_requested", None)
        job.pop("pid", None)
        _jobs[job["id"]] = job
        loaded += 1
        if loaded >= _MAX_LOADED_JOBS:
            break
    if loaded:
        print(f"  已恢复 {loaded} 个历史任务 -> {JOBS_DIR}")


def _delete_job(job_id: str) -> bool:
    """删除任务（内存 + 磁盘）。返回是否删除。"""
    with _jobs_lock:
        job = _jobs.get(job_id)
        if job and job.get("status") in ("running", "queued"):
            return False  # 运行中不允许删除
        _jobs.pop(job_id, None)
    try:
        fp = JOBS_DIR / f"{job_id}.json"
        if fp.exists():
            fp.unlink()
    except OSError:
        pass
    return True


def _run_job(job_id: str) -> None:
    with _jobs_lock:
        job = _jobs[job_id]
        job["status"] = "running"
        job["started_at"] = _now()
    _save_job(job_id)

    cfg = job["config"]
    cmd = [sys.executable, str(ROOT_DIR / "run.py"), "--no-browser"]
    mode = cfg.get("mode", "single")

    if mode == "single":
        cmd.append(cfg["ticker"])
        cmd += ["--depth", cfg.get("depth", "lite")]
    elif mode == "versus":
        tickers = cfg.get("tickers") or []
        cmd += ["--versus"] + tickers
        cmd += ["--depth", cfg.get("depth", "lite")]
    elif mode == "portfolio":
        csv_path = cfg.get("portfolio_csv_path")
        if not csv_path or not Path(csv_path).exists():
            _append_log(job, "❌ portfolio CSV 文件不存在\n")
            with _jobs_lock:
                job["status"] = "error"
                job["error"] = "portfolio CSV 文件不存在"
                job["finished_at"] = _now()
            _save_job(job_id)
            return
        cmd += ["--portfolio", csv_path]
    else:
        with _jobs_lock:
            job["status"] = "error"
            job["error"] = f"未知模式: {mode}"
            job["finished_at"] = _now()
        _save_job(job_id)
        return

    school = cfg.get("school") or ""
    if school and school in "ABCDEFGHI":
        cmd += ["--school", school]
    if cfg.get("no_resume"):
        cmd += ["--no-resume"]
    if cfg.get("output_dir"):
        cmd += ["--output-dir", cfg["output_dir"]]
    remote = bool(cfg.get("remote"))
    if remote:
        cmd += ["--remote"]
        if cfg.get("install_cloudflared"):
            cmd += ["--install-cloudflared"]
    # remote 模式下 run.py 会阻塞在 HTTP 服务，把任务视为长驻服务而非一次性任务
    job["remote"] = remote

    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    env["PYTHONUNBUFFERED"] = "1"
    env["UZI_NO_AUTO_OPEN"] = "1"

    try:
        _append_log(job, f"$ {' '.join(cmd)}\n\n")
        proc = subprocess.Popen(
            cmd, cwd=str(ROOT_DIR),
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
            text=True, encoding="utf-8", errors="replace", env=env, bufsize=1,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )
        with _jobs_lock:
            job["pid"] = proc.pid

        assert proc.stdout is not None
        remote_done = False
        for line in proc.stdout:
            with _jobs_lock:
                job2 = _jobs.get(job_id) or {}
                if job2.get("cancel_requested"):
                    proc.terminate()
                    break
                _append_log(job, line)
                m = re.search(r"reports[\\/]([^\s\\/]+[\\/][^\s]+\.html)", line)
                if m:
                    rel = m.group(1).replace("\\", "/")
                    job["report_url"] = f"/reports/{rel}"
                # 远程模式：检测 Cloudflare 公网链接即视为服务已就绪
                m2 = re.search(r"https://[a-z0-9-]+\.trycloudflare\.com", line)
                if m2 and remote:
                    job["remote_url"] = m2.group(0)
                    if not job.get("report_url") and job2.get("report_url"):
                        job["report_url"] = job2["report_url"]
                    if not job.get("report_url"):
                        found = _find_report_for_ticker(cfg.get("ticker") or "")
                        if found:
                            job["report_url"] = found["url"]
                    job["status"] = "done"
                    _append_log(job, "\n🌐 公网服务已就绪（任务保持后台运行，可取消停止）\n")
                    remote_done = True
                    break
                if job["status"] == "cancelled":
                    break

        if remote_done:
            # 不等待进程退出（run.py 阻塞在 serve_forever），线程结束即可
            with _jobs_lock:
                job["finished_at"] = _now()
            _save_job(job_id)
            return

        code = proc.wait()
        with _jobs_lock:
            job = _jobs.get(job_id) or job
            if job.get("cancel_requested") or job.get("status") == "cancelled":
                job["status"] = "cancelled"
                _append_log(job, "\n⏹ 已取消\n")
            elif not job.get("report_url"):
                # Playwright missing often yields exit 1 even when HTML is ready
                if job.get("status") == "running":
                    job["status"] = "done" if code in (0, 1) else "error"
                    if code not in (0, 1):
                        _append_log(job, f"\n❌ 退出码 {code}\n")
            else:
                job["status"] = "done"
            job["exit_code"] = code
            job["finished_at"] = _now()
        _save_job(job_id)
    except Exception as e:  # noqa: BLE001
        with _jobs_lock:
            job = _jobs.get(job_id) or job
            job["status"] = "error"
            job["error"] = str(e)
            _append_log(job, f"\n❌ {e}\n")
            job["finished_at"] = _now()
        _save_job(job_id)
    finally:
        with _jobs_lock:
            if _jobs.get(job_id, {}).get("status") == "running":
                _jobs[job_id]["status"] = "error"
                _jobs[job_id]["finished_at"] = _now()
        _save_job(job_id)


def _spawn_job(cfg: dict[str, Any]) -> str:
    job_id = uuid.uuid4().hex[:12]
    job = {
        "id": job_id,
        "config": cfg,
        "status": "queued",
        "log": "",
        "created_at": _now(),
        "pid": None,
        "cancel_requested": False,
    }
    with _jobs_lock:
        _jobs[job_id] = job
    _save_job(job_id)
    threading.Thread(target=_dispatch_job, args=(job_id,), daemon=True).start()
    return job_id


def _dispatch_job(job_id: str) -> None:
    """排队调度：并发限制内启动，否则等待。"""
    while True:
        with _jobs_lock:
            running = [j for j in _jobs.values()
                       if j["status"] in ("running", "queued") and j["id"] != job_id]
            can_start = len([j for j in _jobs.values() if j["status"] == "running"]) < MAX_CONCURRENT_JOBS
            cancelled = _jobs.get(job_id, {}).get("cancel_requested")
        if cancelled:
            with _jobs_lock:
                _jobs[job_id]["status"] = "cancelled"
                _jobs[job_id]["finished_at"] = _now()
            _save_job(job_id)
            return
        if can_start:
            _run_job(job_id)
            return
        time.sleep(1.5)


# ───────────────────────────── HTTP 层 ─────────────────────────────

def _json_response(handler: SimpleHTTPRequestHandler, data: Any, status: int = 200) -> None:
    body = json.dumps(data, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Cache-Control", "no-store")
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type")
    handler.end_headers()
    handler.wfile.write(body)


def _read_json(handler: SimpleHTTPRequestHandler) -> dict[str, Any]:
    length = int(handler.headers.get("Content-Length") or 0)
    raw = handler.rfile.read(length) if length else b"{}"
    try:
        return json.loads(raw.decode("utf-8") or "{}")
    except json.JSONDecodeError as e:
        raise ValueError(f"JSON 无效: {e}") from e


class UZIHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(STATIC_DIR), **kwargs)

    def log_message(self, fmt: str, *args) -> None:
        sys.stderr.write("[%s] %s\n" % (self.log_date_time_string(), fmt % args))

    # ── 路由 ──

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        qs = parse_qs(parsed.query)
        try:
            if path == "/api/health":
                return self._api_health()
            if path == "/api/reports":
                return _json_response(self, {"reports": _list_reports()})
            if path == "/api/cache":
                return _json_response(self, {"stocks": _list_cache_stocks()})
            if path == "/api/jobs":
                return self._api_jobs_list()
            if path.startswith("/api/jobs/") and "/cancel" in path:
                return _json_response(self, {"error": "use POST"}, 405)
            if path.startswith("/api/jobs/"):
                return self._api_job_get(path[len("/api/jobs/"):].strip("/"), qs)
            if path == "/api/commands":
                return self._api_commands_list()
            if path.startswith("/api/commands/"):
                return self._api_command_get(path[len("/api/commands/"):].strip("/"))
            if path == "/api/skills":
                return self._api_skills()
            if path.startswith("/api/stocks/"):
                return self._api_stock(path[len("/api/stocks/"):].strip("/"))
            if path.startswith("/api/panel/"):
                return self._api_panel(path[len("/api/panel/"):].strip("/"))
            if path.startswith("/api/dimensions/"):
                return self._api_dimensions(path[len("/api/dimensions/"):].strip("/"))
            if path.startswith("/api/raw/"):
                return self._api_raw(path[len("/api/raw/"):].strip("/"), qs)
            if path.startswith("/reports/"):
                return self._serve_report(path[len("/reports/"):])
            if path in ("/", "/index.html"):
                return self._serve_static("index.html", "text/html; charset=utf-8")
            # SPA 历史路由回退：已存在的静态资产走默认处理器，其余路径回退 index.html
            rel = path.lstrip("/")
            if rel and (STATIC_DIR / rel).is_file():
                return super().do_GET()
            return self._serve_static("index.html", "text/html; charset=utf-8")
        except ValueError as e:
            return _json_response(self, {"error": str(e)}, 400)
        except Exception as e:  # noqa: BLE001
            return _json_response(self, {"error": f"服务器错误: {e}"}, 500)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        try:
            if path == "/api/analyze":
                return self._api_analyze()
            if path.startswith("/api/jobs/") and path.endswith("/cancel"):
                return self._api_job_cancel(path[len("/api/jobs/"):-len("/cancel")].strip("/"))
            return _json_response(self, {"error": "not found"}, 404)
        except ValueError as e:
            return _json_response(self, {"error": str(e)}, 400)
        except Exception as e:  # noqa: BLE001
            return _json_response(self, {"error": f"服务器错误: {e}"}, 500)

    def do_DELETE(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        try:
            if path.startswith("/api/jobs/"):
                job_id = path[len("/api/jobs/"):].strip("/")
                if not job_id:
                    return _json_response(self, {"error": "missing job id"}, 400)
                if _delete_job(job_id):
                    return _json_response(self, {"id": job_id, "deleted": True})
                return _json_response(self, {"error": "运行中的任务不可删除"}, 409)
            return _json_response(self, {"error": "not found"}, 404)
        except Exception as e:  # noqa: BLE001
            return _json_response(self, {"error": f"服务器错误: {e}"}, 500)

    # ── API 实现 ──

    def _api_health(self) -> None:
        python_ok = False
        try:
            import akshare  # noqa: F401
            python_ok = True
        except Exception:
            pass
        _json_response(self, {
            "ok": True,
            "service": "uzi-client-v2",
            "python": sys.executable,
            "python_ok": python_ok,
            "reports_dir": str(REPORTS_DIR),
            "cache_dir": str(CACHE_DIR),
            "max_concurrent_jobs": MAX_CONCURRENT_JOBS,
            "version": "2.0.0",
        })

    def _api_jobs_list(self) -> None:
        with _jobs_lock:
            jobs = [{
                "id": j["id"],
                "status": j["status"],
                "mode": j["config"].get("mode", "single"),
                "ticker": j["config"].get("ticker") or " / ".join(j["config"].get("tickers") or []) or "portfolio",
                "depth": j["config"].get("depth"),
                "school": j["config"].get("school") or "",
                "report_url": j.get("report_url"),
                "remote_url": j.get("remote_url"),
                "remote": j.get("remote", False),
                "error": j.get("error"),
                "created_at": j.get("created_at"),
                "started_at": j.get("started_at"),
                "finished_at": j.get("finished_at"),
                "log_len": len(j.get("log") or ""),
            } for j in sorted(_jobs.values(), key=lambda x: x.get("created_at") or "", reverse=True)]
        _json_response(self, {"jobs": jobs})

    def _api_job_get(self, job_id: str, qs: dict[str, list[str]]) -> None:
        since = int((qs.get("since") or ["0"])[0] or 0)
        with _jobs_lock:
            job = _jobs.get(job_id)
            if not job:
                return _json_response(self, {"error": "job not found"}, 404)
            log = job.get("log") or ""
            payload = {
                "id": job_id,
                "status": job["status"],
                "exit_code": job.get("exit_code"),
                "report_url": job.get("report_url"),
                "remote_url": job.get("remote_url"),
                "remote": job.get("remote", False),
                "error": job.get("error"),
                "log": log[since:],
                "log_len": len(log),
                "created_at": job.get("created_at"),
                "started_at": job.get("started_at"),
                "finished_at": job.get("finished_at"),
            }
        _json_response(self, payload)

    def _api_job_cancel(self, job_id: str) -> None:
        with _jobs_lock:
            job = _jobs.get(job_id)
            if not job:
                return _json_response(self, {"error": "job not found"}, 404)
            is_remote_running = job.get("remote") and job["status"] == "done" and job.get("pid")
            if job["status"] in ("done", "error", "cancelled") and not is_remote_running:
                return _json_response(self, {"id": job_id, "status": job["status"]})
            job["cancel_requested"] = True
            if job.get("pid"):
                try:
                    os.kill(job["pid"], signal.SIGTERM)
                except (OSError, PermissionError):
                    pass
        _save_job(job_id)
        _json_response(self, {"id": job_id, "status": "cancelling"})

    def _api_commands_list(self) -> None:
        items = []
        if COMMANDS_DIR.exists():
            for f in sorted(COMMANDS_DIR.glob("*.md")):
                try:
                    raw = f.read_text(encoding="utf-8")
                except OSError:
                    raw = ""
                desc = ""
                arg_hint = ""
                fm = re.match(r"^---\n([\s\S]*?)\n---", raw)
                if fm:
                    dm = re.search(r"^description:\s*(.+)$", fm.group(1), re.M)
                    am = re.search(r"^argument-hint:\s*(.+)$", fm.group(1), re.M)
                    if dm:
                        desc = dm.group(1).strip().strip('"').strip("'")
                    if am:
                        arg_hint = am.group(1).strip().strip('"').strip("'")
                if not desc:
                    # 回退：正文第一个 # 标题之后的首个非空行
                    for line in raw.splitlines():
                        ls = line.strip()
                        if ls and not ls.startswith("#") and not ls.startswith("---"):
                            desc = ls[:120]
                            break
                items.append({
                    "name": f.stem,
                    "file": f.name,
                    "size": f.stat().st_size,
                    "description": desc,
                    "argument_hint": arg_hint,
                })
        _json_response(self, {"commands": items})

    def _api_command_get(self, name: str) -> None:
        name = name.replace("/", "").replace("\\", "")
        if not name or ".." in name:
            raise ValueError("无效命令名")
        fp = COMMANDS_DIR / f"{name}.md"
        if not fp.exists():
            return _json_response(self, {"error": "command not found"}, 404)
        _json_response(self, {"name": name, "content": fp.read_text(encoding="utf-8")})

    def _api_skills(self) -> None:
        items = []
        if SKILLS_DIR.exists():
            for d in sorted(SKILLS_DIR.iterdir()):
                if not d.is_dir() or d.name.startswith("."):
                    continue
                sk = d / "SKILL.md"
                items.append({
                    "name": d.name,
                    "has_skill": sk.exists(),
                    "description": (sk.read_text(encoding="utf-8").splitlines()[0][2:] if sk.exists() else ""),
                })
        _json_response(self, {"skills": items})

    def _api_stock(self, ticker: str) -> None:
        td = _safe_cache_ticker(ticker)
        syn = _synthesis(td)
        if not syn:
            return _json_response(self, {"error": f"未找到 {ticker} 的分析缓存"}, 404)
        dims = _dimensions(td)
        panel = _panel(td)
        _json_response(self, {
            "ticker": syn.get("ticker") or ticker,
            "name": syn.get("name") or ticker,
            "synthesis": syn,
            "dimensions": dims,
            "panel_summary": _panel_summary(panel),
        })

    def _api_panel(self, ticker: str) -> None:
        td = _safe_cache_ticker(ticker)
        panel = _panel(td)
        if not panel:
            return _json_response(self, {"error": "panel 不存在"}, 404)
        _json_response(self, panel)

    def _api_dimensions(self, ticker: str) -> None:
        td = _safe_cache_ticker(ticker)
        dims = _dimensions(td)
        if not dims:
            return _json_response(self, {"error": "dimensions 不存在"}, 404)
        _json_response(self, dims)

    def _api_raw(self, ticker: str, qs: dict[str, list[str]]) -> None:
        td = _safe_cache_ticker(ticker)
        raw = _read_json_file(td / "raw_data.json")
        if not raw:
            return _json_response(self, {"error": "raw_data 不存在"}, 404)
        dims = raw.get("dimensions") or {}
        wanted = (qs.get("dims") or [""])[0]
        if not wanted or wanted == "*":
            result = dims
        else:
            names = [w.strip() for w in wanted.split(",") if w.strip()]
            result = {k: v for k, v in dims.items() if k in names}
            if not result:
                return _json_response(self, {"error": f"无匹配维度: {wanted}"}, 404)
        _json_response(self, result)

    def _api_analyze(self) -> None:
        data = _read_json(self)
        mode = str(data.get("mode") or "single").lower()
        depth = str(data.get("depth") or "lite").lower()
        if depth not in ("lite", "medium", "deep"):
            raise ValueError("depth 必须是 lite / medium / deep")
        school = str(data.get("school") or "").upper().strip()
        if school and school not in list("ABCDEFGHI"):
            raise ValueError("school 必须是 A–I 或留空")

        cfg: dict[str, Any] = {"mode": mode, "depth": depth, "school": school}
        if mode == "single":
            cfg["ticker"] = _safe_ticker(str(data.get("ticker") or ""))
        elif mode == "versus":
            tickers = [str(t).strip() for t in (data.get("tickers") or []) if str(t).strip()]
            if not (2 <= len(tickers) <= 4):
                raise ValueError("versus 需要 2-4 个股票代码")
            cfg["tickers"] = [_safe_ticker(t) for t in tickers]
        elif mode == "portfolio":
            csv_content = data.get("portfolio_csv") or ""
            if not csv_content.strip():
                raise ValueError("portfolio 模式需要 CSV 内容（列: ticker,weight,note）")
            tmp_dir = Path(tempfile.gettempdir()) / "uzi-client"
            tmp_dir.mkdir(parents=True, exist_ok=True)
            csv_path = tmp_dir / f"portfolio_{uuid.uuid4().hex[:8]}.csv"
            csv_path.write_text(csv_content, encoding="utf-8")
            cfg["portfolio_csv_path"] = str(csv_path)
        else:
            raise ValueError("mode 必须是 single / versus / portfolio")

        cfg["no_resume"] = bool(data.get("no_resume"))
        cfg["remote"] = bool(data.get("remote"))
        cfg["install_cloudflared"] = bool(data.get("install_cloudflared"))
        out_dir = str(data.get("output_dir") or "").strip()
        if out_dir:
            cfg["output_dir"] = out_dir

        job_id = _spawn_job(cfg)
        _json_response(self, {"job_id": job_id, "status": "queued"}, 202)

    # ── 静态/报告托管 ──

    def _serve_static(self, name: str, content_type: str) -> None:
        fp = STATIC_DIR / name
        if not fp.exists():
            self.send_error(404)
            return
        data = fp.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(data)

    def _serve_report(self, rel: str) -> None:
        try:
            rel = _safe_report_rel(rel)
        except ValueError:
            self.send_error(400, "bad path")
            return
        target = (REPORTS_DIR / rel).resolve()
        try:
            target.relative_to(REPORTS_DIR.resolve())
        except ValueError:
            self.send_error(403)
            return
        if not target.exists() or not target.is_file():
            self.send_error(404)
            return
        data = target.read_bytes()
        ctype = "text/html; charset=utf-8" if target.suffix.lower() in (".html", ".htm") else "application/octet-stream"
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


def run_server(host: str = "127.0.0.1", port: int = 8787, open_browser: bool = True) -> None:
    if not (ROOT_DIR / "run.py").exists():
        raise SystemExit("找不到 run.py，请在仓库根目录运行")
    STATIC_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    _load_jobs()

    httpd = ThreadingHTTPServer((host, port), UZIHandler)
    url = f"http://{host}:{port}/"
    print(f"\n{'━' * 52}")
    print(f"  游资 UZI · 本地客户端 v2")
    print(f"  {url}")
    print(f"  Python: {sys.executable}")
    print(f"  报告目录: {REPORTS_DIR}")
    print(f"  缓存目录: {CACHE_DIR}")
    print(f"  并发任务: {MAX_CONCURRENT_JOBS}")
    print(f"  Ctrl+C 停止")
    print(f"{'━' * 52}\n")

    if open_browser:
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n已停止。")
    finally:
        httpd.server_close()


if __name__ == "__main__":
    import argparse

    _ap = argparse.ArgumentParser(description="UZI-Skill 本地客户端后端")
    _ap.add_argument("--host", default="127.0.0.1")
    _ap.add_argument("--port", type=int, default=8787)
    _ap.add_argument("--no-browser", action="store_true", help="不自动打开浏览器")
    _args = _ap.parse_args()
    run_server(host=_args.host, port=_args.port, open_browser=not _args.no_browser)
