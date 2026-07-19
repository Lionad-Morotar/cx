#!/usr/bin/env node
/**
 * cx 迁移 codemod：alias 重写 + 基于 tsc 错误输出的精确显式导入注入。
 *
 * 用法：
 *   node scripts/codemod-imports.mjs alias <pkgSrcDir> <aliasMapJson>  # 重写 @cx/* alias 为相对路径
 *   node scripts/codemod-imports.mjs fix <pkgSrcDir> <tscOutputFile>   # 按 TS2304/TS2552 错误注入 import
 *
 * 设计：alias 重写是纯机械替换；导入注入只处理类型检查器实报的错误标识符，
 * 不做猜测性注入（避免与文件内局部声明冲突）。
 *
 * 已知盲区：被 @ts-ignore / @ts-nocheck 压制的未定义标识符不会出现在 tsc
 * 输出中（useOmit 漏网即此路径），迁移后需对 KNOWN 之外的 use* / 大写驼峰
 * 裸调用点做一次启发式人工排查。
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { relative, dirname, join, resolve } from 'node:path'
import { readdirSync, statSync } from 'node:fs'

const [mode, srcDir, extra] = process.argv.slice(2)
if (!mode || !srcDir) {
  console.error('usage: codemod-imports.mjs <alias|fix> <srcDir> [aliasMapJson|tscOutputFile]')
  process.exit(1)
}
const SRC = resolve(srcDir)

/** 递归收集 .ts/.vue 文件 */
const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(ts|vue)$/.test(name)) out.push(p)
  }
  return out
}

/** alias 映射：从 JSON 文件读入 per-package 配置，格式 [["^pattern$", "target/subpath"], ...]
 * target 支持 $1..$9 捕获组占位。 */
const loadAliases = (jsonPath) => {
  if (!jsonPath) return []
  const raw = JSON.parse(readFileSync(resolve(process.cwd(), jsonPath), 'utf8'))
  return raw.map(([pattern, target]) => [
    new RegExp(pattern),
    (m) => target.replace(/\$(\d)/g, (_, i) => m[Number(i)] ?? ''),
  ])
}

const toRelative = (file, targetSub) => {
  // 目标可能指向目录的 index 或具体文件；统一先按无扩展名相对路径计算
  const targetAbs = join(SRC, targetSub)
  let rel = relative(dirname(file), targetAbs).replace(/\\/g, '/')
  if (!rel.startsWith('.')) rel = './' + rel
  return rel
}

