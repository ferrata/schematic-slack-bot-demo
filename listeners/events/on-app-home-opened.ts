import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt'

import { logger } from '../../lib/logger'

export async function onAppHomeOpened({
  client, event,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<'app_home_opened'>) {
  if (event.tab !== 'home') return

  try {
    await client.views.publish({
      user_id: event.user,
      view: {
        type: 'home',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Welcome home, <@${event.user}> :house:*`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'This is a home tab for a user. All the cool stuff goes here.',
            },
          },
        ],
      },
    })
  } catch (error) {
    logger.error(error)
  }
}
