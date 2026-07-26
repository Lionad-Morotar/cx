<template>
  <UForm
    ref="comp"
    :class="ns.b()"
    class="space-y-2"
    :schema="schema"
    :state="state"
    @submit="$emit('submit', $event)"
    @error="$emit('error', $event)"
  >
    <template #default="x">
      <slot v-if="showSlot('default')" name="default" v-bind="x" />
      <CxEmpty v-else-if="props.uiEmptyTip" :text="props.uiEmptyTipText || '当前表单内容为空'" />
    </template>
  </UForm>
</template>

<script setup lang="ts">
import { CxEmpty } from '@lionad/cx-vue'
import { useAttrs, provide, ref, computed, reactive } from 'vue'

import { UForm } from '../../../vendor/bridge'

import * as z from 'zod'
import { useCxSlot, useCxBEM } from '@lionad/cx-vue'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'
import type { Form, FormSubmitEvent } from '#ui/types'

defineOptions({ name: 'CxForm' })

type UFormProps = ComponentProps<typeof UForm>

const ns = useCxBEM('form')
const inner = defineProps<{}>()
const props = useAttrs() as UFormProps & {
  comp: CxComponentRuntime
  uiEmptyTip?: boolean
  uiEmptyTipText?: string
}
provide(`cx-form-empty-tip-${props.comp.id}`, props.uiEmptyTip)

const { showSlot } = useCxSlot(props.comp)

const compRef = ref<any>()
const ui = computed(() => {})

const attrs = computed(() => ({}) as const)

interface Schema {
  email?: string
  password?: string
}

const schema = z.object({
  email: z.email(),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
})

const state = reactive({
  email: '',
  password: '',
})

defineExpose({
  validate: () => compRef.value?.validate(),
  setErrors: (errors: Record<string, string>) => compRef.value?.setErrors(errors),
  submit: () => compRef.value?.submit(),
  getErrors: (path?: string) => compRef.value?.getErrors(path),
  clear: (path?: string) => compRef.value?.clear(path),
})
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('form') {
    /* 静态样式已上提至模板 class */
  }
}
</style>
