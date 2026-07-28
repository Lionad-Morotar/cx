/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck —— 类型体操集在 tsgo/TS7 下求值有真实错误（M["component"] 推导退化为 unknown），
// 待 TS7 类型体操求值能力增强后摘除；此文件仅被 define/component.ts 的 Guard 消费
import type { KebabCase, UnionToIntersection } from 'type-fest'

// IsAny 的两个 any 是核心逻辑：用 [T] extends [any] + [any] extends [T] 双向判定
// 检测 T 是否为 any（unknown 会破坏此语义——[unknown] extends [T] 分布行为不同）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IsAny<T> = [T] extends [any] ? ([any] extends [T] ? true : false) : false

/* -------------------------------------------------------------------------- */
/*                                    Union                                   */
/* -------------------------------------------------------------------------- */

export type RecordToUnion<T extends Record<string, unknown>> = T[keyof T]

/* -------------------------------------------------------------------------- */
/*                                  Function                                  */
/* -------------------------------------------------------------------------- */

export type Fn<Arg, Ret = void> = (arg: Arg) => Ret

/* -------------------------------------------------------------------------- */
/*                                    Logic                                   */
/* -------------------------------------------------------------------------- */

export type IsEqual<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false

export type IsNotEqual<X, Y> = IsEqual<X, Y> extends true ? false : true

export type IsTrue<T> = T extends never ? never : T extends true ? true : false
export type IsTrueThen<T, Return = true> = IsTrue<T> extends true ? Return : never

export type IsEveryTrue<T extends unknown[], Res = never> = T extends [never]
  ? never
  : T extends []
    ? true
    : T extends [infer One, ...infer Rest]
      ? IsTrue<One> extends true
        ? IsEveryTrue<Rest, true>
        : never
      : Res

export type IsEveryTrueThen<
  T extends unknown[],
  Return = true,
  Res = IsEveryTrue<T>,
> = Res extends never ? never : Return

export type IsEveryTrueXOrY<
  T extends unknown[],
  Return1 = true,
  Return2 = false,
  Res = IsEveryTrue<T>,
> = Res extends never ? Return2 : Return1

/* -------------------------------------------------------------------------- */
/*                                   record                                   */
/* -------------------------------------------------------------------------- */

// Get 的 Record<K, any> 保留 any：改 unknown 会让 Get<M,"component"> 的返回类型
// 在 extends Component 约束处退化为 unknown（component.ts Guard 消费），破坏类型体操
export type Get<T, K = string> = K extends keyof T
  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends Record<K, any>
    ? T[K]
    : never
  : never

/* -------------------------------------------------------------------------- */
/*                                   string                                   */
/* -------------------------------------------------------------------------- */

export type IsKebabCase<T> = IsEqual<KebabCase<T>, T>

/* -------------------------------------------------------------------------- */
/*                                   object                                   */
/* -------------------------------------------------------------------------- */

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (...args: unknown[]) => unknown ? T[P] : DeepPartial<T[P]>
}
