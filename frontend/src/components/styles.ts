/** 【關卡 6】幾個元件共用的樣式 */
import type { CSSProperties } from "react";

export const inputStyle: CSSProperties = {
  display: "block",
  width: "100%",
  marginBottom: 8,
  padding: 8,
  boxSizing: "border-box",
};

export const rowStyle: CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap" };

export function hintStyle(isError: boolean): CSSProperties {
  return { fontSize: 12, margin: "0 0 8px", color: isError ? "crimson" : "gray" };
}