const rewriteAlias = (file, aliases) => {
  let content = readFileSync(file, 'utf8')
  let changed = false
  content = content.replace(/from\s+(['"])(@cx\/[^'"]+)\1/g, (whole, quote, spec) => {
    for (const [re, fn] of aliases) {
      const m = spec.match(re)
      if (m) {
        changed = true
        return `from ${quote}${toRelative(file, fn(m))}${quote}`
      }
    }
    return whole
  })
  if (changed) writeFileSync(file, content)
  return changed
}

/** 已知标识符 → 模块映射（kind: value|type|default|named-as） */
const KNOWN = {
  ref: ['vue'],
  reactive: ['vue'],
  computed: ['vue'],
  watch: ['vue'],
  watchEffect: ['vue'],
  watchPostEffect: ['vue'],
  watchSyncEffect: ['vue'],
  unref: ['vue'],
  toRef: ['vue'],
  toRefs: ['vue'],
  toValue: ['vue'],
  nextTick: ['vue'],
  inject: ['vue'],
  provide: ['vue'],
  getCurrentInstance: ['vue'],
  onMounted: ['vue'],
  onUnmounted: ['vue'],
  onBeforeUnmount: ['vue'],
  onBeforeMount: ['vue'],
  onUpdated: ['vue'],
  onActivated: ['vue'],
  onDeactivated: ['vue'],
  defineAsyncComponent: ['vue'],
  h: ['vue'],
  markRaw: ['vue'],
  shallowRef: ['vue'],
  shallowReactive: ['vue'],
  triggerRef: ['vue'],
  isRef: ['vue'],
  toRaw: ['vue'],
  useAttrs: ['vue'],
  useSlots: ['vue'],
  useTemplateRef: ['vue'],
  defineComponent: ['vue'],
  isVNode: ['vue'],
  createVNode: ['vue'],
  readonly: ['vue'],
  isReactive: ['vue'],
  isProxy: ['vue'],
  toDisplayString: ['vue'],
  customRef: ['vue'],
  effectScope: ['vue'],
  getCurrentScope: ['vue'],
  onScopeDispose: ['vue'],
  Ref: ['vue', 'type'],
  ComputedRef: ['vue', 'type'],
  MaybeRef: ['vue', 'type'],
  MaybeRefOrGetter: ['vue', 'type'],
  Component: ['vue', 'type'],
  App: ['vue', 'type'],
  InjectionKey: ['vue', 'type'],
  DeepReadonly: ['vue', 'type'],
  VNode: ['vue', 'type'],
  VNodeChild: ['vue', 'type'],
  VNodeNormalizedChildren: ['vue', 'type'],
  CSSProperties: ['vue', 'type'],
  WatchStopHandle: ['vue', 'type'],
  ComponentPublicInstance: ['vue', 'type'],
  PropType: ['vue', 'type'],
  Slot: ['vue', 'type'],
  Slots: ['vue', 'type'],
  ComponentInternalInstance: ['vue', 'type'],
  ConcreteComponent: ['vue', 'type'],
  FunctionalComponent: ['vue', 'type'],
  isArray: ['@vue/shared'],
  isFunction: ['@vue/shared'],
  isObject: ['@vue/shared'],
  isString: ['@vue/shared'],
  isPlainObject: ['@vue/shared'],
  hasOwn: ['@vue/shared'],
  isPromise: ['@vue/shared'],
  camelize: ['@vue/shared'],
  capitalize: ['@vue/shared'],
  hyphenate: ['@vue/shared'],
  NOOP: ['@vue/shared'],
  looseEqual: ['@vue/shared'],
  useMemoize: ['@vueuse/core'],
  watchImmediate: ['@vueuse/core'],
  watchDebounced: ['@vueuse/core'],
  watchThrottled: ['@vueuse/core'],
  watchPausable: ['@vueuse/core'],
  tryOnScopeDispose: ['@vueuse/core'],
  useVModel: ['@vueuse/core'],
  useMounted: ['@vueuse/core'],
  unrefElement: ['@vueuse/core'],
  createSharedComposable: ['@vueuse/core'],
  useEventListener: ['@vueuse/core'],
  useResizeObserver: ['@vueuse/core'],
  useElementSize: ['@vueuse/core'],
  useTimeoutFn: ['@vueuse/core'],
  useIntervalFn: ['@vueuse/core'],
  useDebounceFn: ['@vueuse/core'],
  useThrottleFn: ['@vueuse/core'],
  useCloned: ['@vueuse/core'],
  useLocalStorage: ['@vueuse/core'],
  useMediaQuery: ['@vueuse/core'],
  useBreakpoints: ['@vueuse/core'],
  useCssVar: ['@vueuse/core'],
  useStyleTag: ['@vueuse/core'],
  useRafFn: ['@vueuse/core'],
  useNow: ['@vueuse/core'],
  useScroll: ['@vueuse/core'],
  useWindowSize: ['@vueuse/core'],
  whenever: ['@vueuse/core'],
  until: ['@vueuse/core'],
  computedAsync: ['@vueuse/core'],
  useToggle: ['@vueuse/core'],
  useTitle: ['@vueuse/core'],
  useClipboard: ['@vueuse/core'],
  useDraggable: ['@vueuse/core'],
  useFullscreen: ['@vueuse/core'],
  templateRef: ['@vueuse/core'],
  useCurrentElement: ['@vueuse/core'],
  useMutationObserver: ['@vueuse/core'],
  useIntersectionObserver: ['@vueuse/core'],
  useArraySome: ['@vueuse/core'],
  useArrayEvery: ['@vueuse/core'],
  useDocumentVisibility: ['@vueuse/core'],
  useOnline: ['@vueuse/core'],
  useIdle: ['@vueuse/core'],
  createEventHook: ['@vueuse/core'],
  createReusableTemplate: ['@vueuse/core'],
  useElementHover: ['@vueuse/core'],
  useDebounce: ['@vueuse/core'],
  refDebounced: ['@vueuse/core'],
  AnyFn: ['@vueuse/core', 'type'],
  get: ['lodash-es'],
  set: ['lodash-es'],
  unset: ['lodash-es'],
  cloneDeep: ['lodash-es'],
  merge: ['lodash-es'],
  values: ['lodash-es'],
  pick: ['lodash-es'],
  omit: ['lodash-es'],
  isEqual: ['lodash-es'],
  debounce: ['lodash-es'],
  throttle: ['lodash-es'],
  kebabCase: ['lodash-es'],
  camelCase: ['lodash-es'],
  upperFirst: ['lodash-es'],
  lowerFirst: ['lodash-es'],
  snakeCase: ['lodash-es'],
  startCase: ['lodash-es'],
  groupBy: ['lodash-es'],
  keyBy: ['lodash-es'],
  sortBy: ['lodash-es'],
  uniq: ['lodash-es'],
  uniqBy: ['lodash-es'],
  flatten: ['lodash-es'],
  compact: ['lodash-es'],
  chunk: ['lodash-es'],
  range: ['lodash-es'],
  sample: ['lodash-es'],
  shuffle: ['lodash-es'],
  orderBy: ['lodash-es'],
  difference: ['lodash-es'],
  intersection: ['lodash-es'],
  union: ['lodash-es'],
  without: ['lodash-es'],
  isEmpty: ['lodash-es'],
  isBoolean: ['lodash-es'],
  isNil: ['lodash-es'],
  BigNumber: ['bignumber.js', 'default'],
  uuidv4: ['uuid', 'named-as', 'v4'],
  mitt: ['mitt', 'default'],
  z: ['zod'],
  dayjs: ['dayjs', 'default'],
  Fuse: ['fuse.js', 'default'],
  // radashi use* 别名族（p-ray 经 Nuxt imports preset 从 radashi 全量 use* 化 auto-import）
  // 仅收录与 lodash-es 语义等价的条目；无等价物的走 [skip] 人工处理
  withDirectives: ['vue'],
  has: ['@lionad/cx-definition'],
  not: ['@lionad/cx-definition'],
  useMacroTask: ['@lionad/cx-definition'],
  useHooks: ['@lionad/cx-definition'],
  useCleanups: ['@lionad/cx-definition'],
  useSleep: ['@lionad/cx-definition'],
  safeNum: ['@lionad/cx-definition'],
  useMountedWatchImmediate: ['@lionad/cx-vue'],
  useMountedWatch: ['@lionad/cx-vue'],
  useMountedOnce: ['@lionad/cx-vue'],
  useMountedOnceImmediate: ['@lionad/cx-vue'],
  useCxBEM: ['@lionad/cx-vue'],
  useCxState: ['@lionad/cx-vue'],
  useCxEditMode: ['@lionad/cx-vue'],
  useCmptSlots: ['@lionad/cx-vue'],
  Time: ['@lionad/cx-vue'],
  useQueryCached: ['@lionad/cx-vue'],
  useTempPortalRoot: ['@lionad/cx-vue'],
  resetTempPortalRoot: ['@lionad/cx-vue'],
  useKeyStrokeWhen: ['@lionad/cx-vue'],
  useSharedMouse: ['@lionad/cx-vue'],
  useSharedWindowScroll: ['@lionad/cx-vue'],
  useAsync: ['@lionad/cx-vue'],
  useBEM: ['@lionad/cx-vue'],
  useQuery: ['@lionad/cx-vue'],
  useSize: ['@lionad/cx-vue'],
  useSizeOptions: ['@lionad/cx-vue'],
  safeIcon: ['@lionad/cx-vue'],
  useOmit: ['lodash-es', 'named-as', 'omit'],
  tm: ['tailwind-merge', 'named-as', 'twMerge'],
  usePick: ['lodash-es', 'named-as', 'pick'],
  useGet: ['lodash-es', 'named-as', 'get'],
  useClone: ['@lionad/cx-vue'],
}

/** 在文件内容中注入 import 语句（.ts 插到文件头，.vue 插到错误所在 script 块内） */
const injectImport = (content, file, name, spec, lineNo) => {
  const [module, kind, as] = spec
  const isType = kind === 'type'
  const clause = kind === 'default' ? name : kind === 'named-as' ? `${as} as ${name}` : name

  // 已有同模块 import → 尝试合并命名导入
  // 注意：值导入不能并入 import type；类型导入并入值导入时内联 type 修饰
  const modRe = new RegExp(
    `import\\s+(type\\s+)?\\{([^}]*)\\}\\s+from\\s+['"]${module.replace('/', '\\/')}['"]`,
  )
  const existing = content.match(modRe)
  if (existing && kind !== 'default') {
    const isExistingTypeOnly = Boolean(existing[1])
    // 精确成员判断：按逗号拆分并去掉内联 type 修饰后全等比较
    const members = existing[2].split(',').map((x) =>
      x
        .trim()
        .replace(/^type\s+/, '')
        .replace(/\s+as\s+.*$/, ''),
    )
    if (members.includes(name)) return content
    if (isExistingTypeOnly && !isType) {
      // 值导入需要独立语句，落到下方 stmt 逻辑
    } else {
      const clauseInMerge = isExistingTypeOnly || !isType ? clause : `type ${clause}`
      const merged = existing[2].trim().endsWith(',')
        ? `{${existing[2]} ${clauseInMerge}}`
        : `{${existing[2]}, ${clauseInMerge}}`
      return content.replace(modRe, `import ${existing[1] || ''}${merged} from '${module}'`)
    }
  }

  const stmt = `import ${isType ? 'type ' : ''}${kind === 'default' ? clause : `{ ${clause} }`} from '${module}'\n`

  if (file.endsWith('.vue')) {
    // 收集全部 script 块区间，优先注入包含错误行的块（双 script 块 SFC 场景）
    const blocks = [...content.matchAll(/<script[^>]*>/g)].map((m) => ({
      openEnd: m.index + m[0].length,
      start: m.index,
      tag: m[0],
    }))
    if (blocks.length && lineNo) {
      // 以开标签行号近似判断归属（块结束标签行号无需精确）
      const lineOf = (idx) => content.slice(0, idx).split('\n').length
      const owner = blocks.find((b, i) => {
        const from = lineOf(b.start)
        const to = i + 1 < blocks.length ? lineOf(blocks[i + 1].start) : Number.MAX_SAFE_INTEGER
        return lineNo >= from && lineNo < to
      })
      if (owner) {
        return content.slice(0, owner.openEnd) + '\n' + stmt + content.slice(owner.openEnd)
      }
    }
    // 退化：优先 <script setup>，否则第一个 script 块
    const setupMatch = content.match(/<script[^>]*\bsetup\b[^>]*>\s*/)
    if (setupMatch) {
      const idx = setupMatch.index + setupMatch[0].length
      return content.slice(0, idx) + stmt + content.slice(idx)
    }
    return content.replace(/(<script[^>]*>\s*)/, `$1${stmt}`)
  }
  // 插到最后一个 import 之后，否则文件头
  const imports = [...content.matchAll(/^import .*$/gm)]
  if (imports.length) {
    const last = imports.at(-1)
    const idx = last.index + last[0].length
    return content.slice(0, idx) + '\n' + stmt.trimEnd() + content.slice(idx)
  }
  return stmt + content
}

const fixFromTscOutput = (outFile) => {
  const output = readFileSync(outFile, 'utf8')
  // 兼容两种输出格式：tsgo `file(行,列):` 与 vue-tsgo `file:行:列 -`
  const re =
    /^([^\s(]+\.(?:ts|vue))(?:\((\d+),(\d+)\)|:(\d+):\d+)\s*[-:]\s*error TS2(?:304|552): Cannot find name '([^']+)'/gm
  const byFile = new Map()
  let m
  while ((m = re.exec(output))) {
    const [, rawPath, lineA, , lineB, name] = m
    const lineNo = Number(lineA ?? lineB ?? 0)
    const file = resolve(process.cwd(), rawPath)
    if (!file.startsWith(SRC)) continue
    if (!KNOWN[name]) {
      console.log(`[skip] 未知标识符 ${name} @ ${file}`)
      continue
    }
    if (!byFile.has(file)) byFile.set(file, new Map())
    byFile.get(file).set(name, { spec: KNOWN[name], lineNo })
  }
  for (const [file, names] of byFile) {
    let content = readFileSync(file, 'utf8')
    for (const [name, { spec, lineNo }] of names) {
      content = injectImport(content, file, name, spec, lineNo)
    }
    writeFileSync(file, content)
    console.log(`[fix] ${file.replace(SRC, 'src')}: +${[...names.keys()].join(', ')}`)
  }
}

if (mode === 'alias') {
  const aliases = loadAliases(extra)
  if (!aliases.length) {
    console.error('alias 模式需要映射 JSON：[[ "^pattern$", "target/subpath" ], ...]')
    process.exit(1)
  }
  const files = walk(SRC)
  let n = 0
  for (const f of files) if (rewriteAlias(f, aliases)) n++
  console.log(`alias 重写完成：${n}/${files.length} 文件变更`)
} else if (mode === 'fix') {
  if (!extra) {
    console.error('fix 模式需要 tsc 输出文件')
    process.exit(1)
  }
  fixFromTscOutput(extra)
} else {
  console.error(`未知模式 ${mode}`)
  process.exit(1)
}
