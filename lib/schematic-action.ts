export const SchematicAction = {
  PLAN_ENTITLEMENT_CREATED: 'plan.entitlement.created',
  PLAN_ENTITLEMENT_UPDATED: 'plan.entitlement.updated',
  PLAN_ENTITLEMENT_DELETED: 'plan.entitlement.deleted',
} as const

export type SchematicAction = typeof SchematicAction[keyof typeof SchematicAction]
