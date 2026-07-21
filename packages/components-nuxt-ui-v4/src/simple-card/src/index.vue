<template>
  <div ref="cmpt" :class="[ns.b()]">
    <div :class="ns.e('header')">
      <slot name="header-start" />
      <slot name="header">
        <div :class="ns.e('info-con')">
          <div :class="ns.e('name-con')">
            <h4 v-if="name" :class="ns.e('name')">
              {{ name }}
            </h4>

            <UPopover
              v-if="tip"
              mode="hover"
              :popper="{ placement: 'left' }"
              :ui="{ wrapper: 'flex-shrink-0' }"
            >
              <img
                :class="ns.e('tip-icon')"
                aria-hidden="true"
                :src="IconTip"
                class="opacity-30 relative top-[0.2rem]"
                type="image/svg+xml"
              />
              <template #panel>
                <p class="p-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-96">
                  {{ tip }}
                </p>
              </template>
            </UPopover>
          </div>
          <div v-if="description" :class="ns.e('description')">
            {{ description }}
          </div>
        </div>
      </slot>
      <div :class="ns.e('actions-x')">
        <slot name="action" />
      </div>
      <slot name="header-end" />
    </div>
    <div :class="ns.e('content')">
      <slot name="default" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAttrs, useTemplateRef, computed } from 'vue'

import { useCxBEM } from '@lionad/cx-vue'

const IconTip =
  'data:image/svg+xml,%3Csvg%20width%3D%2216%22%20height%3D%2216%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M8%201a7%207%200%20110%2014A7%207%200%20018%201zm0%201.188a5.813%205.813%200%20000%2011.624A5.813%205.813%200%20008%202.188zM8.375%207c.069%200%20.125.056.125.125v4.25a.125.125%200%2001-.125.125h-.75a.125.125%200%2001-.125-.125v-4.25c0-.069.056-.125.125-.125zM8%204.5A.75.75%200%20118%206a.75.75%200%20010-1.5z%22%20fill-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E%0A'
import { UPopover } from '../../../vendor/bridge'

defineOptions({ name: 'CxSimpleCard' })

const ns = useCxBEM('simple-card')
const attrs = useAttrs()
const props = withDefaults(
  defineProps<{
    name?: string
    tip?: string
    description?: string
  }>(),
  {
    name: '',
    tip: '',
    description: '',
  },
)

const cmptRef = useTemplateRef('cmpt')

const name = computed(() => props.name)
const tip = computed(() => props.tip)
const description = computed(() => props.description)
</script>

<style lang="scss">
@use '../../styles/index.scss' as *;

$ns: 'cx';

@layer cx {
  @include b('simple-card') {
    @apply box-border py-1 px-2 h-auto bg-white dark:bg-neutral-800;
    display: grid;
    grid-template: auto minmax(0, 1fr) / minmax(0, 1fr);

    /*********************************************** layouts */

    @include e('header') {
      @apply flex flex-row items-center justify-between gap-1;
      @apply w-full;
    }

    @include e('info-con') {
      @apply flex flex-col flex-1 max-w-full;
    }

    @include e('name-con') {
      @apply flex flex-row items-center gap-1;
    }

    /*********************************************** elements */

    @include e('name') {
      @apply text-base font-semibold text-neutral-800 dark:text-neutral-200;
      @apply capitalize;
      @apply line-clamp-1 break-all max-w-full;
      word-break: break-all;
      max-width: 100%;
    }
    @include e('description') {
      @apply text-sm text-neutral-500 dark:text-neutral-400;
      @apply line-clamp-1 break-all max-w-full;
    }
    @include e('tip-icon') {
      @apply box-border p-0.5 text-neutral-500 dark:text-neutral-400;
    }
  }
}
</style>
