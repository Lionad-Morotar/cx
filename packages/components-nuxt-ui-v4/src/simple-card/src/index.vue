<template>
  <div ref="cmpt" :class="[ns.b()]">
    <div :class="ns.e('header')">
      <slot name="header-start" />
      <slot name="header">
        <div :class="ns.e('info-con')">
          <div :class="ns.e('name-con')">
            <h4 v-if="name" v-cx="{ text: 'name' }" :class="ns.e('name')">
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
          <div v-if="description" v-cx="{ text: 'description' }" :class="ns.e('description')">
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
import IconTip from './icons/tip.svg'
import { UPopover } from '~/vendor/nuxt-ui-v2/bridge'

defineOptions({ name: 'CxSimpleCard' })

const { t, apiTrans } = useApiTranslator()
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

apiTrans(computed(() => [props.name, props.tip, props.description]) as any)

const name = computed(() => t(props.name))
const tip = computed(() => t(props.tip))
const description = computed(() => t(props.description))
</script>

<style lang="scss">
@use 'assets/styles/index.scss' as *;

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
