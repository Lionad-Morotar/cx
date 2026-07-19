import { useAsync } from '../hooks/use-async'
import { apiGetDefaultProjectID, apiGetProjectDetail } from '../apis'

/**
 * 启动时恢复默认项目（mock 层恒定返回内置默认项目）
 */
const useLastSelectedProjectReq = useAsync(async () => {
  const resUserSetting = await apiGetDefaultProjectID()
  const id = resUserSetting?.data?.projectId
  const resDetail = await apiGetProjectDetail({ id })
  return resDetail?.data || null
})

useLastSelectedProjectReq.exec()

export default useLastSelectedProjectReq
