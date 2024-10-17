import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt'
import yargs from 'yargs'
import { z } from 'zod'

import { SchematicAction } from '../../lib/schematic-action'
import { addSubscriber, removeSubscriber } from '../../lib/subscribers'

type Command =
  | {
      name: 'subscribe'
      action: SchematicAction
    }
  | {
      name: 'unsubscribe'
      action: SchematicAction
    }

const commandSchema = z.enum(['subscribe', 'unsubscribe'], {
  errorMap: (_, ctx) => ({
    message: `Unknown command \`${ctx.data}\`. Supported commands: \`subscribe\`, \`unsubscribe\`.`,
  }),
})

const schematicActionSchema = z.enum(
  [
    SchematicAction.PLAN_ENTITLEMENT_CREATED,
    SchematicAction.PLAN_ENTITLEMENT_UPDATED,
    SchematicAction.PLAN_ENTITLEMENT_DELETED,
  ],
  {
    errorMap: (_, ctx) => ({
      message: `Unknown action \`${ctx.data}\`. Supported actions: \`${Object.values(SchematicAction).join('`, `')}\``,
    }),
  },
)

async function parseCommand(input: string): Promise<Command> {
  const parsed = await yargs(input)
    .command('subscribe <action>', 'Subscribe to a Schematic action', (yargs) => {
      return yargs.positional('action', {
        type: 'string',
        choices: Object.values(SchematicAction),
      })
    })
    .command('unsubscribe <action>', 'Unsubscribe from a Schematic action', (yargs) => {
      return yargs.positional('action', {
        type: 'string',
        choices: Object.values(SchematicAction),
      })
    })
    .fail((_, err) => {
      if (err) throw err
    })
    .parse()

  if (parsed._.length === 0) {
    throw new Error('No command provided')
  }

  return {
    name: commandSchema.parse(parsed._[0]),
    action: schematicActionSchema.parse(parsed.action as string),
  }
}

export async function schematicCommand({
  ack,
  respond,
  body,
  command,
}: AllMiddlewareArgs & SlackCommandMiddlewareArgs) {
  try {
    await ack()

    const parsedCommand = await parseCommand(command.text)

    if (parsedCommand.name === 'subscribe') {
      addSubscriber(parsedCommand.action, body.channel_id)
      await respond({
        response_type: 'in_channel',
        text: `Subscribed this channel to action \`${parsedCommand.action}\``,
      })
      console.log(`Subscribed ${body.channel_id} to action ${parsedCommand.action}`)
    }

    if (parsedCommand.name === 'unsubscribe') {
      removeSubscriber(parsedCommand.action, body.channel_id)
      await respond({
        response_type: 'in_channel',
        text: `Unsubscribed this channel from action \`${parsedCommand.action}\``,
      })
      console.log(`Unsubscribed ${body.channel_id} from action ${parsedCommand.action}`)
    }
    // biome-ignore lint/suspicious/noExplicitAny: error handler
  } catch (error: any) {
    console.error(error)

    if (error instanceof z.ZodError) {
      await respond({
        response_type: 'ephemeral',
        text: `${error.errors.map((e) => e.message).join(', ')}`,
      })
      return
    }

    await respond({
      response_type: 'ephemeral',
      text: `${error?.message ?? 'An error occurred'}`,
    })
  }
}
