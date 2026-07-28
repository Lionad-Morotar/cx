import { define, translate } from '@lionad/cx-definition'
import component from './ui/index.vue'

/**
 * 参会人选择弹窗：渲染由 useParticipantsPrompt 单例驱动，
 * 顶栏物料经同一单例 getPrompt 唤起并等待选择结果。
 */
export default define({
  name: translate('参会人选择弹窗'),
  description: translate('选择站会参会/缺席人员，由顶栏开会流程唤起，状态经共享单例编排'),
  key: 'cx-select-participants-dialog',
  component,
  async: true,
})
