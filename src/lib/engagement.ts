import { api } from "./api";

type EventType =
  | "login"
  | "chat_message"
  | "module_view"
  | "article_view"
  | "module_complete";

export async function logEvent(
  event_type: EventType,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await api.post("/engagement/log", { event_type, metadata });
  } catch {
    // Engagement logging is best-effort — never block the user action
  }
}
