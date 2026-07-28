import type { Component } from 'vue'
import type { CxComponentMetaDefined, CxComponentMetaProps } from '../types'
import { has } from '../utils/guard'

// 格式化组件元信息
export function withDefaultMeta<M extends CxComponentMetaDefined<Component>>(meta: M): Required<M> {
  return {
    headless: has(meta.headless),
    async: has(meta.async),
    ...meta,
    props: cleanProps(meta.props || {}),
    emits: meta.emits || {},
    exposes: meta.exposes || {},
    slots: meta.slots,
  } as unknown as Required<M>
}

function cleanProps(props: CxComponentMetaProps): CxComponentMetaProps {
  return Object.entries(props).reduce(
    (h, [k, v]) => {
      h[k] = v

      if (!h[k].key) {
        h[k].key = k
      }

      return h
    },
    {} as CxComponentMetaProps,
  )
}
