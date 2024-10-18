import { z } from "zod"

import { actionSchema } from "./action"

export const planEntitlementSchema = z.object({
  action: actionSchema,
  account_id: z.string(),
  environment_id: z.string(),
  body: z.object({
    created_at: z.string(),
    environment_id: z.string(),
    feature: z.object({
      id: z.string(),
      name: z.string().nullable(),
      description: z.string().nullable(),
      feature_type: z.string().nullable(),
      lifecycle_phase: z.string().nullable(),
      event_subtype: z.string().nullable(),
      trait_id: z.string().nullable(),
      icon: z.string().nullable(),
      maintainer_id: z.string(),
      created_at: z.string(),
      updated_at: z.string(),
    }),
    feature_id: z.string(),
    id: z.string(),
    metric_period: z.string().nullable(),
    plan: z.object({
      audience_type: z.string(),
      created_at: z.string(),
      description: z.string(),
      id: z.string(),
      icon: z.string().nullable(),
      name: z.string().nullable(),
      plan_type: z.string().nullable(),
      updated_at: z.string().nullable(),
    }),
    plan_id: z.string(),
    rule_id: z.string(),
    updated_at: z.string(),
    value_bool: z.boolean().nullable(),
    value_numeric: z.number().nullable(),
    value_trait: z.string().nullable(),
    value_trait_id: z.string().nullable(),
    value_type: z.string(),
  }),
  object_type: z.string(),
})

export type PlanEntitlement = z.infer<typeof planEntitlementSchema>
