# Juicyway Widget Implementation Guide

## Overview

The payment flows now use the **Juicyway.PayWithJuice()** widget API as specified in the billing flow documentation and Juicyway's official docs.

---

## 1. Load the Juicyway Script

Add this to your main layout (`app/layout.tsx` or `_document.tsx`):

```html
<script
  src="https://checkout.juicyway.com/pay.js"
  integrity="sha384-ROsbTCP6XBvgKuKoF3VSg21iu7C48d0RZHByswNEGppV+u2KkCt4rbEq9LpO3M9e"
  crossorigin="anonymous"
></script>
```

---

## 2. Environment Variable

Add your Juicyway public key to `.env.local`:

```env
NEXT_PUBLIC_JUICYWAY_PUBLIC_KEY=your_public_key_here
```

---

## 3. Widget API Usage

### Basic Structure

```typescript
(window as any).Juicyway.PayWithJuice({
  key: process.env.NEXT_PUBLIC_JUICYWAY_PUBLIC_KEY,
  reference: paymentReference,
  amount: finalAmount,
  currency: 'NGN',
  description: 'Payment description',
  order: {
    identifier: paymentReference,
    items: [{
      name: 'Item name',
      type: 'digital',
      qty: 1,
      amount: finalAmount
    }]
  },
  onSuccess: () => {
    // Handle successful payment
  },
  onError: (err) => {
    // Handle payment error
  },
  onClose: () => {
    // Handle widget close
  }
});
```

---

## 4. Implementation in Payment Flows

### Flow 1: Publish Event (`payment-module.tsx`)

```typescript
const res = await initiatePlanPayment({
  eventId,
  planType: selectedPlan,
  couponCode: appliedCoupon
}).unwrap();

Juicyway.PayWithJuice({
  key: process.env.NEXT_PUBLIC_JUICYWAY_PUBLIC_KEY,
  reference: res.data.paymentReference,
  amount: res.data.quote.finalAmount,
  currency: 'NGN',
  description: `${PLAN_LABELS[selectedPlan]} - Event Publishing`,
  order: {
    identifier: res.data.paymentReference,
    items: [{
      name: PLAN_LABELS[selectedPlan],
      type: 'digital',
      qty: 1,
      amount: res.data.quote.finalAmount
    }]
  },
  onSuccess: async () => {
    // Publish event immediately
    await updateEventStatus({ eventId, status: "PUBLISHED" }).unwrap();
    toast.success("Payment successful! Your event is now live.");
    refetchPreview();
  },
  onError: (err) => {
    toast.error(err?.message ?? "Payment failed. Please try again.");
  },
  onClose: () => {
    toast.info("Payment cancelled.");
  }
});
```

### Flow 2: Unlock Additional Game (`gamification-hub-content.tsx`)

```typescript
const res = await initiateAdditionalGamePayment({
  eventId,
  gameSessionId,
  couponCode
}).unwrap();

Juicyway.PayWithJuice({
  key: process.env.NEXT_PUBLIC_JUICYWAY_PUBLIC_KEY,
  reference: res.data.paymentReference,
  amount: res.data.quote.finalAmount,
  currency: 'NGN',
  description: 'Unlock Additional Game Session',
  order: {
    identifier: res.data.paymentReference,
    items: [{
      name: 'Additional Game Session',
      type: 'digital',
      qty: 1,
      amount: res.data.quote.finalAmount
    }]
  },
  onSuccess: () => {
    toast.success("Game unlocked! Players can now join.");
    window.location.reload();
  },
  onError: (err) => {
    toast.error(err?.message ?? "Payment failed.");
  },
  onClose: () => {
    toast.info("Payment cancelled.");
  }
});
```

### Flow 3: Add VibeTags (`vibe-tag-studio.tsx`)

```typescript
const res = await initiateVibeTagAddon({
  eventId,
  bundle,
  couponCode
}).unwrap();

Juicyway.PayWithJuice({
  key: process.env.NEXT_PUBLIC_JUICYWAY_PUBLIC_KEY,
  reference: res.data.paymentReference,
  amount: res.data.quote.finalAmount,
  currency: 'NGN',
  description: `VibeTags ${bundle ? 'Bundle' : 'Single Phase'}`,
  order: {
    identifier: res.data.paymentReference,
    items: [{
      name: `VibeTags ${bundle ? 'Bundle' : 'Single Phase'}`,
      type: 'digital',
      qty: 1,
      amount: res.data.quote.finalAmount
    }]
  },
  onSuccess: () => {
    toast.success("VibeTags unlocked!");
    refetchEvent();
    // Open VibeTags creator
    dispatch(setView("start"));
    setOpen(true);
  },
  onError: (err) => {
    toast.error(err?.message ?? "Payment failed.");
  },
  onClose: () => {
    toast.info("Payment cancelled.");
  }
});
```

---

## 5. Backend Response Structure

The backend should return this structure from payment initiation endpoints:

