import type z from 'zod'

export type CxComponentMetaEmits = Record<string, ConfigMatcher>

type ConfigMatcher = Base

type Base = {
  name: string
  description?: string
  schema?: z.ZodTypeAny
}
