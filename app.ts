import { strict } from 'node:assert'
import { App, type Logger, LogLevel } from '@slack/bolt'
import * as dotenv from 'dotenv'
import { match } from 'ts-pattern'

import { schematicCommand } from './listeners/commands/schematic-command'
import { onSchematicWebhook } from './webhooks/on-schematic-webhook'
import { logger } from './lib/logger'

dotenv.config()

strict(process.env.SLACK_BOT_TOKEN, 'SLACK_BOT_TOKEN must be provided')
strict(process.env.SLACK_APP_TOKEN, 'SLACK_APP_TOKEN must be provided')

const appLogger: Logger = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  getLevel: () => match(logger.level)
    .with('debug', () => LogLevel.DEBUG)
    .with('info', () => LogLevel.INFO)
    .with('warn', () => LogLevel.WARN)
    .with('error', () => LogLevel.ERROR)
    .with('trace', () => LogLevel.DEBUG)
    .with('fatal', () => LogLevel.ERROR)
    .otherwise(() => LogLevel.INFO),
  setLevel: () => { },
  setName: () => { },
}

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: LogLevel.DEBUG,
  logger: appLogger,
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
    logger.info('⚡️ Schematic demo bot is running! ⚡️')
  } catch (error) {
    logger.error('Unable to start Schematic demo bot', error)
  }
}

main()
