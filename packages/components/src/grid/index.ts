import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'
import GridForm from './panel/grids-form.vue'
import { defaultDatas } from './config'
import { getPosByTurn } from './utils'

export default normalize({
  name: '网格',
  icon: 'i-tabler-columns-3',
  description: '能将一系列组件在页面中按行列排列开，并调整行列的宽高和间距',
  key: 'cx-grid',
  component,
  props: {
    colCount: {
      name: '列',
      type: 'custom',
      component: GridForm,
    },
    // 尽管 GridForm 同时支持行、列、和旋转的更改，
    // 但也要暴露相应属性
    rowCount: {
      name: '行',
      type: 'number',
      hidden: true,
    },
    turn: {
      name: '旋转',
      type: 'number',
      hidden: true,
    },
    // gridBox: {
    //   name: '格子高度',
    //   type: 'css-box',
    //   options: {
    //     fields: 'size',
    //     direction: 'w',
    //   },
    // },
    // gap: {
    //   name: '间距',
    //   description: '如：10px',
    //   type: 'string',
    //   initial: '8px',
    // },
  },
  slots: ({ cmpt }) => {
    const turn = +cmpt?.data?.turn || defaultDatas.turn
    const row = +cmpt?.data?.rowCount || defaultDatas.rowCount
    const col = +cmpt?.data?.colCount || defaultDatas.colCount
    if (!col || !row) return []
    // const isTurned = turn === 1 || turn === 3

    // console.trace'[debug] cx-grid slots', col, ro)

    const slots = Array.from({ length: row })
      .map((_, rowIdx) =>
        Array.from({ length: col }).map((_, colIdx) => {
          const [r, c] = getPosByTurn(row, col, rowIdx, colIdx, turn)
          return {
            _r: r,
            _c: c,
            key: `row-${rowIdx + 1}-col-${colIdx + 1}`,
            name: `区域（${r + 1}行${c + 1}列）`,
            description: '',
          }
        }),
      )
      .flat(Number.POSITIVE_INFINITY)
      .sort((a: any, b: any) => {
        return a._r === b._r ? a._c - b._c : a._r - b._r
      }) as {
      key: string
      name: string
      description: string
    }[]

    return slots
  },
})
