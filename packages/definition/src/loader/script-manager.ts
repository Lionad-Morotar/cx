import { createCxID } from '../utils/create-id'
import type { AnyFn } from '@vueuse/core'

type getURLOptions = Partial<{
  moduleType: 'umd' | 'esm'
  onError: OnErrorEventHandler
  onLoad: AnyFn
}>

/**
 * simple url loader
 * 应该从微前端薅一个管理器过来，碰到特殊情况如组件添加了样式，就非常难管理
 * @todo 样式文件的加载
 * @todo 卸载方法
 * @todo 不重复添加，defineAsyncCmpt 应该是做了优化所以现在不会有问题
 */
export const getURL = (url: string, _opts?: getURLOptions) => {
  const uuid = createCxID()
  const uuidKey = 'data-cx-script-id'
  const opts = Object.assign({}, _opts || {})

  // @ts-ignore
  const targetParent = document.head
  // @ts-ignore
  const $script = document.createElement('script')

  $script.setAttribute(uuidKey, uuid)
  $script.setAttribute('async', 'async')

  if (opts.moduleType === 'esm') {
    // @ts-ignore
    const w = window?.rawWindow || window
    const fetch = w.fetch

    $script.type = 'module'
    fetch(url, { cors: true }).then(async (res: any) => {
      const triggerLoad = `;document.head.querySelector("[${uuidKey}='${uuid}']").dispatchEvent(new Event('load'))`
      const content = await res.text()
      const matchRes = content.match(/[^{]*export { (.*) as default }[^}]*$/)
      const defaultName = matchRes?.[1]
      if (defaultName) {
        console.info('[info] found default export', defaultName, 'at url', url)
        const exportDefaultToWindowContent = `${content}\n;window["${url}"]=${defaultName};`
        $script.innerHTML = `${exportDefaultToWindowContent}${triggerLoad}`
      } else {
        console.info('[info] default export not found')
        $script.innerHTML = `${content}${triggerLoad}`
      }
    })
  } else {
    $script.src = url
  }

  if (typeof opts.onError === 'function') {
    $script.onerror = (...args) => {
      try {
        opts.onError!(...args)
      } finally {
        unMount()
      }
    }
  }

  if (typeof opts.onLoad === 'function') {
    $script.onload = opts.onLoad
  }

  function mount() {
    targetParent.append($script)
    return $script
  }

  function unMount() {
    const $target = Array.from(targetParent.children).find(
      (x) => x.getAttribute('src') === $script.src && x.getAttribute(uuidKey) === uuid,
    )
    $target?.remove()
  }

  // TODO style element mount unmount
  return {
    $script,
    mount,
    unMount,
  }
}

export default getURL
