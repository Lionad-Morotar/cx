export type AnyValue = any

// ******************************************** Utils
// ***************************************************
// ***************************************************

export type IsAny<T> = [T] extends [any] ? ([any] extends [T] ? true : false) : false

// ******************************************** Function
// ***************************************************
// ***************************************************

export type Fn<Arg, Ret = void> = (arg: Arg) => Ret

// ******************************************** Union
// ***************************************************
// ***************************************************

// ...

// ******************************************** Logic
// ***************************************************
// ***************************************************

export type IsEqual<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false

export type IsNotEqual<X, Y> = IsEqual<X, Y> extends true ? false : true

// ******************************************** Tupple
// ***************************************************
// ***************************************************

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

// ******************************************** Record
// ***************************************************
// ***************************************************

export type Get<T, K = string> = K extends keyof T
  ? T extends Record<K, any>
    ? T[K]
    : never
  : never
