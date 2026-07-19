<template>
  <div class="user-tag" v-if="user">
    <div class="avatar">
      <img :src="user?.avatarUrl" />
    </div>
    <div class="user-name" v-if="user.name">
      <div class="name">{{ user.name }}</div>
    </div>
  </div>
  <cx-time-count
    weekday
    :run="isCurStandupInProgress"
    :time="isCurStandupInProgress ? () => dayjs() : standup.meetingDate"
    :format="isCurStandupInProgress ? 'YYYY/MM/DD HH:mm:ss' : 'YYYY/MM/DD'"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import CxTimeCount from '../../time-count'
import { useStandupDetail } from '../../../states/standups'
import { dayjs } from '../../../utils'
import { useCurrentUser } from '../../../states/users'

const user = useCurrentUser()
const standup = useStandupDetail()

const isCurStandupInProgress = computed(() => standup.value.state === 'IN_PROGRESS')
</script>

<style lang="scss" scoped>
.user-tag {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  padding: 8px 16px;
  width: auto;
  height: 40px;
  background: #ecf1f5;
  border-radius: 20px;

  .avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: white;

    img {
      width: 100%;
      height: 100%;
      border-radius: inherit;
      box-sizing: border-box;
      vertical-align: middle;
      object-fit: contain;
    }
  }
  .name {
    font-size: 20px;
  }
}
.time-stamp {
  .weekday {
    font-size: 20px;
    font-weight: 500;
  }
}
</style>
