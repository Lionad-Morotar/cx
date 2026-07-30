import CxNaiveUiButton from './button'
import CxNaiveUiAlert from './alert'
import CxNaiveUiResult from './result'
import CxNaiveUiEmpty from './empty'
import CxNaiveUiAvatar from './avatar'
import CxNaiveUiBadge from './badge'
import CxNaiveUiProgress from './progress'
import CxNaiveUiStatistic from './statistic'
import CxNaiveUiDescriptions from './descriptions'
import CxNaiveUiCollapse from './collapse'
import CxNaiveUiTag from './tag'
import CxNaiveUiDivider from './divider'
import CxNaiveUiSteps from './steps'
import CxNaiveUiBreadcrumb from './breadcrumb'
import CxNaiveUiTimeline from './timeline'
import CxNaiveUiInput from './input'
import CxNaiveUiInputNumber from './input-number'
import CxNaiveUiSwitch from './switch'
import CxNaiveUiSelect from './select'
import CxNaiveUiRadioGroup from './radio-group'
import CxNaiveUiCheckboxGroup from './checkbox-group'
import CxNaiveUiDatePicker from './date-picker'
import CxNaiveUiRate from './rate'
import CxNaiveUiSlider from './slider'
import CxNaiveUiDataTable from './data-table'
import CxNaiveUiCard from './card'
import CxNaiveUiSpace from './space'

import type { CxMaterialBundle } from '@lionad/cx-definition'

export { default as CxNaiveUiButton } from './button'
export { default as CxNaiveUiAlert } from './alert'
export { default as CxNaiveUiResult } from './result'
export { default as CxNaiveUiEmpty } from './empty'
export { default as CxNaiveUiAvatar } from './avatar'
export { default as CxNaiveUiBadge } from './badge'
export { default as CxNaiveUiProgress } from './progress'
export { default as CxNaiveUiStatistic } from './statistic'
export { default as CxNaiveUiDescriptions } from './descriptions'
export { default as CxNaiveUiCollapse } from './collapse'
export { default as CxNaiveUiTag } from './tag'
export { default as CxNaiveUiDivider } from './divider'
export { default as CxNaiveUiSteps } from './steps'
export { default as CxNaiveUiBreadcrumb } from './breadcrumb'
export { default as CxNaiveUiTimeline } from './timeline'
export { default as CxNaiveUiInput } from './input'
export { default as CxNaiveUiInputNumber } from './input-number'
export { default as CxNaiveUiSwitch } from './switch'
export { default as CxNaiveUiSelect } from './select'
export { default as CxNaiveUiRadioGroup } from './radio-group'
export { default as CxNaiveUiCheckboxGroup } from './checkbox-group'
export { default as CxNaiveUiDatePicker } from './date-picker'
export { default as CxNaiveUiRate } from './rate'
export { default as CxNaiveUiSlider } from './slider'
export { default as CxNaiveUiDataTable } from './data-table'
export { default as CxNaiveUiCard } from './card'
export { default as CxNaiveUiSpace } from './space'
export { createNaiveUiTriggerRegistry, mainArrayOf, NAIVE_UI_STREAM_TRIGGERS } from './stream-triggers'

/**
 * Naive UI 物料数组：六类 27 件冻结——
 * 基础反馈 / 数据展示 / 导航版式 / 表单 / 表格 / 插槽容器。
 * S5 冻结为 27 件：基础反馈 4（button/alert/result/empty）+ 数据展示 6（avatar/badge/progress/statistic/descriptions/collapse）
 * + 导航版式 5（tag/divider/steps/breadcrumb/timeline）+ 表单 9（input/input-number/switch/select/radio-group/
 * checkbox-group/date-picker/rate/slider）+ 表格 1（data-table）+ 插槽容器 2（card/space）。
 * 增删物料须同步解冻本断言、playground 分类清单与 README。
 */
export const CxNaiveUi = [
  CxNaiveUiButton,
  CxNaiveUiAlert,
  CxNaiveUiResult,
  CxNaiveUiEmpty,
  CxNaiveUiAvatar,
  CxNaiveUiBadge,
  CxNaiveUiProgress,
  CxNaiveUiStatistic,
  CxNaiveUiDescriptions,
  CxNaiveUiCollapse,
  CxNaiveUiTag,
  CxNaiveUiDivider,
  CxNaiveUiSteps,
  CxNaiveUiBreadcrumb,
  CxNaiveUiTimeline,
  CxNaiveUiInput,
  CxNaiveUiInputNumber,
  CxNaiveUiSwitch,
  CxNaiveUiSelect,
  CxNaiveUiRadioGroup,
  CxNaiveUiCheckboxGroup,
  CxNaiveUiDatePicker,
  CxNaiveUiRate,
  CxNaiveUiSlider,
  CxNaiveUiDataTable,
  CxNaiveUiCard,
  CxNaiveUiSpace,
]

export const CxNaiveUiBundle: CxMaterialBundle = {
  name: 'naive-ui',
  materials: CxNaiveUi,
}
