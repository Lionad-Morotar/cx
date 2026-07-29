/**
 * ESLint 规则：组件必须拥有与文件路径一致的规范名（cx 落地版）
 *
 * cx 适配决策（相对 flow-dx 模板）：
 * 1. prefix 经 option 显式传入（'cx'），规则无默认值（fail-loud 防漏配）
 * 2. 路径推导新增 cx 物料分支：packages/<pkg>/src/**\/*.vue 与 app/(standup/)components/**\/*.vue；
 *    basename 为 index 时回退父目录，父目录为 src/ui 等容器段时再上一层
 *    （accordion/src/index.vue → cx-accordion；dashboard-card/ui/index.vue → cx-dashboard-card）
 * 3. 根 class 校验对 BEM 豁免：cx 物料根 class 是 :class="ns.b()"（useCxBEM 运行时生成
 *    cx-<block>，与规范名同源），字面量收集无法覆盖——:class 含块级 .b() 调用即视为标记类存在
 * 4. 开启本规则的层必须同时关闭 'vue/component-definition-name-casing'——
 *    它强制 PascalCase 一种风格，与本规则的 case 宽容（kebab/camel 手写名同样合法）冲突
 * 5. 普通 script 块（非 setup）捕获 export default defineComponent({...}) 的参数对象作 name 容器；
 *    defineOptions 是 setup 专属编译器宏，无对象可修的普通块只报告不修复
 *
 * 双点校验（均按 error 处理）：
 * 1. Component Option Name —— defineOptions({ name })（script setup）或 Options API 的 name
 * 2. 根元素 class —— 规范名出现在首个元素根的静态 class / :class 字面量 / 块级 BEM 调用中
 *
 * 命名推导（kebab-case）：
 * - app/layouts/<name>.vue      → layout-<name>
 * - app/pages/<rel>.vue         → page-<路径段>（尾段 index 省略，[id] 动态段去括号）
 * - packages/<pkg>/src/<...>/<name>.vue → <prefix>-<name>（index 回退父目录，容器段再上）
 * - app/(standup/)components/<...>/<name>.vue → 同上
 *
 * fixer：缺 option name 时自动插入 defineOptions/name；缺根 class 时自动 prepend；
 * name 语义不匹配时改写为推导名（unsound：name 可能被 keep-alive include 字符串引用，fix 后需人工确认缓存匹配）。
 * fixer 统一产出 PascalCase（cx 约定 defineOptions name 为 Cx 前缀 PascalCase；case 宽容保证后续改写不报错）。
 *
 * case 宽容：本规则只检测"名字的存在与一致"（name 与文件路径语义对应），不强制 casing 风格——
 * kebab 化后相等即视为命中（如期望 cx-text 时 CxText / cxText / cx_text 均通过），
 * 后续被改成其他 case 不报错。
 */

/** PascalCase/camelCase/下划线 → kebab-case */
export function toKebab(name) {
  return name
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase()
}

/** kebab-case → PascalCase（fixer 产物风格：cx 约定 defineOptions name 为 Cx 前缀 PascalCase） */
export function toPascal(kebab) {
  return kebab
    .split('-')
    .filter(Boolean)
    .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1))
    .join('')
}

/** 路径段规范化：[id] → id，(kebab 化) */
function normalizeSegment(segment) {
  const unwrapped = segment.replace(/^\[(.+)\]$/, '$1')
  return toKebab(unwrapped)
}

/** basename 为 index 时的回退：取父目录；父目录为容器段（src/ui 等）时再上一层 */
const CONTAINER_SEGMENTS = new Set(['src', 'ui', 'cmpts', 'comps'])

function deriveBaseName(segments) {
  let base = segments[segments.length - 1]
  let depth = segments.length - 1
  while (depth > 0 && (base === 'index' || CONTAINER_SEGMENTS.has(base))) {
    depth -= 1
    base = segments[depth]
  }
  return base
}

