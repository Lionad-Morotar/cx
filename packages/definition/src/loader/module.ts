export const getDefaultExportFromModule = (x: unknown) => {
  const record = x as Record<string, unknown> | null
  return record && record.__esModule && Object.prototype.hasOwnProperty.call(record, 'default')
    ? record['default']
    : x
}
