<template>
  <div class="cx-standup-member-draggable project-members-section">
    <div class="member-section-title">项目成员</div>
    <CxScrollbar>
      <div class="project-members-con">
        <draggable v-model="sortedUsers" item-key="id">
          <template #item="{ element: user }">
            <div class="member">
              <CxSvgIcon class="drag-handler" icon-class="drag" />
              <div class="avatar">
                <img :src="user.avatarUrl" />
              </div>
              <div class="name-con" @mousedown="go(user.webUrl)">
                <span class="name">{{ user.name }}</span>
                <span class="username">{{ user.username }}</span>
                <span class="id">#{{ user.id }}</span>
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </CxScrollbar>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import Draggable from 'vuedraggable'

import CxSvgIcon from '../../cx-svg-icon.vue'
import { selectedProjectUsersReq } from '../../../states/project'
import { go } from '../../../utils'

defineOptions({ name: 'cx-standup-member-draggable' })

// 成员顺序写回 store（拖拽排序持久化到请求结果缓存）
const sortedUsers = computed({
  get: () => selectedProjectUsersReq.result || [],
  set: (v) => {
    selectedProjectUsersReq.result = v
  },
})

// 迁移前由视图 reload 触发成员加载，物料化后改由本物料自行加载
onMounted(() => {
  void selectedProjectUsersReq.exec()
})
</script>

<style scoped>
/* 成员栏：右侧 sticky 存在感，视觉重量低于主区。
   左缘 1px 分隔线为结构性分割（非彩色侧条），颜色走 token */
.project-members-section {
  grid-area: project-members;
  position: relative;
  padding-top: 6px;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 85%;
    border-left: solid 1px var(--su-divider);
  }

  .member-section-title {
    padding: 0 24px 10px 32px;
    color: var(--su-ink-3);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.14em;
    user-select: none;
  }

  .project-members-con {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 0 24px 24px 32px;

    .member {
      display: flex;
      align-items: center;
      padding: 10px 12px;
      position: relative;
      margin-left: -12px;
      gap: 12px;
      border-radius: var(--su-radius-control);
      border: solid 1px transparent;
      transition:
        background var(--su-dur) var(--su-ease),
        border-color var(--su-dur) var(--su-ease);

      &:hover {
        background: var(--su-bg-surface);
        border-color: var(--su-border);

        :deep(.drag-handler) {
          opacity: 1;
        }
      }

      :deep(.drag-handler) {
        position: absolute;
        left: -0.6em;
        opacity: 0;
        transition: opacity var(--su-dur) var(--su-ease);
        padding: 3px;
        cursor: grab;
        user-select: none;
        color: var(--su-ink-3);
      }

      .avatar {
        box-sizing: border-box;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: solid 1.5px transparent;
        overflow: hidden;
        cursor: grab;
        flex-shrink: 0;

        &:hover {
          border-color: var(--su-state-narrative);
        }

        img {
          width: 100%;
          height: 100%;
          border: none;
        }
      }

      .name-con {
        cursor: pointer;
        min-width: 0;

        &:hover {
          text-decoration: underline;
          text-underline-offset: 5px;
          text-decoration-thickness: 1.5px;
          text-decoration-color: var(--su-state-narrative);
        }

        .name {
          color: var(--su-ink);
          font-weight: 500;
        }
        .username {
          margin-left: 4px;
        }
        .username,
        .id {
          color: var(--su-ink-3);
        }
      }
    }
  }
}
</style>
