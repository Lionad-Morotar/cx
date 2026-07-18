const PKG_NAME_SHORT = 'cx'

// eg: 'name' => '_cx_name'
export const prefix = <K extends string>(key: K): `_${typeof PKG_NAME_SHORT}_${K}` =>
  `_${PKG_NAME_SHORT}_${key}`