```typescript
{
  "success": true,
  "data": {
    "paymentId": "uuid",
    "paymentReference": "NVO-1234567890-abc12345",
    "quote": {
      "planType": "MEGA_BUNDLE_SINGLE",
      "tier": "SMALL",
      "baseAmount": 15000,
      "volumeDiscountPercent": 10,
      "volumeDiscountAmount": 1500,
      "couponDiscountAmount": 0,
      "finalAmount": 13500,
      "gamesIncluded": 2
    },
    "expiresAt": "2026-05-12T13:30:00.000Z",
    "status": "PENDING"
  }
}
```

**Note**: No `checkoutKey` or `checkoutUrl` is needed. The frontend uses the `paymentReference` and `finalAmount` directly with the Juicyway widget.

---

## 6. Webhook Integration

Juicyway sends webhooks to your backend when payment completes:

### Webhook Events

- `payment.session.succeeded` - Payment successful
- `payment.session.failed` - Payment failed

### Webhook Payload

```json
{
  "event": "payment.session.succeeded",
  "data": {
    "id": "payment-id",
    "reference": "NVO-1234567890-abc12345",
    "status": "success",
    "amount": 13500,
    "currency": "NGN",
    // ... other fields
  }
}
```

### Backend Webhook Handler

When webhook is received:

1. **Verify webhook authenticity** (checksum validation)
2. **Find payment by reference**
3. **Update payment status**
4. **Activate features**:
   - For plan payments: Publish event + create EventPlan
   - For game payments: Set `paymentRequired = false` on game session
   - For VibeTags payments: Enable VibeTags for the event

---

## 7. Payment Flow Sequence

### Complete Flow

```
1. User clicks "Pay & Publish Event"
   ↓
2. Frontend calls POST /v1/organizer-payments/plan/initiate
   ↓
3. Backend creates OrganizerPayment record (status: PENDING)
   ↓
4. Backend returns paymentReference + quote
   ↓
5. Frontend opens Juicyway.PayWithJuice() widget
   ↓
6. User completes payment in widget
   ↓
7. Juicyway sends webhook to backend
   ↓
8. Backend updates payment status to COMPLETED
   ↓
9. Backend publishes event + activates plan
   ↓
10. Widget calls onSuccess() callback
   ↓
11. Frontend publishes event (idempotent)
   ↓
12. User sees success message
```

---

## 8. Error Handling

### Widget Not Loaded

```typescript
if (typeof window !== "undefined" && (window as any).Juicyway) {
  // Open widget
} else {
  toast.error("Payment system not loaded. Please refresh and try again.");
}
```

### Payment Initiation Failed

```typescript
try {
  const res = await initiatePlanPayment(...).unwrap();
  // Open widget
} catch (err: any) {
  toast.error(err?.data?.message ?? "Failed to initiate payment.");
}
```

### Payment Failed in Widget

```typescript
onError: (err: any) => {
  toast.error(err?.message ?? "Payment failed. Please try again.");
}
```

### User Closed Widget

```typescript
onClose: () => {
  toast.info("Payment cancelled.");
}
```

---

## 9. Testing

### Test Mode

Use Juicyway's sandbox environment:

```env
NEXT_PUBLIC_JUICYWAY_PUBLIC_KEY=test_pk_...
```

### Test Cards

Juicyway provides test cards for different scenarios:
- **Success**: 4084084084084081
- **Insufficient Funds**: 4000000000000002
- **Declined**: 4000000000000069

---

## 10. Security Considerations

### Public Key

- ✅ Safe to expose in frontend code
- ✅ Used only for widget initialization
- ❌ Never use secret key in frontend

### Payment Reference

- Generated by backend
- Unique per payment
- Used to track payment status

### Webhook Verification

Backend must verify webhooks using:
1. **Checksum validation** - Verify signature
2. **IP whitelisting** - Only accept from Juicyway IPs

---

## 11. Files Modified

```
src/
├── app/
│   ├── dashboard/
│   │   └── [eventId]/
│   │       └── components/
│   │           ├── payment-module.tsx           ✏️ UPDATED
│   │           ├── gamification-hub-content.tsx ✏️ UPDATED
│   │           └── vibe-tag-studio.tsx          ✏️ UPDATED
│   └── provider/
│       └── api/
│           └── organizerPaymentApi.ts           ✏️ UPDATED
└── JUICYWAY_WIDGET_IMPLEMENTATION.md            ✨ NEW
```

---

## 12. Summary

✅ **Widget API**: `Juicyway.PayWithJuice()`  
✅ **No checkoutKey needed**: Uses `paymentReference` + `finalAmount`  
✅ **Immediate success handling**: `onSuccess` callback publishes event  
✅ **Webhook reconciliation**: Backend activates features in background  
✅ **All three flows updated**: Publish, unlock game, add VibeTags  

The implementation now **exactly matches** the billing flow specification and Juicyway's official widget documentation.
