"""【關卡 24】Transactional outbox：「註冊成功要通知別人」這件事，先寫進資料庫，再由 worker 送出去

問題：註冊成功後要寄歡迎信、更新統計、通知其他服務……如果在請求裡直接做：
  - 寄信的服務掛了，使用者就註冊失敗？不合理，使用者只是想註冊
  - 先 commit 再送：送到一半程式當掉，事件就丟了；先送再 commit：commit 失敗但信已經寄了
解法：把「待送的事件」和使用者**寫進同一個交易**。交易成功，事件一定在；交易失敗，事件一定不在。
之後由 worker（關卡 24-B）把還沒送的事件撿出來送到 Kafka 或 log，送完標記 published_at。
這就是 transactional outbox pattern，是「資料庫和訊息系統要一致」的標準解法。

這個檔案在 24-A 只有 enqueue；24-B 加 worker 與 consumer。
"""

from typing import Any

from sqlmodel.ext.asyncio.session import AsyncSession

from models import OutboxEvent


def enqueue(session: AsyncSession, topic: str, payload: dict[str, Any]) -> OutboxEvent:
    """把一筆事件加進目前的 session，**不 commit**：和呼叫端的其他寫入一起進同一個交易

    topic 是事件的種類（user.registered），payload 是內容。payload 只放 id 和必要欄位，
    不放密碼雜湊之類的敏感資料：事件之後會被送到別的系統。
    """
    event = OutboxEvent(topic=topic, payload=payload)
    session.add(event)
    return event
