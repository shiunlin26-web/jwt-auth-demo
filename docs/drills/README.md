# 故障演練（關卡 20）

每個 `.patch` 是一個刻意埋進去的 bug。**不要先看 patch 的內容**，照 `LEARNING.md` 關卡 20 的流程：套上去 → 用症狀、log、測試找出原因 → 修好或還原 → 再對答案。

```bash
git apply docs/drills/01.patch   # 套上去（在 repo 根目錄）
git status                       # 看它改了哪個檔案（這是允許的提示）
# ……找出問題……
git checkout -- backend frontend # 還原
```

答案在 `LEARNING.md` 關卡 20 的折疊區。
