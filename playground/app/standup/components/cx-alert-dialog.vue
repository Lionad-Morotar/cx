<script setup lang="ts">
/**
 * cxAlert 的确认弹窗（ElMessageBox 替代）：标题/内容/单确认按钮。
 * 经 useOverlay().create 程序化唤起，emit('close', confirmed) 结算 open 的 Promise。
 */
defineOptions({ name: 'CxCxAlertDialog' })

defineProps<{
  title: string
  content?: string
  showClose?: boolean
  confirmButtonText?: string
}>()

const emit = defineEmits<{
  close: [confirmed: boolean]
}>()
</script>

<template>
  <!-- data-testid: cx-alert-dialog -->
  <UModal
    data-testid="cx-alert-dialog"
    :title="title"
    :description="content"
    :close="showClose ? { onClick: () => emit('close', false) } : false"
    :dismissible="showClose !== false" class="cx-cx-alert-dialog"
  >
    <template #footer>
      <UButton data-testid="cx-alert-confirm" color="primary" @click="emit('close', true)">
        {{ confirmButtonText || '确定' }}
      </UButton>
    </template>
  </UModal>
</template>
