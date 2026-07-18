export const getDefaultExportFromModule = (x: any) => {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x
}
