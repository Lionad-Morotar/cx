/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck

import type { KebabCase, UnionToIntersection } from 'type-fest'

export type TODO = any

export type IsAny<T> = [T] extends [any] ? ([any] extends [T] ? true : false) : false

/* -------------------------------------------------------------------------- */
/*                                    Union                                   */
/* -------------------------------------------------------------------------- */

export type RecordToUnion<T extends Record<string, any>> = T[keyof T]

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

export type Get<T, K = string> = K extends keyof T
  ? T extends Record<K, any>
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
  [P in keyof T]?: T[P] extends (...args: any[]) => any ? T[P] : DeepPartial<T[P]>
}
