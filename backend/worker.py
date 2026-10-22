"""【關卡 24】outbox worker 的入口：python worker.py

和 main.py 是同一個 image、同一份設定，只是跑的不是 uvicorn。compose 的 worker 服務、k8s 的另一個 Deployment 都是這樣起。
收到 SIGTERM（docker stop、k8s 關 pod）就把迴圈取消，讓 publisher 好好關掉。
"""

import asyncio
import signal

from config import settings
from logging_config import setup_logging
from outbox import run_worker


async def main() -> None:
    task = asyncio.ensure_future(run_worker())
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, task.cancel)
    try:
        await task
    except asyncio.CancelledError:
        pass


if __name__ == "__main__":
    setup_logging(level=settings.log_level, json_output=settings.log_json)
    asyncio.run(main())
