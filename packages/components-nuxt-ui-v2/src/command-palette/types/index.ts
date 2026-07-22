import z from 'zod'
import type { FuseResult } from 'fuse.js'
import type { ComputedRef } from 'vue'

export const zItem = z.object({
  id: z.string(),
  label: z.string(),
  click: z.instanceof(Function).optional(),
  icon: z.string().optional(),
  shortcut: z.string().optional(),
  description: z.string().optional(),
  to: z.string().optional(),
  href: z.string().optional(),
})

export type Item = z.infer<typeof zItem>

export const zGroupItem = z.object({
  key: z.string(),
  label: z.string(),
  commands: z.array(zItem),
})

export type GroupItem = z.infer<typeof zGroupItem>

export type FuseResults = ComputedRef<FuseResult<Item>[]>
