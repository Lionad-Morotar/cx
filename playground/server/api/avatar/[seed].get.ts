// 本地 SVG 头像：无外网依赖，满足断网自洽；同一 seed 稳定产出同一色相
export default defineEventHandler(async (event) => {
  const seed = getRouterParam(event, 'seed') || '?'

  // FNV-1a 轻量哈希 → HSL 色相
  let h = 2166136261
  for (const ch of seed) {
    h ^= ch.codePointAt(0) || 0
    h = Math.imul(h, 16777619)
  }
  const hue = (h >>> 0) % 360
  const initial = ([...seed][0] || '?').toUpperCase().replace(/[<>&"']/g, '?')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="10" fill="hsl(${hue}, 62%, 52%)"/><text x="50%" y="50%" dy="0.36em" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="30" fill="#ffffff">${initial}</text></svg>`
  setResponseHeader(event, 'content-type', 'image/svg+xml; charset=utf-8')
  setResponseHeader(event, 'cache-control', 'public, max-age=86400')
  return svg
})
