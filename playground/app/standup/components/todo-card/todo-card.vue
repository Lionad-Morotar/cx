<template>
  <div :class="kls" v-show="dataState.isInited" @click="handleClick">
    <slot name="header">
      <div :class="ns.e('input-con')">
        <UInput
          ref="todoInputRef"
          type="todo-input"
          v-model="input"
          placeholder="请输入问题，按下回车添加"
          :disabled="isDisabled"
        >
          <template #leading v-if="inputTag">
            <UBadge color="neutral" variant="subtle" class="closable-tag">
              {{ inputTag }}
              <button
                type="button"
                class="close-btn"
                aria-label="清除"
                @click="() => (inputTag = '')"
                >×</button
              >
            </UBadge>
          </template>
        </UInput>
      </div>
    </slot>
    <template v-if="isEmptyContent">
      <div :class="ns.e('empty-con')" ref="emptyFirstRef">
        <img class="image" :src="EmptyStrImage" />
        <div class="title">暂时没有内容哦~</div>
      </div>
    </template>
    <template v-else>
      <div :class="ns.e('bg')" />
      <CxScrollbar
        :class="[ns.e('scroll-area-y'), 'cx-todo-scroll-y']"
        ref="scrollAreaRef"
        @scroll="scrollY"
      >
        <div :class="[scrollXVal && ns.is('scroll-x'), ns.e('content-wrapper')]">
          <div :class="ns.e('orders')">
            <template v-for="(line, idx) in dataState.value" :key="String(idx) + line.id">
              <slot name="order" :line="line" :idx="idx">
                <span class="order" :class="ns.is('checked', line.checked)" v-if="isTextEditor">
                  <span class="order-number">{{ Number(idx) + 1 }}.</span>
                </span>
              </slot>
            </template>
          </div>
          <CxScrollbar
            :class="[ns.e('scroll-area-x'), 'cx-todo-scroll-x']"
            @scroll.stop="scrollX"
          >
            <div :class="ns.e('todo-content')">
              <div
                v-for="(line, idx) in dataState.value"
                :key="String(idx) + line.id"
                :class="[
                  ns.e('line-content-wrapper'),
                  ns.is('checked', line.checked),
                  ns.is('highlighted', line.id === highlightedItem?.id),
                ]"
              >
                <slot name="line-content-prefix" :line="line" :idx="idx">
                  <span :class="[ns.is('checked', line.checked), ns.e('order')]" v-if="isTodoList">
                    <slot name="line-content-prefix-prefix" :line="line" :idx="idx" />
                    <UCheckbox
                      v-model="line.checked"
                      :disabled="isDisabled"
                      @update:model-value="dataState.updateDB"
                    />
                    <slot name="line-content-prefix-suffix" :line="line" :idx="idx" />
                  </span>
                </slot>
                <slot name="line-content" :line="line" :idx="idx">
                  <render-content
                    :class="[startWithMark(line.content)]"
                    :key="line.id"
                    :readonly="isDisabled"
                    :disabled="isDisabled"
                    :ref="(ref: any) => refsMan?.set(line.id, { ref, line })"
                    v-model:content="dataState.value[idx]"
                    @blur="(e: Event) => syncEdit(e, line)"
                    @click.stop="() => focusSafe(line)"
                    @input="(e: Event) => preventInputHTML(e as InputEvent, line)"
                  />
                </slot>
                <slot name="line-content-suffix" :line="line" :idx="idx">
                  <div :class="ns.e('actions')" v-if="isTodoList">
                    <div :class="ns.e('action')" @click="dataState.remove(line)">
                      <UIcon name="i-lucide-trash" />
                    </div>
                  </div>
                </slot>
              </div>
            </div>
          </CxScrollbar>
        </div>
      </CxScrollbar>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, watch, ref, nextTick } from 'vue'
import { useActiveElement, unrefElement, useKeyModifier, useEventListener } from '@vueuse/core'
import { useCxNamespace } from '../../utils/namespace'
import deindent from 'deindent'
import { useRefs, onKeyStroke } from '../../hooks'
import RenderContent from './component/render/render-content.vue'
import EmptyStrImage from '../../assets/empty.svg'

