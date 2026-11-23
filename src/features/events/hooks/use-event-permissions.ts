import { EventRole } from "@/features/events/types";

/**
 * Hook for checking event permissions based on user role
 * Implements the permission matrix from the specification
 */
export function useEventPermissions(myRole: EventRole | null | undefined) {
  const isOwner = myRole === "OWNER";
  const isSuperAdmin = myRole === "SUPER_ADMIN";
  const isCoOrganizer = myRole === "CO_ORGANIZER";
  const isAdmin = isOwner || isSuperAdmin;
  const hasAnyRole = isOwner || isSuperAdmin || isCoOrganizer;

  return {
    // Role checks
    isOwner,
    isSuperAdmin,
    isCoOrganizer,
    isAdmin,
    hasAnyRole,

    // Team management
    canPromoteSuperAdmin: isOwner,
    canInviteCoOrganizer: isAdmin,
    canRemoveCoOrganizer: isAdmin,
    canViewPendingInvites: isAdmin,
    canLeaveEvent: isSuperAdmin || isCoOrganizer,

    // Event lifecycle & billing
    canPublishEvent: isAdmin,
    canCancelEvent: isAdmin,
    canEndEvent: isAdmin,
    canPurchasePlans: isAdmin,
    canPurchaseAddons: isAdmin,

    // Day-to-day operations
    canEditEventDetails: hasAnyRole,
    canManageTickets: hasAnyRole,
    canViewAttendees: hasAnyRole,
    canScanCheckIns: hasAnyRole,
    canManageGames: hasAnyRole,
    canManageVibeTags: hasAnyRole,
    canManageReminders: hasAnyRole,

    // Wishlist & payouts
    canManageWishlistItems: hasAnyRole,
    canEditPayoutBankDetails: isOwner,
    canViewPayoutBankDetails: hasAnyRole,
    canRequestPayouts: isOwner,

    // Analytics visibility
    canViewParticipationAnalytics: hasAnyRole,
    canViewGamesAnalytics: hasAnyRole,
    canViewVibeTagsAnalytics: hasAnyRole,
    canViewRepeatAnalytics: hasAnyRole,
    canViewPostcardsAnalytics: hasAnyRole,
    canViewRevenueAnalytics: isAdmin,
  };
}

/**
 * Helper to determine if a UI element should be shown or hidden
 */
export function shouldShow(permission: boolean): boolean {
  return permission;
}

/**
 * Helper to determine if a UI element should be disabled
 */
export function shouldDisable(permission: boolean): boolean {
  return !permission;
}
