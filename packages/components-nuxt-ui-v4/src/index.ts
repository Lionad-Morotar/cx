import CxNuxtUIV4Accordion from './accordion'
import CxNuxtUIV4Alert from './alert'
import CxNuxtUIV4App from './app'
import CxNuxtUIV4Avatar from './avatar'
import CxNuxtUIV4AvatarGroup from './avatar-group'
import CxNuxtUIV4Badge from './badge'
import CxNuxtUIV4Banner from './banner'
import CxNuxtUIV4Breadcrumb from './breadcrumb'
import CxNuxtUIV4Button from './button'
import CxNuxtUIV4Calendar from './calendar'
import CxNuxtUIV4Card from './card'
import CxNuxtUIV4Carousel from './carousel'
import CxNuxtUIV4Checkbox from './checkbox'
import CxNuxtUIV4CheckboxGroup from './checkbox-group'
import CxNuxtUIV4Chip from './chip'
import CxNuxtUIV4Collapsible from './collapsible'
import CxNuxtUIV4ColorPicker from './color-picker'
import CxNuxtUIV4CommandPalette from './command-palette'
import CxNuxtUIV4Container from './container'
import CxNuxtUIV4ContextMenu from './context-menu'
import CxNuxtUIV4Drawer from './drawer'
import CxNuxtUIV4DropdownMenu from './dropdown-menu'
import CxNuxtUIV4Empty from './empty'
import CxNuxtUIV4Error from './error'
import CxNuxtUIV4Form from './form'
import CxNuxtUIV4FormField from './form-field'
import CxNuxtUIV4FieldGroup from './field-group'
import CxNuxtUIV4FileUpload from './file-upload'
import CxNuxtUIV4Footer from './footer'
import CxNuxtUIV4FooterColumns from './footer-columns'
import CxNuxtUIV4Header from './header'
import CxNuxtUIV4Icon from './icon'
import CxNuxtUIV4Input from './input'
import CxNuxtUIV4InputDate from './input-date'
import CxNuxtUIV4InputMenu from './input-menu'
import CxNuxtUIV4InputNumber from './input-number'
import CxNuxtUIV4InputRating from './input-rating'
import CxNuxtUIV4InputTags from './input-tags'
import CxNuxtUIV4InputTime from './input-time'
import CxNuxtUIV4Kbd from './kbd'
import CxNuxtUIV4Link from './link'
import CxNuxtUIV4Listbox from './listbox'
import CxNuxtUIV4Main from './main'
import CxNuxtUIV4Marquee from './marquee'
import CxNuxtUIV4Modal from './modal'
import CxNuxtUIV4NavigationMenu from './navigation-menu'
import CxNuxtUIV4Pagination from './pagination'
import CxNuxtUIV4PinInput from './pin-input'
import CxNuxtUIV4Popover from './popover'
import CxNuxtUIV4Progress from './progress'
import CxNuxtUIV4RadioGroup from './radio-group'
import CxNuxtUIV4Select from './select'
import CxNuxtUIV4SelectMenu from './select-menu'
import CxNuxtUIV4Separator from './separator'
import CxNuxtUIV4Skeleton from './skeleton'
import CxNuxtUIV4ScrollArea from './scroll-area'
import CxNuxtUIV4Sidebar from './sidebar'
import CxNuxtUIV4Slider from './slider'
import CxNuxtUIV4Stepper from './stepper'
import CxNuxtUIV4Slideover from './slideover'
import CxNuxtUIV4Switch from './switch'
import CxNuxtUIV4Table from './table'
import CxNuxtUIV4Tabs from './tabs'
import CxNuxtUIV4Textarea from './textarea'
import CxNuxtUIV4Theme from './theme'
import CxNuxtUIV4Timeline from './timeline'
import CxNuxtUIV4Toast from './toast'
import CxNuxtUIV4Tooltip from './tooltip'
import CxNuxtUIV4Tree from './tree'
import CxNuxtUIV4User from './user'

