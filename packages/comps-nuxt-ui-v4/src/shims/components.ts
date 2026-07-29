import { defineComponent, h } from 'vue'

// Nuxt #components 虚拟模块离线占位：宿主 Nuxt 环境由 @nuxt/ui 提供真实 U* 组件；
// 测试环境将 U* 替换为透传 stub——物料层（defineCxComponent 包装、props/slots 透传）真实执行，
// U* 真实渲染行为由 playground 验收页在宿主中覆盖。
// 清单对齐官方核心 6 分类 70 组件，新增物料时同步补 stub。
const stub = (name: string) =>
  defineComponent({
    name,
    setup(_, { slots }) {
      return () => h('div', { class: `u-stub u-stub-${name}` }, slots.default?.())
    },
  })

// Layout
export const UApp = stub('UApp')
export const UContainer = stub('UContainer')
export const UError = stub('UError')
export const UFooter = stub('UFooter')
export const UHeader = stub('UHeader')
export const UMain = stub('UMain')
export const USidebar = stub('USidebar')
export const UTheme = stub('UTheme')

// Element
export const UAlert = stub('UAlert')
export const UAvatar = stub('UAvatar')
export const UAvatarGroup = stub('UAvatarGroup')
export const UBadge = stub('UBadge')
export const UBanner = stub('UBanner')
export const UButton = stub('UButton')
export const UCalendar = stub('UCalendar')
export const UCard = stub('UCard')
export const UChip = stub('UChip')
export const UCollapsible = stub('UCollapsible')
export const UFieldGroup = stub('UFieldGroup')
export const UIcon = stub('UIcon')
export const UKbd = stub('UKbd')
export const UProgress = stub('UProgress')
export const USeparator = stub('USeparator')
export const USkeleton = stub('USkeleton')

// Form
export const UCheckbox = stub('UCheckbox')
export const UCheckboxGroup = stub('UCheckboxGroup')
export const UColorPicker = stub('UColorPicker')
export const UFileUpload = stub('UFileUpload')
export const UForm = stub('UForm')
export const UFormField = stub('UFormField')
export const UInput = stub('UInput')
export const UInputDate = stub('UInputDate')
export const UInputMenu = stub('UInputMenu')
export const UInputNumber = stub('UInputNumber')
export const UInputRating = stub('UInputRating')
export const UInputTags = stub('UInputTags')
export const UInputTime = stub('UInputTime')
export const UListbox = stub('UListbox')
export const UPinInput = stub('UPinInput')
export const URadioGroup = stub('URadioGroup')
export const USelect = stub('USelect')
export const USelectMenu = stub('USelectMenu')
export const USlider = stub('USlider')
export const USwitch = stub('USwitch')
export const UTextarea = stub('UTextarea')

// Data
export const UAccordion = stub('UAccordion')
export const UCarousel = stub('UCarousel')
export const UEmpty = stub('UEmpty')
export const UMarquee = stub('UMarquee')
export const UScrollArea = stub('UScrollArea')
export const UTable = stub('UTable')
export const UTimeline = stub('UTimeline')
export const UTree = stub('UTree')
export const UUser = stub('UUser')

// Navigation
export const UBreadcrumb = stub('UBreadcrumb')
export const UCommandPalette = stub('UCommandPalette')
export const UFooterColumns = stub('UFooterColumns')
export const ULink = stub('ULink')
export const UNavigationMenu = stub('UNavigationMenu')
export const UPagination = stub('UPagination')
export const UStepper = stub('UStepper')
export const UTabs = stub('UTabs')

// Overlay
export const UContextMenu = stub('UContextMenu')
export const UDrawer = stub('UDrawer')
export const UDropdownMenu = stub('UDropdownMenu')
export const UModal = stub('UModal')
export const UPopover = stub('UPopover')
export const USlideover = stub('USlideover')
export const UToast = stub('UToast')
export const UTooltip = stub('UTooltip')
