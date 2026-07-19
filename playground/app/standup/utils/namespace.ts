/**
 * useCxNamespace 的域内适配器
 *
 * 旧版产出 `cx-<block>` BEM class；新包 useCxBEM 的 namespace 同为 'cx'，
 * b/e/m/is 语义一致（is 默认 true → `is-<name>`），直接委托即可。
 */
import { useCxBEM } from '@lionad/cx-vue'

export function useCxNamespace(block: string) {
  return useCxBEM(block)
}
