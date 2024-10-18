import type { Action } from "./schematic/action"

const subscribersById = new Map<string, string[]>()

export function addSubscriber(action: Action, channelId: string) {
  const subscribers = subscribersById.get(action) ?? []
  subscribersById.set(action, [...subscribers, channelId])
}

export function removeSubscriber(action: Action, channelId: string) {
  const subscribers = subscribersById.get(action) ?? []
  subscribersById.set(action, subscribers.filter((s) => s !== channelId))
}

export function getSubscribers(action: Action): string[] {
  return subscribersById.get(action) ?? []
}
