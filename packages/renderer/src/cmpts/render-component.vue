<template>
  <template v-if="cmpt?.key">
    <component :is="showCmptErrorWrapper" v-if="showCmptErrorWrapper" name="showCmptErrorWrapper" />
    <component
      :is="cmptWrapper"
      v-else-if="cmptWrapper"
      :key="renderKey"
      name="cmptWrapper"
      :cmpt-i-d="cmpt.id"
      :cmpt-key="cmpt.key"
      :data-render-key="renderKey"
    >
      <cx-render-component-with-bindings
        v-if="cmpt"
        :set-ref="(ref: any) => setRef(ref)"
        :component-type="cmptType"
        :component-directives="directives"
        :cmpt-i-d="cmpt.id"
        v-bind="cmptDatas"
        v-on="cmptEvents"
      >
        <template
          v-for="slot in cmptSlots"
          #[slot.key!]="data"
          :key="`render-${cmpt.id}-area-${slot.key}`"
        >
          <cx-render-components :slot="slot" :cmpt-i-d="cmpt.id" :slot-wrapper="slotWrapper" />
        </template>
      </cx-render-component-with-bindings>
    </component>
    <cx-render-component-with-bindings
      v-else-if="cmpt"
      :key="`${cmpt.id}-${cmpt.key}`"
      :set-ref="(ref: any) => setRef(ref)"
      :component-type="cmptType"
      :component-directives="directives"
      :cmpt-i-d="cmpt.id"
      v-bind="cmptDatas"
      v-on="cmptEvents"
    >
      <template
        v-for="slot in cmptSlots"
        #[slot.key!]="data"
        :key="`render-${cmpt.id}-area-${slot.key}`"
      >
        <cx-render-components
          :slot="slot"
          :cmpt-i-d="cmpt.id"
          :slot-wrapper="slotWrapper"
          :data="data"
        />
      </template>
    </cx-render-component-with-bindings>
  </template>
</template>

<script setup lang="ts">
import { useCleanups } from '@lionad/cx-definition'

import { fakeTouch, useMountedWatchImmediate } from '@lionad/cx-vue'
import { useMounted, until, watchImmediate } from '@vueuse/core'
import {
  computed,
  inject,
  nextTick,
  onBeforeUnmount,
  onErrorCaptured,
  provide,
  reactive,
  readonly,
  ref,
  unref,
  useAttrs,
  shallowRef,
  watch,
  watchEffect,
  onBeforeMount,
  markRaw,
  onMounted,
  onUnmounted,
} from 'vue'
import {
  cloneDeep,
  isArray,
  isEqual,
  isFunction,
  isObject,
  isString,
  mapValues,
  omit as useOmit,
} from 'lodash-es'
import { nativeEvents } from '../event/native-event'
import { deepMerge } from '../utils'
import CxRenderComponentWithBindings from './render-component-with-bindings.vue'
import CxRenderComponents from './render-components.vue'
import type { Component } from 'vue'
import type {
  CxComponentSlot,
  CxComponentRuntime,
  CxEmitter,
  CxLoaderInstance,
  CxEventKey,
} from '@lionad/cx-definition'

defineOptions({
  name: 'CxRenderComponent',
  inheritAttrs: false,
})

// * simplified template, but hard to debug, so mute it
// const [DefineCmptRender, ReuseCmptRender] = createReusableTemplate()

const _isMounted = useMounted()
const isMounted = ref(false)

const emits = defineEmits(['update:component'])
const cx = inject<CxLoaderInstance>('cx')
if (!cx) {
  throw new Error(
    'cx-render-component should inside within cx-render, or provide your own cxInstance for instead',
  )
}

const refs = inject<CxLoaderInstance>('cx')!.refs

let setRefTick: any
const setRef = async (ref: any) => {
  await until(_isMounted).toBeTruthy()
  if (setRefTick) {
    clearTimeout(setRefTick)
  }
  setRefTick = setTimeout(() => {
    const lastRef = refs.get(unref(cmpt)!.id) || ({} as any)
    lastRef.ref = ref
    if (!lastRef.data) {
      lastRef.data = cmpt.value
    }
    refs.set(unref(cmpt)!.id, lastRef)
    isMounted.value = true
  }, 0)
}

