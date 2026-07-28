import { trim } from 'lodash-es'

function parseError(msg: string): void {
  throw new Error(msg)
}

/**
 * @source https://github.com/micro-zoe/micro-app/blob/dev/src/sandbox/scoped_css.ts
 * @changes
 *  1. common selector such as html\:root should being scoped too
 *  2. remove magic comments
 *  3. special processing for "&" and "html.dark" selector
 *  4. simplified
 */
export class CSSParser {
  private cssText = ''
  private prefix = ''
  private result = ''

  public exec(cssText: string, prefix: string): string {
    this.cssText = cssText
    this.prefix = prefix
    this.matchRules()
    return this.result
  }

  public reset(): void {
    this.cssText = this.prefix = this.result = ''
  }

  // core action for match rules
  private matchRules(): void {
    this.matchLeadingSpaces()
    this.matchComments()
    while (
      this.cssText.length &&
      this.cssText.charAt(0) !== '}' &&
      (this.matchAtRule() || this.matchStyleRule())
    ) {
      this.matchComments()
    }
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleRule
  private matchStyleRule(): boolean | void {
    const selectors = this.formatSelector(true)

    if (!selectors) return parseError('selector missing')

    this.recordResult(selectors)

    this.matchComments()

    this.styleDeclarations()

    this.matchLeadingSpaces()

    return true
  }

  private formatSelector(skip: boolean): false | string {
    const m = this.commonMatch(/^[^{]+/, skip)
    if (!m) return false

    return m[0].replace(/(^|,[\n\s]*)([^,]+)/g, (_, separator, selector) => {
      selector = trim(selector)

      const escape = 'html.dark'

      if (selector === '&') {
        selector = this.prefix
      } else if (selector.startsWith(`${escape} `)) {
        selector = `${escape} ${this.prefix} ${selector.slice(escape.length + 1)}`
      } else {
        selector = `${this.prefix} ${selector}`
      }

      return separator + selector
    })
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration
  private styleDeclarations(): boolean | void {
    if (!this.matchOpenBrace()) return parseError("CSS Declaration missing '{'")

    this.matchAllDeclarations()

    if (!this.matchCloseBrace()) return parseError("CSS Declaration missing '}'")

    return true
  }

  private matchAllDeclarations(nesting = 1): void {
    let cssValue = (
      this.commonMatch(/^(?:url\(["']?(?:[^)"'}]+)["']?\)|[^{}/])*/, true) as RegExpExecArray
    )[0]

    if (cssValue) {
      cssValue = cssValue.replace(/url\(["']?([^)"']+)["']?\)/gm, (all, $1) => {
        if (/^((data|blob):|#)/.test($1) || /^(https?:)?\/\//.test($1)) {
          return all
        }
        return `url("${$1}")`
      })

      this.recordResult(cssValue)
    }

    if (!this.cssText) return

    if (this.cssText.charAt(0) === '}') {
      if (!nesting) return
      if (nesting > 1) {
        this.commonMatch(/}+/)
      }
      return this.matchAllDeclarations(nesting - 1)
    }

    // extract comments in declarations
    if (this.cssText.charAt(0) === '/') {
      if (this.cssText.charAt(1) === '*') {
        this.matchComments()
      } else {
        this.commonMatch(/\/+/)
      }
    }

    if (this.cssText.charAt(0) === '{') {
      this.commonMatch(/{+\s*/)
      nesting++
    }

    return this.matchAllDeclarations(nesting)
  }

  private matchAtRule(): boolean | void {
    if (this.cssText[0] !== '@') return false
    return (
      this.keyframesRule() ||
      this.mediaRule() ||
      this.customMediaRule() ||
      this.supportsRule() ||
      this.importRule() ||
      this.charsetRule() ||
      this.namespaceRule() ||
      this.containerRule() ||
      this.documentRule() ||
      this.pageRule() ||
      this.hostRule() ||
      this.fontFaceRule()
    )
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/CSSKeyframesRule
  private keyframesRule(): boolean | void {
    if (!this.commonMatch(/^@([-\w]+)?keyframes\s*/)) return false

    if (!this.commonMatch(/^[^{]+/)) return parseError('@keyframes missing name')

    this.matchComments()

    if (!this.matchOpenBrace()) return parseError("@keyframes missing '{'")

    this.matchComments()
    while (this.keyframeRule()) {
      this.matchComments()
    }

    if (!this.matchCloseBrace()) return parseError("@keyframes missing '}'")

    this.matchLeadingSpaces()

    return true
  }

  private keyframeRule(): boolean {
    let r
    const valList = []

    while ((r = this.commonMatch(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/))) {
      valList.push(r[1])
      this.commonMatch(/^,\s*/)
    }

    if (!valList.length) return false

    this.styleDeclarations()

    this.matchLeadingSpaces()

    return true
  }

  // https://github.com/postcss/postcss-custom-media
  private customMediaRule(): boolean {
    if (!this.commonMatch(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/)) return false

    this.matchLeadingSpaces()

    return true
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/CSSPageRule
  private pageRule(): boolean | void {
    if (!this.commonMatch(/^@page */)) return false

    this.formatSelector(false)

    return this.commonHandlerForAtRuleWithSelfRule('page')
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/CSSFontFaceRule
  private fontFaceRule(): boolean | void {
    if (!this.commonMatch(/^@font-face\s*/)) return false

    return this.commonHandlerForAtRuleWithSelfRule('font-face')
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/CSSMediaRule
  private mediaRule = this.createMatcherForRuleWithChildRule(/^@media *([^{]+)/, '@media')

  // https://developer.mozilla.org/en-US/docs/Web/API/CSSSupportsRule
  private supportsRule = this.createMatcherForRuleWithChildRule(/^@supports *([^{]+)/, '@supports')

  private documentRule = this.createMatcherForRuleWithChildRule(
    /^@([-\w]+)?document *([^{]+)/,
    '@document',
  )

  private hostRule = this.createMatcherForRuleWithChildRule(/^@host\s*/, '@host')

  // :global is CSS Modules rule, it will be converted to normal syntax
  // private globalRule = this.createMatcherForRuleWithChildRule(/^:global([^{]*)/, ':global')
  // https://developer.mozilla.org/en-US/docs/Web/API/CSSImportRule
  private importRule = this.createMatcherForNoneBraceAtRule('import')
  // Removed in most browsers
  private charsetRule = this.createMatcherForNoneBraceAtRule('charset')
  // https://developer.mozilla.org/en-US/docs/Web/API/CSSNamespaceRule
  private namespaceRule = this.createMatcherForNoneBraceAtRule('namespace')
  // https://developer.mozilla.org/en-US/docs/Web/CSS/@container
  private containerRule = this.createMatcherForRuleWithChildRule(
    /^@container *([^{]+)/,
    '@container',
  )

  // common matcher for @media, @supports, @document, @host, :global, @container
  private createMatcherForRuleWithChildRule(reg: RegExp, name: string): () => boolean | void {
    return () => {
      if (!this.commonMatch(reg)) return false

      if (!this.matchOpenBrace()) return parseError(`${name} missing '{'`)

      this.matchComments()

      this.matchRules()

      if (!this.matchCloseBrace()) return parseError(`${name} missing '}'`)

      this.matchLeadingSpaces()

      return true
    }
  }

  // common matcher for @import, @charset, @namespace
  private createMatcherForNoneBraceAtRule(name: string): () => boolean {
    const reg = new RegExp(`^@${name}\\s*([^;]+);`)
    return () => {
      if (!this.commonMatch(reg)) return false
      this.matchLeadingSpaces()
      return true
    }
  }

  // common handler for @font-face, @page
  private commonHandlerForAtRuleWithSelfRule(name: string): boolean | void {
    if (!this.matchOpenBrace()) return parseError(`@${name} missing '{'`)

    this.matchAllDeclarations()

    if (!this.matchCloseBrace()) return parseError(`@${name} missing '}'`)

    this.matchLeadingSpaces()

    return true
  }

  // match and slice comments
  private matchComments(): void {
    while (this.matchComment());
  }

  // css comment
  private matchComment(): boolean | void {
    if (this.cssText.charAt(0) !== '/' || this.cssText.charAt(1) !== '*') return false

    let i = 2
    while (
      this.cssText.charAt(i) !== '' &&
      (this.cssText.charAt(i) !== '*' || this.cssText.charAt(i + 1) !== '/')
    )
      ++i
    i += 2

    if (this.cssText.charAt(i - 1) === '') {
      return parseError('End of comment missing')
    }

    // get comment content
    const commentText = this.cssText.slice(2, i - 2)

    this.recordResult(`/*${commentText}*/`)

    this.cssText = this.cssText.slice(i)

    this.matchLeadingSpaces()

    return true
  }

  private commonMatch(reg: RegExp, skip = false): RegExpExecArray | null | void {
    const matchArray = reg.exec(this.cssText)
    if (!matchArray) return
    const matchStr = matchArray[0]
    this.cssText = this.cssText.slice(matchStr.length)
    if (!skip) this.recordResult(matchStr)
    return matchArray
  }

  private matchOpenBrace() {
    return this.commonMatch(/^{\s*/)
  }

  private matchCloseBrace() {
    return this.commonMatch(/^}/)
  }

  // match and slice the leading spaces
  private matchLeadingSpaces(): void {
    this.commonMatch(/^\s*/)
  }

  // splice string
  private recordResult(strFragment: string): void {
    // Firefox performance degradation when string contain special characters, see https://github.com/micro-zoe/micro-app/issues/256
    this.result += strFragment
  }
}

const cssParser = new CSSParser()

export default cssParser
