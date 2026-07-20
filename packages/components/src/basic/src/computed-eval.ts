/**
 * cx-computed 的受限表达式求值器。
 *
 * 只支持布尔/比较组合（||、&&、!、==、!=、<、>、<=、>=）、括号、
 * 字面量（true/false/null/数字/字符串）与标识符（从 ctx 取值）。
 *
 * 安全性来自结构而非过滤：没有 eval/new Function，标识符仅作为 ctx 的
 * key 查找（拿到函数也不会调用），任何不在白名单内的 token 或语法
 * 直接抛错——因此 inherently 无注入面，用于 cx-computed 声明「a || b」
 * 这类布尔逻辑。
 */
type Tok = { t: string; v: any }

const TOKEN_RE =
  /\s*(\|\||&&|==|!=|<=|>=|<|>|!|\(|\)|true|false|null|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|-?\d+\.\d+|-?\d+|[A-Za-z_$][\w$]*)/g

function tokenize(expr: string): Tok[] {
  const toks: Tok[] = []
  let last = 0
  TOKEN_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = TOKEN_RE.exec(expr))) {
    if (m.index !== last) {
      throw new Error(`[cx-computed] 非法字符: "${expr.slice(last, m.index)}"`)
    }
    const raw = m[1]!
    last = m.index + m[0].length
    const OP: Record<string, string> = {
      '||': 'OR',
      '&&': 'AND',
      '!': 'NOT',
      '==': 'EQ',
      '!=': 'NE',
      '<=': 'LE',
      '>=': 'GE',
      '<': 'LT',
      '>': 'GT',
      '(': 'LP',
      ')': 'RP',
    }
    const op = OP[raw]
    if (op) toks.push({ t: op, v: raw })
    else if (raw === 'true' || raw === 'false') toks.push({ t: 'LIT', v: raw === 'true' })
    else if (raw === 'null') toks.push({ t: 'LIT', v: null })
    else if (raw[0] === "'" || raw[0] === '"') toks.push({ t: 'LIT', v: raw.slice(1, -1) })
    else if (/^-?\d/.test(raw)) toks.push({ t: 'LIT', v: Number(raw) })
    else toks.push({ t: 'IDENT', v: raw })
  }
  if (last !== expr.length) {
    throw new Error(`[cx-computed] 非法尾部: "${expr.slice(last)}"`)
  }
  return toks
}

export function safeEval(expr: string, ctx: Record<string, any> = {}): any {
  const toks = tokenize(expr)
  let i = 0
  const peek = () => toks[i]
  const next = () => toks[i++]

  const parseOr = (): any => {
    let v = parseAnd()
    while (peek()?.t === 'OR') {
      next()
      // 显式 parse 右值再布尔合并——不能用 JS `||` 短路，否则右操作数不被消费，token 错位
      const r = parseAnd()
      v = v || r
    }
    return v
  }
  const parseAnd = (): any => {
    let v = parseNot()
    while (peek()?.t === 'AND') {
      next()
      const r = parseNot()
      v = v && r
    }
    return v
  }
  const parseNot = (): any => {
    if (peek()?.t === 'NOT') {
      next()
      return !parseNot()
    }
    return parseComparison()
  }
  const parseComparison = (): any => {
    const l = parsePrimary()
    const op = peek()?.t
    if (op === 'EQ' || op === 'NE' || op === 'LT' || op === 'GT' || op === 'LE' || op === 'GE') {
      next()
      const r = parsePrimary()
      if (op === 'EQ') return l == r
      if (op === 'NE') return l != r
      if (op === 'LT') return l < r
      if (op === 'GT') return l > r
      if (op === 'LE') return l <= r
      return l >= r
    }
    return l
  }
  const parsePrimary = (): any => {
    const tk = peek()
    if (!tk) throw new Error('[cx-computed] 表达式不完整')
    if (tk.t === 'LIT') {
      next()
      return tk.v
    }
    if (tk.t === 'IDENT') {
      next()
      return ctx?.[tk.v]
    }
    if (tk.t === 'LP') {
      next()
      const v = parseOr()
      if (peek()?.t !== 'RP') throw new Error('[cx-computed] 缺少右括号')
      next()
      return v
    }
    throw new Error(`[cx-computed] 意外的 token: "${tk.v}"`)
  }

  const result = parseOr()
  if (i < toks.length) throw new Error(`[cx-computed] 未消费 token: "${toks[i]!.v}"`)
  return result
}
