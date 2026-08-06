import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
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
  // emits 与 SFC defineEmits 同集合:声明后 cx 渲染器 getEmits 命中,经 _cx_events 接到 host
  emits: {
    change: { name: '偏好变更', description: '任一项开关/取值变化,宿主回写「偏好设置为 <变更摘要>」' },
    action: { name: '动作触发', description: '点击面板动作(如保存),宿主回写「偏好动作 <actionId>」' },
  },
})
