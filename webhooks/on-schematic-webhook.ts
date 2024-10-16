import { App } from "@slack/bolt"
import { ServerResponse } from "node:http"
import { text } from "node:stream/consumers"
import { getSubscribers } from "../lib/subscribers"

export async function onSchematicWebhook(app: App, req: NodeJS.ReadableStream, res: ServerResponse): Promise<void> {
  const body = await text(req)
  console.log('Received a webhook!', { body })

  const { id } = JSON.parse(body)
  if (id != null) {
    const subscribers = getSubscribers(id)
    for (const channelId of subscribers) {
      console.log(`Notifying channel ${channelId} about event ${id}`)
      try {
        await app.client.chat.postMessage({
          token: process.env.SLACK_BOT_TOKEN,
          channel: channelId,
          text: `A new post was published with ID: ${id}`,
        })
      } catch (error) {
        console.error(error)
      }
    }
  }

  res.statusCode = 200
  res.end()
}
