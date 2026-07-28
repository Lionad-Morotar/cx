/**
 * ESLint 规则：禁止注释夹带开发追踪标记与外部编号引用（模板）
 *
 * 项目化调整点（复制到 <repo-root>/eslint-plugin-<org>/rules/no-tracking-marker.js 后评估）：
 * ① PATTERNS 形态集与 kind 文案按项目任务系统的编号惯例裁剪（默认覆盖 Phase/任务 ID/切片 ID 等 11 类）
 * ② 豁免与追加形态经 flat config options 注入（allow / additionalPatterns），不改规则本体
 * ③ 排除边界（函内步骤标签、eslint/@ts- 指令注释）为通用设计，一般无需调整
 *
 * ────────────────────────────────────────────────────────────────
 *
 * 追踪编号（任务系统的任务 ID、规划文档的阶段号、评审发现编号）在注释里无法溯源——
 * 任务系统废弃或规划文档删除后，编号成为死引用，读者既不知道它指什么，也无法验证是否仍然成立。
 * 注释应只解释 why（隐含假设、折衷、不稳健之处），需要溯源时用自己的话重述背景。
 *
 * 实现策略：逐注释扫描（getAllComments + .vue 模板 HTMLComment），report 定位到注释节点。
 * 只扫注释不扫字符串与代码——日期、版本号、文案里的数字形态天然免疫。
 *
 * 检测形态与排除边界：
 * - 命中：Phase/Plan 编号、字母-数字对任务 ID（T-04-03/D-13）、无连字符单字母 ID（D11/S3/P1-a）、
 *   纯数字对（17-02）、中文关键词+字母编号（阶段 U1/决策 D2）、括号阶段（（阶段 8））、
 *   CR#/ADR 外部编号、审查溯源措辞（正交审查/审查发现）、flow/teammate 上下文编号、DEFAULT- 前缀、
 *   内部系统路由代号（Route Z——线上系统的内部路由编号，仓库内无任何对应物可溯源）
 * - 排除：函数内步骤标签（"阶段 1 — 认证"/"Step 1:"/"Part A:"）——形态上不含字母+数字组合，自然不匹配；
 *   eslint/@ts- 指令注释——否则 disable 本规则的注释会自我举报，永远无法抑制
 *
 * 已知盲点（unsound，需逃逸时用 allow 选项）：
 * - numeric-pair 会被时间区间误伤（"02:00-04:00" 中的 "00-04"）
 * - bare-id 字母集 [DPTSU] 与实体名冲突（AWS S3、百分位 P95、Google T5）
 * - 长字母前缀编号（如 XXXXXX-01）仅 DEFAULT- 有独立模式
 *
 * 使用注意：
 * - Phase/Plan 大小写敏感是刻意取舍——小写 phase 是普通英文词，大写形态才指向规划文档
 * - allow 为部分匹配（RegExp.test），精确豁免单个 marker 请写锚定形式，如 '^S3$'
 * - allow / additionalPatterns 的正则非法时在 create() 抛错并注明出处，属配置级错误
 * - 本文件为 .js 时若项目 lint 范围只含 ts/tsx/vue，头注释的形态示例不会自举报错；
 *   若 lint 范围含 js，需先删除或改写头注释示例
 */

