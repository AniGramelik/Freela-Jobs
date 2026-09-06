/**
 * Camada de notificação abstraída (ADR-0004).
 *
 * O negócio fala com `Notifier`; os canais concretos (e-mail, push e, depois,
 * SMS/WhatsApp) entram como `NotificationProvider` sem mudar os chamadores.
 */

export type NotificationChannel = "EMAIL" | "PUSH";

export type OutboundNotification = {
  /** E-mail, id de subscription push, etc. */
  recipient: string;
  channel: NotificationChannel;
  /** "auth" | "callout" | "digest" | ... — governa opt-out. */
  category: string;
  template: string;
  data: Record<string, unknown>;
};

export type SendResult = {
  providerId?: string;
};

export interface NotificationProvider {
  readonly channel: NotificationChannel;
  send(notification: OutboundNotification): Promise<SendResult>;
}

export class Notifier {
  private readonly providers: Map<NotificationChannel, NotificationProvider>;

  constructor(providers: readonly NotificationProvider[]) {
    this.providers = new Map(providers.map((p) => [p.channel, p]));
  }

  async send(notification: OutboundNotification): Promise<SendResult> {
    const provider = this.providers.get(notification.channel);
    if (!provider) {
      throw new Error(`Sem provedor para o canal ${notification.channel}`);
    }
    return provider.send(notification);
  }
}
