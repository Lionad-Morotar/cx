export const bgColorStrengthOptions = [
  { value: '50', label: '50' },
  { value: '100', label: '100' },
  { value: '200', label: '200' },
  { value: '300', label: '300' },
  { value: '400', label: '400' },
  { value: '500', label: '500' },
  { value: '600', label: '600' },
  { value: '700', label: '700' },
  { value: '800', label: '800' },
  { value: '900', label: '900' },
  { value: '950', label: '950' }
] as const

export const bgColorStrengths = bgColorStrengthOptions.map(x => x.value)

export const colorNameOptions = [

  /* fixed colors */
  { value: 'black', label: '黑' },
  { value: 'white', label: '白' },
  { value: 'transparent', label: '透明' },
  // { value: 'background', label: '背景' },
  // { value: 'foreground', label: '前景' },
  // { value: 'primary', label: '主' },

  /* 'slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose' */
  { value: 'red', label: '红', strength: bgColorStrengths },
  { value: 'orange', label: '橙', strength: bgColorStrengths },
  { value: 'amber', label: '琥珀', strength: bgColorStrengths },
  { value: 'yellow', label: '黄', strength: bgColorStrengths },
  { value: 'lime', label: '绿黄', strength: bgColorStrengths },
  { value: 'green', label: '绿', strength: bgColorStrengths },
  { value: 'emerald', label: '翠绿', strength: bgColorStrengths },
  { value: 'teal', label: '水鸭', strength: bgColorStrengths },
  { value: 'cyan', label: '青', strength: bgColorStrengths },
  { value: 'sky', label: '天蓝', strength: bgColorStrengths },
  { value: 'blue', label: '蓝', strength: bgColorStrengths },
  { value: 'indigo', label: '靛蓝', strength: bgColorStrengths },
  { value: 'violet', label: '紫罗兰', strength: bgColorStrengths },
  { value: 'purple', label: '紫', strength: bgColorStrengths },
  { value: 'fuchsia', label: '紫红', strength: bgColorStrengths },
  { value: 'pink', label: '粉红', strength: bgColorStrengths },
  { value: 'rose', label: '玫瑰', strength: bgColorStrengths },
  { value: 'gray', label: '灰', strength: bgColorStrengths },
  { value: 'slate', label: '暗蓝灰', strength: bgColorStrengths },
  { value: 'zinc', label: '锌', strength: bgColorStrengths },
  { value: 'neutral', label: '中性', strength: bgColorStrengths },
  { value: 'stone', label: '石', strength: bgColorStrengths }

] as const

export const cmptColorNames = [
  { label: '主色', value: 'primary' },
  ...colorNameOptions
    .filter(x => !['black', 'white', 'transparent', 'slate', 'zinc', 'neutral', 'stone'].includes(x.value))
    .map(x => usePick(x, ['label', 'value']))
]

export const cmptColorNames3 = [
  { label: '主色', value: 'primary' },
  ...colorNameOptions
    .filter(x => !['gray', 'black', 'white', 'transparent', 'slate', 'zinc', 'neutral', 'stone'].includes(x.value))
    .map(x => usePick(x, ['label', 'value']))
]

// cmptColorNames with black and white
// TODO better name
export const cmptColorNames2 = [
  { label: '主色', value: 'primary' },
  ...colorNameOptions
    .filter(x => !['transparent', 'slate', 'zinc', 'neutral', 'stone'].includes(x.value))
    .map(x => usePick(x, ['label', 'value']))
]
