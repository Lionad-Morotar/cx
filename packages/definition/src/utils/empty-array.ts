export function createEmptyArray(length: number) {
  return Array.from({ length })
    .fill('')
    .map(() => [])
}
