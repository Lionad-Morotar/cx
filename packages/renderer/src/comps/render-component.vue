<template>
  <!-- eslint-disable vue/no-deprecated-slot-attribute -- :slot 是 cx-render-components 已声明的 prop，非废弃插槽特性 -->
  <template v-if="comp?.key">
    <component :is="showCompErrorWrapper" v-if="showCompErrorWrapper" name="showCompErrorWrapper" />
    <component
      :is="compWrapper"
      v-else-if="compWrapper"
      :key="renderKey"
      name="compWrapper"
      :comp-i-d="comp.id"
      :comp-key="comp.key"
      :data-render-key="renderKey"
    >
      <cx-render-component-with-bindings
        v-if="comp"
        :set-ref="(ref: any) => setRef(ref)"
        :component-type="compType"
        :component-directives="directives"
        :comp-i-d="comp.id"
        v-bind="compDatas"
        v-on="compEvents"
      >
        <template
          v-for="slot in compSlots"
          #[slot.key!]
          :key="`render-${comp.id}-area-${slot.key}`"
        >
          <cx-render-components :slot="slot" :comp-i-d="comp.id" :slot-wrapper="slotWrapper" />
        </template>
      </cx-render-component-with-bindings>
    </component>
    <cx-render-component-with-bindings
      v-else-if="comp"
      :key="`${comp.id}-${comp.key}`"
      :set-ref="(ref: any) => setRef(ref)"
      :component-type="compType"
      :component-directives="directives"
      :comp-i-d="comp.id"
      v-bind="compDatas"
      v-on="compEvents"
    >
      <template
        v-for="slot in compSlots"
        #[slot.key!]="data"
        :key="`render-${comp.id}-area-${slot.key}`"
      >
        <cx-render-components
          :slot="slot"
          :comp-i-d="comp.id"
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
// const [DefineCompRender, ReuseCompRender] = createReusableTemplate()

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
    const lastRef = refs.get(unref(comp)!.id) || ({} as any)
    lastRef.ref = ref
    if (!lastRef.data) {
      lastRef.data = comp.value
    }
    refs.set(unref(comp)!.id, lastRef)
    isMounted.value = true
  }, 0)
}

const cxEmitter = cx.emitter
const cxUtils = cx.utils
const compWrapper = readonly(inject<Component>('cx-render-component-wrapper')!)
const compErrorWrapper = readonly(inject<Component>('cx-render-error-component-wrapper')!)
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
const showCompErrorWrapper = computed(() => states.isSyncError && unref(compErrorWrapper))

