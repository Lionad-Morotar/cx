import kebabCase from 'lodash-es/kebabCase'
import cloneDeep from 'lodash-es/cloneDeep'
import isFunction from 'lodash-es/isFunction'
import type { CxComponentMetaDefined, Meta } from '../types'

export const toJSON = (_meta: CxComponentMetaDefined): Meta => {
  _meta = cloneDeep(_meta)
  const meta = _meta as Meta

  const { name } = _meta.component || {}
  const { type, url, umdExportsName } = _meta

  // component 是 CxComponentMetaDefined 必填字段，但此处运行时已提取到变量，
  // 从 meta 删除避免序列化时包含 Vue 组件实例
  // @ts-expect-error deleting required 'component' field at runtime
  delete _meta.component

  // CxG2 转换为 kebab-case 是“cx-g-2”，但应该得到“cx-g2”
  meta.key = kebabCase(name).replace(/([a-z])-([0-9])/, '$1$2')

  meta.exports = umdExportsName || name

  meta.type = type || 'umd'
  meta.url = url || `${meta.key.replace(/^cx-/, '')}.js`

  // 移除属性里的大对象，与 defineCxComponent 部分逻辑相对
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
        // 删除路径必须在 options 层级（原为复制粘贴残留的顶层路径，函数会泄漏进 JSON）
        delete meta.props[k].options.default
      }
      const optionInitialValue = vuePropOptions?.initial
      if (isFunction(optionInitialValue)) {
        delete meta.props[k].options.initial
      }
    } catch {
      // do nothing
    }
  })

  return meta
}
