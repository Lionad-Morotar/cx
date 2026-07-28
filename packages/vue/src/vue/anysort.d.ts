declare module 'anysort' {
  /** anysort@2.0.0 官方未带类型声明。按 index.js 真实导出补最小声明：
   *  - 主函数为重载：单参返回 comparator，三参直接比较两元素
   *  - 仅挂 splice / grouped 两个静态方法，无 config
   *  - anysort() 是 comparator 生成器而非原地排序（export = 对应 CJS module.exports 单导出） */

  /** anymatch 兼容的匹配条件：字符串/正则/函数/或它们的数组 */
  type AnysortCriteria = string | RegExp | ((value: unknown) => boolean) | AnysortCriteria[]

  /** 比较器函数：(a, b) => 负数|0|正数 */
  type AnysortComparator<T = unknown> = (a: T, b: T, startIndex?: number) => number

  /** 重载 1：传入 criteria，返回用于 Array.sort 的比较器 */
  function anysort<T = unknown>(criteria: AnysortCriteria): AnysortComparator<T>
  /** 重载 2：传入待比较的两元素与 criteria，返回比较结果（-1/0/1） */
  function anysort<T = unknown>(a: T, b: T, criteria: AnysortCriteria): number
  /** 重载 3（fallback）：传入数组与多组条件（spread），对应源码 (...args) 形态；
   *  args.length<=1 走重载1，否则源码仅消费 args[2]，多余 criteria 被忽略 */
  function anysort<T = unknown>(array: T[], ...criteria: AnysortCriteria[]): number

  namespace anysort {
    /** 按条件切分数组：返回匹配/不匹配/已排序三组（元素类型与输入一致） */
    function splice<T>(
      array: T[],
      criteria?: AnysortCriteria,
      tieBreakers?: AnysortCriteria,
    ): { matched: T[]; unmatched: T[]; sorted: T[] }
    /** 按多组条件分组排序，返回每组的匹配数组 */
    function grouped<T>(array: T[], groups?: AnysortCriteria[], order?: string): T[][]
  }

  export = anysort
}
