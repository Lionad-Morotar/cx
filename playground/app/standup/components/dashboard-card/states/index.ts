import { ref } from 'vue'
import type { Props, DefinedEmits } from '../types'
import type { Ref } from 'vue'

export type DashboardCardStates = {
  isEmpty: Ref<boolean>
}

export const useDashboardCardStates = (props: Props, emits: any): DashboardCardStates => {
  return props.use
    ? props.use(props, emits)
    : {
        isEmpty: ref(false),
      }
}

export const useDashboardCard = (props: Props, emits: any) => {
  const { isEmpty } = useDashboardCardStates(props, emits)
  return {
    isEmpty,
  }
}
