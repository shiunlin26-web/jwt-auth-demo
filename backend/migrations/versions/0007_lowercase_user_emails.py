"""lowercase user emails

【關卡 20】資料遷移：既有帳號的 email 轉成小寫（schemas.py 的 normalize_email 之後一律存小寫）
不改表結構，所以不是 autogenerate 產生的；alembic check 不受影響

Revision ID: 0007
Revises: 0006
Create Date: 2026-11-05 04:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0007'
down_revision: Union[str, Sequence[str], None] = '0006'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """升級：有大寫字母的 email 轉小寫

    轉完會撞在一起（例如 Test@x.com 和 test@x.com 都存在）時，UPDATE 會被 unique 索引擋下、
    部署失敗。先檢查並給看得懂的錯誤，只印筆數不印 email（部署 log 不放個資）。
    2026-11-05 已在正式與本機資料庫確認沒有這種帳號。
    """
    conn = op.get_bind()
    collisions = conn.execute(
        sa.text('SELECT count(*) FROM (SELECT lower(email) FROM "user" GROUP BY lower(email) HAVING count(*) > 1) AS d')
    ).scalar_one()
    if collisions:
        raise RuntimeError(
            f"有 {collisions} 組帳號轉成小寫後 email 相同，先決定保留哪一個再重跑遷移（SELECT lower(email), array_agg(email) FROM \"user\" GROUP BY 1 HAVING count(*) > 1）"
        )
    op.execute('UPDATE "user" SET email = lower(email) WHERE email <> lower(email)')


def downgrade() -> None:
    """降級：不做事。原本的大小寫沒有留下來，退不回去；全小寫的資料在舊版程式也能用（舊版登入時要打小寫）"""