/**
 * 由文件路径推导规范组件名；非目标文件（非 layouts/pages/components/物料下的 .vue）返回 null
 * @param {string} filename 物理路径（允许相对路径，允许 \ 分隔）
 * @param {{ prefix?: string, packagePrefixes?: Record<string, string> }} [options]
 *   prefix 为组件名推导的必填项，缺失时抛错（layout/page 推导不需要）；
 *   packagePrefixes 按包名覆盖前缀（物料包中缀体系，如 comps-nuxt-ui-v4 → cx-nuxt-ui-v4）
 */
export function deriveComponentName(filename, options = {}) {
  const prefix = options.prefix
  const normalized = filename.replace(/\\/g, '/')

  const layoutMatch = normalized.match(/(?:^|\/)app\/layouts\/([^/]+)\.vue$/)
  if (layoutMatch) {
    return `layout-${toKebab(layoutMatch[1])}`
  }

  const pageMatch = normalized.match(/(?:^|\/)app\/pages\/(.+)\.vue$/)
  if (pageMatch) {
    const segments = pageMatch[1].split('/').map(normalizeSegment)
    if (segments.length > 1 && segments[segments.length - 1] === 'index') {
      segments.pop()
    }
    return `page-${segments.join('-')}`
  }

  // cx 物料与业务组件：packages/<pkg>/src/**/*.vue、app/(standup/)components/**/*.vue
  const pkgMatch = normalized.match(/(?:^|\/)packages\/([^/]+)\/src\/(.+)\.vue$/)
  const appMatch = normalized.match(/(?:^|\/)app\/(?:standup\/)?components\/(.+)\.vue$/)
  if (pkgMatch ?? appMatch) {
    const effectivePrefix = pkgMatch ? (options.packagePrefixes?.[pkgMatch[1]] ?? prefix) : prefix
    if (!effectivePrefix) {
      // 缺配置必须抛错而非静默兜底——兜底默认值会让"忘配 prefix"的项目无声地用上别人的前缀
      throw new Error(
        "require-component-name: 缺少 prefix 配置。请在 flat config 中显式设置，如 'require-component-name': ['error', { prefix: 'cx' }]（1~2 字符组织缩写，CSS class 不能以数字开头）"
      )
    }
    const segments = (pkgMatch ? pkgMatch[2] : appMatch[1]).split('/')
    return `${effectivePrefix}-${toKebab(deriveBaseName(segments))}`
  }

  return null
}

/** 无法挂载 class 的根标签（无自身根 DOM 或 fallthrough 不可靠），跳过 class 校验 */
const CLASSLESS_ROOT_TAGS = new Set([
  'slot',
  'template',
  'transition',
  'transition-group',
  'teleport',
  'keep-alive',
  'suspense',
  'router-view',
  'client-only',
])

/** 收集 :class 绑定表达式中的所有字符串字面量类名 */
function collectClassLiterals(node, out = new Set()) {
  if (!node) return out
  if (node.type === 'Literal' && typeof node.value === 'string') {
    node.value.split(/\s+/).forEach((cls) => cls && out.add(cls))
  } else if (node.type === 'TemplateLiteral') {
    for (const quasi of node.quasis) {
      quasi.value.raw.split(/\s+/).forEach((cls) => cls && out.add(cls))
    }
  } else if (node.type === 'ArrayExpression') {
    for (const el of node.elements) collectClassLiterals(el, out)
  } else if (node.type === 'ObjectExpression') {
    for (const prop of node.properties) {
      if (prop.type === 'Property') collectClassLiterals(prop.key, out)
    }
  } else if (node.type === 'ConditionalExpression') {
    collectClassLiterals(node.consequent, out)
    collectClassLiterals(node.alternate, out)
  } else if (node.type === 'LogicalExpression') {
    collectClassLiterals(node.left, out)
    collectClassLiterals(node.right, out)
  }
  return out
}

