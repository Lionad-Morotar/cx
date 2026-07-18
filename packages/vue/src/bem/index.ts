import type { InjectionKey, Ref } from 'vue'

export const defaultNamespace = 'p'
export const statePrefix = 'is-'

const innerBEM = (namespace: string, block: string, blockSuffix: string, element: string, modifier: string) => {
  let cls = `${namespace}-${block}`
  if (blockSuffix) {
    cls += `-${blockSuffix}`
  }
  if (element) {
    cls += `__${element}`
  }
  if (modifier) {
    cls += `--${modifier}`
  }
  return cls
}

export const namespaceContextKey: InjectionKey<Ref<string | undefined>> = Symbol('namespaceContextKey')

export const genUseNamespace = (dftName: string = defaultNamespace) => (block: string) => {
  const ns = dftName
  const b = (blockSuffix = '') => innerBEM(ns, block, blockSuffix, '', '')
  const e = (element?: string) => (element ? innerBEM(ns, block, '', element, '') : '')
  const m = (modifier?: string) => (modifier ? innerBEM(ns, block, '', '', modifier) : '')
  const be = (blockSuffix?: string, element?: string) =>
    blockSuffix && element ? innerBEM(ns, block, blockSuffix, element, '') : ''
  const em = (element?: string, modifier?: string) =>
    element && modifier ? innerBEM(ns, block, '', element, modifier) : ''
  const bm = (blockSuffix?: string, modifier?: string) =>
    blockSuffix && modifier ? innerBEM(ns, block, blockSuffix, '', modifier) : ''
  const bem = (blockSuffix?: string, element?: string, modifier?: string) =>
    blockSuffix && element && modifier ? innerBEM(ns, block, blockSuffix, element, modifier) : ''
  const is: {
    (name: string, state: boolean | undefined): string
    (name: string): string
  } = (name: string, ...args: [boolean | undefined] | []) => {
    const state = args.length >= 1 ? args[0]! : true
    return name && state ? `${statePrefix}${name}` : ''
  }

  // for css var
  // --c-xxx: value
  const cssVar = (object: Record<string, string>) => {
    const styles: Record<string, string> = {}
    Object.keys(object).forEach((key) => {
      if (object[key]) {
        styles[`--${ns}-${key}`] = object[key]
      }
    })
    return styles
  }
  // with block
  const cssVarBlock = (object: Record<string, string>) => {
    const styles: Record<string, string> = {}
    Object.keys(object).forEach((key) => {
      if (object[key]) {
        styles[`--${ns}-${block}-${key}`] = object[key]
      }
    })
    return styles
  }

  const cssVarName = (name: string) => `--${ns}-${name}`
  const cssVarBlockName = (name: string) => `--${ns}-${block}-${name}`

  return {
    namespace: ns,
    b,
    e,
    m,
    be,
    em,
    bm,
    bem,
    is,
    // css
    cssVar,
    cssVarName,
    cssVarBlock,
    cssVarBlockName
  }
}

export const useBEM = genUseNamespace()
export const useBem = genUseNamespace()

export const useCxBEM = genUseNamespace('cx')
