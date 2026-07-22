<template>
  <UModal
    class="select-participants-dialog"
    v-model:open="visible"
    title="确认与会人"
    @update:open="(v: boolean) => !v && handleDialogClose()"
  >
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
import Draggable from 'vuedraggable'

import CxSvgIcon from '../../cx-svg-icon.vue'
import { useParticipantsPrompt } from '../states/use-participants-prompt'

// 弹窗只是共享单例的渲染层：状态与 confirm/cancel 编排都在 useParticipantsPrompt
const {
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
  handleConfirm,
  handleCancel,
  handleDialogClose,
} = useParticipantsPrompt()
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
