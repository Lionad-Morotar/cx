export * from './gitlab-project'
export * from './label'
export * from './project'
export * from './standup'
export * from './task'
export * from './user'

export type PagerArg = {
  offset: number
  pageSize: number
}

export type IssueLine = 'requirement' | 'design' | 'development'

export type Response<Data = any> = {
  code: string
  message: string
  success: boolean
  data: Data
}

export type Request<Arg = unknown, Data = unknown> = (arg?: Partial<Arg>) => Promise<Response<Data>>

export type RequestPager<Arg = unknown, Data = unknown> = Request<Arg & PagerArg, Data>
