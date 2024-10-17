import { strict } from 'node:assert'
import { App, LogLevel } from '@slack/bolt'
import * as dotenv from 'dotenv'

import { schematicCommand } from './listeners/commands/schematic-command'
import { onSchematicWebhook } from './webhooks/on-schematic-webhook'

dotenv.config()

strict(process.env.SLACK_BOT_TOKEN, 'SLACK_BOT_TOKEN must be provided')
strict(process.env.SLACK_APP_TOKEN, 'SLACK_APP_TOKEN must be provided')

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: LogLevel.DEBUG,
  port: process.env.SLACK_APP_PORT ? Number.parseInt(process.env.SLACK_APP_PORT) : 3000,
  customRoutes: [
    {
      path: '/schematic-webhook',
      method: ['POST'],
      handler: (req, res) => onSchematicWebhook(app, req, res),
    },
  ],
})

async function main() {
  try {
    app.command('/schematic', schematicCommand)

    await app.start()
    console.log('⚡️ Schematic demo bot is running! ⚡️')
  } catch (error) {
    console.error('Unable to start Schematic demo bot', error)
  }
}

main()
