/**
 * After a successful login / register / Google OAuth, call this to decide
 * where to send the user.
 *
 * Rules:
 *  - Admin users always go to /admin (or validFrom if it starts with /admin)
 *  - If the user has NO vibes saved → /onboarding/vibes?next=<destination>
 *  - Otherwise → <destination> (validFrom or /events)
 */

export function resolvePostAuthDestination({
  isSuperAdmin,
  validFrom,
  hasVibes,
}: {
  isSuperAdmin: boolean;
  /** The decoded `from` query param — already validated to start with "/" and not "/auth" */
  validFrom: string | null;
  /** Whether the user already has at least one saved vibe */
  hasVibes: boolean;
}): string {
  if (isSuperAdmin) {
    return validFrom ?? "/admin";
  }

  const finalDestination = validFrom ?? "/events";

  if (!hasVibes) {
    const next = encodeURIComponent(finalDestination);
    return `/onboarding/vibes?next=${next}`;
  }

  return finalDestination;
}

/**
 * Checks whether a user object has vibes/interests configured.
 * Handles both the API shape (vibes: [...]) and legacy shape (interests: [...]).
 */
export function userHasVibes(user: any): boolean {
  const vibes = user?.vibes ?? user?.interests ?? user?.vibeTags ?? [];
  return Array.isArray(vibes) && vibes.length > 0;
}
