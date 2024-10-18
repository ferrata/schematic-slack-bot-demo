import { z } from "zod"

export const actionSchema = z.enum([
  'plan.entitlement.created',
  'plan.entitlement.updated',
  'plan.entitlement.deleted',
])

export type Action = z.infer<typeof actionSchema>
