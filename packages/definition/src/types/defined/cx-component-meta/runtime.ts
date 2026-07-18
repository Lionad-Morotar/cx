import type z from 'zod'

export type CxArg = {
  name: string
  description: string
  help?: string
  schema?: z.ZodTypeAny
}
