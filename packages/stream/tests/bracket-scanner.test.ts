import { describe, expect, it } from 'vitest'
import { scanBalancedItems } from '../src/core/bracket-scanner'

describe('scanBalancedItems', () => {
  // --- 典型流式场景：对象根 JSON 树（移植自已验证的源测试集） ---

  const treePrefix = `{
    "root": "t1",
    "elements": {
      "t1": {
        "type": "Table",
        "props": {
          "id": "t1",
          "columns": [`

  const col1 = `{"key":"type","label":"类别","priority":"primary"}`
  const col2 = `{"key":"examples","label":"举例","priority":"primary"}`
  const row1 = `{"type":"电动工具","examples":"磨床","relevance":"potential"}`
  const row2 = `{"type":"电池相关","examples":"充电器","relevance":"direct"}`

  const colsPath = ['elements', '*', 'props', 'columns', '*']
  const dataPath = ['elements', '*', 'props', 'data', '*']

  it('不完整 JSON：无匹配', () => {
    expect(scanBalancedItems(treePrefix, colsPath)).toEqual([])
  })

  it('第一个 item 完整', () => {
    const json = `${treePrefix}${col1}`
    const m = scanBalancedItems(json, colsPath)
    expect(m).toHaveLength(1)
    expect(m[0]!.end).toBe(json.length - 1)
  })

  it('第一个 item 完整 + 第二个未完成', () => {
    const partial = `{"key":"examples","label":"举`
    const json = `${treePrefix}${col1},${partial}`
    const m = scanBalancedItems(json, colsPath)
    expect(m).toHaveLength(1)
  })

  it('两个 items 都完整', () => {
    const json = `${treePrefix}${col1},${col2}`
    const m = scanBalancedItems(json, colsPath)
    expect(m).toHaveLength(2)
    expect(m[1]!.end).toBe(json.length - 1)
  })

  it('columns 完整 + data 第一行完整', () => {
    const json = `${treePrefix}${col1},${col2}],"data":[${row1}`
    expect(scanBalancedItems(json, colsPath)).toHaveLength(2)
    const mData = scanBalancedItems(json, dataPath)
    expect(mData).toHaveLength(1)
    expect(mData[0]!.end).toBe(json.length - 1)
  })

  it('data 多行逐步增长', () => {
    const json = `${treePrefix}${col1},${col2}],"data":[${row1},${row2}`
    expect(scanBalancedItems(json, dataPath)).toHaveLength(2)
  })

  // --- 字符串内转义 ---

  it('字符串内转义引号不影响括号平衡', () => {
    const json = `{"root":"r","elements":{"r":{"type":"X","props":{"items":[{"name":"a\\"b","val":1}]}}}}`
    expect(scanBalancedItems(json, ['elements', '*', 'props', 'items', '*'])).toHaveLength(1)
  })

  it('字符串内转义反斜杠', () => {
    const json = `{"root":"r","elements":{"r":{"type":"X","props":{"items":[{"name":"a\\\\b","val":1}]}}}}`
    expect(scanBalancedItems(json, ['elements', '*', 'props', 'items', '*'])).toHaveLength(1)
  })

  // --- 嵌套对象 ---

  it('item 包含嵌套对象', () => {
    const col = `{"key":"rel","label":"关联","format":{"kind":"badge","colorMap":{"direct":"success"}}}`
    const json = `${treePrefix}${col}`
    const m = scanBalancedItems(json, colsPath)
    expect(m).toHaveLength(1)
    expect(json[m[0]!.end]).toBe('}')
  })

  // --- 数组索引精确匹配 ---

  it('精确索引匹配：只找 columns[1]', () => {
    const json = `${treePrefix}${col1},${col2}`
    const m = scanBalancedItems(json, ['elements', '*', 'props', 'columns', 1])
    expect(m).toHaveLength(1)
    expect(json[m[0]!.end]).toBe('}')
  })

  it('精确索引匹配：columns[2] 不存在', () => {
    const json = `${treePrefix}${col1},${col2}`
    expect(scanBalancedItems(json, ['elements', '*', 'props', 'columns', 2])).toHaveLength(0)
  })

  // --- 通配符与多元素 ---

  it('通配符匹配任意元素', () => {
    const json = `{"root":"x","elements":{"x":{"type":"T","props":{"list":[{"a":1}]}}}}`
    expect(scanBalancedItems(json, ['elements', '*', 'props', 'list', '*'])).toHaveLength(1)
  })

  it('多个兄弟元素各匹配自己的 items', () => {
    const json = `{"root":"a","elements":{"a":{"type":"T","props":{"items":[{"x":1}]}},"b":{"type":"T","props":{"items":[{"y":2}]}}}}`
    expect(scanBalancedItems(json, ['elements', '*', 'props', 'items', '*'])).toHaveLength(2)
  })

  // --- 空输入 ---

  it('空字符串', () => {
    expect(scanBalancedItems('', ['a'])).toEqual([])
  })

  it('空路径', () => {
    expect(scanBalancedItems('{"a":1}', [])).toEqual([])
  })

  // --- 完整 JSON 树 ---

  it('完整树扫描 data 行', () => {
    const full = JSON.stringify({
      root: 'bt',
      elements: {
        bt: {
          type: 'Table',
          props: {
            columns: [
              { key: 'type', label: '类别' },
              { key: 'examples', label: '举例' },
            ],
            data: [
              { type: '电动工具', examples: '磨床' },
              { type: '电池相关', examples: '充电器' },
              { type: '搬运设备', examples: '托盘车' },
            ],
          },
        },
      },
    })
    const mData = scanBalancedItems(full, dataPath)
    expect(mData).toHaveLength(3)
    for (const m of mData) {
      expect(full[m.end]).toBe('}')
    }
  })

  // --- cx 组件树形状（单对象根约定） ---

  const cxPrefix = `{"id":"t1","key":"cx-demo-table","data":{"columns":[`
  const cxCol = `{"key":"name","label":"名称"}`
  const cxRow1 = `{"name":"磨床","category":"电动工具"}`
  const cxRow2 = `{"name":"充电器","category":"电池相关"}`

  it('cx 形状：columns 经 data 路径寻址', () => {
    const json = `${cxPrefix}${cxCol}`
    const m = scanBalancedItems(json, ['data', 'columns', '*'])
    expect(m).toHaveLength(1)
    expect(json[m[0]!.end]).toBe('}')
  })

  it('cx 形状：rows 逐步增长', () => {
    const json = `${cxPrefix}${cxCol}],"rows":[${cxRow1},${cxRow2}`
    const m = scanBalancedItems(json, ['data', 'rows', '*'])
    expect(m).toHaveLength(2)
  })

  it('cx 形状：流式中途（第二行未闭合）', () => {
    const json = `${cxPrefix}${cxCol}],"rows":[${cxRow1},{"name":"充`
    const m = scanBalancedItems(json, ['data', 'rows', '*'])
    expect(m).toHaveLength(1)
  })

  // --- 顶层数组根（增强：元素以索引作为首段路径） ---

  it('顶层数组：元素对象可按索引寻址', () => {
    const json = `[{"data":{"columns":[{"key":"a"}]}}]`
    const m = scanBalancedItems(json, [0, 'data', 'columns', '*'])
    expect(m).toHaveLength(1)
    expect(json[m[0]!.end]).toBe('}')
  })

  it('顶层数组：通配符匹配元素索引', () => {
    const json = `[{"data":{"rows":[{"x":1},{"x":2}]}}]`
    const m = scanBalancedItems(json, ['*', 'data', 'rows', '*'])
    expect(m).toHaveLength(2)
  })

  it('顶层数组：多元素索引互不混淆', () => {
    const json = `[{"items":[{"a":1}]},{"items":[{"b":2},{"c":3}]}]`
    expect(scanBalancedItems(json, [0, 'items', '*'])).toHaveLength(1)
    expect(scanBalancedItems(json, [1, 'items', '*'])).toHaveLength(2)
  })

  it('顶层数组：第二个元素的部分 item 流式未闭合', () => {
    // 元素 1 的第一个 item 已闭合、第二个未闭合
    const json = `[{"items":[{"a":1}]},{"items":[{"b":2},{"c":3`
    expect(scanBalancedItems(json, [1, 'items', '*'])).toHaveLength(1)
    expect(scanBalancedItems(json, ['*', 'items', '*'])).toHaveLength(2)
  })

  it('顶层数组：纯量元素不产生路径噪音', () => {
    const json = `[1,"x",{"items":[{"a":1}]}]`
    expect(scanBalancedItems(json, [2, 'items', '*'])).toHaveLength(1)
  })

  it('顶层数组：路径 [*] 匹配根元素自身而非内部容器', () => {
    const json = `[{"a":{"b":1}}]`
    const m = scanBalancedItems(json, ['*'])
    expect(m).toHaveLength(1)
    // 匹配的是根元素对象的闭合 }（索引 0 的容器），不是内部 {"b":1}，也不是根数组的 ]
    expect(json.slice(0, m[0]!.end + 1)).toBe('[{"a":{"b":1}}')
  })
})
