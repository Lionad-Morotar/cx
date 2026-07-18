import { cxTranslateFn } from '../../events/i18n'

const processData = (key: string, data: any) => {
  // console.log('[info] processData', processData)
  let text = key
  if (!text) {
    return key
  }
  if (cxTranslateFn.value) {
    text = cxTranslateFn.value(key, data)
  }
  if (typeof data === 'object') {
    if (text !== key) {
      return text
    }
    let str = key
    for (const [key, value] of Object.entries(data)) {
      const reg = new RegExp(`{s*${key}s*}`, 'g')
      if (reg.test(str)) {
        str = str.replace(reg, value as string)
      }
    }
    return str
  }
  return text
}

export function useTranslator() {
  const translate: any = function (key: string, data?: any) {
    if (!key) return key
    return processData(key, data)
  }
  return {
    t: translate,
    translate,
    // dt: deferTranslate,
  }
}

export const { t, translate } = useTranslator()
