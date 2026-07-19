<template>
  <div :class="ns.b()" ref="cmptRef">
    <el-button ref="goBackBtnRef" @click="router.go(-1)">
      <span>返回</span>
    </el-button>
    <cx-fullscreen-button data-focus-id="full-screen-button" />
  </div>
</template>

<script lang="ts" setup>
/* Import NPM Depends */
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
/* Import Project Depends */
import { useAsync } from '../../../hooks/use-async'
import { useCxNamespace } from '../../../utils/namespace'
/* Import Components */
import { CxFullscreenButton } from '../..'
/* Import States */
/* Import Utils */
/* Import APIs */
/* Import Config */
/* Import Assets (CSS、Images) */
/* Import Types */

/* -------------------------------------------------------------------------- */
/*                                 types & env                                */
/* -------------------------------------------------------------------------- */

type AnyValue = any

defineOptions({ name: 'daily-page-actions' })
const router = useRouter()

const ns = useCxNamespace('daily-page-actions')
const emits = defineEmits([])
const props = withDefaults(
  defineProps<{
    // ...
  }>(),
  {
    // ...
  },
)

/* -------------------------------------------------------------------------- */
/*                                   states                                   */
/* -------------------------------------------------------------------------- */

const cmptRef = ref()
const states = reactive({})

/* -------------------------------------------------------------------------- */
/*                                 interaction                                */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                          cmpt lifecycle & exposed                          */
/* -------------------------------------------------------------------------- */

const resetReq = useAsync(async () => {
  await Promise.all([])
})
const reloadReq = useAsync(async () => {
  await resetReq.exec()
  await Promise.all([])
})
onMounted(reloadReq.exec)

defineExpose({
  reload: reloadReq.exec,
  isLoading: computed(() => reloadReq.isLoading),
})
</script>

<style lang="scss">
@import '../../../styles/mixins/index.scss';

@include b('daily-page-actions') {
  .el-button {
    width: 80px;
    height: 34px;
    line-height: 34px;
    border-radius: 3px;
  }
}
</style>