import type { User } from '../../apis'
import { useStandupContents } from './contents'
import type { Content } from './types'

// const [LineTemplate, ReuseLineTemplate] = createReusableTemplate()

// const log = (e: Event) => console.log(e)

/********************************************************************************** Props */

const ns = useCxNamespace('todo-card')
const props = withDefaults(
  defineProps<{
    use?: any
    modelValue?: Content[]
    standupID?: string
    user?: User | null
    disabled?: boolean
    type?: 'text' | 'todo'
  }>(),
  {
    modelValue: () => [] as Content[],
    disabled: false,
    type: 'todo',
  },
)
// const isDisabled = ref(false)
const isDisabled = computed(() => props.disabled)
const isTodoList = computed(() => props.type === 'todo')
const isTextEditor = computed(() => props.type === 'text')
const isEmptyContent = computed(() => !dataState.value?.length)

const kls = computed(() => [
  ns.b(),
  ns.is('disabled', isDisabled.value),
  ns.is('empty', !dataState.value?.length),
  ns.is('todo', Boolean(isTodoList.value)),
  ns.is('text', Boolean(isTextEditor.value)),
  ns.is('compact', Boolean(isTodoList.value)),
])

const startWithMark = (content = '') => {
  const markShouldIndent = /^[『【]/
  return markShouldIndent.test(content) ? ns.is('first-mark') : ''
}

/********************************************************************************** Data Manipulate */

const userID = computed(() => props.user?.id || '')
const standupID = computed(() => props.standupID || '')
const dataState =
  props.use ||
  useStandupContents(standupID, userID, isDisabled, (x: Content) => {
    // 问题列表形式下，不需要展示空行
    if (isTodoList.value) {
      return x.content.replace(/\s|\r|\n/g, '').length > 0
    }
    return true
  })
const refsMan = useRefs<any>()

const clear = () => {
  refsMan.clear()
  dataState.clear()
}

const active = ref<Content | null>(null)
const documentActiveElem = useActiveElement()
const isActive = computed(() => !!active.value)

// 在离开页面前主动保存一次
useEventListener(window, 'beforeunload', async () => {
  refsMan.getAll().map((x) => x.ref?.blur())
  await dataState.updateDBImmediate()
})
watch(active, async (n) => {
  if (n) {
    const ref = refsMan.get(n.id)?.ref
    ref?.focus()
  }
})
watch(documentActiveElem, (n) => {
  const inActive = refsMan.getAll().find((x) => unrefElement(x.ref) === n)
  if (!inActive) {
    active.value = null
  }
})

const getValidSelection = () => {
  const selection = window?.getSelection?.()
  // console.log(selection)
  if (!selection) {
    return false
  }
  return selection
}

// 因为 contenteditable 节点中的内容和数据分离，
// 所以某些时候需要用到这个手动同步数据的函数
const getRealContent = (line: Content) => {
  const ref = refsMan.get(line.id)?.ref
  if (!ref) return null
  return ref.innerText || ''
}
const syncContent = (line: Content) => {
  const realContent = getRealContent(line)
  if (realContent) {
    line.content = realContent
  }
}

const syncEdit = (e: Event, line: Content) => {
  const text = refsMan.get(line.id)?.ref?.getValue() || ''
  line.content = text
  resetScroll(line)
}
// 直接替换文本会导致光标跳到最前面，所以需要手动恢复
// 编辑态光标管理
const preventInputHTML = (e: InputEvent, line: Content) => {
  // * disabled for a while
  // if (e.inputType !== 'insertFromPaste') {
  //   return
  // }
  // const text = (e?.target as any)?.innerText || ''
  // const html = (e?.target as any)?.innerHTML || ''
  // if (text !== html) {
  //   line.content = text || ''
  // }
}

