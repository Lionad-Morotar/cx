declare module 'anysort' {
  /** anysort 官方未带类型声明（v2.0.0），按使用面补最小声明 */
  export const anysort: {
    (records: any[], ...plugins: any[]): any[]
    config: { autoSort: boolean }
  }
}
