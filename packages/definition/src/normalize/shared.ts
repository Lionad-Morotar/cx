import kebabCase from 'lodash-es/kebabCase'
import cloneDeep from 'lodash-es/cloneDeep'
import isFunction from 'lodash-es/isFunction'
import type { CxComponentMetaDefined, Meta } from '../index'

export const toJSON = (_meta: CxComponentMetaDefined): Meta => {
  _meta = cloneDeep(_meta)
  const meta = _meta as Meta

  const { name } = _meta.component || {}
  const { type, url, umdExportsName } = _meta

  // @ts-ignore
  delete _meta.component

  // CxG2 转换为 kebab-case 是“cx-g-2”，但应该得到“cx-g2”
  meta.key = kebabCase(name).replace(/([a-z])-([0-9])/, '$1$2')

  meta.exports = umdExportsName || name

  meta.type = type || 'umd'
  meta.url = url || `${meta.key.replace(/^cx-/, '')}.js`

  // 移除属性里的大对象，与 normalize 部分逻辑相对
  Object.keys(meta.props || {}).forEach((k) => {
    try {
      delete meta.props[k].component

      const vueProp = meta.props?.[k]
      const defaultValue = vueProp?.default
      if (isFunction(defaultValue)) {
        delete meta.props[k].default
      }
      const initialValue = vueProp?.initial
      if (isFunction(initialValue)) {
        delete meta.props[k].initial
      }

      const vuePropOptions = meta.props?.[k]?.options
      const optionDefaultValue = vuePropOptions?.default
      if (isFunction(optionDefaultValue)) {
        delete meta.props[k].default
      }
      const optionInitialValue = vuePropOptions?.initial
      if (isFunction(optionInitialValue)) {
        delete meta.props[k].initial
      }
    } catch {
      // do nothing
    }
  })

  return meta
}