/** 表达式中是否含块级 BEM 调用（ns.b()）：cx 物料的根标记类由 useCxBEM 运行时生成 */
function hasBemBlockCall(node) {
  if (!node || typeof node !== 'object') return false
  if (
    node.type === 'CallExpression' &&
    node.callee.type === 'MemberExpression' &&
    !node.callee.computed &&
    node.callee.property.type === 'Identifier' &&
    node.callee.property.name === 'b'
  ) {
    return true
  }
  for (const key of Object.keys(node)) {
    if (key === 'parent') continue
    const child = node[key]
    if (Array.isArray(child)) {
      if (child.some(hasBemBlockCall)) return true
    } else if (child && typeof child === 'object' && hasBemBlockCall(child)) {
      return true
    }
  }
  return false
}

/** 根元素是否已包含期望类名（静态 class、:class 字面量，或块级 BEM 调用） */
function rootElementHasClass(element, expected) {
  const classes = new Set()
  for (const attr of element.startTag.attributes) {
    if (attr.type === 'VAttribute' && !attr.directive && attr.key.name === 'class' && attr.value) {
      attr.value.value.split(/\s+/).forEach((cls) => cls && classes.add(cls))
    } else if (
      attr.type === 'VAttribute' &&
      attr.directive &&
      attr.key.name.name === 'bind' &&
      attr.key.argument &&
      attr.key.argument.type === 'VIdentifier' &&
      attr.key.argument.name === 'class' &&
      attr.value
    ) {
      collectClassLiterals(attr.value.expression, classes)
      // cx BEM 体系：:class="ns.b()" 运行时生成 cx-<block>，与规范名同源，视为标记类存在
      if (hasBemBlockCall(attr.value.expression)) return true
    }
  }
  // case 变体等价: class 写作 PascalCase/camelCase 等风格同样视为命中(kebab 化后比较)
  return [...classes].some((cls) => toKebab(cls) === expected)
}

/** case 宽容比对：kebab 化相等，或去连字符后相等（UIV4/LinkedIn 等分段歧义豁免——词序列相同仅分段风格不同） */
function nameEquals(actual, expected) {
  const kebab = toKebab(actual)
  return kebab === expected || kebab.replace(/-/g, '') === expected.replace(/-/g, '')
}

/** 找根元素的静态 class 属性节点 */
function findStaticClassAttr(element) {
  return element.startTag.attributes.find(
    (attr) =>
      attr.type === 'VAttribute' && !attr.directive && attr.key.name === 'class' && attr.value
  )
}

