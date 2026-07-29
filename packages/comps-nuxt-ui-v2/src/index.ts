import CxAccordion from './accordion'
import CxAlert from './alert'
import CxAvatar from './avatar'
import CxBadge from './badge'
import CxBreadcrumb from './breadcrumb'
import CxButton from './button'
import CxButtonGroup from './button-group'
import CxCard from './card'
import CxCarousel from './carousel'
import CxCheckbox from './checkbox'
import CxChip from './chip'
import CxCommandPalette from './command-palette'
import CxContainer from './container'
import CxContextMenu from './context-menu'
import CxDatePicker from './date-picker'
import CxDivider from './divider'
import CxDropdown from './dropdown'
import CxForm from './form'
import CxFormItem from './form-item'
import CxIcon from './icon'
import CxInput from './input'
import CxInputMenu from './input-menu'
import CxKbd from './kbd'
import CxLink from './link'
import CxMeter from './meter'
import CxMeterGroup from './meter-group'
import CxModal from './modal'
import CxNavigation from './navigation'
import CxNotification from './notification'
import CxPagination from './pagination'
import CxPopover from './popover'
import CxProgress from './progress'
import CxRadio from './radio'
import CxRange from './range'
import CxSelect from './select'
import CxSelectMenu from './select-menu'
import CxSkeleton from './skeleton'
import CxSlideover from './slideover'
import CxTable from './table'
import CxTabs from './tabs'
import CxTextarea from './textarea'
import CxToggle from './toggle'
import CxTooltip from './tooltip'

import type { CxMaterialBundle } from '@lionad/cx-definition'

// CxNuxtUIV2: 全量对齐 Nuxt UI v2 官方组件的物料集（vendored 离线形态）。
// 物料 key 形如 cx-<comp>；与 v4 物料（cx-nuxt-ui-v4-*）共存于同一 cx 实例
// （注册到全局 vueApp 时靠版本化 key 避免冲突）。
export const CxNuxtUIV2 = [
  CxAccordion,
  CxAlert,
  CxAvatar,
  CxBadge,
  CxBreadcrumb,
  CxButton,
  CxButtonGroup,
  CxCard,
  CxCarousel,
  CxCheckbox,
  CxChip,
  CxCommandPalette,
  CxContainer,
  CxContextMenu,
  CxDatePicker,
  CxDivider,
  CxDropdown,
  CxForm,
  CxFormItem,
  CxIcon,
  CxInput,
  CxInputMenu,
  CxKbd,
  CxLink,
  CxMeter,
  CxMeterGroup,
  CxModal,
  CxNavigation,
  CxNotification,
  CxPagination,
  CxPopover,
  CxProgress,
  CxRadio,
  CxRange,
  CxSelect,
  CxSelectMenu,
  CxSkeleton,
  CxSlideover,
  CxTable,
  CxTabs,
  CxTextarea,
  CxToggle,
  CxTooltip,
]

/** nuxt-ui-v2 物料 bundle：vendored Nuxt UI v2 物料自描述单元，供装配方（cx-nuxt 等）按 bundle 装配 */
export const CxNuxtUIV2Bundle: CxMaterialBundle = {
  name: 'nuxt-ui-v2',
  materials: [...CxNuxtUIV2],
}
