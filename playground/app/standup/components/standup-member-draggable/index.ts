import { define, translate } from '@lionad/cx-definition'
import component from './ui/index.vue'

/**
 * 项目成员区：成员列表可拖拽排序（写回 selectedProjectUsersReq），点击跳转成员主页。
 */
export default define({
  name: translate('项目成员列表'),
  description: translate('站会列表右侧项目成员区，支持拖拽排序'),
  key: 'cx-standup-member-draggable',
  component,
  async: true,
})
