// Nuxt UI v4 组件经宿主 Nuxt app 的 @nuxt/ui module 注册到 #components 虚拟模块（auto-import）。
// v4 物料显式 `import { U* } from '#components'`，运行时由宿主提供真实实现（playground 已装 @nuxt/ui ^4）。
// 注意：@nuxt/ui 不全局注册组件，故物料不能裸用 <U*>（dist 预编译为 resolveComponent 会查全局失败）。
declare module '#components' {
  export const UAccordion: any
  export const UAlert: any
  export const UAvatar: any
  export const UBadge: any
  export const UBanner: any
  export const UBreadcrumb: any
  export const UButton: any
  export const UCard: any
  export const UCarousel: any
  export const UCheckbox: any
  export const UChip: any
  export const UCommandPalette: any
  export const UContainer: any
  export const UContextMenu: any
  export const UDropdownMenu: any
  export const UForm: any
  export const UFormField: any
  export const UIcon: any
  export const UInput: any
  export const UInputDate: any
  export const UInputMenu: any
  export const UKbd: any
  export const ULink: any
  export const UModal: any
  export const UNavigationMenu: any
  export const UPagination: any
  export const UPopover: any
  export const UProgress: any
  export const URadioGroup: any
  export const USelect: any
  export const USelectMenu: any
  export const USeparator: any
  export const USkeleton: any
  export const USlideover: any
  export const USlider: any
  export const USwitch: any
  export const UTable: any
  export const UTabs: any
  export const UTextarea: any
  export const UToast: any
  export const UTooltip: any
}

export {}
