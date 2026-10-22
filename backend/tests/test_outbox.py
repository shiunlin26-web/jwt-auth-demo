"""【關卡 24】Transactional outbox：註冊成功事件和使用者在同一個交易裡；worker 送出；消費端冪等"""

import uuid

from helpers import register
from sqlmodel import select

from models import OutboxEvent, ProcessedEvent
from outbox import handle_event, publish_pending


async def test_註冊成功會留下一筆待送事件(client, db):
    await register(client, "a@test.com", "Passw0rd!x")

    events = (await db.exec(select(OutboxEvent))).all()
    assert len(events) == 1
    event = events[0]
    assert event.topic == "user.registered"
    assert event.payload == {"user_id": 1, "email": "a@test.com"}
    # 還沒送出去：worker（24-B）送完才會填
    assert event.published_at is None
    # payload 不放敏感資料
    assert "password" not in str(event.payload)


async def test_註冊失敗就沒有事件_同一個交易(client, db):
    await register(client, "a@test.com", "Passw0rd!x")
    r = await client.post(
        "/api/auth/register", json={"email": "a@test.com", "password": "Passw0rd!x"}
    )
    assert r.status_code == 400

    # 第二次註冊 email 重複、交易回滾：使用者沒多、事件也沒多
    events = (await db.exec(select(OutboxEvent))).all()
    assert len(events) == 1


class FakePublisher:
    """測試用：把送出的東西收進 list，不碰網路"""

    def __init__(self) -> None:
        self.sent: list[tuple[str, str, bytes]] = []

    async def send(self, topic: str, key: str, value: bytes) -> None:
        self.sent.append((topic, key, value))

    async def stop(self) -> None:
        pass


async def test_worker把待送事件送出並標記(client, db):
    await register(client, "a@test.com", "Passw0rd!x")
    await register(client, "b@test.com", "Passw0rd!x")
    publisher = FakePublisher()

    assert await publish_pending(db, publisher) == 2
    topics = {topic for topic, _, _ in publisher.sent}
    assert topics == {"user.registered"}
    # key 是事件 id，value 是 JSON，裡面也帶 id（消費端做冪等用）
    _, key, value = publisher.sent[0]
    assert key in value.decode()

    # 送過的都標了時間；再撿一次什麼都沒有（不會重複送）
    events = (await db.exec(select(OutboxEvent))).all()
    assert all(e.published_at is not None for e in events)
    assert await publish_pending(db, publisher) == 0


async def test_消費端同一筆事件只處理一次(db):
    event_id = uuid.uuid4()
    payload = {"user_id": 1, "email": "a@test.com"}
    assert await handle_event(db, event_id, "user.registered", payload) is True
    # 同一個 id 再來一次：撞主鍵 → 回 False，表裡還是一筆
    assert await handle_event(db, event_id, "user.registered", payload) is False
    processed = (await db.exec(select(ProcessedEvent))).all()
    assert len(processed) == 1