onErrorCaptured((err) => {
  console.error(`[ERR] cx error capturer, on component ${unref(comp)?.key}`, err)
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

const comp = shallowRef<CxComponentRuntime>()
watchImmediate(model, (x) => (comp.value = x as CxComponentRuntime))
provide('cx-comp', comp)

const renderKey = ref(1)
const reRender = async () => (renderKey.value += 1)

const compMeta = computed(() => cxUtils?.getMeta?.(unref(comp)!))
provide('cx-comp-meta', compMeta)
provide('cx-reloader', async (condition: boolean | CallableFunction) => {
  const shouldReRender = isFunction(condition) ? await condition.call(null, unref(comp)) : condition
  console.log('[info] check cx-reload due to:', condition, shouldReRender)
  if (shouldReRender) {
    reRender()
  }
})

const compType = computed(() => {
  const k = comp.value?.key || ''
  // * 调试模式时，组件名 cx-dialog 会被转换为 cx-dialog-debug
  const postFix = k.startsWith('cx-') ? (isDebug ? '-debug' : '') : ''
  const patchedK = k
  return `${patchedK}${postFix}`
})

// 异步组件创建时，还没有加载到元数据，
// 所以等加载完毕后重新初始化一下 data
cx.hooks.on('comp:async-comp:loaded', resetAsyncComponentInitialData)
onBeforeUnmount(() => cx.hooks.off('comp:async-comp:loaded', resetAsyncComponentInitialData))
async function resetAsyncComponentInitialData({ comp: loadedComp }: any) {
  if (!comp.value) {
    return // console.error('[ERR] skip async-comp:loaded, no comp value found')
  }
  if (loadedComp.key === comp.value.key) {
    await nextTick()
    try {
      if (isObject(comp.value?.data) && comp.value?.data) {
        const initial = cloneDeep(
          await cxUtils.getData(loadedComp.key, {}, {
            component: readonly(comp.value),
            data: readonly(comp.value.data),
          } as any),
        )
        const sourceData = cloneDeep(comp.value.data)
        deepMerge(comp.value.data, deepMerge(initial, sourceData))
      }
    } catch (e) {
      console.log('[verbose] error on comp:async-comp:loaded', e)
    } finally {
      await nextTick()
      cx!.hooks.emit('comp:async-comp-data:loaded', { comp: loadedComp })
    }
    // console.log(
    //   '[event] comp:async-comp:loaded data',
    //   initial,
    //   sourceData,
    //   comp.value.data
    // )
  }
}

const directives = computed(() => {
  const _datas = comp.value?.data || {}
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
  // console.log('[debug] directives', comp.value.key, res)
  return res
})

// watch(
//   () => unref(comp).data,
//   (newData) => {
//     console.log('[debug] ret', comp.value.key, newData)
//   },
//   {
//     deep: true,
//     immediate: true,
//   }
// )

/** *********************************************** events handlers */
/**********************************************************/

const compEmitNames = computed(() => {
  if (!comp.value) {
    return []
  }
  const eventData = comp.value?.data?._cx_events || []
  const isCxEvent = cxUtils.findFromCX(comp.value.key)
  if (isCxEvent) {
    const metaEmits = cxUtils.getEmits(comp.value.key)
    const names = Object.keys(metaEmits).filter((x) => eventData.find((y) => x === y.key))
    // console.info('[debug] event names', comp.value.key, names)
    return names
  }
  const names = eventData.map((x) => x.key)
  // console.info('[debug] event names', comp.value.key, names)
  return names
})
const nativeEmitNames = computed(() => {
  const eventData = comp.value?.data?._cx_events || []
  const metaEmits = nativeEvents
  const names = Object.keys(metaEmits).filter((x) => eventData.find((y) => x === y.key))
  return names
})

const dataConfig = ref({ binds: {} })
watchImmediate(
  () => comp.value?.data?._cx_data_config,
  () => {
    dataConfig.value = cx.utils.calcDataConfigs(comp.value!) || {
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
      const [mainCate, compID, subCate, propKey] = parsed
      const targetCompData = unref(cx.datas.compsIdMap)?.[compID!]?.data || {}
      Object.entries(targetCompData).map(([k, value]) => {
        if (k !== propKey) return
        const stop = watch(
          () => targetCompData[k],
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

const compDatas = computed(() => {
  if (!comp.value) {
    return {}
  }
  const rawData = comp.value.data
  const data = {
    ...rawData,
    ...bindDatas.value,
  } as Record<string, any>

  return useOmit(data, [
    // vue comp props
    'class',
    // cx meta props
    '_cx_name',
    '_cx_events',
    '_cx_style',
    'comp',
    // TODO move to other place
    '_config',
    '_dataConfig',
    '_cx_data_config',
    '_pr',
    '_slotConfig',
  ])
})

const compEvents = computed(() => {
  if (!comp.value) {
    return {}
  }
  const id = comp.value.id
  // 这里监听的所有定义事件和原生事件，不知道会不会有性能问题
  const keys = [...compEmitNames.value, ...nativeEmitNames.value]
  const eventsMap = {} as Record<string | CxEventKey, () => void>
  try {
    keys.forEach((k) => {
      const broadcast = (...args: any[]) => {
        unref(cx).hooks.emit('comp:cx-event:emit', {
          id,
          event: k,
          args,
        })
        return cxEmitter({
          comp: unref(comp)!,
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

const _compSlots = computed(() => {
  if (!_isMounted.value || !comp.value) {
    return []
  }
  fakeTouch(comp.value.key)

  // console.log('[debug] compSlots', comp.value.key, comp.value, compMeta.value?._cx_meta)

  // await nextTick()
  // await macroTask()
  // await nextTick()
  // await macroTask()
  // await nextTick()

  // console.log('[debug] compSlots', comp.value.key, comp.value, compMeta.value?._cx_meta)

  // 1. 优先按照组件运行时的 slots 属性展示页面
  if (comp.value.slots) {
    return (
      isFunction(comp.value.slots)
        ? comp.value.slots({ comp: readonly(comp.value)!, cx: readonly(cx) } as any)
        : comp.value.slots
    ) as CxComponentSlot[]
  }

  // 2. 再按照组件元数据定义的 slots 展示页面
  // compMeta 即 getMeta 的返回值（_cx_meta 本体），直接取 slots；
  // 此前误写为 compMeta.value?._cx_meta?.slots（多套一层），导致元数据声明的
  // 插槽永不生效、全部回落默认插槽
  const metaSlots = compMeta.value?.slots as any
  if (metaSlots) {
    return (
      isFunction(metaSlots)
        ? metaSlots({ comp: readonly(comp.value)!, cx: readonly(cx) } as any)
        : isArray(metaSlots)
          ? metaSlots
          : // 此处不能加 async：mapValues 不会 await，async 回调会让每个插槽变成
            // 未解析的 Promise，slot.key 变 undefined，插槽同样无法渲染
            mapValues(metaSlots, (v, k) => ({
              key: k,
              ...(isFunction(v)
                ? v({ comp: readonly(comp.value!), cx: readonly(cx) } as any)
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

const compSlots = ref(_compSlots.value)
watchEffect(() => {
  // 就算 meta.slots 计算结果为空数组，也会触发 compSlots.value 及模版更新，
  // 所以这里做一次浅比较再赋值，不然开发过程中会出现组件热更新时死循环现象
  if (isEqual(_compSlots.value, compSlots.value)) {
    return
  } else {
    compSlots.value = _compSlots.value
  }
})

// watchEffect(() => {
//   console.log('[debug] compSlots', comp.value?.name, comp.value?.id?.slice(-4), compSlots.value)
// })

onBeforeMount(() => {
  if (comp.value) {
    cx.hooks.emit('comp:before-mount', {
      comp: markRaw(unref(comp)!) as CxComponentRuntime,
    })
  }
})
onMounted(() => {
  if (comp.value) {
    cx.hooks.emit('comp:mounted', {
      comp: markRaw(unref(comp)!) as CxComponentRuntime,
    })
  }
})
onBeforeUnmount(() => {
  if (comp.value) {
    cx.hooks.emit('comp:unmounted', {
      comp: markRaw(unref(comp)!) as CxComponentRuntime,
    })
  }
})
onUnmounted(() => {
  if (comp.value) {
    cx.hooks.emit('comp:unmounted', {
      comp: markRaw(unref(comp)!) as CxComponentRuntime,
    })
  }
})

defineExpose({
  reRender,
  isMounted,
})
</script>