const handleClick = () => {
  isTextEditor.value && dataState.add()
}
const addAndFocus = (...args: Parameters<typeof dataState.add>) => {
  const n = dataState.add(...args)
  focus(n)
  return n
}

/********************************************************************************** Highlight */

const highlightedItem = ref(null as Content | null)
const highlightedItemTick = ref(0)
const highlight = (line: Parameters<typeof dataState.findIndex>[0]) => {
  const target = dataState.findIndex(line)
  if (target === -1) {
    return
  }

  highlightedItem.value = dataState.value[target] ?? null
  if (!highlightedItem.value) return
  const $elm = unrefElement(refsMan.get(highlightedItem.value.id)?.ref)
  $elm?.scrollIntoViewIfNeeded({ behavior: 'smooth' })

  if (highlightedItemTick.value) {
    clearTimeout(highlightedItemTick.value)
  }
  highlightedItemTick.value = setTimeout(() => {
    highlightedItem.value = null
  }, 1000) as unknown as number
}

/********************************************************************************** Keyboard Actions */

const moveToPrevLine = (line: Content) => {
  const index = dataState.findIndex(line)
  if (index >= 1) {
    focus(dataState.value[index - 1], true)
  }
}
const moveToNextLine = (line: Content) => {
  const index = dataState.findIndex(line)
  if (index === -1) {
    return
  }
  if (index === dataState.value.length - 1) {
    // 新行必须落入数据源（展示数组由 filter 派生，push 展示数组会凭空消失）
    const n = dataState.add()
    if (n) focus(n)
  } else {
    focus(dataState.value[index + 1], true)
  }
  // 光标移动（跨行合并/拆分时保持位置）
  // await nextTick();
  // const selection = getValidSelection()
  // if (selection) {
  //   selection.setPosition(selection.anchorNode, 0)
  // }
}
const removeLineSafe = async (line: Content, e: Event) => {
  if (!active.value) {
    return
  }
  const selection = getValidSelection()
  if (!selection) {
    return
  }
  if (selection.anchorOffset === 0) {
    e.preventDefault()

    const idx = dataState.findIndex(line)
    const prevLine = dataState.value[idx - 1]
    if (!prevLine) {
      dataState.remove(line)
      focus(dataState.value[0])
      return
    }

    const moveContent = getRealContent(line)
    prevLine.content = prevLine.content + moveContent
    dataState.remove(line)

    await focus(prevLine)
    const selection = getValidSelection()
    if (selection) {
      selection.setPosition(selection.anchorNode, prevLine.content.length - moveContent.length)
    }
  }
}
const splitLineSafe = async (line: Content, e: Event) => {
  if (!active.value) {
    return
  }
  const selection = getValidSelection()
  if (!selection) {
    return
  }
  e.preventDefault()

  moveToNextLine(line)

  // * todo check
  // const content = getRealContent(line)
  // const idx = dataState.findIndex(line)
  // const [toPreserve, toMove] = [
  //   content.slice(0, selection.anchorOffset),
  //   content.slice(selection.anchorOffset)
  // ]
  // // const newLine = dataState.add(toMove, idx)
  // line.content = toPreserve

  // console.log('[info] preserve', toPreserve, 'move', toMove, idx)
  // await focus(newLine)
}

const focusSafe = (item?: Content, instant = false) => {
  if (isDisabled.value) {
    return
  } else {
    focus(item, instant)
  }
}

const focus = async (item?: Content, instant = false) => {
  // console.log('[info] focus', item?.id);
  if (!item) {
    if (dataState.value?.length) {
      focus(dataState.value[dataState.value.length - 1])
    } else {
      addAndFocus()
    }
  } else {
    if (!instant) {
      await nextTick()
    }
    active.value = item
  }
}

const isCtrlOn = useKeyModifier('Control')
const isMetaOn = useKeyModifier('Meta')
const isCtrlOrMetaOn = computed(() => isCtrlOn.value || isMetaOn.value)

