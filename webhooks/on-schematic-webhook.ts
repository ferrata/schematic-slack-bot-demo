import type { App, KnownBlock } from "@slack/bolt"
import type { ServerResponse } from "node:http"
import { json } from "node:stream/consumers"
import { match } from "ts-pattern"

import { getSubscribers } from "../lib/subscribers"
import { planEntitlementSchema, type PlanEntitlement } from "../lib/schematic/plan-entitlement"
import { logger } from "../lib/logger"

function createSlackMessage(entitlement: PlanEntitlement): { text: string, blocks: KnownBlock[] } {
  const value = match(entitlement.body.value_type)
    .with("numeric", () => `\`${entitlement.body.value_numeric} (${entitlement.body.value_type})\``)
    .with("boolean", () => `\`${entitlement.body.value_bool} (${entitlement.body.value_type})\``)
    .otherwise(() => `\`${entitlement.body.value_type}\``)

  return {
    text: `Environment ${entitlement.body.environment_id}

${entitlement.body.plan.name} plan was updated
Action type: ${entitlement.action}
Feature name: ${entitlement.body.feature.name}
Value: ${value}
`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `Environment ${entitlement.body.environment_id}`,
          emoji: true
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `
*\`${entitlement.body.plan.name}\`* plan was <https://app.schematichq.com/${entitlement.body.environment_id}/settings/audit-log|updated>

Action type: \`${entitlement.action}\`
Feature name: \`${entitlement.body.feature.name}\`
Value: ${value}
`
        },
      },
      {
        type: "divider"
      }
    ]
  }
}

export async function onSchematicWebhook(app: App, req: NodeJS.ReadableStream, res: ServerResponse): Promise<void> {
  const body = await json(req)
  const parsed = planEntitlementSchema.safeParse(body)

  if (!parsed.success) {
    logger.error(`Invalid request: ${parsed.error}`)

    res.statusCode = 400
    res.end()

    return
  }

  logger.info(`Received action ${parsed.data.action}`)

  const subscribers = getSubscribers(parsed.data.action)
  const message = createSlackMessage(parsed.data)

  logger.info(`Notifying ${subscribers.length} subscribers`)

  for (const channelId of subscribers) {
    logger.info(`Notifying channel ${channelId} about action ${parsed.data.action}`)
    try {
      await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: channelId,
        blocks: message.blocks,
        text: message.text,
      })
    } catch (error) {
      logger.error(error)
    }
  }

  res.statusCode = 200
  res.end()
}
