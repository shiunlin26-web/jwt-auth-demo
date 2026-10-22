"""【關卡 24】outbox consumer 的入口：python consumer.py（需要 KAFKA_BOOTSTRAP_SERVERS）

真實世界這會是另一個服務（寄信服務、統計服務），和產生事件的後端分開部署、分開擴充；
這裡放在同一個 repo、同一個 image，是為了看得到整條路。
"""

import asyncio
import signal

from config import settings
from logging_config import setup_logging
from outbox import run_consumer


async def main() -> None:
    task = asyncio.ensure_future(run_consumer())
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