onKeyStroke(
  'Enter',
  (e) => {
    console.log(e)
    if (active.value) {
      e.preventDefault()
      e.stopImmediatePropagation()
      if (isTextEditor.value) {
        splitLineSafe(active.value, e)
      }
      return true
    }
    if (isTodoList.value) {
      if (document.activeElement?.getAttribute('type') === 'todo-input') {
        addInputToItem()
        return true
      }
    }
  },
  {
    takeover: true,
  },
)
onKeyStroke(
  'Backspace',
  (e) => {
    if (active.value) {
      e.stopImmediatePropagation()
      removeLineSafe(active.value, e)
      return true
    }
  },
  {
    takeover: true,
  },
)
onKeyStroke(
  'ArrowUp',
  (e) => {
    if (active.value) {
      e.stopImmediatePropagation()
      moveToPrevLine(active.value)
      return true
    }
  },
  {
    takeover: true,
  },
)
onKeyStroke(
  'ArrowDown',
  (e) => {
    if (active.value) {
      e.stopImmediatePropagation()
      moveToNextLine(active.value)
      return true
    }
  },
  {
    takeover: true,
  },
)
onKeyStroke(
  'ArrowLeft',
  (e) => {
    if (active.value) {
      e.stopImmediatePropagation()
      return true
    }
  },
  {
    takeover: true,
  },
)
onKeyStroke(
  'ArrowRight',
  (e) => {
    if (active.value) {
      e.stopImmediatePropagation()
      return true
    }
  },
  {
    takeover: true,
  },
)
onKeyStroke(['v', 'V'], () => {
  if (active.value && isCtrlOrMetaOn.value) {
    const idleFn = window.requestIdleCallback || window.setTimeout
    idleFn(() => {
      setTimeout(() => {
        const value = deindent(active.value?.content)
        const [first, ...rest] = value?.split('\n') || []
        if (first) {
          active.value!.content = first
          resetScroll(active.value!)
        }
        if (rest.length) {
          let idx = dataState.findIndex(active.value!)
          rest.forEach((x: string) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const n = addAndFocus(x, ++idx)
            n && resetScroll(n)
          })
        }
      }, 16.66 * 3)
    })
  }
})

/********************************************************************************** TODO-List Input */

const input = ref('')
const inputTag = ref('')
const todoInputRef = ref()

const addInputToItem = async () => {
  if (!input.value.length) {
    return
  }
  const s = input.value
  const t = inputTag.value
  input.value = ''
  inputTag.value = ''

  addAndFocus(
    {
      content: s,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      mention: t ? [t] : [],
    },
    0,
  )

  await nextTick()
  await nextTick()
  const ref = todoInputRef.value as any
  const inputEl =
    (ref?.inputRef as HTMLInputElement) || ref?.$el?.querySelector('input')
  inputEl?.focus?.()
}

/********************************************************************************** Scroll Interactions */

const scrollAreaRef = ref()
const scrollYPX = ref('0px')
const scrollXVal = ref(0)
const scrollY = (e: Event) => {
  const scrollTop = (e.target as HTMLElement).scrollTop || 0
  scrollYPX.value = `-${scrollTop}px`
}
const scrollX = (e: Event) => {
  const scrollLeft = (e.target as HTMLElement).scrollLeft || 0
  scrollXVal.value = scrollLeft
}

const shadowX = computed(() => Math.pow(scrollXVal.value, 0.3))

const resetScroll = async (item: Content) => {
  nextTick(() => {
    const target = refsMan.get(item.id)?.ref
    const el = unrefElement(target)
    el?.scrollLeft && (el.scrollLeft = 0)
  })
  nextTick(() => {
    const scrollEl = unrefElement(scrollAreaRef.value) as HTMLElement | null
    if (scrollEl) {
      scrollEl.scrollLeft = 0
    }
  })
}

/********************************************************************************** Expose */

defineExpose({
  isActive,
  addItem: addAndFocus,
  focus,
  items: dataState.value,
  scroll,
  clear,
  highlight,
  todoInputRef,
  inputValue: input,
  inputTagValue: inputTag,
  setInput: (s: string) => !isDisabled.value && (input.value = s || ''),
  setInputTag: (s: string) => !isDisabled.value && (inputTag.value = s || ''),
})
</script>

