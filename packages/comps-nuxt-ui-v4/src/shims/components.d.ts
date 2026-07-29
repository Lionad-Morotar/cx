// Nuxt UI v4 组件经宿主 Nuxt app 的 @nuxt/ui module 注册到 #components 虚拟模块（auto-import）。
// v4 物料显式 `import { U* } from '#components'`，运行时由宿主提供真实实现（playground 已装 @nuxt/ui ^4）。
// 注意：@nuxt/ui 不全局注册组件，故物料不能裸用 <U*>（dist 预编译为 resolveComponent 会查全局失败）。
// 清单对齐官方核心 6 分类 70 组件，新增物料时同步补声明。
declare module '#components' {
  // Layout
  export const UApp: any
  export const UContainer: any
  export const UError: any
  export const UFooter: any
  export const UHeader: any
  export const UMain: any
  export const USidebar: any
  export const UTheme: any

  // Element
  export const UAlert: any
  export const UAvatar: any
  export const UAvatarGroup: any
  export const UBadge: any
  export const UBanner: any
  export const UButton: any
  export const UCalendar: any
  export const UCard: any
  export const UChip: any
  export const UCollapsible: any
  export const UFieldGroup: any
  export const UIcon: any
  export const UKbd: any
  export const UProgress: any
  export const USeparator: any
  export const USkeleton: any

  // Form
  export const UCheckbox: any
  export const UCheckboxGroup: any
  export const UColorPicker: any
  export const UFileUpload: any
  export const UForm: any
  export const UFormField: any
  export const UInput: any
  export const UInputDate: any
  export const UInputMenu: any
  export const UInputNumber: any
  export const UInputRating: any
  export const UInputTags: any
  export const UInputTime: any
  export const UListbox: any
  export const UPinInput: any
  export const URadioGroup: any
  export const USelect: any
  export const USelectMenu: any
  export const USlider: any
  export const USwitch: any
  export const UTextarea: any

  // Data
  export const UAccordion: any
  export const UCarousel: any
  export const UEmpty: any
  export const UMarquee: any
  export const UScrollArea: any
  export const UTable: any
  export const UTimeline: any
  export const UTree: any
  export const UUser: any

  // Navigation
  export const UBreadcrumb: any
  export const UCommandPalette: any
  export const UFooterColumns: any
  export const ULink: any
  export const UNavigationMenu: any
  export const UPagination: any
  export const UStepper: any
  export const UTabs: any

  // Overlay
  export const UContextMenu: any
  export const UDrawer: any
  export const UDropdownMenu: any
  export const UModal: any
  export const UPopover: any
  export const USlideover: any
  export const UToast: any
  export const UTooltip: any
}

export {}
