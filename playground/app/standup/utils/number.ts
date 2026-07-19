export const xToY = (x: number, y: number) => {
  // console.log('[debug] x y', x, y)
  if (isNaN(x) || isNaN(y)) {
    return []
  } else if (x === y) {
    return [x]
  } else if (x > y) {
    return []
  } else {
    // console.log("[debug] len", y-x+1);
    return Array(y - x + 1)
      .fill(0)
      .map((_, idx) => idx + x)
  }
}