<style>
.cx-todo-scroll-y,
.cx-todo-scroll-x {
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.closable-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  .close-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    padding: 0 2px;
    color: inherit;
  }
}

.cx-todo-card {
  --line-height: 40px;

  position: relative;
  gap: 4px;
  background: white;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 12px 14px;
  border-radius: 8px;
  width: 100%;
  height: 100%;
  overflow: hidden;
  transition: 0.15s;
  color: #262626;

  &.is-disabled {
    background: #eff2fb;

    .cx-todo-card__actions {
      display: none;
    }

    .cx-todo-card__bg {
      background: none;
    }

    &:hover {
      background: #e4e7f1;

      .cx-todo-card__bg {
        background: none;
      }
    }
  }
  &.is-empty {
    background: transparent;

    &:not(is-disabled):hover {
      background: rgba(255, 255, 255, 0.38);
    }
  }
  &.is-compact {
    .cx-todo-card__todo-content {
      max-width: 100%;

      .cx-todo-card__line-content-wrapper {
        text-overflow: ellipsis;
        overflow: hidden;
        word-break: break-all;
      }
    }
  }

  &__empty-con {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 27px;
    width: 100%;
    height: 100%;
    text-align: center;

    /* 保留原 BEM 全名：template 实际用 class="image"/"title"，二者历史上不匹配 */
    .cx-todo-card__image {
      width: 200px;
    }
    .cx-todo-card__title {
      font-size: 18px;
      color: #373737;
    }
  }

  /* 滚动超出一定距离后背景失效（浏览器渲染策略），line 也需单独设置背景 */
  &__bg {
    position: absolute;
    left: 14px;
    top: 12px;
    width: calc(100% - (14px * 2));
    height: 2000px;
    background: repeating-linear-gradient(
      transparent,
      transparent var(--line-height),
      #f1f1f1 var(--line-height),
      #f1f1f1 calc(var(--line-height) + 1px)
    );
    transform: translateY(v-bind(scrollYPX));
  }

  &__scroll-area-y {
    box-sizing: border-box;
    width: calc(100% + 12px);
    padding-right: 12px;
  }
  &__scroll-area-x {
    flex: 1;

    .el-scrollbar__bar {
      display: none;
    }
  }

  &__content-wrapper {
    display: flex;
  }

  &__orders {
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 calc(6px * v-bind(shadowX)) -4px rgba(0, 0, 0, 0.18);
    transition: 0.2s;
  }

  &__actions {
    display: grid;
    place-items: center;
    padding: 0 0.5em;
    color: #b4b4b4;
    font-size: 14px;
    font-weight: bold;
    height: var(--line-height);
    line-height: calc(var(--line-height) - 1px);
  }
  &__line-content {
    box-sizing: border-box;
    margin: 0px;
    padding: 0;
    height: calc(var(--line-height) + 1px);
    line-height: var(--line-height);
    border-bottom: solid 1px #f1f1f1;
    border: none;
    box-shadow: none;
    outline: none;
    -webkit-appearance: none;
    -webkit-user-select: auto;
    font-size: 15px;
    background: transparent;
    resize: none;
    width: fit-content;
    min-width: 100%;
    word-break: break-all;
    white-space: nowrap;

    &::-webkit-scrollbar {
      display: none !important;
      width: 0;
      height: 0;
    }
    &::-webkit-scrollbar-track {
      display: none !important;
    }

    &.is-first-mark {
      text-indent: -0.35em;
    }
  }

  /* --------------------------- styles by edit-type -------------------------- */

  &.is-text {
    .cx-todo-card__input-con {
      display: none;
    }
  }
  &.is-todo {
    .el-checkbox__inner {
      width: 18px;
      height: 18px;
      outline-color: var(--color, #ff4c4f);

      &::after {
        top: 1px;
        left: 6px;
        width: 4px;
        height: 10px;
      }
      &:hover {
        border-color: var(--color, #ff4c4f);
      }
    }
    .el-checkbox__input {
      &.is-checked .el-checkbox__inner {
        background: var(--color, #ff4c4f);
        border-color: var(--color, #ff4c4f);
      }
    }

    .cx-todo-card__input-con {
      margin-top: 4px;
      margin-bottom: 12px;

      .el-input {
        .el-input__wrapper {
          border-radius: 4px;
          font-size: 15px;

          &:has(.el-tag) {
            padding: 4px 8px;
          }
        }
        .el-input__inner {
          color: #262626;
        }
      }
    }
    .cx-todo-card__bg {
      display: none;
    }
    .cx-todo-card__line-content {
      height: fit-content;
      min-height: calc(var(--line-height) + 1px);
      line-height: calc(var(--line-height) + 1px);
      border-bottom: none;
      word-break: break-all;
      white-space: normal;
    }

    .cx-todo-card__order {
      display: flex;
      align-items: center;
      padding: 0 1em;
      width: auto;
      height: calc(var(--line-height) + 1px);
    }

    &:not(.is-disabled) {
      .cx-todo-card__line-content-wrapper {
        &:hover {
          background: rgba(255, 76, 79, 0.05);
          border-radius: 4px;
          border-color: none;
        }
      }
    }
    .cx-todo-card__todo-content {
      .cx-todo-card__line-content-wrapper {
        grid-template: auto / auto minmax(0, 1fr) auto;
        align-items: flex-start;
        width: 100%;
        height: fit-content;
        transition: background 0.2s;
        border-bottom: solid 1px #eff2fb;

        &:hover {
          .cx-todo-card__action {
            .el-icon {
              opacity: 1;
            }
          }
        }

        &:has(+ .cx-todo-card__line-content-wrapper:hover) {
          border-color: transparent;
        }

        &:last-child {
          border-color: transparent;
        }

        &.is-checked {
          .cx-todo-card__line-content {
            color: #b4b4b4;
            text-decoration: line-through;
          }
        }
      }

      .cx-todo-card__action {
        display: flex;
        justify-content: center;
        align-items: center;

        .el-icon {
          padding: 6px;
          cursor: pointer;
          background: white;
          border-radius: 4px;
          background: #fcfdff;
          opacity: 0;
          transition: 0.2s;

          &:hover {
            background: #f4f5fd;
          }
          &:active {
            background: #eff2fb;
          }
        }
      }
    }
  }
}

/* 以下 element 经 SCSS @at-root 从嵌套提升为扁平选择器，此处保持等价独立 */
.cx-todo-card__order {
  position: sticky;
  left: 0;
  display: grid;
  place-items: center;
  padding: 0 0.5em;
  width: auto;
  min-width: 1em;
  height: calc(var(--line-height) + 1px);
}

.cx-todo-card__order-number {
  position: relative;
  top: -0.5px;
  font-size: 15px;
  color: #999;
}

.cx-todo-card__todo-content {
  display: flex;
  flex-direction: column;
  width: max-content;
  padding: 0;
  min-width: 100%;
}

.cx-todo-card__line-content-wrapper {
  display: grid;
  grid-template: repeat(auto-fill, var(--line-height)) / minmax(0, 1fr);
  gap: 0 4px;
  align-items: center;
  box-sizing: border-box;
  height: calc(var(--line-height) + 1px);

  &.is-highlighted {
    animation: highlight 0.7s cubic-bezier(0, 0.99, 0.97, 0.82);
  }
}

/* @keyframes 必须置于顶层：Lightning CSS minify 不接受嵌套在选择器内的 at-rule */
@keyframes highlight {
  0% {
    background: #ff4c4f00;
    border-radius: 4px;
    z-index: 2;
  }
  20% {
    background: #ff4c4f43;
  }
  99% {
    background: #ff4c4f00;
    border-radius: 4px;
  }
  100% {
    background: white;
    border-radius: 0;
  }
}
</style>
