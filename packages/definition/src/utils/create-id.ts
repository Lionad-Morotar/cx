import { v4 as uuidv4 } from 'uuid'

/**
 * 统一的 cx 运行时 id 生成出口。
 *
 * 收口 definition 包内散落的 uuidv4 裸用（runtime / loader / script-manager / cx-emitter），
 * 为未来 id 命名空间前缀或算法切换（如 nanoid）留单一改动点。
 *
 * 默认返回裸 uuid 以兼容现有已持久化的 id 格式；带前缀命名空间留作未来增强，
 * 避免本次改变 id 形态破坏存量数据。
 */
export const createCxID = (): string => uuidv4()
