# NextVibe Payment Flows

This document covers every payment flow on the platform — for organizers publishing events, adding features, and for attendees buying tickets.

---

## Overview

| Actor | Action | Cost |
|-------|--------|------|
| Organizer | Create event | Free |
| Organizer | Add game sessions to DRAFT event | Free |
| Organizer | Add VibeTags to DRAFT event | Free |
| Organizer | **Publish** event with no games + no VibeTags | **Free** |
| Organizer | **Publish** event with games and/or VibeTags | **Payment required** |
| Organizer | Add game session to PUBLISHED event (within quota) | Free |
| Organizer | Add game session to PUBLISHED event (over quota) | Payment required |
| Organizer | Add VibeTags to PUBLISHED event | Payment required |
| Attendee | Buy tickets | Payment required |

---

## Pricing Tiers

Event tier is **auto-determined from capacity** — the organizer never picks it.

| Tier | Attendees |
|------|-----------|
| Micro | 1 – 50 |
| Small | 51 – 200 |
| Medium | 201 – 500 |
| Large | 501 – 2,000 |
| Enterprise | 2,001+ |

---

## Organizer Plans

### VibeTags

| Plan | Included | Micro | Small | Medium | Large | Enterprise |
|------|----------|-------|-------|--------|-------|------------|
| `VIBETAGS_SINGLE` | One phase (Pre OR Main) | ₦5,000 | ₦10,000 | ₦20,000 | ₦35,000 | ₦50,000 |
| `VIBETAGS_BUNDLE` | Both phases (Pre + Main) | ₦8,000 | ₦15,000 | ₦30,000 | ₦50,000 | ₦75,000 |

### Gamification

| Plan | Included | Micro | Small | Medium | Large | Enterprise |
|------|----------|-------|-------|--------|-------|------------|
| `GAMIFICATION_SINGLE` | 2 games, one phase | ₦5,000 | ₦10,000 | ₦20,000 | ₦35,000 | ₦50,000 |
| `GAMIFICATION_BUNDLE` | 4 games, both phases | ₦8,000 | ₦15,000 | ₦30,000 | ₦50,000 | ₦75,000 |

### Mega Bundle (VibeTags + Gamification)

| Plan | Included | Micro | Small | Medium | Large | Enterprise |
|------|----------|-------|-------|--------|-------|------------|
| `MEGA_BUNDLE_SINGLE` | VibeTags + 2 games, one phase | ₦8,000 | ₦15,000 | ₦30,000 | ₦55,000 | ₦85,000 |
| `MEGA_BUNDLE_FULL` | VibeTags + 4 games, both phases | ₦12,000 | ₦25,000 | ₦50,000 | ₦85,000 | ₦135,000 |

### Additional Game Sessions (post-publish)

| Tier | Price per game |
|------|---------------|
| Micro | ₦2,000 |
| Small | ₦3,500 |
| Medium | ₦6,000 |
| Large | ₦10,000 |
| Enterprise | ₦15,000 |

---

## Volume Discounts (Organizers)

Auto-applied based on events published in the last 12 months.

| Events published | Discount |
|------------------|----------|
| 3 – 5 | 10% off |
| 6 – 11 | 15% off |
| 12+ | 20% off |

---

## Coupon Codes

- Created by admins
- Applied **after** volume discounts
- Can be percentage or fixed NGN amount
- Can have usage limits and expiry dates

---

## Widget Integration

All paid flows use the **Juicyway inline payment widget**. The backend generates a `paymentReference` and the frontend opens the widget directly.

```html
<!-- Include in <head> -->
<script
  src="https://checkout.juicyway.com/pay.js"
  integrity="sha384-ROsbTCP6XBvgKuKoF3VSg21iu7C48d0RZHByswNEGppV+u2KkCt4rbEq9LpO3M9e"
  crossorigin="anonymous"
></script>
```

