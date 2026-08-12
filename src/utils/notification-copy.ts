/**
 * Single source of truth for notification wording.
 *
 * Previously the navbar dropdown and the notifications page each had their own
 * `switch`, with copy that had already drifted ("challenged you to a game" vs
 * "joined your game"). Worse, both matched **lowercase** strings while the API
 * sends the Prisma enum in **UPPERCASE** — so nothing ever matched and the
 * navbar's `default` branch rendered the raw enum, producing "kingsley LIKE".
 *
 * Matching here is case-insensitive so it can't break that way again.
 */

/** Mirrors the backend `NotificationTarget` enum. */
export type NotificationTargetType =
  | "EVENT"
  | "POSTCARD"
  | "GAME"
  | "USER"
  | "PAYMENT"
  | "TICKET";

export interface NotificationLike {
  type: string;
  targetType?: string | null;
  actor?: { username?: string; displayName?: string | null } | null;
  /** Optional server-supplied text. Always wins when present. */
  message?: string | null;
}

/** "your postcard" / "your event" — so LIKE copy isn't hardcoded to postcards. */
function targetNoun(targetType?: string | null): string {
  switch (targetType?.toUpperCase()) {
    case "EVENT":
      return "your event";
    case "POSTCARD":
      return "your postcard";
    case "GAME":
      return "your game";
    case "TICKET":
      return "your ticket";
    default:
      return "your post";
  }
}

export function actorName(n: NotificationLike): string {
  return n.actor?.displayName || n.actor?.username || "Someone";
}

/**
 * The action phrase, without the actor's name — e.g. "liked your postcard".
 * Covers every value of the backend `NotificationType` enum.
 */
export function notificationLabel(n: NotificationLike): string {
  const target = targetNoun(n.targetType);

  switch (n.type?.toUpperCase()) {
    case "LIKE":
      return `liked ${target}`;
    case "COMMENT":
      return `commented on ${target}`;
    case "FOLLOW":
      return "started following you";
    case "TAG":
      return `tagged you in ${n.targetType?.toUpperCase() === "EVENT" ? "an event" : "a postcard"}`;
    case "RSVP":
      return "RSVP'd to your event";
    case "CHECK_IN":
      return "checked in to your event";
    case "GAME_RESULT":
      return "played your game";
    case "GAME_UNLOCKED":
      return "unlocked a new game";
    case "EVENT_REMINDER":
      return "your event is coming up";
    case "EVENT_PUBLISHED":
      return "your event is now live";
    case "TICKET_PURCHASED":
      return "bought a ticket to your event";
    case "PAYMENT_CONFIRMED":
      return "your payment was confirmed";
    case "PAYMENT_FAILED":
      return "your payment failed";
    case "VIBETAG_ACTIVATED":
      return "VibeTags are now active on your event";
    default:
      // Never show a raw enum. Turn SOMETHING_LIKE_THIS into "something like this".
      return n.type ? n.type.toLowerCase().replace(/_/g, " ") : "sent you an update";
  }
}

/**
 * True when the sentence should be prefixed with the actor's name.
 * System notifications ("your payment failed") read wrong with a name in front.
 */
export function hasActorPrefix(n: NotificationLike): boolean {
  const systemTypes = [
    "EVENT_REMINDER",
    "EVENT_PUBLISHED",
    "PAYMENT_CONFIRMED",
    "PAYMENT_FAILED",
    "VIBETAG_ACTIVATED",
    "GAME_UNLOCKED",
  ];
  return !systemTypes.includes(n.type?.toUpperCase() ?? "");
}

/** The full sentence, e.g. "Kingsley liked your postcard". */
export function notificationText(n: NotificationLike): string {
  if (n.message) return n.message;

  const label = notificationLabel(n);
  return hasActorPrefix(n) ? `${actorName(n)} ${label}` : capitalise(label);
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Accent dot colour per type, matching the existing navbar palette. */
export function notificationDot(type: string): string {
  switch (type?.toUpperCase()) {
    case "LIKE":
    case "GAME_RESULT":
      return "bg-[hsl(330,70%,55%)]";
    case "COMMENT":
    case "GAME_UNLOCKED":
      return "bg-[hsl(195,100%,42%)]";
    case "FOLLOW":
    case "TAG":
      return "bg-[hsl(280,60%,50%)]";
    case "RSVP":
    case "CHECK_IN":
    case "TICKET_PURCHASED":
      return "bg-[hsl(316,62%,20%)]";
    case "PAYMENT_FAILED":
      return "bg-destructive";
    case "PAYMENT_CONFIRMED":
      return "bg-emerald-500";
    default:
      return "bg-muted-foreground";
  }
}