const cxEmitter = cx.emitter
const cxUtils = cx.utils
const cmptWrapper = readonly(inject<Component>('cx-render-component-wrapper')!)
const cmptErrorWrapper = readonly(inject<Component>('cx-render-error-component-wrapper')!)
const slotWrapper = readonly(inject<Component>('cx-render-slot-wrapper')!)

const attrs = useAttrs()
const props = withDefaults(
  defineProps<{
    component?: CxComponentRuntime | string
  }>(),
  {},
)
const isDebug = inject('is-cx-debug', false)
fakeTouch(isDebug)
const isEdit = inject('is-cx-edit', false)
fakeTouch(isEdit)
// console.log(
//   '[debug] setup cx-render-component',
//   props.component?.key,
//   props.component?.id?.slice(0, 6)
// )

const states = reactive({
  // 模块内部错误
  isSyncError: false,
})
const showCmptErrorWrapper = computed(() => states.isSyncError && unref(cmptErrorWrapper))

onErrorCaptured((err) => {
  console.error(`[ERR] cx error capturer, on component ${unref(cmpt)?.key}`, err)
  states.isSyncError = true
  return false
})

// 兼容一下 key 字符串形式的组件，在模板中传 key 要比造数据体验好不少，
// <cx-render-component component="cx-button" />
// 但是由于是先下载异步组件再到 app 里注册的，所以如果不做特殊处理，
// 以下写法暂时行不通，以及 ref、key 等属性在模板中无法使用，
// <cx-render-component component="cx-button" />
const model = isString(props.component)
  ? ref(
      cxUtils.cloneComponent({
        key: props.component as string,
        data: attrs,
      }),
    )
  : computed(() => props.component)

const cmpt = shallowRef<CxComponentRuntime>()
watchImmediate(model, (x) => (cmpt.value = x as CxComponentRuntime))
provide('cx-cmpt', cmpt)

const renderKey = ref(1)
const reRender = async () => (renderKey.value += 1)

const cmptMeta = computed(() => cxUtils?.getMeta?.(unref(cmpt)!))
provide('cx-cmpt-meta', cmptMeta)
provide('cx-reloader', async (condition: boolean | CallableFunction) => {
  const shouldReRender = isFunction(condition) ? await condition.call(null, unref(cmpt)) : condition
  console.log('[info] check cx-reload due to:', condition, shouldReRender)
  if (shouldReRender) {
    reRender()
  }
})

const cmptType = computed(() => {
  const k = cmpt.value?.key || ''
  // * 调试模式时，组件名 cx-dialog 会被转换为 cx-dialog-debug
  const postFix = k.startsWith('cx-') ? (isDebug ? '-debug' : '') : ''
  const patchedK = k
  return `${patchedK}${postFix}`
})

// 异步组件创建时，还没有加载到元数据，
// 所以等加载完毕后重新初始化一下 data
cx.hooks.on('cmpt:async-cmpt:loaded', resetAsyncComponentInitialData)
onBeforeUnmount(() => cx.hooks.off('cmpt:async-cmpt:loaded', resetAsyncComponentInitialData))
async function resetAsyncComponentInitialData({ cmpt: loadedCmpt }: any) {
  if (!cmpt.value) {
    return // console.error('[ERR] skip async-cmpt:loaded, no cmpt value found')
  }
  if (loadedCmpt.key === cmpt.value.key) {
    await nextTick()
    try {
      if (isObject(cmpt.value?.data) && cmpt.value?.data) {
        const initial = cloneDeep(
          await cxUtils.getData(loadedCmpt.key, {}, {
            component: readonly(cmpt.value),
            data: readonly(cmpt.value.data),
          } as any),
        )
        const sourceData = cloneDeep(cmpt.value.data)
        deepMerge(cmpt.value.data, deepMerge(initial, sourceData))
      }
    } catch (e) {
      console.log('[verbose] error on cmpt:async-cmpt:loaded', e)
    } finally {
      await nextTick()
      cx!.hooks.emit('cmpt:async-cmpt-data:loaded', { cmpt: loadedCmpt })
    }
    // console.log(
    //   '[event] cmpt:async-cmpt:loaded data',
    //   initial,
    //   sourceData,
    //   cmpt.value.data
    // )
  }
}