```js
Juicyway.PayWithJuice({
  key: YOUR_JUICYWAY_PUBLIC_KEY,     // your public API key (frontend env)
  reference: response.paymentReference,
  amount: response.amount,           // or response.quote.finalAmount
  currency: 'NGN',
  description: '...',
  order: {
    identifier: response.paymentReference,
    items: [{ name: '...', type: 'digital', qty: 1, amount: response.amount }]
  },
  customer: {
    email: currentUser.email,
    first_name: currentUser.firstName,
    last_name: currentUser.lastName,
  },
  onSuccess: () => {
    // proceed immediately — see per-flow instructions
  },
  onError: (err) => { /* handle error */ },
  onClose: () => { /* user dismissed */ },
});
```

> Juicyway also fires a **server-side webhook** to the backend, which reconciles and activates features in the background.

---

## Flow 1 — Publishing an Event (Organizer)

### Step 1: Get a publish preview

```
GET /v1/organizer-payments/publish-preview/:eventId
Authorization: Bearer <token>
```

**Response — billable event:**
```json
{
  "eventId": "uuid",
  "tier": "SMALL",
  "eventCapacity": 150,
  "gameSessionCount": 2,
  "gamePhases": ["PRE_EVENT"],
  "vibetagCount": 1,
  "vibetagPhases": ["PRE_EVENT"],
  "isFreePublish": false,
  "availablePlans": [
    {
      "planType": "MEGA_BUNDLE_SINGLE",
      "tier": "SMALL",
      "baseAmount": 15000,
      "volumeDiscountPercent": 10,
      "volumeDiscountAmount": 1500,
      "couponDiscountAmount": 0,
      "finalAmount": 13500,
      "gamesIncluded": 2
    }
  ]
}
```

**Response — nothing billable:**
```json
{ "isFreePublish": true, "availablePlans": [] }
```

---

### Step 2a (free): Publish directly

```
PATCH /v1/events/:id/status
Authorization: Bearer <token>
Body: { "status": "PUBLISHED" }
```

---

### Step 2b (paid, optional): Get a quote with a coupon code

```
POST /v1/organizer-payments/quote
Authorization: Bearer <token>
Body: { "eventId": "uuid", "planType": "MEGA_BUNDLE_SINGLE", "couponCode": "LAUNCH50" }
```

**Response:**
```json
{
  "tier": "SMALL",
  "baseAmount": 15000,
  "volumeDiscountPercent": 10,
  "volumeDiscountAmount": 1500,
  "couponDiscountAmount": 6750,
  "finalAmount": 6750,
  "gamesIncluded": 2,
  "couponCode": "LAUNCH50"
}
```

---

### Step 3: Initiate plan payment

```
POST /v1/organizer-payments/plan/initiate
Authorization: Bearer <token>
Body: { "eventId": "uuid", "planType": "MEGA_BUNDLE_SINGLE", "couponCode": "LAUNCH50" }
```

**Response:**
```json
{
  "paymentId": "uuid",
  "paymentReference": "NVO-1234567890-abc12345",
  "quote": { ... },
  "expiresAt": "2026-05-12T13:30:00.000Z",
  "status": "PENDING"
}
```

→ Open the Juicyway widget with `paymentReference` and `quote.finalAmount`.

---

### Step 4: `onSuccess` — publish the event immediately

