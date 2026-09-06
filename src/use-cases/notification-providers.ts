import { logger } from "@/lib/logger";

import {
  Notifier,
  type NotificationChannel,
  type NotificationProvider,
  type OutboundNotification,
} from "./notifier";

/**
 * Provedor de log — entrega "de mentira", registra a intenção. Serve ao piloto
 * enquanto os provedores reais (D4: e-mail transacional, Web Push) não entram.
 * A troca não toca em regra de negócio.
 */
class LogProvider implements NotificationProvider {
  constructor(readonly channel: NotificationChannel) {}

  async send(notification: OutboundNotification) {
    logger().info(
      {
        channel: this.channel,
        recipient: notification.recipient,
        category: notification.category,
        template: notification.template,
      },
      "notification_dispatched_via_log_provider",
    );
    return { providerId: `log_${crypto.randomUUID()}` };
  }
}

export const logEmailProvider = new LogProvider("EMAIL");
export const logPushProvider = new LogProvider("PUSH");

export function createDefaultNotifier(): Notifier {
  return new Notifier([logEmailProvider, logPushProvider]);
}
