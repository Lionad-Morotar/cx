<template>
  <UFormGroup
    ref="cmpt"
    :class="ns.b()"
    class="space-y-2"
    :required="has(props.required)"
    :eager-validation="has(props.eagerValidation)"
  >
    <template #default="{ error }">
      <slot v-if="showSlot('default')" name="default" v-bind="{ error }" />
      <CxEmpty v-else-if="showEmptyTip" text-only :text="'当前表单项为空'" />
    </template>
    <template #label="x">
      <slot v-if="showSlot('label')" name="label" v-bind="x" />
      <span v-else>{{ props.label }}</span>
    </template>
    <template #description="x">
      <slot v-if="showSlot('description')" name="description" v-bind="x" />
      <span v-else>{{ props.description }}</span>
    </template>
    <template #hint="x">
      <slot v-if="showSlot('hint')" name="hint" v-bind="x" />
      <span v-else>{{ props.hint }}</span>
    </template>
    <template #help="x">
      <slot v-if="showSlot('help')" name="help" v-bind="x" />
      <span v-else>{{ props.help }}</span>
    </template>
    <template v-if="showSlot('error')" #error="x">
      <slot name="error" v-bind="x" />
    </template>
  </UFormGroup>
</template>

<script setup lang="ts">
import { CxEmpty } from '@lionad/cx-vue'
import { has } from '@lionad/cx-definition'
import { useAttrs, inject, useTemplateRef, computed } from 'vue'

import { UFormGroup } from '../../../vendor/bridge'

import { useCxSlot, useCxBEM } from '@lionad/cx-vue'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxForm' })

type UFormFieldProps = ComponentProps<typeof UFormGroup>

const ns = useCxBEM('form-item')
const inner = defineProps<{}>()
const props = useAttrs() as UFormFieldProps & {
  cmpt: CxComponentRuntime
}
const showEmptyTip = inject(`cx-form-empty-tip-${props.cmpt.id}`, true)

const { showSlot } = useCxSlot(props.cmpt)

const cmptRef = useTemplateRef('cmpt')
const ui = computed(() => {})

defineExpose({})
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('form-item') {
    /* 静态样式已上提至模板 class */
  }
}
</style>