const directives = computed(() => {
  const _datas = cmpt.value?.data || {}
  // console.log('Object.entries({ ..._datas })', Object.entries({ ..._datas }))
  const res = Object.entries({ ..._datas }).reduce(
    (h, [k, v]) => {
      if (k.startsWith('v-')) {
        h[k] = v
      }
      return h
    },
    {} as Record<string, any>,
  )
  // console.log('[debug] directives', cmpt.value.key, res)
  return res
})

// watch(
//   () => unref(cmpt).data,
//   (newData) => {
//     console.log('[debug] ret', cmpt.value.key, newData)
//   },
//   {
//     deep: true,
//     immediate: true,
//   }
// )

/** *********************************************** events handlers */
/**********************************************************/

const cmptEmitNames = computed(() => {
  if (!cmpt.value) {
    return []
  }
  const eventData = cmpt.value?.data?._cx_events || []
  const isCxEvent = cxUtils.findFromCX(cmpt.value.key)
  if (isCxEvent) {
    const metaEmits = cxUtils.getEmits(cmpt.value.key)
    const names = Object.keys(metaEmits).filter((x) => eventData.find((y) => x === y.key))
    // console.info('[debug] event names', cmpt.value.key, names)
    return names
  }
  const names = eventData.map((x) => x.key)
  // console.info('[debug] event names', cmpt.value.key, names)
  return names
})
const nativeEmitNames = computed(() => {
  const eventData = cmpt.value?.data?._cx_events || []
  const metaEmits = nativeEvents
  const names = Object.keys(metaEmits).filter((x) => eventData.find((y) => x === y.key))
  return names
})

const dataConfig = ref({ binds: {} })
watchImmediate(
  () => cmpt.value?.data?._cx_data_config,
  () => {
    dataConfig.value = cx.utils.calcDataConfigs(cmpt.value!) || {
      binds: {},
    }
  },
  { deep: true },
)
const bindDatas = ref<Record<string, any>>({})
const cleanDataBinds = useCleanups()
useMountedWatchImmediate(
  () => dataConfig.value,
  () => {
    cleanDataBinds.cleanup()

    const binds = unref(dataConfig)?.binds || {}
    Object.entries(binds).map((bind) => {
      const parsed = cx.utils.parseDataBind(bind[1] as string)
      const [mainCate, cmptID, subCate, propKey] = parsed
      const targetCmptData = unref(cx.datas.cmptsIdMap)?.[cmptID!]?.data || {}
      Object.entries(targetCmptData).map(([k, value]) => {
        if (k !== propKey) return
        const stop = watch(
          () => targetCmptData[k],
          (newVal) => {
            bindDatas.value[k] = newVal
          },
          {
            immediate: true,
            deep: true,
          },
        )
        cleanDataBinds.add(() => {
          delete bindDatas.value[k]
          stop()
        })
      })
    })
  },
  {
    deep: true,
  },
)

const cmptDatas = computed(() => {
  if (!cmpt.value) {
    return {}
  }
  const rawData = cmpt.value.data
  const data = {
    ...rawData,
    ...bindDatas.value,
  } as Record<string, any>

  return useOmit(data, [
    // vue cmpt props
    'class',
    // cx meta props
    '_cx_name',
    '_cx_events',
    '_cx_style',
    'cmpt',
    // TODO move to other place
    '_config',
    '_dataConfig',
    '_cx_data_config',
    '_pr',
    '_slotConfig',
  ])
})

const cmptEvents = computed(() => {
  if (!cmpt.value) {
    return {}
  }
  const id = cmpt.value.id
  // 这里监听的所有定义事件和原生事件，不知道会不会有性能问题
  const keys = [...cmptEmitNames.value, ...nativeEmitNames.value]
  const eventsMap = {} as Record<string | CxEventKey, () => void>
  try {
    keys.forEach((k) => {
      const broadcast = (...args: any[]) => {
        unref(cx).hooks.emit('cmpt:cx-event:emit', {
          id,
          event: k,
          args,
        })
        return cxEmitter({
          cmpt: unref(cmpt)!,
          // FIXME type
          eventKey: k as any,
          args,
        })
      }
      eventsMap[k] = broadcast
    })
  } catch (error) {
    console.error('[ERR]', error)
  }
  return eventsMap
})

