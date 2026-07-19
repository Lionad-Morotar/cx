/**
 * modified from @vueuse/core onKeyStroke
 * @description
 * vueuse 的 onKeyStroke 可以重复注册，不会覆盖，
 * 所以先让 todo-card 的 onKeyStroke 先执行，以便其 stopImmediatePropagation 能发挥作用，
 * （不然的话，此 useFocus 的 onKeyStroke 会先执行，导致无法在 todo-card 阻止其它事件）
 */
import { reactive, ref } from 'vue'
import { useEventListener, tryOnScopeDispose } from '@vueuse/core'
import { toValue } from 'vue'
import { isClient } from '@vueuse/shared'

import type { MaybeRefOrGetter } from 'vue'

export const defaultWindow = /*#__PURE__*/ isClient ? window : undefined

export type KeyPredicate = (event: KeyboardEvent) => boolean
export type KeyFilter = true | string | string[] | KeyPredicate
export type KeyStrokeEventName = 'keydown' | 'keypress' | 'keyup'
export interface OnKeyStrokeOptions {
  eventName?: KeyStrokeEventName
  target?: MaybeRefOrGetter<EventTarget | null | undefined>
  passive?: boolean
  /**
   * Set to `true` to ignore repeated events when the key is being held down.
   *
   * @default false
   */
  dedupe?: MaybeRefOrGetter<boolean>
  /**
   * @default false
   */
  takeover?: boolean
}

function createKeyPredicate(keyFilter: KeyFilter): KeyPredicate {
  if (typeof keyFilter === 'function') return keyFilter
  else if (typeof keyFilter === 'string') return (event: KeyboardEvent) => event.key === keyFilter
  else if (Array.isArray(keyFilter)) return (event: KeyboardEvent) => keyFilter.includes(event.key)

  return () => true
}

function getPredicateKeyCodes(keyFilter: KeyFilter) {
  // ！takeover 模式暂不支持传入 keycode 验证函数
  if (typeof keyFilter === 'function') return []
  else if (typeof keyFilter === 'string') return [keyFilter]
  else if (Array.isArray(keyFilter)) return keyFilter

  return []
}

type Handler = (event: KeyboardEvent) => boolean | void
type Handlers = Handler[]

const HandlersMap = new Map<KeyFilter, Handlers>()

function createHandlerStates(keys: string[], handler: Handler, takeover = false) {
  const states = reactive({
    getHandlers,
  })

  keys.map((key) => {
    const handlers = HandlersMap.get(key) || []
    if (takeover) {
      handlers.push(handler)
      HandlersMap.set(key, handlers)
    }
  })

  tryOnScopeDispose(() => {
    keys.map((key) => {
      const handlers = HandlersMap.get(key) || []
      const index = handlers.indexOf(handler)
      if (index !== -1) {
        handlers.splice(index, 1)
      }
      HandlersMap.set(key, handlers)
    })
  })

  function getHandlers() {
    if (!takeover) {
      return [handler]
    }
    for (const key of keys) {
      return HandlersMap.get(key) || []
    }
    return []
  }
  return states
}

export function onKeyStroke(
  key: KeyFilter,
  handler: (event: KeyboardEvent) => void,
  options?: OnKeyStrokeOptions,
): () => void
export function onKeyStroke(
  handler: (event: KeyboardEvent) => void,
  options?: OnKeyStrokeOptions,
): () => void

/**
 * Listen for keyboard keys being stroked.
 *
 * @see https://vueuse.org/onKeyStroke
 */
export function onKeyStroke(
  key: KeyFilter,
  handler: (event: KeyboardEvent) => void,
  options?: OnKeyStrokeOptions,
): () => void
export function onKeyStroke(
  handler: (event: KeyboardEvent) => void,
  options?: OnKeyStrokeOptions,
): () => void
export function onKeyStroke(...args: any[]) {
  let key: KeyFilter
  let handler: (event: KeyboardEvent) => void
  let options: OnKeyStrokeOptions = {}

  if (args.length === 3) {
    key = args[0]
    handler = args[1]
    options = args[2]
  } else if (args.length === 2) {
    if (typeof args[1] === 'object') {
      key = true
      handler = args[0]
      options = args[1]
    } else {
      key = args[0]
      handler = args[1]
    }
  } else {
    key = true
    handler = args[0]
  }

  const {
    target = defaultWindow,
    eventName = 'keydown',
    passive = false,
    dedupe = false,
    takeover = false,
  } = options

  const predicate = createKeyPredicate(key)

  const keys = getPredicateKeyCodes(key)
  const handlerStates = createHandlerStates(keys, handler, takeover)

  const listener = (e: KeyboardEvent) => {
    if (e.repeat && toValue(dedupe)) return
    if (predicate(e)) {
      // console.log(
      //   "[info] predicated!",
      //   keys,
      //   handlerStates.getHandlers(),
      //   HandlersMap
      // );
      const handlers = handlerStates.getHandlers()
      const stop = ref(false)
      for (const handler of [...handlers].reverse()) {
        if (!stop.value) {
          stop.value = handler?.(e) || false
          // console.info("[info]", handler, stop.value);
        }
      }
    }
  }

  return useEventListener(target, eventName, listener, passive)
}

/**
 * Listen to the keydown event of the given key.
 *
 * @see https://vueuse.org/onKeyStroke
 * @param key
 * @param handler
 * @param options
 */
export function onKeyDown(
  key: KeyFilter,
  handler: (event: KeyboardEvent) => void,
  options: Omit<OnKeyStrokeOptions, 'eventName'> = {},
) {
  return onKeyStroke(key, handler, { ...options, eventName: 'keydown' })
}

/**
 * Listen to the keypress event of the given key.
 *
 * @see https://vueuse.org/onKeyStroke
 * @param key
 * @param handler
 * @param options
 */
export function onKeyPressed(
  key: KeyFilter,
  handler: (event: KeyboardEvent) => void,
  options: Omit<OnKeyStrokeOptions, 'eventName'> = {},
) {
  return onKeyStroke(key, handler, { ...options, eventName: 'keypress' })
}

/**
 * Listen to the keyup event of the given key.
 *
 * @see https://vueuse.org/onKeyStroke
 * @param key
 * @param handler
 * @param options
 */
export function onKeyUp(
  key: KeyFilter,
  handler: (event: KeyboardEvent) => void,
  options: Omit<OnKeyStrokeOptions, 'eventName'> = {},
) {
  return onKeyStroke(key, handler, { ...options, eventName: 'keyup' })
}
