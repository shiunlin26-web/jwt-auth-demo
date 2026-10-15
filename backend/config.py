"""【關卡 2】集中管理所有設定

原本設定散落在各檔案：database.py、security.py 各自 load_dotenv() + os.getenv()，
CORS 網址、cookie 的 secure 直接寫死在程式碼裡。

現在全部集中在這裡，好處是：
1. 一眼看到這個專案有哪些設定、預設值是什麼
2. 型別自動轉換：.env 裡都是字串，這裡會自動轉成 int、bool
3. 啟動時就檢查：必填的沒填、格式不對，後端直接起不來（fail fast），
   不會等到有人登入時才爆 500
"""

from pathlib import Path

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # 告訴 pydantic-settings 去讀 backend/.env
    # （用 config.py 所在的資料夾定位，不管從哪個目錄啟動 uvicorn 都找得到）
    # 欄位名稱不分大小寫：.env 裡寫 JWT_SECRET，這裡用 jwt_secret 就能對上
    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent / ".env",
        extra="ignore",  # .env 裡有這裡沒定義的變數時忽略，不要報錯
    )

    # ---- 必填（沒有預設值，.env 沒填就啟動失敗）----
    database_url: str
    # HS256 建議金鑰至少 32 bytes，太短容易被暴力破解（PyJWT 也會警告）
    jwt_secret: str = Field(min_length=32)

    # ---- 選填（有預設值）----
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # 允許哪些前端網址呼叫 API，多個用逗號分隔
    cors_origins: str = "http://localhost:5173"

    # refresh token cookie 是否只在 HTTPS 傳送。本機是 http 所以預設 False，正式環境要 True
    cookie_secure: bool = False

    # 【關卡 4】跑測試用的資料庫。測試會清空資料表，所以一定要和 DATABASE_URL 不同！
    # 只有跑 pytest 才需要，平常啟動後端不用設定
    test_database_url: str | None = None

    # 是否把每一句 SQL 印在 terminal。學習時可以打開看，平常關掉（會印出 token 雜湊等敏感資料）
    db_echo: bool = False

    # ---- 【關卡 11】維護相關 ----
    # log 等級：DEBUG / INFO / WARNING / ERROR
    log_level: str = "INFO"
    # log 要不要輸出成 JSON（一行一筆、機器好讀）。本機看文字比較舒服，正式環境用 JSON
    log_json: bool = False
    # Sentry 的 DSN（錯誤追蹤服務給你的網址）。沒設定就不啟用，本機通常不設
    sentry_dsn: str | None = None
    # 目前跑的是哪個 commit。Render 會自動注入 RENDER_GIT_COMMIT，/api/health 會回傳它，
    # 讓你一眼確認「線上跑的是不是我剛推的那版」
    app_version: str | None = Field(
        default=None, validation_alias=AliasChoices("APP_VERSION", "RENDER_GIT_COMMIT")
    )
    # 是否開放除錯用的端點（例如故意丟例外測 Sentry）。正式環境平常關閉，要演練時再暫時打開
    enable_debug_endpoints: bool = False

    # 【關卡 17】登入與註冊的頻率限制（slowapi 的格式："10/minute"、"100/hour"）
    rate_limit_enabled: bool = True
    auth_rate_limit: str = "10/minute"
    # 前面有幾層可信的代理（決定從 X-Forwarded-For 的哪一段取客戶端 IP，見 rate_limit.py）。
    # 本機 0；只有 Render 1；Vercel + Render 2（render.yaml 設 2）
    trusted_proxy_hops: int = 0

    @property
    def cors_origin_list(self) -> list[str]:
        """把 "a,b,c" 轉成 ["a", "b", "c"]"""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


# 整個專案共用這一個 settings 物件：from config import settings
# 建立的當下就會讀 .env 並驗證，有錯就直接丟例外 → 後端啟動失敗
# pyright 看不懂 pydantic-settings「必填欄位從環境變數來」的魔法，會以為少傳參數，這一行關掉它的檢查
settings = Settings()  # pyright: ignore[reportCallIssue]
