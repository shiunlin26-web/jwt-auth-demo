"""【關卡 24】Transactional outbox：註冊成功事件和使用者在同一個交易裡"""

from helpers import register
from sqlmodel import select

from models import OutboxEvent


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
