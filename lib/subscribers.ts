import { SchematicAction } from "./schematic-action"

const subscribersById = new Map<string, string[]>()

export function addSubscriber(action: SchematicAction, channelId: string) {
  const subscribers = subscribersById.get(action) ?? []
  subscribersById.set(action, [...subscribers, channelId])
}

export function removeSubscriber(action: SchematicAction, channelId: string) {
  const subscribers = subscribersById.get(action) ?? []
  subscribersById.set(action, subscribers.filter((s) => s !== channelId))
}

export function getSubscribers(action: SchematicAction): string[] {
  return subscribersById.get(action) ?? []
}
