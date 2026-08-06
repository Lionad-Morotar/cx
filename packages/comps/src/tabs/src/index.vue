<template>
  <div :class="ns.b()" class="box-border w-full">
    <!-- tab 头行：点击切换激活面板 -->
    <div :class="ns.e('header')" role="tablist">
      <button
        v-for="t in normalizedTabs"
        :key="t.key"
        type="button"
        role="tab"
        :aria-selected="current === t.key"
        :class="[ns.e('tab'), current === t.key && ns.is('active')]"
        @click="current = t.key"
      >
        {{ t.label }}
      </button>
    </div>
    <!-- 面板区：v-show 保持各面板 DOM 状态，流式生长不被切换打断 -->
    <div :class="ns.e('panels')">
      <div
        v-for="t in normalizedTabs"
        v-show="current === t.key"
        :key="t.key"
        :class="ns.e('panel')"
        role="tabpanel"
      >
        <slot :name="`tab-${t.key}`" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useCxBEM } from '@lionad/cx-vue'

defineOptions({ name: 'CxTabs', inheritAttrs: false })

interface TabItem {
  key: string
  label: string
}

const props = withDefaults(
  defineProps<{
    tabs?: TabItem[]
    activeKey?: string
  }>(),
  {
    tabs: () => [],
    activeKey: '',
  },
)

const ns = useCxBEM('tabs')

// data 可能来自流式 JSON（未过 zod），宽容过滤非法项
const normalizedTabs = computed(() =>
  (props.tabs ?? []).filter(
    (t): t is TabItem => typeof t?.key === 'string' && !!t.key,
  ).map((t) => ({ key: t.key, label: t.label || t.key })),
)

// 内部激活态：props.activeKey 是 data-in 通道（伪联动/外部驱动），
// 缺省或失效时回落首个 tab
const current = ref('')
watch(
  [() => props.activeKey, normalizedTabs],
  ([key, tabs]) => {
    current.value = tabs.some((t) => t.key === key) ? key : (tabs[0]?.key ?? '')
  },
  { immediate: true },
)
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('tabs') {
    display: flex;
    flex-direction: column;

    @include e('header') {
      display: flex;
      gap: 4px;
      border-bottom: 1px solid rgb(127 127 127 / 25%);
    }

    @include e('tab') {
      padding: 6px 14px;
      font-size: 14px;
      color: inherit;
      cursor: pointer;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      opacity: 0.65;
      transition: opacity 0.2s;

      &:hover {
        opacity: 0.9;
      }

      @include when('active') {
        opacity: 1;
        border-bottom-color: currentcolor;
      }
    }

    @include e('panels') {
      flex: 1;
      min-height: 0;
    }

    @include e('panel') {
      height: 100%;
    }
  }
}
</style>
