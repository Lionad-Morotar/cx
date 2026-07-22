import { normalize } from '@lionad/cx-definition'

import component from './src/index.vue'

export default normalize({
  name: '偏好面板',
  description:
    '偏好设置面板，分区含多种控件类型（switch/toggle/select/input/textarea），支持 v-model。',
  key: 'cx-vtu-preferences-panel',
  icon: 'i-tabler-settings',
  component,
  props: {
    title: {
      name: '标题',
      type: 'short',
      initial: '偏好设置',
    },
    sections: {
      name: '分区',
      type: 'json',
      initial: () => [
        {
          heading: '通用',
          items: [
            { id: 'notif', label: '开启通知', type: 'switch', defaultChecked: true },
            { id: 'theme', label: '主题', type: 'switch', defaultChecked: false },
          ],
        },
      ],
    },
  },
})
