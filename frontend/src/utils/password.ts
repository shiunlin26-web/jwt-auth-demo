/**
 * 【關卡 0】密碼規則，要和後端 schemas.py 一致：8～72 個可列印 ASCII 字元
 * 前端檢查只是為了即時提示，真正的把關在後端（前端檢查可以被繞過）
 *
 * 註冊和改密碼都會用到，所以獨立成一個檔案
 */
export const PASSWORD_HINT = "8～72 個英文字母、數字或符號";

/** 符合規則回傳 null，不符合回傳錯誤訊息 */
export function getPasswordError(password: string): string | null {
  if (!/^[\x20-\x7E]*$/.test(password)) return "密碼只能包含英文字母、數字、空白與符號";
  if (password.length < 8) return "密碼至少 8 個字元";
  if (password.length > 72) return "密碼最多 72 個字元";
  return null;
}