/** 从 defineOptions({...}) 或 export default {...} 的对象中取 name 属性 */
function getNameProperty(objExpr) {
  return objExpr.properties.find(
    (prop) =>
      prop.type === 'Property' &&
      !prop.computed &&
      ((prop.key.type === 'Identifier' && prop.key.name === 'name') ||
        (prop.key.type === 'Literal' && prop.key.value === 'name'))
  )
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description: '组件必须声明与文件路径一致的 Option Name 并作为根元素标记类',
    },
    schema: [
      {
        type: 'object',
        properties: {
          prefix: { type: 'string' },
          // 按包名覆盖前缀（物料包中缀体系）：{ 'comps-nuxt-ui-v4': 'cx-nuxt-ui-v4' }
          packagePrefixes: {
            type: 'object',
            additionalProperties: { type: 'string' },
          },
          // 薄包装物料包跳过根 class 校验（根为第三方组件，DOM 类体系由被包装组件控制）
          skipRootClassPackages: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingOptionName:
        "组件缺少 Option Name。应声明 defineOptions({ name: '{{expected}}' })（名称由文件路径推导）。",
      mismatchedOptionName:
        '组件 Option Name "{{actual}}" 与文件路径不匹配（期望 "{{expected}}"；case 变体如 PascalCase/camelCase 视为等价，不强制风格）。',
      missingRootClass: '组件根元素缺少标记类 "{{expected}}"。规范名必须作为根 DOM 的 class 存在。',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode
    const expected = deriveComponentName(context.filename, context.options[0] ?? {})
    if (!expected) return {}

    // 薄包装物料包（根为第三方组件、DOM 类体系由被包装组件控制）跳过根 class 校验
    const pkgName = context.filename.replace(/\\/g, '/').match(/(?:^|\/)packages\/([^/]+)\//)?.[1]
    const skipRootClass = pkgName
      ? (context.options[0]?.skipRootClassPackages ?? []).includes(pkgName)
      : false

    let defineOptionsCall = null
    let exportDefaultObj = null

    return {
      CallExpression(node) {
        if (
          !defineOptionsCall &&
          node.callee.type === 'Identifier' &&
          node.callee.name === 'defineOptions'
        ) {
          defineOptionsCall = node
        }
      },
      ExportDefaultDeclaration(node) {
        if (node.declaration.type === 'ObjectExpression') {
          exportDefaultObj = node.declaration
          return
        }
        // export default defineComponent({...})：name 属于 defineComponent 的参数对象，
        // 不捕获会漏判后由 fixer 向普通 script 块误插 defineOptions（仅 setup 块可用的编译器宏）
        if (
          node.declaration.type === 'CallExpression' &&
          node.declaration.callee.type === 'Identifier' &&
          node.declaration.callee.name === 'defineComponent' &&
          node.declaration.arguments[0]?.type === 'ObjectExpression'
        ) {
          exportDefaultObj = node.declaration.arguments[0]
        }
      },
      'Program:exit'(program) {
        // --- 校验 1: Option Name -----------------------------------------
        const optionObj =
          defineOptionsCall && defineOptionsCall.arguments[0]?.type === 'ObjectExpression'
            ? defineOptionsCall.arguments[0]
            : exportDefaultObj

        if (optionObj) {
          const nameProp = getNameProperty(optionObj)
          if (!nameProp) {
            context.report({
              node: optionObj,
              messageId: 'missingOptionName',
              data: { expected },
              fix(fixer) {
                if (optionObj.properties.length === 0) {
                  return fixer.replaceText(optionObj, `{ name: '${toPascal(expected)}' }`)
                }
                const firstProp = optionObj.properties[0]
                // defineOptions 单行对象用行内插入；export default 多行对象换行并保持缩进
                if (optionObj.loc.start.line === optionObj.loc.end.line) {
                  return fixer.insertTextBefore(firstProp, `name: '${toPascal(expected)}', `)
                }
                const indent = ' '.repeat(firstProp.loc.start.column)
                return fixer.insertTextBefore(firstProp, `name: '${toPascal(expected)}',\n${indent}`)
              },
            })
          } else if (
            nameProp.value.type === 'Literal' &&
            typeof nameProp.value.value === 'string' &&
            !nameEquals(nameProp.value.value, expected)
          ) {
            context.report({
              node: nameProp.value,
              messageId: 'mismatchedOptionName',
              data: { actual: nameProp.value.value, expected },
              fix(fixer) {
                // unsound: Option Name 可能被 keep-alive :include/:exclude 字符串引用,
                // fix 改名后需人工确认缓存匹配仍有效(本仓库无 keep-alive 引用,安全)
                return fixer.replaceText(nameProp.value, `'${toPascal(expected)}'`)
              },
            })
          }
        } else if (program.body.length > 0) {
          // script setup：在最后一个 import 后（无 import 则在首个语句前）插入 defineOptions；
          // 普通 script 块（无 export default 对象的畸形形态）不可用编译器宏，只报告不修复
          const fragment = sourceCode.parserServices?.getDocumentFragment?.()
          const setupScriptEl = fragment?.children.find(
            (child) =>
              child.type === 'VElement' &&
              child.name === 'script' &&
              child.startTag.attributes.some(
                (attr) => attr.type === 'VAttribute' && !attr.directive && attr.key.name === 'setup'
              )
          )
          context.report({
            node: program.body[0],
            messageId: 'missingOptionName',
            data: { expected },
            fix: setupScriptEl
              ? (fixer) => {
                  const imports = program.body.filter((s) => s.type === 'ImportDeclaration')
                  const lastImport = imports[imports.length - 1]
                  if (lastImport) {
                    return fixer.insertTextAfter(
                      lastImport,
                      `\n\ndefineOptions({ name: '${toPascal(expected)}' })`
                    )
                  }
                  return fixer.insertTextBefore(
                    program.body[0],
                    `defineOptions({ name: '${toPascal(expected)}' })\n\n`
                  )
                }
              : null,
          })
        } else {
          // script 块为空(纯模板组件的空 script setup): 在 script 开标签后直接插入;
          // 无 script 或非 setup 块时 defineOptions 不可用, 只报告不修复
          const fragment = sourceCode.parserServices?.getDocumentFragment?.()
          const scriptEl = fragment?.children.find(
            (child) =>
              child.type === 'VElement' &&
              child.name === 'script' &&
              child.startTag.attributes.some(
                (attr) => attr.type === 'VAttribute' && !attr.directive && attr.key.name === 'setup'
              )
          )
          context.report({
            node: program,
            messageId: 'missingOptionName',
            data: { expected },
            fix: scriptEl
              ? (fixer) =>
                  fixer.insertTextAfterRange(
                    [scriptEl.startTag.range[1], scriptEl.startTag.range[1]],
                    `\ndefineOptions({ name: '${toPascal(expected)}' })\n`
                  )
              : null,
          })
        }

        // --- 校验 2: 根元素 class -----------------------------------------
        // 新版 vue-eslint-parser 的 services 不再暴露 templateBody 属性,
        // 经 getDocumentFragment() 取 SFC fragment,其 <template> VElement 的 children 即页面根节点
        if (skipRootClass) return

        const fragment = sourceCode.parserServices?.getDocumentFragment?.()
        const templateEl = fragment?.children.find(
          (child) => child.type === 'VElement' && child.name === 'template'
        )
        if (!templateEl) return

        const rootElements = (templateEl.children ?? []).filter(
          (child) => child.type === 'VElement'
        )
        const checkable = rootElements.filter(
          (el) => !CLASSLESS_ROOT_TAGS.has(el.name.toLowerCase())
        )
        if (checkable.length === 0) return
        if (checkable.some((el) => rootElementHasClass(el, expected))) return

        const target = checkable[0]
        context.report({
          node: target.startTag,
          messageId: 'missingRootClass',
          data: { expected },
          fix(fixer) {
            const staticClass = findStaticClassAttr(target)
            if (staticClass) {
              return fixer.replaceText(
                staticClass.value,
                `"${expected} ${staticClass.value.value}"`
              )
            }
            // vue/attributes-order：class（OTHER_ATTR）须位于事件与内容指令之前——
            // 插到首个 @/v-on: 或 v-html/v-text 属性前，否则 fixer 产物自身违反属性序
            const eventLikeAttr = target.startTag.attributes.find(
              (attr) =>
                attr.type === 'VAttribute' &&
                attr.directive &&
                ['on', 'html', 'text'].includes(attr.key.name.name)
            )
            if (eventLikeAttr) {
              return fixer.insertTextBefore(eventLikeAttr, `class="${expected}" `)
            }
            // 插入点: 开标签收尾符(> 或 />)之前的尾部空白之前,保持既有空白风格
            const tagText = sourceCode.text.slice(
              target.startTag.range[0],
              target.startTag.range[1]
            )
            const closeLen = target.startTag.selfClosing ? 2 : 1
            const bodyBeforeClose = tagText.slice(0, tagText.length - closeLen)
            const trailingWs = bodyBeforeClose.match(/\s*$/)[0].length
            const insertPos = target.startTag.range[1] - closeLen - trailingWs
            return fixer.insertTextAfterRange([insertPos, insertPos], ` class="${expected}"`)
          },
        })
      },
    }
  },
}
