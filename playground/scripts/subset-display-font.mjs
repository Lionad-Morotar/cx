/**
 * 展示字体子集化：Archivo 可变字体 → standup-display.woff2。
 *
 * 字形集只保留站会页面展示排版用到的字符（数字、星期缩写、序数后缀与
 * 少量分隔符），体积从数百 KB 压到个位数 KB。源 TTF 放 zRefs/（全局 ignore），
 * 产物 woff2 入库；需要更新字形集时改 GLYPHS 重跑本脚本。
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import subsetFont from 'subset-font'

const GLYPHS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZstndrh /:-.·'

const source = readFileSync(new URL('../zRefs/fonts/Archivo-variable.ttf', import.meta.url))
const woff2 = await subsetFont(source, GLYPHS, { targetFormat: 'woff2' })

const outDir = new URL('../app/standup/assets/fonts/', import.meta.url)
mkdirSync(outDir, { recursive: true })
writeFileSync(new URL('./standup-display.woff2', outDir), woff2)

console.log(`subset ok: ${woff2.length} bytes, ${GLYPHS.length} glyphs`)
