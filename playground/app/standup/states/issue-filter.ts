import { tryOnScopeDispose } from '@vueuse/core'
import { computed, reactive, onMounted, unref } from 'vue'
import { useDisplaySelectedProject } from './project'
import { dayjs, isEmpty } from '../utils'
import {
  StageLabels,
  isTaskIn,
  getTaskStepsSpendSeconds,
  getTaskSpendTimeSteps,
} from '../utils/label'

import IconTeam from '../assets/team.svg'

import type { Ref, ComputedRef } from 'vue'
import type { MaybeRef } from 'vue'
import type { User, FormattedIssue } from '../apis'
import type { Dayjs } from 'dayjs'

// 虚拟团队角色
export const userTeam = {
  id: '_TEAM',
  name: '',
  username: '',
  avatarUrl: IconTeam,
  created: '',
  email: '',
  state: '',
  webUrl: '',
}

type Filter = (x: any) => boolean
type FilterGetter = (...xs: any[]) => Filter

type RegistryFilter =
  | Filter
  | Ref<Filter>
  | ComputedRef<Filter>
  | FilterGetter
  | Ref<FilterGetter>
  | ComputedRef<FilterGetter>

const filterStore = reactive({} as Record<string, RegistryFilter>)

/**
 * 根据项目、用户角色等状态创建相关的过滤器
 */
