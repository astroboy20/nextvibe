# 🚀 Quick Reference Guide

## Import Statements

```typescript
// Team Management
import { 
  TeamManagementPanel,
  PendingInvitesBanner 
} from "@/features/events/components/team-management";

// Analytics
import { EventAnalyticsDashboard } from "@/features/events/components/analytics";

// Permissions
import { useEventPermissions } from "@/features/events/hooks/use-event-permissions";

// API
import { 
  useGetCoOrganizersQuery,
  useInviteCoOrganizerMutation,
  useAcceptInviteMutation 
} from "@/features/events/api/co-organizers-api";

import { useGetManagedEventsQuery } from "@/features/events/api/events-api";
```

## Usage Examples

### 1. Team Management Panel
```tsx
<TeamManagementPanel 
  eventId="event-123"
  eventStatus="PUBLISHED"
  onLeave={() => router.push("/events")}
/>
```

### 2. Analytics Dashboard
```tsx
<EventAnalyticsDashboard 
  eventId="event-123"
  eventStatus="PUBLISHED"
  myRole="SUPER_ADMIN"
/>
```

### 3. Permission Checks
```tsx
const permissions = useEventPermissions(event.myRole);

// Show/hide UI elements
{permissions.canInviteCoOrganizer && <InviteButton />}

// Disable buttons
<Button disabled={!permissions.canPublishEvent}>Publish</Button>

// Conditional rendering
{permissions.canViewRevenueAnalytics && <RevenueCard />}
```

### 4. Pending Invites Banner
```tsx
// Just add to your dashboard - no props needed
<PendingInvitesBanner />
```

## Permission Quick Reference

| Permission | OWNER | SUPER_ADMIN | CO_ORGANIZER |
|-----------|-------|-------------|--------------|
| Promote Super Admin | ✅ | ❌ | ❌ |
| Invite Co-Organizer | ✅ | ✅ | ❌ |
| Remove Team Member | ✅ | ✅* | ❌ |
| Publish Event | ✅ | ✅ | ❌ |
| Purchase Plans | ✅ | ✅ | ❌ |
| Edit Event Details | ✅ | ✅ | ✅ |
| Manage Games | ✅ | ✅ | ✅ |
| Edit Bank Details | ✅ | ❌ | ❌ |
| View Revenue | ✅ | ✅ | ❌ |
| Leave Event | ❌ | ✅ | ✅ |

*Super Admin can only remove Co-Organizers, not other Super Admins

## Role Badge Component

```tsx
import { Crown, Shield, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const roleConfig = {
  OWNER: { label: "Owner", icon: Crown, color: "text-amber-600" },
  SUPER_ADMIN: { label: "Super Admin", icon: Shield, color: "text-purple-600" },
  CO_ORGANIZER: { label: "Co-Organizer", icon: User, color: "text-blue-600" },
};

function RoleBadge({ role }) {
  const { label, icon: Icon, color } = roleConfig[role];
  return (
    <Badge variant="outline" className={color}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
}
```

## API Endpoints

```
GET    /v1/events/me/managed                           → List managed events
GET    /v1/events/:id/co-organizers                   → Get team roster
POST   /v1/events/:id/co-organizers                   → Invite member
PATCH  /v1/events/:id/co-organizers/:id/role          → Update role
DELETE /v1/events/:id/co-organizers/:id               → Remove member
DELETE /v1/events/:id/co-organizers/me                → Leave event
GET    /v1/co-organizers/invites                      → My invites
POST   /v1/co-organizers/invites/:token/accept        → Accept invite
POST   /v1/co-organizers/invites/:token/decline       → Decline invite
GET    /v1/analytics/events/:id                       → Get analytics
```

## Common Patterns

### Gating Publish Button
```tsx
const permissions = useEventPermissions(event.myRole);

<Button 
  disabled={!permissions.canPublishEvent}
  onClick={handlePublish}
>
  Publish Event
</Button>
```

### Hiding Revenue Section
```tsx
const permissions = useEventPermissions(event.myRole);

{permissions.canViewRevenueAnalytics && (
  <Card>
    <CardTitle>Revenue</CardTitle>
    <CardContent>
      <p>Total: {formatCurrency(revenue)}</p>
    </CardContent>
  </Card>
)}
```

### Read-Only Bank Details
```tsx
const permissions = useEventPermissions(event.myRole);

<Input
  value={bankAccount}
  onChange={handleChange}
  disabled={!permissions.canEditPayoutBankDetails}
/>
{!permissions.canEditPayoutBankDetails && (
  <p className="text-xs text-muted-foreground">
    Only the event owner can edit payout details
  </p>
)}
```

## Zero-Denominator Protection

```typescript
// Always guard division operations
const checkInRate = confirmedRsvps > 0 
  ? (checkIns / confirmedRsvps) * 100 
  : 0;

const avgValue = orderCount > 0 
  ? totalRevenue / orderCount 
  : 0;
```

## Currency Formatting

```typescript
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency, // NGN, USD, etc.
    minimumFractionDigits: 0,
  }).format(amount);
};

// Usage
<p>{formatCurrency(event.revenue, event.currency)}</p>
```

## Troubleshooting

### myRole is undefined
✅ Check backend returns `myRole` in event response
✅ Verify query is successful: `const { data, error } = useGetEventDetailsQuery(id);`

### Revenue showing for CO_ORGANIZER
✅ Confirm `myRole` is correctly passed: `<Dashboard myRole={event.myRole} />`
✅ Check permission hook: `const permissions = useEventPermissions(event.myRole);`

### Invite not working
✅ User must be authenticated
✅ Token must be valid (not expired)
✅ Email must match logged-in user

### Cache not updating
✅ Check Redux DevTools for cache tags
✅ Verify API returns success status
✅ Confirm mutation is unwrapped: `await mutation().unwrap();`

## File Locations

```
Co-Organizer System:
└── src/features/events/
    ├── api/co-organizers-api.ts
    ├── hooks/use-event-permissions.ts
    ├── types.ts (updated)
    └── components/team-management/
        ├── team-management-panel.tsx
        ├── invite-dialog.tsx
        └── pending-invites-banner.tsx

Analytics Dashboard:
└── src/features/events/components/analytics/
    ├── event-analytics-dashboard.tsx
    ├── participation-module.tsx
    ├── gamification-module.tsx
    ├── vibetags-module.tsx
    ├── repeat-engagement-module.tsx
    ├── postcards-module.tsx
    └── revenue-module.tsx

Invite Acceptance:
└── src/app/(app)/invites/co-organizer/[token]/page.tsx
```

## Testing Commands

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build project
npm run build

# Start dev server
npm run dev
```

## Need More Help?

📖 **Full Integration Guide**: INTEGRATION_GUIDE.md
📋 **Implementation Summary**: CO_ORGANIZER_IMPLEMENTATION_SUMMARY.md
✅ **Complete Status**: IMPLEMENTATION_COMPLETE.md
