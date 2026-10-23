# NextVibe — Affiliate Marketing Frontend Implementation Guide

This guide covers everything the frontend team needs to build the Affiliate Marketing features on NextVibe — including the referral link capture on signup, the automatic checkout discount, and the full Affiliate Dashboard.

---

## 1. How the Program Works (Summary for Product/UI)

1. **Marketers:** Any logged-in user can register as an affiliate with one click. They receive a unique code prefixed with `NV-` (e.g. `NV-KINGSLEY`) and can share their referral link:
   `https://mynextvibe.com/signup?ref=NV-KINGSLEY`
2. **Referred Organizers (The Buyers):** 
   - When they register via an affiliate link, they are permanently attributed to that marketer.
   - On their **first organizer package purchase** (VibeTags / Gamification / Mega Bundle), they automatically receive a **5% discount**.
   - They never need to manually enter a code at checkout if they signed up with a link.
   - If they signed up without a link, they can type the affiliate's code into the normal coupon discount box at checkout.
3. **The Commission:** Marketers earn **10% lifetime commission** on every package purchase made by their referred organizers. *(Note: This program applies to organizer event plans and addons only; ticket sales are excluded).*

---

## 2. Frontend User Flows & Touchpoints

There are **three touchpoints** to implement in the web/mobile app:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. SIGNUP PAGE                                                              │
│ URL: /signup?ref=NV-KINGSLEY                                                │
│ Action: Read `ref` query param -> send in POST /v1/auth/register            │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. CHECKOUT / PUBLISH EVENT MODAL                                           │
│ Action: POST /v1/organizer-payments/plan/quote                              │
│ Display: Subtotal, 5% Referral Discount (if first purchase), Final Total    │
│ Input: Single "Discount Code" box (accepts both coupons & affiliate codes)  │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. AFFILIATE DASHBOARD                                                      │
│ Action: GET /v1/affiliates/me (Check if registered)                         │
│ If Not: Show "Become an Affiliate" CTA -> POST /v1/affiliates/register      │
│ If Yes: Show Dashboard Metrics, Referral Links, and Earnings Ledger         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Touchpoint 1: Referral Capture on Signup

When a user lands on the website with `?ref=...`:
1. Save `ref` in `localStorage` or `sessionStorage` (e.g. `sessionStorage.setItem('nv_referral_code', ref)`).
2. When the user submits the registration form, pass `referralCode` in the body.

### API: `POST /v1/auth/register`

#### Request Payload
```json
{
  "email": "organizer@example.com",
  "username": "eventmaster",
  "displayName": "Event Master",
  "password": "StrongPassword123!",
  "phone": "+2348012345678",
  "referralCode": "NV-KINGSLEY" // <-- Optional: pass ref param here
}
```

---

## 4. Touchpoint 2: Checkout & Plan Quote

When an organizer publishes an event or buys a plan, the frontend calls the quote endpoint.

### API: `POST /v1/organizer-payments/plan/quote`

#### Request Payload
```json
{
  "eventId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "planType": "VIBETAGS_SINGLE",
  "couponCode": "NV-KINGSLEY" // <-- Optional: single box for coupons OR affiliate codes
}
```

#### Response Payload (`200 OK`)
```json
{
  "tier": "MICRO",
  "baseAmount": 5000,
  "volumeDiscountPercent": 0,
  "volumeDiscountAmount": 0,
  "couponDiscountAmount": 0,
  "affiliateDiscountPercent": 5,
  "affiliateDiscountAmount": 250,
  "affiliateId": "aff-uuid",
  "affiliateCode": "NV-KINGSLEY",
  "finalAmount": 4750,
  "gamesIncluded": 0,
  "couponCode": null
}
```

### UI Checkout Display Checklist:
- If `affiliateDiscountAmount > 0`: Display a line item:
  - **Base Price:** `₦5,000`
  - **Referral Discount (5%):** `-₦250`
  - **Total to Pay:** `₦4,750`
- If the user was referred at signup, `affiliateDiscountAmount` is applied **automatically** even if `couponCode` was not passed in the request!
- If the user enters their own code: Backend returns `400 Bad Request` (`"You cannot use your own referral code"`). Show this error under the coupon input.

---

## 5. Touchpoint 3: The Affiliate Dashboard

All routes below require `Authorization: Bearer <access_token>`.

### A. Check Status: `GET /v1/affiliates/me`

Call this on mount when the user navigates to `/affiliates` or opens settings:

#### Response if NOT registered:
```json
{
  "isAffiliate": false,
  "profile": null
}
```
*(Show the "Join the NextVibe Affiliate Program" landing card with a "Register Now" button)*

#### Response if ALREADY registered:
```json
{
  "isAffiliate": true,
  "profile": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "user-uuid",
    "affiliateCode": "NV-KINGSLEY",
    "commissionRate": 0.1,
    "isActive": true,
    "createdAt": "2026-10-23T12:00:00.000Z",
    "referralCode": "NV-KINGSLEY"
  }
}
```

---

### B. Register: `POST /v1/affiliates/register`

