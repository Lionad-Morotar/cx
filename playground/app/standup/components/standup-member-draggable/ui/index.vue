<template>
  <div class="project-members-section">
    <div class="member-section-title">项目成员</div>
    <el-scrollbar>
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
    </el-scrollbar>
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

<style lang="less" scoped>
.project-members-section {
  grid-area: project-members;
  position: relative;
  margin-top: 78px;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0px;
    height: 85%;
    border-left: solid 1px #d9d9d9;
  }

  .member-section-title {
    padding: 0 24px 0 32px;
    color: #b4b4b4;
    font-size: 14px;
  }

  .project-members-con {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 0 24px 24px 32px;

    .member {
      display: flex;
      align-items: center;
      padding: 12px;
      position: relative;
      margin-left: -12px;
      gap: 12px;

      &:first-child {
        margin-top: 12px;
      }

      &:hover {
        :deep(.drag-handler) {
          opacity: 1;
        }
      }

      :deep(.drag-handler) {
        position: absolute;
        left: -0.6em;
        opacity: 0;
        transition: 0.2s;
        padding: 3px;
        cursor: grab;
        user-select: none;
      }

      .avatar {
        box-sizing: border-box;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: solid 1.5px transparent;
        overflow: hidden;
        cursor: grab;

        &:hover {
          border: solid 1.5px bisque;
        }

        img {
          width: 100%;
          height: 100%;
          border: none;
        }
      }

      .name-con {
        cursor: pointer;

        &:hover {
          text-decoration: underline;
          text-underline-offset: 5px;
          text-decoration-thickness: 1.5px;
          text-decoration-color: bisque;
        }

        .name {
          color: #333;
        }
        .username {
          margin-left: 4px;
        }
        .username,
        .id {
          color: #999;
        }
      }
    }
  }
}
</style>
