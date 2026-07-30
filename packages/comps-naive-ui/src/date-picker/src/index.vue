<!-- CxNaiveUiDatePicker: 包装 naive-ui NDatePicker。桥接族（formatted-value 通道）：NDatePicker 的
     onChange 与 NSwitch 同为废弃函数 prop（props.mjs 标注 deprecated 但内部仍 call(onChange, value,
     formattedValue)），不剥离会与桥接双发；改经非废弃的 update:formatted-value 显式桥接至 attrs.onChange，
     载荷为格式化字符串（低代码数据常模）而非时间戳。valueFormat 为 date-fns token
     （yyyy-MM-dd 小写，区别于 dayjs 大写 YYYY） -->
<template>
  <NDatePicker v-bind="pickerProps" :class="ns.b()" data-testid="cx-naive-ui-date-picker" @update:formatted-value="onFormattedChange" />
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { NDatePicker } from 'naive-ui'
import { isValid, parse } from 'date-fns'
import { useCxBEM } from '@lionad/cx-vue'

import { useNaiveUiProps } from '../../shared/use-naive-ui-props'
import { useNaiveChangeBridge } from '../../shared/use-naive-change-bridge'

defineOptions({ name: 'CxNaiveUiDatePicker', inheritAttrs: false })

const ns = useCxBEM('naive-ui-date-picker')
const naiveProps = useNaiveUiProps(useAttrs())
const { forwarded, emitChange } = useNaiveChangeBridge(naiveProps)
// naive 内部以 date-fns strictParse 按 valueFormat 严格 token 解析 formatted-value，
// 非法字符串（低代码示例文本回填、用户脏配置、'2026/01/01' 等 token 不匹配的宽松日期串）
// 解析为 Invalid Date 后渲染期 format() 抛 RangeError: Invalid time value 致整棵子树为空。
// 守卫判定源必须与抛错源同源（date-fns parse + isValid）：new Date 宽松解析会放行
// 斜杠/点号等"人看合法"但 token 不匹配的值，留下静默消失窗口。date-fns 版本约束与
// naive-ui 一致以共享同一实例。非法值剥除回退非受控空态——漏放会整片消失（用户可见故障
// 且无报错线索），误杀仅显示空态，取舍向严防漏放倾斜
const pickerProps = computed(() => {
  const rest: Record<string, unknown> = { ...forwarded.value }
  const fv = rest.formattedValue
  if (typeof fv !== 'string' || fv === '' || !isValidFormatted(fv, rest.valueFormat)) {
    delete rest.formattedValue
  }
  return rest
})
function isValidFormatted(fv: string, valueFormat: unknown): boolean {
  const format = typeof valueFormat === 'string' && valueFormat !== '' ? valueFormat : 'yyyy-MM-dd'
  try {
    return isValid(parse(fv, format, new Date()))
  } catch {
    return false
  }
}
const onFormattedChange = (formatted: string | [string, string] | null): void => {
  emitChange(formatted)
}
</script>
