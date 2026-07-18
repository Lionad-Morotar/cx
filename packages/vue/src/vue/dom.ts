/**
 * DOM 测量工具（按 use-cx-re-render 的实际需要裁剪内化，
 * p-ray 原版 composables/dom/index.ts 的其余成员未被 cx 使用）。
 */
export const getRect = (x: HTMLElement | null) => {
  return x ? x.getBoundingClientRect() : null
}

export const getStyle = (x: HTMLElement | null) => {
  return x ? window.getComputedStyle(x) : null
}
