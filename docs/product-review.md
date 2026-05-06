# Product Review & Feature Requirements Document

**Project:** Vibetag App
**Review Date:** May 6, 2026
**Type:** Frontend & Backend Bug Fixes + Feature Requests

---

## Frontend

### Bug Fixes

**1. Upload Status Label**
- Change the label from "processing" to "uploading" when a user uploads a video or image for a postcard.

**2. Game Tab Flow**
- Fix the game tab navigation/flow for a particular event. The current flow is broken and needs to be corrected.

**3. Postcard Video Missing Vibetag Stamp**
- A postcard that contains a video is not displaying the vibetag stamp. This should be applied consistently across both image and video postcards.

**4. Event Activity Restriction**
- A user should not be able to perform any main event activity until the event has officially started.

---

### New Features

**5. Event & Postcard Filters**
- Add filtering functionality for both events and postcards to allow users to narrow down content.

**6. Postcard Carousel**
- Each postcard should be displayed as a carousel, allowing users to swipe/scroll through multiple media items within a single postcard.

**7. Postcard Interaction Buttons**
- Each postcard should include the following action buttons:
  - Like
  - Comment
  - Share

---

## Backend

### Bug Fixes

**8. WebSocket Chat System**
- The chatting system for events is not working. It is built on WebSocket and needs to be debugged and restored to full functionality.

**9. Postcard Upload Optimization**
- Optimize the upload process for postcard creation to improve speed and reliability.

---

### New Features / Behavior Changes

**10. Shared Game — No Authentication Required**
- When a game is shared, the recipient should be able to access and play it without needing to authenticate.

**11. Check-in — One-Time Only**
- A user should not be required to check in every time they access an event. Check-in should be a one-time action.

**12. Token Expiry & Persistent Login**
- Tokens are expiring too quickly. Implement a persistent login strategy so users only need to log in once (e.g., refresh tokens or extended session management).

**13. Event Filters**
- Add filtering support for events based on the following criteria:
  - Location
  - Interest
  - Vibe tag
  - "For You" (personalized recommendations)

**14. Postcards Grouped by Event**
- Add an endpoint to fetch postcards grouped per event, so each event's postcards are returned together.

**15. Post-Postcard Creation Endpoint (Per Event)**
- After a user creates a postcard for a specific event, provide an endpoint that returns:
  - The created postcard
  - Activity timing for the event
  - The event leaderboard
  - Like and comment functionality on the postcard

---

## Summary Table

| # | Area | Type | Title |
|---|------|------|-------|
| 1 | Frontend | Bug Fix | Change "processing" to "uploading" |
| 2 | Frontend | Bug Fix | Fix game tab flow |
| 3 | Frontend | Bug Fix | Postcard video missing vibetag stamp |
| 4 | Frontend | Bug Fix | Block activity before event starts |
| 5 | Frontend | Feature | Event & postcard filters |
| 6 | Frontend | Feature | Postcard carousel |
| 7 | Frontend | Feature | Like, comment, share buttons on postcards |
| 8 | Backend | Bug Fix | WebSocket chat system not working |
| 9 | Backend | Bug Fix | Optimize postcard upload process |
| 10 | Backend | Feature | Shared game requires no auth |
| 11 | Backend | Feature | One-time check-in per event |
| 12 | Backend | Feature | Persistent login / token refresh |
| 13 | Backend | Feature | Event filters (location, interest, vibe, for you) |
| 14 | Backend | Feature | Fetch postcards grouped by event |
| 15 | Backend | Feature | Post-creation endpoint with leaderboard + activity timing |