import type { CxMaterialBundle } from '@lionad/cx-definition'

// CxNuxtUIV4: 全量对齐 Nuxt UI v4 官方核心组件（Layout / Element / Form / Data /
// Navigation / Overlay，官方组件文档 2026-07-22 抓取共 70 个）的物料集。
// 物料 key 形如 cx-nuxt-ui-v4-<官方组件名>，与 v2 物料（cx-<comp>）共存于同一 cx 实例
// （注册到全局 vueApp 时靠版本化 key 避免冲突）。
export const CxNuxtUIV4 = [
  CxNuxtUIV4Accordion,
  CxNuxtUIV4Alert,
  CxNuxtUIV4App,
  CxNuxtUIV4Avatar,
  CxNuxtUIV4AvatarGroup,
  CxNuxtUIV4Badge,
  CxNuxtUIV4Banner,
  CxNuxtUIV4Breadcrumb,
  CxNuxtUIV4Button,
  CxNuxtUIV4Calendar,
  CxNuxtUIV4Card,
  CxNuxtUIV4Carousel,
  CxNuxtUIV4Checkbox,
  CxNuxtUIV4CheckboxGroup,
  CxNuxtUIV4Chip,
  CxNuxtUIV4Collapsible,
  CxNuxtUIV4ColorPicker,
  CxNuxtUIV4CommandPalette,
  CxNuxtUIV4Container,
  CxNuxtUIV4ContextMenu,
  CxNuxtUIV4Drawer,
  CxNuxtUIV4InputDate,
  CxNuxtUIV4Separator,
  CxNuxtUIV4DropdownMenu,
  CxNuxtUIV4Empty,
  CxNuxtUIV4Error,
  CxNuxtUIV4Form,
  CxNuxtUIV4FormField,
  CxNuxtUIV4FieldGroup,
  CxNuxtUIV4FileUpload,
  CxNuxtUIV4Footer,
  CxNuxtUIV4FooterColumns,
  CxNuxtUIV4Header,
  CxNuxtUIV4Icon,
  CxNuxtUIV4Input,
  CxNuxtUIV4InputMenu,
  CxNuxtUIV4InputNumber,
  CxNuxtUIV4InputRating,
  CxNuxtUIV4InputTags,
  CxNuxtUIV4InputTime,
  CxNuxtUIV4Kbd,
  CxNuxtUIV4Link,
  CxNuxtUIV4Listbox,
  CxNuxtUIV4Main,
  CxNuxtUIV4Marquee,
  CxNuxtUIV4Modal,
  CxNuxtUIV4NavigationMenu,
  CxNuxtUIV4Toast,
  CxNuxtUIV4Pagination,
  CxNuxtUIV4PinInput,
  CxNuxtUIV4Popover,
  CxNuxtUIV4Progress,
  CxNuxtUIV4RadioGroup,
  CxNuxtUIV4Slider,
  CxNuxtUIV4Stepper,
  CxNuxtUIV4Select,
  CxNuxtUIV4SelectMenu,
  CxNuxtUIV4Skeleton,
  CxNuxtUIV4ScrollArea,
  CxNuxtUIV4Sidebar,
  CxNuxtUIV4Slideover,
  CxNuxtUIV4Table,
  CxNuxtUIV4Tabs,
  CxNuxtUIV4Textarea,
  CxNuxtUIV4Theme,
  CxNuxtUIV4Timeline,
  CxNuxtUIV4Switch,
  CxNuxtUIV4Tooltip,
  CxNuxtUIV4Tree,
  CxNuxtUIV4User,
]

export { default as CxNuxtUIV4Button } from './button'

/** nuxt-ui-v4 物料 bundle：Nuxt UI v4 物料自描述单元，供装配方（cx-nuxt 等）按 bundle 装配 */
export const CxNuxtUIV4Bundle: CxMaterialBundle = {
  name: 'nuxt-ui-v4',
  materials: [...CxNuxtUIV4],
}
