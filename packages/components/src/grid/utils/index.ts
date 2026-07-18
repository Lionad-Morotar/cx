/**
 ** @example 1
 * [[1, 2, 3]]
 * * rotate 45 degree clockwise
 * [[1],
 *  [2],
 *  [3]]
 * * (1, 1) -> (1, 1), (1, 2) -> (2, 1), (1, 3) -> (3, 1)
 *
 * @example 2
 * [[1, 2, 3],
 *  [4, 5, 6]]
 * * rotate 45 degree clockwise
 * [[4, 1],
 *  [5, 2],
 *  [6, 3]]
 * * (1, 1) -> (1, 2), (1, 2) -> (2, 2), (1, 3) -> (3, 2)
 * * (2, 1) -> (1, 1), (2, 2) -> (2, 1), (2, 3) -> (3, 1)
 *
 * @example 3
 * [[1, 2, 3],
 *  [4, 5, 6],
 *  [7, 8, 9],
 *  [10, 11, 12],
 *  [13, 14, 15]]
 * * rotate 45 degree clockwise
 * [[13, 10, 7, 4, 1],
 *  [14, 11, 8, 5, 2],
 *  [15, 12, 9, 6, 3]]
 * * (1, 1) -> (1, 5), (1, 2) -> (2, 5), (1, 3) -> (3, 5)
 * * (5, 1) -> (1, 1), (5, 2) -> (2, 1), (5, 3) -> (3, 1)
 *
 * @example 4
 * [[1, 2, 3],
 *  [4, 5, 6]]
 * * rotate 45 degree anticlockwise
 * [[3, 6],
 *  [2, 5],
 *  [1, 4]]
 * * (1, 1) -> (3, 1), (1, 2) -> (2, 1), (1, 3) -> (1, 1)
 * * (2, 1) -> (3, 2), (2, 2) -> (2, 2), (2, 3) -> (1, 2)
 */
export const rotatePos = (
  oldRows: number,
  oldCols: number,
  row: number,
  col: number,
  direction: 'clockwise' | 'anticlockwise',
): [number, number] => {
  if (!direction) {
    return [row, col]
  }
  return direction === 'clockwise' ? [col, oldRows - row - 1] : [oldCols - col - 1, row]
}

export const getPosByTurn = (
  oldRows: number,
  oldCols: number,
  rIdx: number,
  cIdx: number,
  turn: number,
): [number, number] => {
  let [row, col] = [rIdx, cIdx]
  if (turn === 1) {
    ;[row, col] = rotatePos(oldRows, oldCols, row, col, 'clockwise')
  }
  if (turn === 2) {
    ;[row, col] = rotatePos(oldRows, oldCols, row, col, 'clockwise')
    ;[row, col] = rotatePos(oldCols, oldRows, row, col, 'clockwise')
  }
  if (turn === 3) {
    ;[row, col] = rotatePos(oldRows, oldCols, row, col, 'anticlockwise')
  }
  return [row, col]
}
