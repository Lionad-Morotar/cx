import { reactive } from 'vue'
import { cloneDeep, isFunction, isNil, isString } from 'lodash-es'
import { useCxState } from '@cx/hooks'
import type { CxImageUploadPropValue } from '@cx/definition'

import type { Ref } from 'vue'

type UseCxStateParams = Parameters<typeof useCxState>

const getDefaultValue = () => Object.freeze({ url: '', fit: 'cover' })

const fallback = (...args: any[]) => {
  return args.find(x => !isNil(x)) || null
}

const clean = (
  value: Ref<CxImageUploadPropValue>,
  defaultOverride: Record<string, any>
) => {
  const defaultValue = getDefaultValue()
  if (isString(value.value) || isNil(value.value)) {
    value.value = Object.assign(
      defaultValue,
      {
        url: value.value || '',
        fit: 'cover'
      },
      defaultOverride || {}
    )
  } else {
    const cloned = cloneDeep(value.value || {})
    const override = defaultOverride || {}
    Object.assign(value.value, {
      url: fallback(cloned.url, override.url, defaultValue.url),
      fit: fallback(cloned.fit, override.fit, defaultValue.fit)
    })
  }
}

export const useCxPropImageUpload = (...args: UseCxStateParams) => {
  const value = useCxState(...args) as Ref<CxImageUploadPropValue>

  const optDefaultValue = args[3]?.defaultValue || {}
  const getOptionDefaultValue = () =>
    isFunction(optDefaultValue) ? optDefaultValue() : optDefaultValue

  clean(value, getOptionDefaultValue())

  const states = reactive({
    value,
    clean,
    getDefaultValue
  })

  return states
}
