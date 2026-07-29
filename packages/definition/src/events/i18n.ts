import mitt from 'mitt'

/** 翻译函数类型：(key, data?) => string */
export type TranslateFn = (key: string, data?: unknown) => string

export const cxTranslateFn = {
  value: null as TranslateFn | null,
}

export const cxTranslator = mitt<{
  provide: {
    t: TranslateFn
  }
}>()

cxTranslator.on('provide', ({ t }) => {
  cxTranslateFn.value = t
})
