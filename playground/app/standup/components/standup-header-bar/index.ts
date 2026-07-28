import { define, translate } from '@lionad/cx-definition'
import component from './ui/index.vue'

/**
 * 站会列表顶栏：时间计数 + 手动同步 / 开会·继续会议 / 设置参会人 / 全屏。
 * 开会流程经 useParticipantsPrompt 唤起参会人弹窗。
 */
export default define({
  name: translate('站会顶栏'),
  description: translate('站会列表顶栏：时间计数与手动同步、开会/继续、设置参会人、全屏操作'),
  key: 'cx-standup-header-bar',
  component,
  async: true,
})
