import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '天气组件',
  description: '天气组件，含当前位置、实况与多日预报，支持温度单位与背景特效。',
  key: 'cx-vtu-weather-widget',
  icon: 'i-tabler-cloud-sun',
  component,
  props: {
    location: {
      name: '位置',
      type: 'json',
      initial: () => ({ name: '上海' }),
    },
    units: {
      name: '单位',
      type: 'json',
      initial: () => ({ temperature: 'celsius' }),
    },
    current: {
      name: '实况',
      type: 'json',
      initial: () => ({
        conditionCode: 'partly-cloudy',
        temperature: 24,
        tempMin: 19,
        tempMax: 27,
        windSpeed: 12,
      }),
    },
    forecast: {
      name: '预报',
      type: 'json',
      initial: () => [
        { label: '周一', conditionCode: 'clear', tempMin: 18, tempMax: 26 },
        { label: '周二', conditionCode: 'rain', tempMin: 17, tempMax: 23 },
        { label: '周三', conditionCode: 'cloudy', tempMin: 16, tempMax: 22 },
      ],
    },
  },
})
