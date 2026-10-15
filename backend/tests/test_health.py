"""【關卡 11】維護相關的測試：health、request id、除錯端點預設關閉"""


async def test_ping不碰資料庫也能回(client):
    r = await client.get("/api/ping")
    assert r.status_code == 200
    assert r.json() == {"message": "pong"}


async def test_health會回報資料庫狀態(client):
    r = await client.get("/api/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["db"] == "ok"
    # 測試資料庫是 create_all 建的，沒有 alembic_version 表，所以是 unknown
    assert body["migration"] == "unknown"


async def test_每個回應都不准快取(client):
    # 【關卡 19】/api/me 被瀏覽器或 proxy 快取會把 A 的資料給 B，所以 API 一律 no-store
    res = await client.get("/api/ping")
    assert res.headers["cache-control"] == "no-store"


async def test_每個回應都有request_id(client):
    r = await client.get("/api/ping")
    assert r.headers.get("X-Request-ID")
    # 呼叫端自己帶 id 的話要原樣回傳（方便串接前端或其他服務的 log）
    r = await client.get("/api/ping", headers={"X-Request-ID": "abc123"})
    assert r.headers["X-Request-ID"] == "abc123"


async def test_除錯端點預設關閉(client):
    r = await client.get("/api/_boom")
    assert r.status_code == 404
