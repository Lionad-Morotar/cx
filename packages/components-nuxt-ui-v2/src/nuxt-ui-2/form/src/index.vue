<template>
  <UForm
    ref="cmpt"
    :class="ns.b()"
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

import { UForm } from '../../../../vendor/bridge'

import * as z from 'zod'
import { useCxSlot, useCxBEM } from '@lionad/cx-vue'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'
import type { Form, FormSubmitEvent } from '#ui/types'

defineOptions({ name: 'CxForm' })

type UFormProps = ComponentProps<typeof UForm>

const ns = useCxBEM('form')
const inner = defineProps<{}>()
const props = useAttrs() as UFormProps & {
  cmpt: CxComponentRuntime
  uiEmptyTip?: boolean
  uiEmptyTipText?: string
}
provide(`cx-form-empty-tip-${props.cmpt.id}`, props.uiEmptyTip)

const { showSlot } = useCxSlot(props.cmpt)

const cmptRef = ref<any>()
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
  validate: () => cmptRef.value?.validate(),
  setErrors: (errors: Record<string, string>) => cmptRef.value?.setErrors(errors),
  submit: () => cmptRef.value?.submit(),
  getErrors: (path?: string) => cmptRef.value?.getErrors(path),
  clear: (path?: string) => cmptRef.value?.clear(path),
})
</script>

<style lang="scss">
@use '../../../styles/index.scss' as *;

$ns: 'cx';

@layer cx {
  @include b('form') {
    @apply space-y-2;
  }
}
</style>