```js
onSuccess: () => {
  await fetch(`/v1/events/${eventId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'PUBLISHED' }),
  });
  navigate(`/events/${eventId}`);
}
```

The event is published right away. The backend webhook fires in the background to activate the EventPlan and game sessions.

---

## Flow 2 — Adding a Game Session to a Published Event (Organizer)

Game sessions on published events are created immediately, but those over quota are **locked** until paid.

### Step 1: Create the game session

```
POST /v1/events/:eventId/game-sessions
Authorization: Bearer <token>
```

**Response — over quota:**
```json
{ "id": "uuid", "paymentRequired": true, ... }
```

When `paymentRequired` is `true`, show an **"Unlock this game"** prompt.

---

### Step 2: Initiate payment

```
POST /v1/organizer-payments/additional-game/initiate
Authorization: Bearer <token>
Body: { "eventId": "uuid", "gameSessionId": "uuid", "couponCode": "LAUNCH50" }
```

**Response:**
```json
{
  "paymentId": "uuid",
  "paymentReference": "NVO-GAME-...",
  "quote": { "finalAmount": 3500, ... },
  "expiresAt": "2026-05-12T13:30:00.000Z"
}
```

→ Open widget with `paymentReference` and `quote.finalAmount`.

---

### Step 3: `onSuccess` — poll verify until active

The game session is activated by the backend webhook. Poll the verify endpoint until you see `completed`:

```
GET /v1/organizer-payments/verify/:paymentId
Authorization: Bearer <token>
```

**Response:**
```json
{ "status": "completed" | "pending" | "failed" | "already_completed", "paymentId": "uuid" }
```

Retry on `pending` (webhook may take a moment). On `completed`, reload the game session.

---

## Flow 3 — Adding VibeTags to a Published Event (Organizer)

### Step 1: Initiate payment

```
POST /v1/organizer-payments/vibetag-addon/initiate
Authorization: Bearer <token>
Body: { "eventId": "uuid", "bundle": false, "couponCode": "LAUNCH50" }
```

`bundle: false` = Single (one phase), `bundle: true` = Bundle (both phases).

**Response:**
```json
{
  "paymentId": "uuid",
  "paymentReference": "NVO-VT-...",
  "quote": { "finalAmount": 10000, ... },
  "expiresAt": "..."
}
```

→ Open widget. On `onSuccess`, poll `GET /v1/organizer-payments/verify/:paymentId` until `completed`.

---

## Flow 4 — Buying Tickets (Attendee)

### Step 1: Initiate ticket purchase

```
POST /v1/payments/purchase
Authorization: Bearer <token>
Body:
{
  "eventId": "uuid",
  "ticketTiers": [
    { "tierId": "uuid", "quantity": 2 }
  ]
}
```

**Response:**
```json
{
  "purchaseId": "uuid",
  "paymentReference": "NV-1234567890-abc12345",
  "totalAmount": 10000,
  "expiresAt": "2026-05-12T13:30:00.000Z"
}
```

→ Open widget with `paymentReference` and `totalAmount`.

---

### Step 2: `onSuccess` — poll verify for tickets

```
GET /v1/payments/verify/:purchaseId
Authorization: Bearer <token>
```

**Response — success:**
```json
{
  "status": "already_completed",
  "tickets": [
    { "id": "uuid", "ticketCode": "NV-XXXX-XXXX", "tierName": "VIP", ... }
  ]
}
```

Retry on `pending`. On `already_completed` or `success`, display the tickets to the user.

---

### Step 3: View purchases

```
GET /v1/payments/purchases
Authorization: Bearer <token>
```

```
GET /v1/payments/purchases/:purchaseId
Authorization: Bearer <token>
```

---

## Organizer Payment History

```
GET /v1/organizer-payments/my-payments?page=1&limit=20
Authorization: Bearer <token>
```

---

## Payment Status Reference

| Status | Meaning |
|--------|---------|
| `PENDING` | Payment initiated, awaiting completion |
| `COMPLETED` | Payment confirmed, features activated |
| `FAILED` | Payment failed |
| `CANCELLED` | Superseded by a newer payment attempt |
| `EXPIRED` | 30-minute window passed |

---

## Endpoint Summary

### Organizer

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/organizer-payments/publish-preview/:eventId` | Plan options + prices |
| `POST` | `/organizer-payments/quote` | Re-price with coupon |
| `POST` | `/organizer-payments/plan/initiate` | Start publish payment |
| `POST` | `/organizer-payments/additional-game/initiate` | Unlock extra game session |
| `POST` | `/organizer-payments/vibetag-addon/initiate` | Add VibeTags to published event |
| `GET` | `/organizer-payments/verify/:paymentId` | Poll payment status |
| `GET` | `/organizer-payments/my-payments` | Payment history |

### Attendee

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/payments/purchase` | Initiate ticket purchase |
| `GET` | `/payments/verify/:purchaseId` | Poll payment + get tickets |
| `GET` | `/payments/purchases` | All purchases |
| `GET` | `/payments/purchases/:id` | Single purchase detail |