/** 内置检测模式集；kind 用于报错信息说明命中类别 */
const PATTERNS = [
  { kind: '阶段/计划编号', re: /\b(?:Phase|Plan)\s*\d+/ },
  { kind: '任务编号', re: /\b[A-Z]{1,3}-\d{2}(?:-\d{2})?\b/ },
  // 后随 ASCII 字母的是量词区间（15-18px），不是编号；CJK/标点/空白结尾仍命中
  { kind: '迭代编号', re: /(?<![\d-])\d{2}-\d{2}(?![\dA-Za-z-])/ },
  { kind: '规划残留前缀', re: /\bDEFAULT-\d+\b/ },
  // 字母集刻意收窄：B/F/M 与实体名（Mac M3、Part B2）冲突面大，仅由上下文模式覆盖
  { kind: '任务编号', re: /(?<![\w-])[DPTSU]\d{1,2}(?:-[a-z])?\b/ },
  { kind: '阶段/决策编号', re: /(?:阶段|决策)\s*[A-Z]+\d+\b/ },
  { kind: '阶段编号', re: /[（(]阶段\s*\d+/ },
  { kind: '外部编号', re: /CR#\d+\b|\bADR-?\d+\b/ },
  { kind: '审查溯源', re: /正交审查|审查发现/ },
  { kind: '协作编号', re: /(?:flow|teammate\s+review)\s+[A-Z]\d+\b/i },
  // 大写敏感与 Phase 同理：小写 route 是 HTTP 路由的普通技术词，大写单字母形态才指向内部系统代号
  { kind: '路由代号', re: /\bRoute\s+[A-Z]\b/ },
]

/** eslint/@ts- 指令注释前缀——跳过不扫，避免 disable 注释自我举报 */
const DIRECTIVE_RE = /^\s*(eslint[-\s]|globals?[\s:]|@ts-(?:ignore|nocheck|expect-error))/

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        '禁止注释夹带开发追踪标记与外部编号引用（编号无法从代码溯源，应用自己的话重述 why）',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allow: { type: 'array', items: { type: 'string' } },
          additionalPatterns: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      trackingMarker:
        '注释夹带开发追踪标记 "{{marker}}"（{{kind}}）。编号无法从代码溯源——请删除，或用自己的话重述 why。',
    },
  },
  create(context) {
    const options = context.options[0] ?? {}
    // 非法正则属配置级错误：抛错时注明选项名与原文，否则维护者只能拿到无出处的 SyntaxError 堆栈
    const compile = (src, optName) => {
      try {
        return new RegExp(src)
      } catch (err) {
        throw new Error(
          `no-tracking-marker: 选项 ${optName} 含非法正则 ${JSON.stringify(src)}（${err.message}）`,
          { cause: err }
        )
      }
    }
    const allowRes = (options.allow ?? []).map((src) => compile(src, 'allow'))
    const extraPatterns = (options.additionalPatterns ?? []).map((src) => ({
      kind: '自定义标记',
      re: compile(src, 'additionalPatterns'),
    }))
    const patterns = [...PATTERNS, ...extraPatterns].map(({ kind, re }) => ({
      kind,
      // 同注释同模式的多次命中须全部上报，matchAll 依赖 g flag，统一预编译为全局形态
      scanRe: new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'),
    }))

    /** 单条注释的违规扫描：收集全部未被 allow 豁免的匹配；
     *  被更长匹配包含的视为重复；区间完全相同时保留数组序靠前者（内置模式在前，kind 描述更准确） */
    function scanComment(comment) {
      const value = comment.value
      if (DIRECTIVE_RE.test(value)) return
      const hits = []
      for (const { kind, scanRe } of patterns) {
        for (const match of value.matchAll(scanRe)) {
          if (allowRes.some((allow) => allow.test(match[0]))) continue
          hits.push({
            kind,
            marker: match[0],
            start: match.index,
            end: match.index + match[0].length,
          })
        }
      }
      for (const [i, hit] of hits.entries()) {
        const contained = hits.some(
          (other, j) =>
            j !== i &&
            other.start <= hit.start &&
            other.end >= hit.end &&
            (other.start < hit.start || other.end > hit.end || j < i)
        )
        if (contained) continue
        context.report({
          node: comment,
          messageId: 'trackingMarker',
          data: { marker: hit.marker, kind: hit.kind },
        })
      }
    }

    return {
      'Program:exit'() {
        const { ast } = context.sourceCode
        for (const comment of context.sourceCode.getAllComments()) {
          scanComment(comment)
        }
        // .vue 模板的 HTML 注释不在 getAllComments 中，挂在 templateBody.comments
        for (const comment of ast.templateBody?.comments ?? []) {
          scanComment(comment)
        }
      },
    }
  },
}