/** *********************************************** slots */
/*********************************************************/

const _cmptSlots = computed(() => {
  if (!_isMounted.value || !cmpt.value) {
    return []
  }
  fakeTouch(cmpt.value.key)

  // console.log('[debug] cmptSlots', cmpt.value.key, cmpt.value, cmptMeta.value?._cx_meta)

  // await nextTick()
  // await macroTask()
  // await nextTick()
  // await macroTask()
  // await nextTick()

  // console.log('[debug] cmptSlots', cmpt.value.key, cmpt.value, cmptMeta.value?._cx_meta)

  // 1. 优先按照组件运行时的 slots 属性展示页面
  if (cmpt.value.slots) {
    return (
      isFunction(cmpt.value.slots)
        ? cmpt.value.slots({ cmpt: readonly(cmpt.value)!, cx: readonly(cx) } as any)
        : cmpt.value.slots
    ) as CxComponentSlot[]
  }

  // 2. 再按照组件元数据定义的 slots 展示页面
  // cmptMeta 即 getMeta 的返回值（_cx_meta 本体），直接取 slots；
  // 此前误写为 cmptMeta.value?._cx_meta?.slots（多套一层），导致元数据声明的
  // 插槽永不生效、全部回落默认插槽
  const metaSlots = cmptMeta.value?.slots as any
  if (metaSlots) {
    return (
      isFunction(metaSlots)
        ? metaSlots({ cmpt: readonly(cmpt.value)!, cx: readonly(cx) } as any)
        : isArray(metaSlots)
          ? metaSlots
          : // 此处不能加 async：mapValues 不会 await，async 回调会让每个插槽变成
            // 未解析的 Promise，slot.key 变 undefined，插槽同样无法渲染
            mapValues(metaSlots, (v, k) => ({
              key: k,
              ...(isFunction(v)
                ? v({ cmpt: readonly(cmpt.value!), cx: readonly(cx) } as any)
                : {
                    name: v.name || k,
                    description: v.description || '',
                  }),
            }))
    ) as CxComponentSlot[]
  }

  // 3. 没有定义插槽时，仅使用默认插槽
  // TODO 一些组件可能有多个子组件，默认应当都放到 default slot 中
  return [{ key: 'default', name: '默认插槽' }] as CxComponentSlot[]
})

const cmptSlots = ref(_cmptSlots.value)
watchEffect(() => {
  // 就算 meta.slots 计算结果为空数组，也会触发 cmptSlots.value 及模版更新，
  // 所以这里做一次浅比较再赋值，不然开发过程中会出现组件热更新时死循环现象
  if (isEqual(_cmptSlots.value, cmptSlots.value)) {
    return
  } else {
    cmptSlots.value = _cmptSlots.value
  }
})

// watchEffect(() => {
//   console.log('[debug] cmptSlots', cmpt.value?.name, cmpt.value?.id?.slice(-4), cmptSlots.value)
// })

onBeforeMount(() => {
  if (cmpt.value) {
    cx.hooks.emit('cmpt:before-mount', {
      cmpt: markRaw(unref(cmpt)!) as CxComponentRuntime,
    })
  }
})
onMounted(() => {
  if (cmpt.value) {
    cx.hooks.emit('cmpt:mounted', {
      cmpt: markRaw(unref(cmpt)!) as CxComponentRuntime,
    })
  }
})
onBeforeUnmount(() => {
  if (cmpt.value) {
    cx.hooks.emit('cmpt:unmounted', {
      cmpt: markRaw(unref(cmpt)!) as CxComponentRuntime,
    })
  }
})
onUnmounted(() => {
  if (cmpt.value) {
    cx.hooks.emit('cmpt:unmounted', {
      cmpt: markRaw(unref(cmpt)!) as CxComponentRuntime,
    })
  }
})

defineExpose({
  reRender,
  isMounted,
})
</script>
