import { isString } from 'lodash-es'

/** 图标名兜底：无前缀时补 i-heroicons-（原为 p-ray utils 的 safeIcon） */
export const safeIcon = (icon: unknown) => {
  const defaultGroup = 'heroicons'
  const fullIconName = isString(icon)
    ? icon.startsWith('i-')
      ? icon
      : icon
        ? `i-${defaultGroup}-${icon}`
        : ''
    : ''
  return fullIconName
}
