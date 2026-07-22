<template>
  <UAvatarGroup
    v-if="isGroup"
    :class="[ns.b(), ns.is('group'), ns.is(props.size as string)]"
    :size="props.size as any"
    :max="safeNum(inner.max, 5)"
  >
    <cx-render-component v-for="avatar in avatars" :key="avatar.id" :component="avatar" />
  </UAvatarGroup>
  <UAvatar
    v-else
    ref="cmpt"
    :class="[ns.b(), ns.is('sub', props.isInGroup), ns.is(props.index as string)]"
    v-bind="{ ...avatarAttrs, ...chipAttrs }"
  />
</template>

<script setup lang="ts">
import { safeNum } from '@lionad/cx-definition'
import { has, not } from '@lionad/cx-definition'

import { useAttrs, useTemplateRef, computed, toRef, unref } from 'vue'

import { UAvatar, UAvatarGroup } from '../../../vendor/bridge'

import { useCx, useCxMedia, useCxSlot, useCxBEM } from '@lionad/cx-vue'
import type {
  CxComponentRuntime,
  ComponentProps,
  CxImageUploadPropValue,
} from '@lionad/cx-definition'

defineOptions({ name: 'CxAvatar' })

type UAvatarProps = ComponentProps<typeof UAvatar>

const cx = useCx()
const ns = useCxBEM('avatar')
const inner = defineProps<{
  max?: number | string
}>()
const props = useAttrs() as UAvatarProps & {
  cmpt: CxComponentRuntime
  image?: CxImageUploadPropValue
  enableChip?: boolean
  isInGroup?: boolean
  index?: string
}
const { showSlot } = useCxSlot(props.cmpt)
const cmptRef = useTemplateRef('cmpt')

const isGroup = showSlot('tail')
const avatars = computed(() => {
  const res = [] as CxComponentRuntime[]
  cx.utils.touch(props.cmpt, (cmpt) => {
    if (cmpt.key === 'cx-avatar') {
      const newAvatar = cx.utils.cloneComponent(cmpt, ['data', 'id', 'parents', 'sortn'])
      newAvatar.data.size = props.size
      newAvatar.data.isInGroup = not(cmpt.id === props.cmpt.id && isGroup)
      newAvatar.data.index = String(res.length)
      res.push(newAvatar)
    }
  })
  return res
})

const oss = useCxMedia()
const src = oss.getPreviewURL(toRef(props.image?.url))
const avatarAttrs = computed(() => ({
  src: unref(src),
  alt: props.alt,
  title: props.alt,
  size: props.size,
}))
const chipAttrs = computed(() => {
  return not(props.enableChip)
    ? {}
    : {
        chipText: props.chipText || '',
        chipColor: props.chipColor || 'primary',
        chipPosition: props.chipPosition || 'top-right',
      }
})

const isInGroup = computed(() => has(props.isInGroup))
defineExpose({
  isInGroup,
})
</script>

<style lang="scss">
@use '../../styles/index.scss' as *;

$ns: 'cx';

@layer cx {
  @include b('avatar') {
    @apply inline-block align-middle;

    @include when('group') {
      @apply relative;

      @include when('3xs') {
        --ml: -0.1rem;
      }
      @include when('2xs') {
        --ml: -0.15rem;
      }
      @include when('xs') {
        --ml: -0.2rem;
      }
      @include when('sm') {
        --ml: -0.25rem;
      }
      @include when('md') {
        --ml: -0.3rem;
      }
      @include when('lg') {
        --ml: -0.35rem;
      }
      @include when('xl') {
        --ml: -0.4rem;
      }
      @include when('2xl') {
        --ml: -0.45rem;
      }
      @include when('3xl') {
        --ml: -0.5rem;
      }
    }

    @include when('group') {
      .placeholder-avatar,
      .cx-avatar {
        @apply ring-2 ring-white dark:ring-black;

        // 使用 index 而不是 :nth-child，避免 render-cmpt-wrapper 多套了一层 DOM
        &:not(.is-0) {
          margin-left: var(--ml);
        }
      }
    }
  }
}
</style>
