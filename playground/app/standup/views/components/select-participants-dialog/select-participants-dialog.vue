<template>
  <UModal class="select-participants-dialog" v-model:open="visible" title="确认与会人">
    <template #body>
      <div class="dialog-content">
        <div class="to-select-panel">
          <div class="input-wrapper">
            <UInput
              class="search-input"
              v-model="filterStr"
              :placeholder="'输入关键字搜索'"
              trailing-icon="i-lucide-search"
            />
          </div>
          <div class="panel">
            <div class="title-wrapper list-item">
              <span class="title">参会人员（{{ unSelected.length }}人）</span>
            </div>
            <CxScrollbar class="to-select-scroll-area">
              <div class="to-select-wrapper">
                <template v-if="filterStr">
                  <div
                    v-for="item in filteredList"
                    :key="item.id"
                    class="list-item"
                    :class="isSelected(item) && 'is-selected'"
                  >
                    <img class="avatar" :src="item.avatarUrl" />
                    <div class="name">{{ item.name }}</div>
                    <div class="actions">
                      <span class="button absent-button" @click="select(item)">缺席</span>
                    </div>
                  </div>
                </template>
                <draggable v-else v-model="users" item-key="id">
                  <template #item="{ element: item }">
                    <div class="list-item" :class="isSelected(item) && 'is-selected'">
                      <img class="avatar" :src="item.avatarUrl" />
                      <div class="name">{{ item.name }}</div>
                      <div class="actions">
                        <CxSvgIcon class="button drag-handler" icon-class="drag" />
                        <span class="button absent-button" @click="select(item)">缺席</span>
                      </div>
                    </div>
                  </template>
                </draggable>
              </div>
            </CxScrollbar>
          </div>
        </div>

        <div class="selected-panel">
          <div class="panel">
            <div class="title-wrapper list-item">
              <div class="title">
                <span>缺席人员（{{ selected.length }}人）</span>
              </div>
              <div class="actions">
                <span
                  class="button remove-all-button"
                  @click="clearSelection"
                  v-if="selected.length"
                  >清空</span
                >
              </div>
            </div>
            <CxScrollbar class="to-select-scroll-area">
              <div class="to-select-wrapper">
                <div v-for="item in selected" :key="item.id" class="list-item">
                  <img class="avatar" :src="item.avatarUrl" />
                  <div class="name">{{ item.name }}</div>
                  <div class="actions">
                    <span class="button remove-button" @click="clear(item)">参会</span>
                  </div>
                </div>
              </div>
            </CxScrollbar>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="dialog-footer">
        <UButton @click="handleCancel">{{ '取消' }}</UButton>
        <UButton color="primary" @click="handleConfirm">{{ '确定' }}</UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { watch, ref, computed, readonly } from 'vue'
import { useVModel } from '@vueuse/core'
import { selectedProjectUsersReq } from '../../../states/project'

import Draggable from 'vuedraggable'

import type { User } from '../../../apis/user'

const resolver = ref<
  | ((
      _:
        | boolean
        | {
            action: 'cancel' | 'confirm'
            selected: User[]
            unSelected: User[]
          },
    ) => void)
  | null
>(null)
const emits = defineEmits(['update:visible', 'success'])
const props = withDefaults(
  defineProps<{
    visible?: boolean
  }>(),
  {
    visible: false,
  },
)

const action = ref<'cancel' | 'confirm'>('cancel')
const visible = useVModel(props, 'visible', emits)
watch(
  visible,
  (n) =>
    !n &&
    resolver.value?.({
      action: action.value,
      selected: readonly(selected.value) as User[],
      unSelected: readonly(unSelected.value) as User[],
    }),
)

const usersReq = selectedProjectUsersReq
const users = computed({
  get: () => usersReq.result || [],
  set: (v) => {
    usersReq.result = v
  },
})

const selected = ref<User[]>([] as User[])
const isSelected = (user: User) => selected.value.find((x) => String(x.id) === String(user.id))
const unSelected = computed(() => users.value.filter((x) => !isSelected(x)))

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

const filterStr = ref('')
const filteredList = computed(() => {
  if (!filterStr.value) {
    return users.value
  }
  return users.value.filter(
    (user) =>
      String(user?.id).includes(filterStr.value) || String(user?.name).includes(filterStr.value),
  )
})

const init = async () => {
  action.value = 'cancel'
  clearSelection()
  visible.value = false
  await usersReq.exec()
}

const handleConfirm = () => {
  action.value = 'confirm'
  visible.value = false
}
const handleCancel = () => {
  action.value = 'cancel'
  clearSelection()
  visible.value = false
  resolver.value?.(false)
}

defineExpose({
  async refresh() {
    // await menuItemsReq.exec();
  },
  async getPrompt(inputSelected?: User['id'][], inputNotSelected?: User['id'][]) {
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

    return new Promise((resolve) => {
      resolver.value = resolve
    }).finally(() => {
      init()
      resolver.value = null
    }) as Promise<{
      action: 'cancel' | 'confirm'
      selected: User[]
      unSelected: User[]
    }>
  },
})
</script>

<style scoped>
.select-participants-dialog {
  :deep(.el-dialog__footer) {
    background: unset;
    border-top: 1px solid #dcdee2;
  }

  .dialog-content {
    display: flex;
    overflow: hidden;

    & > * {
      flex: 1;
      width: 50%;
      height: auto;
    }
  }

  .panel {
    .title-wrapper {
      display: flex;
      justify-self: flex-start;
      align-items: center;
      gap: 10px;
      box-sizing: border-box;
      padding: 0 18px;
      width: 100%;
      height: 32px;

      .title {
        flex: 1;
        font-size: 13px;
        color: #898989;
      }
      .actions {
        display: flex;
      }
    }
  }

  .list-item {
    display: flex;
    justify-self: flex-start;
    align-items: center;
    gap: 10px;
    box-sizing: border-box;
    padding: 0 18px;
    width: 100%;
    height: 32px;
    transition:
      background 0.15s,
      opacity 0.3s;

    &:hover {
      background-color: #f0f3fa;

      .actions {
        display: flex;
      }
    }

    &.is-selected {
      opacity: 0.4;
    }

    .avatar {
      width: 20px;
      height: 20px;
      border-radius: 50%;
    }
    .name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 13px;
      color: #000;
    }

    .actions {
      display: none;

      .button {
        display: flex;
        justify-self: flex-start;
        align-items: center;
        padding: 3px 5px;
        cursor: pointer;

        &:hover {
          opacity: 0.92;
        }
        &:active {
          opacity: 0.8;
        }

        & + .button {
          margin-left: 4px;
        }
      }
    }
  }

  .to-select-panel {
    border-right: solid 1px #dcdfe6;

    .input-wrapper {
      padding: 8px 18px;
      box-sizing: border-box;

      .el-input__wrapper,
      :deep(.el-input__wrapper) {
        box-shadow: none;
        border: solid 1px #dcdfe6;
      }
    }
    .panel {
      height: calc(100% - 48px - 32px);
    }
    .drag-handler {
      position: relative;
      top: 1.5px;
    }
    .absent-button {
      color: #f13737;
    }
  }

  .selected-panel {
    padding: 6px 0 0 0;

    .remove-button {
      color: #337ffb;
    }
  }
}
</style>
