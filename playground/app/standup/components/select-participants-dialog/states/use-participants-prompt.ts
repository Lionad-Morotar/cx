import { computed, readonly, ref } from 'vue'

import { selectedProjectUsersReq } from '../../../states/project'

import type { User } from '../../../apis/user'

/**
 * 参会人选择弹窗的共享状态与 prompt 编排（模块级单例）。
 *
 * 迁移前弹窗逻辑内聚在组件里、经 defineExpose 的 getPrompt 与视图 ref 耦合；
 * schema 化后顶栏物料与弹窗物料是两个独立节点，改由本单例共享同一份状态：
 * 顶栏调 getPrompt 唤起并等待结果，弹窗物料渲染状态并把用户操作回写到这里。
 */
export type PromptResult =
  | false
  | {
      action: 'cancel' | 'confirm'
      selected: User[]
      unSelected: User[]
    }

const visible = ref(false)
const selected = ref<User[]>([])
const filterStr = ref('')
const action = ref<'cancel' | 'confirm'>('cancel')
let resolver: ((r: PromptResult) => void) | null = null

const usersReq = selectedProjectUsersReq
const users = computed({
  get: () => usersReq.result || [],
  set: (v) => {
    usersReq.result = v
  },
})

const isSelected = (user: User) => selected.value.find((x) => String(x.id) === String(user.id))
const unSelected = computed(() => users.value.filter((x) => !isSelected(x)))
const filteredList = computed(() => {
  if (!filterStr.value) {
    return users.value
  }
  return users.value.filter(
    (user) =>
      String(user?.id).includes(filterStr.value) || String(user?.name).includes(filterStr.value),
  )
})

const select = (user: User) => {
  if (!isSelected(user)) {
    selected.value.push(user)
  }
}
const clear = (user: User) => {
  const index = selected.value.findIndex((x) => x.id === user.id)
  if (index !== -1) {
    selected.value.splice(index, 1)
  }
}
const clearSelection = () => {
  selected.value = []
}

// 每次 getPrompt 只应结算一次（确认/取消/关闭多路触发，用 resolver 置空做幂等）
const settle = (result: PromptResult) => {
  if (resolver) {
    const fn = resolver
    resolver = null
    fn(result)
  }
}

const init = async () => {
  action.value = 'cancel'
  clearSelection()
  visible.value = false
  await usersReq.exec()
}

export const useParticipantsPrompt = () => {
  /** 唤起弹窗并等待用户选择；cancel / 关闭返回 false，confirm 返回选择结果 */
  const getPrompt = async (inputSelected?: User['id'][], inputNotSelected?: User['id'][]) => {
    await init()
    visible.value = true

    const defaultSelected = inputSelected || []
    if (defaultSelected.length) {
      users.value.map((x) => clear(x))
      defaultSelected.map((id) => {
        const user = users.value.find((x) => String(x.id) === String(id))
        if (user) {
          select(user)
        }
      })
    }

    const defaultUnSelected = inputNotSelected || []
    if (defaultUnSelected.length) {
      users.value.map((x) => select(x))
      defaultUnSelected.map((id) => {
        const user = users.value.find((x) => String(x.id) === String(id))
        if (user) {
          clear(user)
        }
      })
    }

    return new Promise<PromptResult>((resolve) => {
      resolver = resolve
    }).finally(() => {
      init()
      resolver = null
    })
  }

  const handleConfirm = () => {
    action.value = 'confirm'
    settle({
      action: 'confirm',
      selected: readonly(selected.value) as User[],
      unSelected: readonly(unSelected.value) as User[],
    })
    visible.value = false
  }
  const handleCancel = () => {
    action.value = 'cancel'
    clearSelection()
    settle(false)
    visible.value = false
  }
  // 点 X / ESC 关闭：按取消处理（调用方对 action==='cancel' 与 false 等价对待）
  const handleDialogClose = () => {
    settle({
      action: 'cancel',
      selected: readonly(selected.value) as User[],
      unSelected: readonly(unSelected.value) as User[],
    })
  }

  return {
    visible,
    selected,
    unSelected,
    users,
    filterStr,
    filteredList,
    isSelected,
    select,
    clear,
    clearSelection,
    getPrompt,
    handleConfirm,
    handleCancel,
    handleDialogClose,
  }
}