Triggered when the user clicks "Join Affiliate Program". No request body required (uses the logged-in user's token).

#### Response (`201 Created`):
```json
{
  "isAffiliate": true,
  "profile": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "user-uuid",
    "affiliateCode": "NV-KINGSLEY",
    "commissionRate": 0.1,
    "isActive": true,
    "createdAt": "2026-10-23T12:00:00.000Z",
    "referralCode": "NV-KINGSLEY"
  }
}
```
*(Error `409 Conflict`: "You are already registered as an affiliate")*

---

### C. Dashboard Overview: `GET /v1/affiliates/dashboard`

Use this to populate the main dashboard screen in a single request.

#### Response (`200 OK`):
```json
{
  "profile": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "affiliateCode": "NV-KINGSLEY",
    "commissionRate": 0.1,
    "isActive": true,
    "createdAt": "2026-10-23T12:00:00.000Z"
  },
  "metrics": {
    "totalEarnings": 15500,     // Total NGN earned all-time
    "availableBalance": 12500,  // Ready for withdrawal
    "pendingBalance": 3000,     // In clearance window
    "paidOutBalance": 0,        // Total already withdrawn
    "totalReferrals": 14,       // Organizers signed up
    "convertedReferrals": 6     // Organizers who bought >= 1 plan
  },
  "recentEarnings": [
    {
      "id": "earning-uuid",
      "amount": 500,
      "baseAmount": 5000,
      "rateApplied": 0.1,
      "currency": "NGN",
      "status": "AVAILABLE",
      "createdAt": "2026-10-23T14:30:00.000Z",
      "eventName": "Lagos Tech Fest 2026",
      "planType": "VIBETAGS_SINGLE",
      "paymentType": "PLAN_PURCHASE"
    }
  ],
  "recentReferrals": [
    {
      "id": "referral-uuid",
      "referredUserId": "user-2",
      "createdAt": "2026-10-22T09:15:00.000Z",
      "organizer": {
        "username": "eventking",
        "displayName": "Event King",
        "avatarUrl": "https://...",
        "joinedAt": "2026-10-22T09:15:00.000Z"
      },
      "completedPurchasesCount": 2
    }
  ]
}
```

---

### D. Full Referrals Table: `GET /v1/affiliates/referrals`

Use this for the dedicated "My Referrals" tab/page with pagination.

**Query Parameters:**
- `page` (optional, default `1`)
- `limit` (optional, default `20`, max `100`)

#### Example: `GET /v1/affiliates/referrals?page=1&limit=20`

#### Response (`200 OK`):
```json
{
  "data": [
    {
      "id": "ref-uuid",
      "referredUserId": "user-uuid",
      "createdAt": "2026-10-22T09:15:00.000Z",
      "organizer": {
        "username": "eventpro",
        "displayName": "Event Pro Ltd",
        "avatarUrl": "https://...",
        "joinedAt": "2026-10-22T09:15:00.000Z"
      },
      "completedPurchasesCount": 3
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### E. Full Earnings Ledger: `GET /v1/affiliates/earnings`

Use this for the dedicated "Earnings & Commission History" tab/page.

**Query Parameters:**
- `page` (optional, default `1`)
- `limit` (optional, default `20`)
- `status` (optional: `PENDING`, `AVAILABLE`, `PAID_OUT`, `CANCELLED`)

#### Example: `GET /v1/affiliates/earnings?page=1&limit=20&status=AVAILABLE`

#### Response (`200 OK`):
```json
{
  "data": [
    {
      "id": "earn-uuid",
      "amount": 1200,
      "baseAmount": 12000,
      "rateApplied": 0.1,
      "currency": "NGN",
      "status": "AVAILABLE",
      "createdAt": "2026-10-23T10:00:00.000Z",
      "eventName": "Summer Groove",
      "planType": "MEGA_BUNDLE_FULL",
      "paymentType": "PLAN_PURCHASE"
    }
  ],
  "meta": {
    "total": 18,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

## 6. TypeScript Interfaces (Copy-pasteable)

```typescript
export interface AffiliateProfile {
  id: string;
  userId: string;
  affiliateCode: string;
  commissionRate: number;
  isActive: boolean;
  createdAt: string;
  referralCode?: string;
}

export interface AffiliateMetrics {
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  paidOutBalance: number;
  totalReferrals: number;
  convertedReferrals: number;
}

export type AffiliateEarningStatus = 'PENDING' | 'AVAILABLE' | 'PAID_OUT' | 'CANCELLED';

export interface AffiliateEarningItem {
  id: string;
  amount: number;
  baseAmount: number;
  rateApplied: number;
  currency: string;
  status: AffiliateEarningStatus;
  createdAt: string;
  eventName: string | null;
  planType: string | null;
  paymentType: string | null;
}

export interface AffiliateReferralItem {
  id: string;
  referredUserId: string;
  createdAt: string;
  organizer: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
    joinedAt: string;
  };
  completedPurchasesCount: number;
}

export interface AffiliateDashboardResponse {
  profile: AffiliateProfile;
  metrics: AffiliateMetrics;
  recentEarnings: AffiliateEarningItem[];
  recentReferrals: AffiliateReferralItem[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

---

## 7. How to Construct the Referral Link

When showing the marketer their referral link to copy:
```typescript
const shareUrl = `${window.location.origin}/signup?ref=${profile.affiliateCode}`;
```

Provide a "Copy Link" button that copies `shareUrl` and a "Copy Code" button that copies `profile.affiliateCode`.
