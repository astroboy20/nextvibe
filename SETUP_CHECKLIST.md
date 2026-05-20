# Setup Checklist - Payment Module

## ✅ Completed

### 1. Juicyway Script Added
- ✅ Added to `src/app/layout.tsx`
- ✅ Loaded with `strategy="beforeInteractive"`
- ✅ Includes integrity hash for security

```tsx
<Script
  src="https://checkout.juicyway.com/pay.js"
  integrity="sha384-ROsbTCP6XBvgKuKoF3VSg21iu7C48d0RZHByswNEGppV+u2KkCt4rbEq9LpO3M9e"
  crossOrigin="anonymous"
  strategy="beforeInteractive"
/>
```

### 2. Environment Variable Added
- ✅ Added to `.env` file
- ⚠️ **ACTION REQUIRED**: Replace placeholder with actual key

```env
NEXT_PUBLIC_JUICYWAY_PUBLIC_KEY=your_juicyway_public_key_here
```

**To get your Juicyway public key:**
1. Log in to [Juicyway Dashboard](https://dashboard.juicyway.com)
2. Navigate to Settings → API Keys
3. Copy your **Public Key** (starts with `pk_test_` or `pk_live_`)
4. Replace `your_juicyway_public_key_here` in `.env`

### 3. Payment Flows Implemented
- ✅ Flow 1: Publish Event (`payment-module.tsx`)
- ✅ Flow 2: Unlock Additional Game (`gamification-hub-content.tsx`)
- ✅ Flow 3: Add VibeTags (`vibe-tag-studio.tsx`)

### 4. Pricing Constants
- ✅ Tier-based pricing structure
- ✅ Volume discount tiers
- ✅ Helper functions

### 5. API Integration
- ✅ All endpoints implemented
- ✅ Response interfaces updated
- ✅ Hooks exported

---

## ⏳ Pending (Backend)

### 1. Backend Response Structure
Backend must return this from payment initiation endpoints:

```json
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

**Key fields:**
- `paymentReference` - Used by Juicyway widget
- `quote.finalAmount` - Payment amount
- No `checkoutKey` or `checkoutUrl` needed

### 2. Webhook Configuration
Configure Juicyway webhook URL in dashboard:

```
https://your-backend-domain.com/webhooks/juicyway
```

**Webhook events to handle:**
- `payment.session.succeeded` - Payment successful
- `payment.session.failed` - Payment failed

**Webhook handler must:**
1. Verify webhook signature (checksum validation)
2. Find payment by `reference`
3. Update payment status
4. Activate features:
   - Publish event + create EventPlan
   - Unlock game session
   - Enable VibeTags

### 3. Event Details Response
Include `eventPlan` object:

```json
{
  "id": "event-id",
  "name": "Event Name",
  "status": "PUBLISHED",
  "eventPlan": {
    "hasVibeTags": true,
    "hasGamification": true,
    "gamesIncluded": 2,
    "gamesUsed": 1
  }
}
```

### 4. Volume Discount Calculation
Calculate based on events published in last 12 months:
- 3-5 events: 10% off
- 6-11 events: 15% off
- 12+ events: 20% off

---

## 🧪 Testing Checklist

### Local Testing

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Check Juicyway script loaded:**
   - Open browser console
   - Type `window.Juicyway`
   - Should see object with `PayWithJuice` method

3. **Test environment variable:**
   - Check `process.env.NEXT_PUBLIC_JUICYWAY_PUBLIC_KEY` is set
   - Should not be `undefined` or `your_juicyway_public_key_here`

### Flow Testing

#### Flow 1: Publish Event
- [ ] Create draft event with games/vibetags
- [ ] Navigate to event dashboard
- [ ] See payment module with plan options
- [ ] Select a plan
- [ ] Apply coupon code (optional)
- [ ] Click "Pay & Publish Event"
- [ ] Juicyway widget opens
- [ ] Complete test payment
- [ ] Event publishes automatically
- [ ] Success message appears

#### Flow 2: Unlock Game
- [ ] Published event with game over quota
- [ ] See "Unlock" button on game
- [ ] Click "Unlock"
- [ ] Unlock dialog appears
- [ ] Enter coupon (optional)
- [ ] Click "Pay & Unlock"
- [ ] Juicyway widget opens
- [ ] Complete test payment
- [ ] Game becomes active

#### Flow 3: Add VibeTags
- [ ] Published event without VibeTags
- [ ] Navigate to VibeTags studio
- [ ] Click "Create VibeTag"
- [ ] Payment dialog appears
- [ ] Choose Single or Bundle
- [ ] Enter coupon (optional)
- [ ] Juicyway widget opens
- [ ] Complete test payment
- [ ] VibeTags creator opens

### Test Cards (Juicyway Sandbox)

Use these test cards in sandbox mode:

| Card Number | Scenario |
|-------------|----------|
| 4084084084084081 | Success |
| 4000000000000002 | Insufficient Funds |
| 4000000000000069 | Declined |

---

## 📝 Environment Setup

### Development (.env.local)
```env
NEXT_PUBLIC_JUICYWAY_PUBLIC_KEY=pk_test_your_test_key_here
```

### Production (.env.production)
```env
NEXT_PUBLIC_JUICYWAY_PUBLIC_KEY=pk_live_your_live_key_here
```

---

## 🚨 Important Notes

1. **Never commit real API keys** to version control
2. **Test mode first** - Use `pk_test_` keys before going live
3. **Webhook security** - Backend must verify webhook signatures
4. **Error handling** - All payment flows have error handlers
5. **Idempotency** - Event publishing is idempotent (safe to call multiple times)

---

## 📚 Documentation References

- [Juicyway Widget Documentation](https://docs.juicyway.com/payments/payment-widget/widget-integration-guide)
- [Juicyway Webhooks](https://docs.juicyway.com/webhooks)
- [Implementation Guide](./JUICYWAY_WIDGET_IMPLEMENTATION.md)
- [Billing Flow Spec](./organizer-billing-flow.md)

---

## ✅ Ready to Test

Once you've:
1. ✅ Added Juicyway script (DONE)
2. ⚠️ Set `NEXT_PUBLIC_JUICYWAY_PUBLIC_KEY` in `.env`
3. ⏳ Backend returns correct response structure
4. ⏳ Backend webhook handler configured

You can start testing the payment flows!

---

## 🆘 Troubleshooting

### Widget doesn't open
- Check browser console for errors
- Verify Juicyway script loaded: `window.Juicyway`
- Check environment variable is set
- Ensure not blocking popups/modals

### Payment fails immediately
- Check backend response structure
- Verify `paymentReference` is valid
- Check Juicyway dashboard for errors
- Ensure using correct API key (test vs live)

### Webhook not received
- Check webhook URL in Juicyway dashboard
- Verify backend endpoint is accessible
- Check webhook signature verification
- Review Juicyway webhook logs

---

## 📞 Support

- **Juicyway Support**: support@juicyway.com
- **Documentation**: https://docs.juicyway.com
- **Dashboard**: https://dashboard.juicyway.com
