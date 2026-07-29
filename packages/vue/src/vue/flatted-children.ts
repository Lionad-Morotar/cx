import { isVNode } from 'vue'
import { isArray, isFunction, isObject } from '@vue/shared'
import type { VNode, VNodeChild, VNodeNormalizedChildren } from 'vue'

export type VNodeChildAtom = Exclude<VNodeChild, Array<unknown>>
export type RawSlots = Exclude<VNodeNormalizedChildren, Array<unknown> | null | string>

export type FlattenVNodes = Array<VNodeChildAtom | RawSlots>

const getItems = (
  // FlattenVNodes | VNode | VNodeNormalizedChildren
  xs: unknown,
) => (isArray(xs) ? xs : isVNode(xs) ? [xs] : isObject(xs) ? Object.values(xs) : xs ? [xs] : [])

// ! not tested, not sure if it work as expected
export const flattedChildren = async (
  children: FlattenVNodes | VNode | VNodeNormalizedChildren,
): Promise<FlattenVNodes> => {
  const vNodes = getItems(children)
  const result: FlattenVNodes = []

  vNodes.forEach(async (vNode) => {
    const nodes = getItems(vNode).flatMap((node) => (isFunction(node) ? node() : node))
    nodes.forEach(async (node) => {
      const isContentVNode = isVNode(node)
      // console.log('node', node, isContentVNode)
      if (isContentVNode) {
        result.push(node)
        if (node.children) {
          const childs = await flattedChildren(node.children)
          console.log('childs', childs)
          result.push(
            ...childs.flatMap((x) =>
              // @ts-expect-error x 是 RawSlots（函数形态），TS 无法从联合收窄到可调用
              isFunction(x) ? x() : x,
            ),
          )
        }
        if (node.component?.subTree) {
          result.push(...(await flattedChildren(node.component.subTree)))
        }
      }
      // if (isFunction(node)) {
      //   console.log(node)
      // }
    })
  })
  return result
}
