import CxElementPlusButton from './button'
import CxElementPlusAlert from './alert'
import CxElementPlusResult from './result'
import CxElementPlusEmpty from './empty'
import CxElementPlusAvatar from './avatar'
import CxElementPlusProgress from './progress'
import CxElementPlusStatistic from './statistic'
import CxElementPlusDivider from './divider'
import CxElementPlusLink from './link'
import CxElementPlusTag from './tag'
import CxElementPlusBadge from './badge'
import CxElementPlusDescriptions from './descriptions'
import CxElementPlusSteps from './steps'
import CxElementPlusBreadcrumb from './breadcrumb'
import CxElementPlusTimeline from './timeline'
import CxElementPlusInput from './input'
import CxElementPlusInputNumber from './input-number'
import CxElementPlusSwitch from './switch'
import CxElementPlusSelect from './select'
import CxElementPlusRadioGroup from './radio-group'
import CxElementPlusCheckboxGroup from './checkbox-group'
import CxElementPlusDatePicker from './date-picker'
import CxElementPlusRate from './rate'
import CxElementPlusSlider from './slider'
import CxElementPlusTable from './table'
import CxElementPlusCard from './card'
import CxElementPlusSpace from './space'

import type { CxMaterialBundle } from '@lionad/cx-definition'

export { default as CxElementPlusButton } from './button'
export { default as CxElementPlusAlert } from './alert'
export { default as CxElementPlusResult } from './result'
export { default as CxElementPlusEmpty } from './empty'
export { default as CxElementPlusAvatar } from './avatar'
export { default as CxElementPlusProgress } from './progress'
export { default as CxElementPlusStatistic } from './statistic'
export { default as CxElementPlusDivider } from './divider'
export { default as CxElementPlusLink } from './link'
export { default as CxElementPlusTag } from './tag'
export { default as CxElementPlusBadge } from './badge'
export { default as CxElementPlusDescriptions } from './descriptions'
export { default as CxElementPlusSteps } from './steps'
export { default as CxElementPlusBreadcrumb } from './breadcrumb'
export { default as CxElementPlusTimeline } from './timeline'
export { default as CxElementPlusInput } from './input'
export { default as CxElementPlusInputNumber } from './input-number'
export { default as CxElementPlusSwitch } from './switch'
export { default as CxElementPlusSelect } from './select'
export { default as CxElementPlusRadioGroup } from './radio-group'
export { default as CxElementPlusCheckboxGroup } from './checkbox-group'
export { default as CxElementPlusDatePicker } from './date-picker'
export { default as CxElementPlusRate } from './rate'
export { default as CxElementPlusSlider } from './slider'
export { default as CxElementPlusTable } from './table'
export { default as CxElementPlusCard } from './card'
export { default as CxElementPlusSpace } from './space'

/**
 * Element Plus 物料数组：六类 27 件冻结——
 * 基础反馈 / 数据展示 / 导航版式 / 表单 / 表格 / 插槽容器。
 */
export const CxElementPlus = [
  CxElementPlusButton,
  CxElementPlusAlert,
  CxElementPlusResult,
  CxElementPlusEmpty,
  CxElementPlusAvatar,
  CxElementPlusProgress,
  CxElementPlusStatistic,
  CxElementPlusDivider,
  CxElementPlusLink,
  CxElementPlusTag,
  CxElementPlusBadge,
  CxElementPlusDescriptions,
  CxElementPlusSteps,
  CxElementPlusBreadcrumb,
  CxElementPlusTimeline,
  CxElementPlusInput,
  CxElementPlusInputNumber,
  CxElementPlusSwitch,
  CxElementPlusSelect,
  CxElementPlusRadioGroup,
  CxElementPlusCheckboxGroup,
  CxElementPlusDatePicker,
  CxElementPlusRate,
  CxElementPlusSlider,
  CxElementPlusTable,
  CxElementPlusCard,
  CxElementPlusSpace,
]

/** Element Plus 物料 bundle：自描述单元，供装配方（cx-nuxt 等）按 bundle 装配 */
export const CxElementPlusBundle: CxMaterialBundle = {
  name: 'element-plus',
  materials: [...CxElementPlus],
}

// --- 流式增量渲染预设 ---
export * from './stream-triggers'
