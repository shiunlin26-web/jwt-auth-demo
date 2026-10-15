-- 【關卡 18】SQL 實驗：看 ORM 底下發生什麼事
--
-- 怎麼用：一段一段貼進 Neon 的 SQL Editor（左邊選「測試用」的資料庫 jwtdemo_test），或本機 psql。
-- ⚠️ 不要在正式資料庫跑：第 2 步會灌 5 萬個假帳號。
-- 每一步的「要看什麼」寫在註解裡；對照 LEARNING.md 關卡 18。

-- ============================================================
-- 1. 現在有哪些表、哪些索引
-- ============================================================
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name IN ('user', 'refreshtoken')
ORDER BY table_name, ordinal_position;

-- 要看什麼：索引是「為了找得快而另外維護的一本目錄」。
-- 這裡會看到 4 個：user 的主鍵和 email、refreshtoken 的主鍵、token_hash、user_id。每一個都對應程式裡的一種查法。
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('user', 'refreshtoken')
ORDER BY tablename, indexname;

-- ============================================================
-- 2. 灌資料：5 萬個使用者、20 萬個 refresh token（約 10 秒）
-- ============================================================
-- 要看什麼：資料少的時候索引有沒有都一樣快，看不出差別；要有「幾萬筆」才看得到。
-- generate_series 是 Postgres 產生 1..N 的函式，常拿來造測試資料。
INSERT INTO "user" (email, hashed_password, created_at)
SELECT 'u' || g || '@lab.test', 'not-a-real-hash', now()
FROM generate_series(1, 50000) AS g;

INSERT INTO refreshtoken (token_hash, user_id, revoked, expires_at, created_at)
SELECT md5('lab-' || g),
       (SELECT id FROM "user" WHERE email = 'u' || ((g % 50000) + 1) || '@lab.test'),
       (g % 10 = 0),                                 -- 每 10 個有 1 個已撤銷
       now() + (g % 14 - 7) * interval '1 day',      -- 一半已過期、一半沒過期
       now()
FROM generate_series(1, 200000) AS g;

SELECT (SELECT count(*) FROM "user") AS users, (SELECT count(*) FROM refreshtoken) AS tokens;

-- ============================================================
-- 3. EXPLAIN ANALYZE：資料庫「打算怎麼找」和「實際花多久」
-- ============================================================
-- 要看什麼：第一行是 "Index Scan using ix_user_email"（用目錄翻），Execution Time 零點幾毫秒。
-- 這就是 routes/auth.py 登入時 select(User).where(User.email == ...) 跑的那句。
EXPLAIN ANALYZE SELECT * FROM "user" WHERE email = 'u12345@lab.test';

-- 要看什麼：同一張表、同一個欄位，只是外面套了 lower()，變成 "Seq Scan"（一列一列翻），慢幾十到幾百倍。
-- 原因：索引是照「email 原文」排序的，lower(email) 的值不在目錄裡。想要大小寫不分的查詢，要另外建 lower(email) 的索引。
EXPLAIN ANALYZE SELECT * FROM "user" WHERE lower(email) = 'u12345@lab.test';

-- 要看什麼：refresh 時 where(RefreshToken.token_hash == hash) 走 ix_refreshtoken_token_hash，Index Scan。
EXPLAIN ANALYZE SELECT * FROM refreshtoken WHERE token_hash = md5('lab-777');

-- 把索引拔掉再查一次：Seq Scan，Execution Time 從 0.0x ms 變成幾十 ms。
-- 20 萬筆就差這麼多；正式環境每次 refresh 都要查一次，沒有索引整個登入系統會被拖垮。
DROP INDEX ix_refreshtoken_token_hash;
EXPLAIN ANALYZE SELECT * FROM refreshtoken WHERE token_hash = md5('lab-777');
-- 建回來（和 migrations/versions/0001 建的一模一樣）
CREATE UNIQUE INDEX ix_refreshtoken_token_hash ON refreshtoken (token_hash);

-- ============================================================
-- 4. N+1：一次查 20 個使用者各有幾個 token
-- ============================================================
-- 錯的做法（N+1）：先查 20 個使用者，再「每個使用者查一次」token 數 → 1 + 20 = 21 次來回。
-- ORM 很容易不小心寫成這樣：for user in users: len(user.tokens)。
-- 下面這句模擬其中「一次」；想像它被執行 20 次，每次都是一趟網路來回（Neon 在新加坡，每趟幾十毫秒）。
SELECT count(*) FROM refreshtoken WHERE user_id = 1;

-- 對的做法：一句 JOIN + GROUP BY，一次來回拿全部。
-- 要看什麼：EXPLAIN 裡 refreshtoken 走 ix_refreshtoken_user_id；整句幾毫秒。
EXPLAIN ANALYZE
SELECT u.id, u.email, count(rt.id) AS tokens, count(rt.id) FILTER (WHERE rt.revoked) AS revoked
FROM "user" u
LEFT JOIN refreshtoken rt ON rt.user_id = u.id
GROUP BY u.id
ORDER BY u.id
LIMIT 20;

-- ============================================================
-- 5. 交易與鎖：refresh 的 with_for_update() 在擋什麼
-- ============================================================
-- 這一段要「兩個視窗」同時做（兩個 psql，或 Neon SQL Editor 開兩個分頁）。
-- 視窗 A：
--   BEGIN;
--   SELECT * FROM refreshtoken WHERE token_hash = md5('lab-777') FOR UPDATE;
--   （先不要 COMMIT）
-- 視窗 B：
--   SELECT * FROM refreshtoken WHERE token_hash = md5('lab-777') FOR UPDATE;
--   → 會卡住不動，直到 A 做 COMMIT 或 ROLLBACK。
-- 視窗 A：
--   UPDATE refreshtoken SET revoked = true WHERE token_hash = md5('lab-777');
--   COMMIT;
-- 視窗 B 這時才拿到資料，而且看到的是 revoked = true。
-- 要看什麼：這就是關卡 1 的「同一個 token 同時來兩個請求，第二個會等第一個做完才讀」。
-- 沒有 FOR UPDATE，兩個請求會同時讀到 revoked = false，兩個都換發成功，重複使用偵測失效。
-- 玩完把它改回來：
UPDATE refreshtoken SET revoked = false WHERE token_hash = md5('lab-777');

-- ============================================================
-- 6. 清掉過期 token：登入時 delete_expired_refresh_tokens 做的事
-- ============================================================
-- 要看什麼：程式是「某個使用者的」過期 token（走 ix_refreshtoken_user_id）；
-- 這裡示範「全部使用者的」，走不了 user_id 索引，Seq Scan 20 萬筆。資料多了這種「全表清理」要排程、分批做。
EXPLAIN ANALYZE DELETE FROM refreshtoken WHERE expires_at < now();

-- ============================================================
-- 7. 清理實驗資料
-- ============================================================
DELETE FROM refreshtoken WHERE user_id IN (SELECT id FROM "user" WHERE email LIKE '%@lab.test');
DELETE FROM "user" WHERE email LIKE '%@lab.test';
SELECT (SELECT count(*) FROM "user") AS users, (SELECT count(*) FROM refreshtoken) AS tokens;
