<template>
  <div class="cx-user-select user-select">
    <CxScrollbar class="scroll-area">
      <div class="members">
        <template v-for="user in presentUsers" :key="user.id">
          <div v-if="user.id === 'padding'" class="member is-empty" />
          <div
            v-else
            :key="user.id + user.name"
            class="member"
            :class="[checkIsSelected(user) ? 'is-current' : '', isAbsent(user) ? 'is-absent' : '']"
            :title="getUserA11yTitle(user)"
            @click="select(user)"
          >
            <div class="avatar">
              <img :src="user.avatarUrl" />
            </div>
          </div>
        </template>
      </div>
    </CxScrollbar>
  </div>
</template>

<script lang="ts" setup>
import { watchEffect, getCurrentInstance } from 'vue'
import { standupBus as cx } from '../../../utils/standup-bus'
import { useCurrentUser } from '../../../states/users'
import { useUserSelect } from '../states'

import type { User, Users } from '../../../apis'

defineOptions({ name: 'CxUserSelect' })

const instance = getCurrentInstance()!
cx.emit('pass:instance:CxUserSelectRef', instance)

// 类型内联声明：跨文件 import type 会触发 SFC 编译器的 fs 类型解析（rolldown 环境不可用）
const emits = defineEmits<{
  'update:user': [x: User | null]
  'update:next-user': [x: User | null]
  'update:prev-user': [x: User | null]
}>()
const props = withDefaults(
  defineProps<{
    use?: any
    user?: User | null
    nextUser?: User | null
    prevUser?: User | null
    participants?: Users
    absents?: Users
    autoSelect?: boolean
    autoSelectDirection?: 'first' | 'last'
    enableKeyboardControl?: boolean
  }>(),
  {
    participants: () => [] as Users,
    absents: () => [] as Users,
    autoSelect: true,
    autoSelectDirection: 'first',
    enableKeyboardControl: false,
  },
)

const {
  curSelection,
  presentUsers,
  isAbsent,
  isFirstPresent,
  isLastPresent,
  select,
  selectPrev,
  selectNext,
} = useUserSelect(props, emits)

const backwardCapableUser = useCurrentUser()
watchEffect(() => (backwardCapableUser.value = curSelection.value))

const checkIsSelected = (x: User) => String(x.id) === String(curSelection.value?.id)

const getUserA11yTitle = (user: User) => {
  const name = user?.name || ''
  return isAbsent(user) ? `${name}（缺席）` : name
}

defineExpose({
  isAbsent,
  isFirstPresent,
  isLastPresent,
  select,
  selectPrev,
  selectNext,
})
</script>

<style scoped>
.user-select {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  box-sizing: border-box;
  width: 100%;
  height: 100%;

  .scroll-area {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    height: 100%;
    padding: calc(40px * 1.5 - 40px) 0;
  }
}
.members {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--user-item-gap);
  height: 100%;
}

.member {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  box-sizing: border-box;
  width: var(--user-item-width);
  height: var(--user-item-width);
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 0 rgba(0, 0, 0, 0.2);
  transition:
    transform 0.2s ease-in-out,
    box-shadow 0.25s ease-out,
    border 0.1s;
  transform: scale(1);

  &:not(.is-empty, .is-absent) {
    cursor: pointer;
  }

  &:not(.is-empty, .is-absent):hover {
    box-shadow: 0 2px 13px rgba(0, 0, 0, 0.1);
    transform: scale(1.5);
    z-index: 2;
  }

  .avatar {
    width: calc(var(--user-item-width) * 0.55);
    height: calc(var(--user-item-width) * 0.55);
    border-radius: 50%;
    overflow: hidden;
    background: white;
    user-select: none;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &.is-empty {
    width: 0px;
    height: 0px;
    opacity: 0;
  }
  &.is-current {
    /* border: solid 0.5px #1890ff; */
    box-shadow: 0 6px 26px rgba(0, 0, 0, 0.2);
    transform: scale(1.5);
    z-index: 1;
  }
  &.is-absent {
    opacity: 0.38;
  }
  &.is-fade {
    opacity: 0.38;
  }
}

.members {
  --user-item-gap: 30px;
  .member {
    --user-item-width: 40px;
  }
}

@media (max-width: 1688px) {
  .members {
    --user-item-gap: 28px;
    .member {
      --user-item-width: 36px;
    }
  }
}

@media (max-width: 1440px) {
  .members {
    --user-item-gap: 24px;
    .member {
      --user-item-width: 32px;
    }
  }
}

@media (max-width: 1366px) {
  .members {
    --user-item-gap: 20px;
    .member {
      --user-item-width: 28px;
    }
  }
}
@media (max-width: 1280px) {
  .members {
    --user-item-gap: 18px;
    .member {
      --user-item-width: 26px;
    }
  }
}
@media (max-width: 1024px) {
  .members {
    --user-item-gap: 15px;
    .member {
      --user-item-width: 23px;
    }
  }
}
@media (max-width: 768px) {
  .members {
    --user-item-gap: 12px;
    .member {
      --user-item-width: 20px;
    }
  }
}
@media (max-height: 1200px) {
  .members {
    --user-item-gap: 30px;
    .member {
      --user-item-width: 40px;
    }
  }
}
@media (max-height: 1080px) {
  .members {
    --user-item-gap: 26px;
    .member {
      --user-item-width: 36px;
    }
  }
}
@media (max-height: 900px) {
  .members {
    --user-item-gap: 22px;
    .member {
      --user-item-width: 32px;
    }
  }
}
@media (max-height: 800px) {
  .members {
    --user-item-gap: 18px;
    .member {
      --user-item-width: 28px;
    }
  }
}
@media (max-height: 700px) {
  .members {
    --user-item-gap: 14px;
    .member {
      --user-item-width: 24px;
    }
  }
}
</style>