export const useIssueFilters = (userRef: MaybeRef<User | null | undefined>) => {
  const user = computed(() => unref(userRef))

  const projectReq = useDisplaySelectedProject
  if (!projectReq.isLoading) {
    onMounted(() => {
      if (!projectReq.isLoading) {
        projectReq.exec()
      }
    })
  }

  const isTeamManager = computed(() => isUserTeamManager(unref(user)))
  const isProductManager = computed(() => isUserProductManager(unref(user)))
  const isFEDeveloper = computed(() => isUserFEDeveloper(unref(user)))
  const isBEDeveloper = computed(() => isUserBEDeveloper(unref(user)))
  const isDesigner = computed(() => isUserDesigner(unref(user)))
  const isTester = computed(() => isUserTester(unref(user)))

  // watch(user, (n) => console.info("[info] user", n));
  // watch(
  //   () => projectReq.result,
  //   (n) => console.info("[info] project", n)
  // );

  const isUserTeamManager = (x: User | null | undefined) => userTeam.id === x?.id
  const isUserProductManager = (x: User | null | undefined) =>
    Boolean(projectReq.result?.pmUsers?.find((y) => y.id === x?.id))
  const isUserFEDeveloper = (x: User | null | undefined) =>
    Boolean(projectReq.result?.feUsers?.find((y) => y.id === x?.id))
  const isUserBEDeveloper = (x: User | null | undefined) =>
    Boolean(projectReq.result?.beUsers?.find((y) => y.id === x?.id))
  const isUserDesigner = (x: User | null | undefined) =>
    Boolean(projectReq.result?.deUsers?.find((y) => y.id === x?.id))
  const isUserTester = (x: User | null | undefined) =>
    Boolean(projectReq.result?.teUsers?.find((y) => y.id === x?.id))

  const isTaskInPMProject = (x: FormattedIssue) =>
    Boolean(projectReq.result?.pmProjects?.find((y) => x.webUrl.includes(y.webUrl)))
  const isTaskInFEProject = (x: FormattedIssue) =>
    Boolean(projectReq.result?.feProjects?.find((y) => x.webUrl.includes(y.webUrl)))
  const isTaskInBEProject = (x: FormattedIssue) =>
    Boolean(projectReq.result?.beProjects?.find((y) => x.webUrl.includes(y.webUrl)))
  const isTaskInDevProject = (x: FormattedIssue) => isTaskInBEProject(x) || isTaskInFEProject(x)
  const isTaskInDEProject = (x: FormattedIssue) =>
    Boolean(projectReq.result?.deProjects?.find((y) => x.webUrl.includes(y.webUrl)))
  const isTaskInTEProject = (x: FormattedIssue) =>
    Boolean(projectReq.result?.teProjects?.find((y) => x.webUrl.includes(y.webUrl)))

  function isTaskDone(x: FormattedIssue) {
    return !isTaskUndone(x)
  }

  const isTaskUndone = (x: FormattedIssue) => {
    if (isTeamManager.value) {
      return !isTaskIn(x, ['pm-passed'])
    }
    if (isProductManager.value) {
      return isTaskIn(x, ['func-designing', 'pm-checking'])
    }
    if (isFEDeveloper.value || isBEDeveloper.value) {
      return isTaskIn(x, ['planed', 'wip', 'np', 'pm-np', 'ui-np', 'review-np'])
    }
    if (isDesigner.value) {
      return isTaskIn(x, ['planed', 'func-designed', 'ui-checking', 'ui-designing'])
    }
    if (isTester.value) {
      return isTaskIn(x, ['planed', 'solved', 'testing'])
    }
    return false
  }

  // 默认按照角色过滤各自项目里的 issue
  const byRoleProject = (x: FormattedIssue) => {
    // console.log(
    //   "user",
    //   isTeamManager,
    //   isProductManager,
    //   isFEDeveloper,
    //   isBEDeveloper,
    //   isDesigner,
    //   isTester
    // );
    // 目前设计和产品共用部分项目的 issue；开发、测试和设计共用部分项目的 issue
    // 团队管理员视角按共享仓库组过滤（URL 片段与 mock 数据契约对齐）
    const filters = {
      [String(isTeamManager.value)]: (x) =>
        x.webUrl?.includes?.('pm-hub') ||
        x.webUrl?.includes?.('frontend-hub') ||
        x.webUrl?.includes?.('backend-hub'),
      [String(isProductManager.value)]: (x) => isTaskInPMProject(x) || isTaskInDEProject(x),
      [String(isFEDeveloper.value)]: (x) => isTaskInDevProject(x),
      [String(isBEDeveloper.value)]: (x) => isTaskInDevProject(x),
      [String(isDesigner.value)]: (x) =>
        isTaskInPMProject(x) || isTaskInDEProject(x) || isTaskInDevProject(x),
      [String(isTester.value)]: (x) => isTaskInDevProject(x) || isTaskInTEProject(x),
    } as Record<string, (x: FormattedIssue) => boolean>

    // console.log("filters", filters);

    const targetFilter = filters[String(true)] || (() => false)
    return targetFilter(x)
  }

  const isTaskValid = (x: FormattedIssue) => {
    return !x?.issueLabels?.find((x) => x?.name === 'state: invalid')
  }
  const isTaskInvalid = (x: FormattedIssue) => {
    return x?.issueLabels?.find((x) => x?.name === 'state: invalid')
  }

  const isTaskDoneAt = (x: FormattedIssue, date: Dayjs | string) => {
    const targetDate = dayjs(date)
    const isInTime = (...xs: string[]) =>
      xs.some((x) => !isEmpty(x) && dayjs(x).isSame(targetDate, 'day'))

    if (isTaskUndone(x)) {
      return false
    }

    const filters: Record<string, (x: FormattedIssue) => unknown> = {
      [String(isTeamManager.value)]: (x) => isInTime(x.pmPassedAt),
      [String(isProductManager.value)]: (x) => isInTime(x.funcDesignedAt, x.pmPassedAt),
      [String(isFEDeveloper.value)]: (x) => isInTime(x.solvedAt),
      [String(isBEDeveloper.value)]: (x) => isInTime(x.solvedAt),
      [String(isDesigner.value)]: (x) => isInTime(x.uiPassedAt, x.uiDesignedAt),
      [String(isTester.value)]: (x) => isInTime(x.passedAt),
    }

    const targetFilter = filters[String(true)] || (() => false)
    return targetFilter(x)
  }

  // 过滤已经完成和进行中的任务
  const genByFocusDone = (date?: Dayjs | string) => {
    if (!date) {
      return () => false
    }

    const targetDate = dayjs(date)
    const isInTime = (...xs: string[]) =>
      xs.some((x) => !isEmpty(x) && dayjs(x).isSameOrAfter(targetDate))

    const filters: Record<string, (x: FormattedIssue) => unknown> = {
      [String(isTeamManager.value)]: (x) => {
        return isTaskUndone(x) ? !isTaskIn(x, ['accepted']) : isInTime(x.pmPassedAt)
      },
      [String(isProductManager.value)]: (x) => {
        // if (x?.webUrl?.includes("368")) {
        //   console.log(
        //     x,
        //     isTaskUndone(x),
        //     isInTime(x.funcDesignedAt, x.pmPassedAt)
        //   );
        // }
        return isTaskUndone(x) ? true : isInTime(x.funcDesignedAt, x.pmPassedAt)
      },
      [String(isFEDeveloper.value)]: (x) => {
        return isTaskUndone(x) ? true : isInTime(x.solvedAt)
      },
      [String(isBEDeveloper.value)]: (x) => {
        return isTaskUndone(x) ? true : isInTime(x.solvedAt)
      },
      [String(isDesigner.value)]: (x) => {
        // * debug
        // if (x?.webUrl?.includes("product-design/-/issues/301")) {
        //   console.log(
        //     x,
        //     isTaskUndone(x),
        //     isInTime(x.uiDesignedAt, x.uiPassedAt)
        //   );
        // }
        return isTaskUndone(x) ? true : isInTime(x.uiDesignedAt, x.uiPassedAt)
      },
      [String(isTester.value)]: (x) => {
        return isTaskUndone(x) ? true : isInTime(x.passedAt)
      },
    }
    const roleFilter = filters[String(true)] || (() => false)
    return (x: FormattedIssue) => {
      return roleFilter(x) && !isTaskInvalid(x)
    }
  }

  // 过滤进行中和计划要做的任务
  // 今天完成（今天完成但是是开会前完成的任务）也算正在做
  const genByFocusDoing = (date?: Dayjs | string) => {
    if (!date) {
      return () => false
    }
    const targetDate = dayjs(date)

    const filters: Record<string, (x: FormattedIssue) => unknown> = {
      [String(isTeamManager.value)]: (x) => {
        // * debug
        // if (x?.webUrl?.includes("147")) {
        //   console.log(
        //     x,
        //     isTaskUndone(x),
        //     isTaskIn(x, ["accepted"]),
        //     isTaskDoneAt(x, targetDate),
        //     timeStr(targetDate)
        //   );
        // }
        return (
          isTaskIn(x, ['planed']) ||
          (isTaskUndone(x) ? !isTaskIn(x, ['accepted']) : isTaskDoneAt(x, targetDate))
        )
      },
      [String(isProductManager.value)]: (x) => {
        return (
          isTaskIn(x, ['planed', 'func-designing', 'passed', 'ui-passed', 'pm-checking']) ||
          isTaskDoneAt(x, targetDate)
        )
      },
      [String(isFEDeveloper.value)]: (x) =>
        isTaskIn(x, ['planed', 'np', 'ui-np', 'pm-np', 'ui-designed', 'wip']) ||
        isTaskDoneAt(x, targetDate),
      [String(isBEDeveloper.value)]: (x) =>
        isTaskIn(x, ['planed', 'np', 'ui-np', 'pm-np', 'ui-designed', 'wip']) ||
        isTaskDoneAt(x, targetDate),
      [String(isDesigner.value)]: (x) =>
        isTaskIn(x, ['func-designed', 'ui-designing', 'passed', 'ui-checking']) ||
        isTaskDoneAt(x, targetDate),
      [String(isTester.value)]: (x) =>
        isTaskIn(x, ['solved', 'testing']) || isTaskDoneAt(x, targetDate),
    }

    // console.log("filters", filters, user);

    const roleFilter = filters[String(true)] || (() => false)
    return (x: FormattedIssue) => {
      return roleFilter(x) && !isTaskInvalid(x)
    }
  }

  // 按照任务过期时间排序
  const sortByDueDate = (a: FormattedIssue, b: FormattedIssue) => {
    // 缺 dueDate 的任务沉底（Infinity），双方都有时按过期时间倒序
    const dueDateA = !isEmpty(a.dueDate) ? dayjs(a.dueDate).valueOf() : Infinity
    const dueDateB = !isEmpty(b.dueDate) ? dayjs(b.dueDate).valueOf() : Infinity
    return dueDateB - dueDateA
  }

  // 按照打标签的流程排序
  const sortByStage = (taskA: FormattedIssue, taskB: FormattedIssue) => {
    const a = (taskA.issueLabels || []).find((x) => StageLabels.find((y) => +y.id === +x.id))
    const b = (taskB.issueLabels || []).find((x) => StageLabels.find((y) => +y.id === +x.id))
    if (!a || !b) {
      return 0
    }
    const idxA = StageLabels.findIndex((x) => +x.id === +a.id)
    const idxB = StageLabels.findIndex((x) => +x.id === +b.id)
    // console.log("idxA - idxB", idxA - idxB);
    // return idxA - idxB;
    return idxB - idxA
  }

  const spendTimeOnTask = (x: FormattedIssue) => {
    // 周会的"在做"口径含计划与进行中
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const filters: Record<string, (x: FormattedIssue) => number> = {
      [String(isTeamManager.value)]: (x) => getTaskSpendTimeSteps(x),
      [String(isProductManager.value)]: (x) =>
        getTaskStepsSpendSeconds(0, x) + getTaskStepsSpendSeconds(5, x),
      [String(isFEDeveloper.value)]: (x) => getTaskStepsSpendSeconds(2, x),
      [String(isBEDeveloper.value)]: (x) => getTaskStepsSpendSeconds(2, x),
      [String(isDesigner.value)]: (x) =>
        getTaskStepsSpendSeconds(1, x) + getTaskStepsSpendSeconds(4, x),
      [String(isTester.value)]: (x) => getTaskStepsSpendSeconds(3, x),
    }
    const targetFilter = filters[String(true)] || (() => 0)
    return targetFilter(x)
  }

  // 周会指标的"未完成"口径按角色区分
  // const spendTimeByRole = (x: FormattedIssue, user: User) => {}

  const registry = (key: string, value: RegistryFilter) => {
    if (filterStore[key]) {
      console.warn(`filter ${key} already exists, overriding`)
    }
    filterStore[key] = value

    tryOnScopeDispose(() => {
      delete filterStore[key]
    })
  }

  const get = <T>(key: string, ...args: T extends Array<unknown> ? T : []) => {
    if (!filterStore[key]) {
      console.warn(`filter ${key} does not exist`)
      return () => true
    }
    return args.length
      ? (unref(filterStore[key] as FilterGetter)(...args) as Filter)
      : (unref(filterStore[key]) as Filter)
  }

  const states = reactive({
    registry,
    get,
    isTeamManager,
    isProductManager,
    isFEDeveloper,
    isBEDeveloper,
    isDesigner,
    isTester,
    isUserTeamManager,
    isUserProductManager,
    isUserFEDeveloper,
    isUserBEDeveloper,
    isUserDesigner,
    isUserTester,
    isTaskInTEProject,
    isTaskInPMProject,
    isTaskInFEProject,
    isTaskInBEProject,
    isTaskInDevProject,
    isTaskInDEProject,
    isTaskIn,
    isTaskValid,
    isTaskInvalid,
    isTaskUndone,
    isTaskDone,
    isTaskDoneAt,
    spendTimeOnTask,
    byRoleProject,
    sortByDueDate,
    sortByStage,
    genByFocusDone,
    genByFocusDoing,
  })
  return states
}
