declare module 'anysort' {
  /** anysort@2.0.0 官方未带类型声明。真实导出为 module.exports = anysort（裸函数单导出），
   *  仅挂 splice / grouped 两个静态方法，无 config；any sort() 是 comparator 生成器而非原地排序。
   *  按真实形态补最小声明（export = 对应 CJS module.exports 单导出）。 */
  function anysort(...args: any[]): any

  namespace anysort {
    function splice(
      array: any[],
      criteria?: any,
      tieBreakers?: any,
    ): { matched: any[]; unmatched: any[]; sorted: any[] }
    function grouped(array: any[], groups?: any, order?: any): any[]
  }

  export = anysort
}
