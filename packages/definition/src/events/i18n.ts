import mitt from 'mitt'

export const cxTranslateFn = {
  value: null as any,
}

export const cxTranslator = mitt<{
  provide: {
    t: any
  }
}>()

cxTranslator.on('provide', ({ t }) => {
  cxTranslateFn.value = t
})
