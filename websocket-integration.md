# WebSocket Integration Guide

This document describes how the frontend should integrate with the two Socket.IO namespaces exposed by the backend: `/messaging` (chat) and `/notifications`.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Messaging (`/messaging`)](#messaging-namespace)
   - [Connecting](#connecting-to-messaging)
   - [Direct Messages](#direct-messages-dm)
   - [Event Chat](#event-chat)
   - [REST Endpoints Supporting Chat](#rest-endpoints-supporting-chat)
4. [Notifications (`/notifications`)](#notifications-namespace)
   - [Connecting](#connecting-to-notifications)
   - [Real-Time Events](#real-time-notification-events)
   - [Notification REST Endpoints](#notification-rest-endpoints)
5. [Data Shapes](#data-shapes)
6. [Error Handling & Reconnection](#error-handling--reconnection)
7. [Full Integration Example](#full-integration-example)

---

## Overview

The backend exposes two independent Socket.IO namespaces:

| Namespace        | Purpose                                |
|------------------|----------------------------------------|
| `/messaging`     | DM conversations and event chat rooms  |
| `/notifications` | Real-time push notifications per user  |

Both require a valid JWT access token passed at connection time.

---

## Authentication

Every socket connection must supply the JWT access token in the handshake `auth` object.

```js
import { io } from 'socket.io-client';

const BASE_URL = 'https://api.nextvibe.com'; // replace with actual base URL

const token = getAccessTokenFromStorage(); // your token retrieval logic

const messagingSocket = io(`${BASE_URL}/messaging`, {
  auth: { token },
  transports: ['websocket'],
});

const notificationsSocket = io(`${BASE_URL}/notifications`, {
  auth: { token },
  transports: ['websocket'],
});
```

If the token is missing or invalid, the server will immediately disconnect the client. Listen for the `disconnect` event and redirect to login accordingly.

When the access token is refreshed, disconnect and reconnect both sockets with the new token.

---

## Messaging Namespace

### Connecting to `/messaging`

```js
const socket = io(`${BASE_URL}/messaging`, {
  auth: { token },
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('Messaging socket connected:', socket.id);
});

socket.on('connect_error', (err) => {
  // Token expired or invalid — refresh token then reconnect
  console.error('Messaging connection error:', err.message);
});

socket.on('disconnect', (reason) => {
  console.warn('Messaging disconnected:', reason);
});
```

---

### Direct Messages (DM)

#### Flow

```
1. Create conversation via REST  POST /v1/conversations → { id }
2. Join the DM room              emit('join:dm', { conversationId })
3. Listen for confirmation       on('joined:dm', ...)
4. Send messages                 emit('send:dm', { conversationId, body, mediaUrl })
5. Receive messages              on('new:dm', message => ...)
6. Show typing indicators        emit('typing:dm', { conversationId })
                                 on('typing:dm', { userId } => ...)
```

#### Emit: `join:dm`

Must be called before sending messages. Call this when the user opens a conversation.

```js
socket.emit('join:dm', { conversationId: '<uuid>' });
```

#### On: `joined:dm`

Confirmation that the client has joined the room.

```js
socket.on('joined:dm', ({ conversationId }) => {
  console.log('Joined DM room for conversation:', conversationId);
});
```

#### Emit: `send:dm`

At least one of `body` or `mediaUrl` must be provided.

```js
socket.emit('send:dm', {
  conversationId: '<uuid>',
  body: 'Hello!',       // optional — text content
  mediaUrl: '<url>',    // optional — image or video URL
});
```

#### On: `new:dm`

Received by **all** users in the room (including the sender).

```js
socket.on('new:dm', (message) => {
  // append message to conversation UI
  appendMessage(message);
});
```

#### Emit: `typing:dm`

Fire when the user starts typing. Debounce on the client to avoid flooding.

```js
socket.emit('typing:dm', { conversationId: '<uuid>' });
```

#### On: `typing:dm`

Only received by the **other** participant (the server excludes the sender).

```js
socket.on('typing:dm', ({ userId }) => {
  showTypingIndicator(userId);
});
```

---

### Event Chat

Event chats are divided into three sections tied to the event lifecycle.

| Section        | When it is active         |
|----------------|---------------------------|
| `PRE_EVENT`    | Before the event starts   |
| `DURING_EVENT` | While the event is live   |
| `POST_EVENT`   | After the event ends      |

> **Access control:** The user must have RSVPed or checked in to the event before they can join or send messages in any section.

#### Flow

```
1. Join the section room   emit('join:event-chat', { eventId, section })
2. Listen for confirmation on('joined:event-chat', ...)
3. Send messages           emit('send:event-chat', { eventId, section, body, mediaUrl })
4. Receive messages        on('new:event-chat', message => ...)
```

#### Emit: `join:event-chat`

```js
socket.emit('join:event-chat', {
  eventId: '<uuid>',
  section: 'DURING_EVENT', // 'PRE_EVENT' | 'DURING_EVENT' | 'POST_EVENT'
});
```

#### On: `joined:event-chat`

```js
socket.on('joined:event-chat', ({ room }) => {
  // room format: 'chat:<eventId>:<section>'
  console.log('Joined event chat room:', room);
});
```

#### Emit: `send:event-chat`

```js
socket.emit('send:event-chat', {
  eventId: '<uuid>',
  section: 'DURING_EVENT',
  body: 'This is amazing!', // optional
  mediaUrl: '<url>',        // optional
});
```

#### On: `new:event-chat`

Received by all users in `chat:{eventId}:{section}`.

```js
socket.on('new:event-chat', (message) => {
  appendEventChatMessage(message);
});
```

---

### REST Endpoints Supporting Chat

Use these HTTP endpoints to set up state before or alongside the socket connection.

#### Create a DM conversation

```
POST /v1/conversations
Body: { "userId": "<target-user-uuid>" }
```

Both users must be mutual followers. Returns the conversation object including `id`.

#### List DM conversations

```
GET /v1/conversations
```

Returns an array of conversations, each with:

```json
{
  "id": "uuid",
  "participant": { "id": "...", "username": "...", "avatarUrl": "..." },
  "lastMessage": { "body": "...", "createdAt": "..." },
  "unreadCount": 3,
  "lastMessageAt": "2026-05-20T10:00:00.000Z"
}
```

#### Fetch DM message history

```
GET /v1/conversations/:conversationId/messages?page=1&limit=50
```

Paginated. Load older messages as the user scrolls up.

#### Fetch event chat history

```
GET /v1/events/:eventId/chat/:section?page=1&limit=50
```

Where `:section` is `PRE_EVENT`, `DURING_EVENT`, or `POST_EVENT`.

---

## Notifications Namespace

### Connecting to `/notifications`

Connect once when the user logs in and keep the connection alive for the session lifetime.

```js
const notificationsSocket = io(`${BASE_URL}/notifications`, {
  auth: { token },
  transports: ['websocket'],
});

notificationsSocket.on('connect', () => {
  console.log('Notifications socket connected');
});

notificationsSocket.on('connect_error', (err) => {
  console.error('Notifications connection error:', err.message);
});
```

On connection, the server automatically places the client in a room named `user:{userId}`. All personal notifications are delivered to this room — no manual room join is needed.

---

### Real-Time Notification Events

#### On: `notification`

The primary event. Pushed whenever any action triggers a notification for the logged-in user.

```js
notificationsSocket.on('notification', (notification) => {
  // show in-app toast / update notification badge count
  displayNotificationToast(notification);
  incrementBadgeCount();
});
```

#### Emit / On: `ping` / `pong`

Use to keep the connection alive or verify connectivity.

```js
notificationsSocket.emit('ping');

notificationsSocket.on('pong', () => {
  console.log('Notifications socket is alive');
});
```

---

### Notification REST Endpoints

#### Fetch notification history

```
GET /v1/notifications?page=1&limit=50
```

Response includes a `meta.unreadCount` field to initialise the badge on load.

#### Mark a single notification as read

```
POST /v1/notifications/:id/read
```

#### Mark all notifications as read

```
POST /v1/notifications/read-all
```

Response: `{ "updatedCount": <number> }`

---

## Data Shapes

### Message (DM and Event Chat)

```ts
interface Message {
  id: string;
  conversationId?: string; // present on DM messages
  chatId?: string;         // present on event chat messages
  senderId: string;
  body?: string;
  mediaUrl?: string;
  createdAt: string;       // ISO 8601
  sender: {
    id: string;
    username: string;
    avatarUrl?: string;
    displayName?: string;
  };
}
```

### Notification

```ts
interface Notification {
  id: string;
  recipientId: string;
  actorId?: string;        // null/undefined means system-generated
  type: NotificationType;
  targetType: NotificationTarget;
  targetId: string;
  isRead: boolean;
  createdAt: string;       // ISO 8601
  actor?: {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
}

type NotificationType =
  | 'FOLLOW'
  | 'LIKE'
  | 'COMMENT'
  | 'TAG'
  | 'RSVP'
  | 'GAME_RESULT'
  | 'EVENT_REMINDER'
  | 'CHECK_IN'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_FAILED'
  | 'EVENT_PUBLISHED'
  | 'TICKET_PURCHASED'
  | 'GAME_UNLOCKED'
  | 'VIBETAG_ACTIVATED';

type NotificationTarget =
  | 'EVENT'
  | 'POSTCARD'
  | 'GAME'
  | 'USER'
  | 'PAYMENT'
  | 'TICKET';
```

---

## Error Handling & Reconnection

### Token expiry

When the access token expires, the server will reject reconnection attempts. Handle this by refreshing the token and reconnecting:

```js
function connectSockets(token) {
  const messagingSocket = io(`${BASE_URL}/messaging`, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: false,
  });

  const notificationsSocket = io(`${BASE_URL}/notifications`, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: false,
  });

  [messagingSocket, notificationsSocket].forEach((s) => {
    s.on('connect_error', async (err) => {
      if (err.message === 'Unauthorized' || err.message.includes('jwt')) {
        const newToken = await refreshAccessToken();
        s.auth = { token: newToken };
        s.connect();
      }
    });
  });

  messagingSocket.connect();
  notificationsSocket.connect();

  return { messagingSocket, notificationsSocket };
}
```

### Rejoining rooms after reconnect

Socket.IO handles automatic reconnection, but room membership is not persisted across reconnects. Re-emit `join:dm` and `join:event-chat` inside the `connect` handler for any rooms that should be active.

```js
let activeConversationId = null;
let activeEventRoom = null; // { eventId, section }

messagingSocket.on('connect', () => {
  if (activeConversationId) {
    messagingSocket.emit('join:dm', { conversationId: activeConversationId });
  }
  if (activeEventRoom) {
    messagingSocket.emit('join:event-chat', activeEventRoom);
  }
});
```

### Cleanup

Disconnect sockets when the user logs out.

```js
function disconnectSockets() {
  messagingSocket.disconnect();
  notificationsSocket.disconnect();
}
```

---

## Full Integration Example

A minimal but complete integration demonstrating both namespaces together:

```js
import { io } from 'socket.io-client';

const BASE_URL = 'https://api.nextvibe.com';

class NextVibeSocketClient {
  constructor(token) {
    this.messaging = io(`${BASE_URL}/messaging`, {
      auth: { token },
      transports: ['websocket'],
    });

    this.notifications = io(`${BASE_URL}/notifications`, {
      auth: { token },
      transports: ['websocket'],
    });

    this._activeConversation = null;
    this._activeEventRoom = null;

    this._bindMessagingEvents();
    this._bindNotificationEvents();
  }

  _bindMessagingEvents() {
    this.messaging.on('connect', () => {
      // rejoin active rooms after reconnect
      if (this._activeConversation) {
        this.messaging.emit('join:dm', { conversationId: this._activeConversation });
      }
      if (this._activeEventRoom) {
        this.messaging.emit('join:event-chat', this._activeEventRoom);
      }
    });

    this.messaging.on('new:dm', (message) => {
      this.onNewDm?.(message);
    });

    this.messaging.on('new:event-chat', (message) => {
      this.onNewEventChat?.(message);
    });

    this.messaging.on('typing:dm', ({ userId }) => {
      this.onTypingDm?.(userId);
    });
  }

  _bindNotificationEvents() {
    this.notifications.on('notification', (notification) => {
      this.onNotification?.(notification);
    });
  }

  openDm(conversationId) {
    this._activeConversation = conversationId;
    this.messaging.emit('join:dm', { conversationId });
  }

  sendDm(conversationId, body, mediaUrl) {
    this.messaging.emit('send:dm', { conversationId, body, mediaUrl });
  }

  sendTypingDm(conversationId) {
    this.messaging.emit('typing:dm', { conversationId });
  }

  openEventChat(eventId, section) {
    this._activeEventRoom = { eventId, section };
    this.messaging.emit('join:event-chat', { eventId, section });
  }

  sendEventChat(eventId, section, body, mediaUrl) {
    this.messaging.emit('send:event-chat', { eventId, section, body, mediaUrl });
  }

  destroy() {
    this.messaging.disconnect();
    this.notifications.disconnect();
  }
}

// Usage
const client = new NextVibeSocketClient(accessToken);
client.onNewDm = (msg) => console.log('New DM:', msg);
client.onNewEventChat = (msg) => console.log('New event chat:', msg);
client.onTypingDm = (userId) => console.log(userId, 'is typing...');
client.onNotification = (n) => console.log('Notification:', n.type, n.targetType);

client.openDm('conversation-uuid');
client.sendDm('conversation-uuid', 'Hey!');
```
