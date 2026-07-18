import type z from 'zod'

export type CxComponentMetaExposes = Record<string, ConfigMatcher>

type ConfigMatcher = Base

type Base = {
  name: string
  description?: string
  schema?: z.ZodTypeAny
}
