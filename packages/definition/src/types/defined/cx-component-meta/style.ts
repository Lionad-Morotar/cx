export type CxComponentStyle = {
  // box(width, height)
  w?: string
  // font
  f?: string
  // margin
  m?: string
  // padding
  p?: string
  // layout
  l?: string
  // round
  r?: string
  // border
  b?: string
  // cosmetic(background, opacity, shadow, cursor, filters)
  c?: {
    b?: [string, string, string]
    o?: string
    s?: string
    c?: string
    f?: string
  }
}
