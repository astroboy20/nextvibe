# NextVibe — Frontend Learning Reference

A complete guide to the patterns, decisions, and concepts used in this codebase.
Written for someone who has never touched Next.js but wants to understand it from first principles through to advanced production patterns.

---

## Table of Contents

1. [What This Project Is](#1-what-this-project-is)
2. [The App Router — Next.js 13+](#2-the-app-router--nextjs-13)
3. [File-Based Routing](#3-file-based-routing)
4. [Route Groups](#4-route-groups)
5. [Dynamic Routes](#5-dynamic-routes)
6. [Layouts and Nesting](#6-layouts-and-nesting)
7. [Server vs Client Components](#7-server-vs-client-components)
8. [API Routes (Route Handlers)](#8-api-routes-route-handlers)
9. [State Management — Redux Toolkit](#9-state-management--redux-toolkit)
10. [Data Fetching — RTK Query](#10-data-fetching--rtk-query)
11. [Authentication Flow](#11-authentication-flow)
12. [Real-Time with Socket.IO](#12-real-time-with-socketio)
13. [Payment Integration Pattern](#13-payment-integration-pattern)
14. [Forms — react-hook-form + zod](#14-forms--react-hook-form--zod)
15. [UI Layer — shadcn/ui + Tailwind](#15-ui-layer--shadcnui--tailwind)
16. [Fonts, Images, and Scripts](#16-fonts-images-and-scripts)
17. [Path Aliases and Project Structure](#17-path-aliases-and-project-structure)
18. [Performance and Optimization](#18-performance-and-optimization)
19. [Scaling Patterns](#19-scaling-patterns)
20. [Concepts Not Used Here (But You Should Know)](#20-concepts-not-used-here-but-you-should-know)
21. [Common Mistakes and How to Avoid Them](#21-common-mistakes-and-how-to-avoid-them)

---

## 1. What This Project Is

NextVibe is a social event platform. Users can discover events, RSVP, chat, buy tickets, and play games during events. Organizers can create and publish events, run gamification sessions, and track payments.

**Tech stack:**
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State**: Redux Toolkit + RTK Query
- **Real-time**: Socket.IO client
- **Auth**: JWT in cookies, manual refresh token queue
- **Payments**: Ercaspay (redirect-based checkout)
- **Forms**: react-hook-form + zod

---

## 2. The App Router — Next.js 13+

Next.js has two routing systems. This project uses the **App Router** (introduced in Next.js 13), which lives inside `src/app/`. The older Pages Router (`pages/`) is not used.

### Why the App Router matters

The App Router is built around React Server Components. Every file in `src/app/` is a **Server Component by default** — meaning it renders on the server, sends HTML to the browser, and ships zero JavaScript unless you explicitly opt into the client.

```
src/app/
├── layout.tsx        ← Root layout (always rendered)
├── page.tsx          ← Home page "/"
├── dashboard/
│   └── page.tsx      ← "/dashboard"
└── (auth)/
    └── auth/
        └── login/
            └── page.tsx  ← "/auth/login"
```

The key files Next.js recognises inside a route folder:

| File | Purpose |
|---|---|
| `page.tsx` | The UI for that URL. Makes the route publicly accessible. |
| `layout.tsx` | Wraps children. Persists across navigations within its subtree. |
| `loading.tsx` | Automatic Suspense boundary. Shown while `page.tsx` is streaming. |
| `error.tsx` | Error boundary. Shown when the route throws. |
| `not-found.tsx` | Rendered when `notFound()` is called or no route matches. |
| `route.ts` | API endpoint (no UI). Handles HTTP requests. |

---

## 3. File-Based Routing

You don't configure routes anywhere. The folder structure **is** the route.

```
src/app/dashboard/events/[id]/page.tsx
                              ↑
               This renders at /dashboard/events/abc123
```

### Reading route params in a page

```tsx
// src/app/dashboard/events/[id]/page.tsx
export default function EventPage({ params }: { params: { id: string } }) {
  return <div>Event {params.id}</div>;
}
```

### Reading query params

```tsx
// /dashboard/events?tab=chat
export default function EventPage({ searchParams }: { searchParams: { tab?: string } }) {
  const tab = searchParams.tab ?? "overview";
}
```

> **In Client Components**, use `useSearchParams()` from `next/navigation` instead.
> `searchParams` as a prop only works in Server Components.

---

## 4. Route Groups

Folders wrapped in `(parentheses)` are **route groups**. They let you organise files and share layouts **without affecting the URL**.

```
src/app/
├── (auth)/            ← "(auth)" is invisible in the URL
│   ├── layout.tsx     ← Auth-specific layout (centered card, no navbar)
│   └── auth/
│       ├── login/page.tsx    → /auth/login
│       └── register/page.tsx → /auth/register
├── (admin)/           ← Admin section with its own layout
│   └── admin/
│       └── ...
└── dashboard/
    └── (dashboard-route)/   ← Dashboard routes with navbar + bottom nav
        ├── layout.tsx
        ├── events/page.tsx  → /dashboard/events
        └── messages/page.tsx → /dashboard/messages
```

In this project there are three route groups:
- `(auth)` — login, register, forgot-password, verify-email. Has a centred auth layout.
- `(admin)` — admin panel. Has an admin-specific layout.
- `(dashboard-route)` — the main app after login. Has `DashboardNavbar` + `BottomNav`.

**Rule of thumb**: use a route group any time a set of pages needs a shared layout that others don't.

---

## 5. Dynamic Routes

Square brackets create segments that match any value.

```
[id]          → matches /events/abc, /events/123, /events/anything
[...slug]     → catches all remaining segments: /docs/a/b/c → slug = ["a","b","c"]
[[...slug]]   → optional catch-all: matches / as well
```

In this project:
- `/dashboard/[eventId]/` — organiser event management page
- `/dashboard/events/[id]/` — attendee event detail page
- `/game/[token]/` — game session page
- `/admin/users/[id]/` — admin user detail

### Generating static paths at build time (not used here, but important)

```tsx
// For a page like /blog/[slug]
export async function generateStaticParams() {
  const posts = await fetchAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}
```

This tells Next.js which dynamic pages to pre-render at build time instead of on-demand.

---

## 6. Layouts and Nesting

A `layout.tsx` wraps all pages in its folder and below. It **persists between navigations** — the layout does not unmount when you navigate between its child pages. This is why nav bars don't flash when you change pages.

```tsx
// src/app/layout.tsx  — root layout, wraps everything
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ProviderWrapper>  {/* Redux + Google OAuth */}
          {children}
          <Toaster />
        </ProviderWrapper>
      </body>
    </html>
  );
}
```

Layouts nest automatically:

```
RootLayout                ← src/app/layout.tsx
└── DashboardLayout       ← src/app/dashboard/(dashboard-route)/layout.tsx
    └── EventsPage        ← src/app/dashboard/(dashboard-route)/events/page.tsx
```

When a user navigates from `/dashboard/events` to `/dashboard/messages`, `RootLayout` and `DashboardLayout` both stay mounted. Only the page content swaps.

### The `"use client"` in a layout

The dashboard layout is `"use client"` because it renders `DashboardNavbar` which uses React state (for the notification bell). This is a trade-off: the whole subtree loses server rendering benefits. The ideal pattern is to push `"use client"` as deep as possible — keep layouts as Server Components and only make the interactive parts client-side.

---

## 7. Server vs Client Components

This is the single most important concept in the App Router.

### Server Components (default)

- Render on the server only.
- Can `async/await` directly — no `useEffect` needed for data fetching.
- Can access environment variables, databases, file system.
- Ship **zero JavaScript** to the browser.
- **Cannot** use hooks (`useState`, `useEffect`, etc.), browser APIs (`window`, `document`), or event handlers.

```tsx
// Server Component — no "use client" needed
async function EventList() {
  const events = await fetch("https://api.nextvibe.com/v1/events").then(r => r.json());
  return <ul>{events.map(e => <li key={e.id}>{e.name}</li>)}</ul>;
}
```

### Client Components

Add `"use client"` at the very top of the file. Everything in that file (and everything it imports) becomes client-side.

```tsx
"use client";
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### The boundary rule

Once you add `"use client"` to a component, **all its imports become client-side too**. The boundary propagates downward, not upward.

```
ServerComponent            ← Server
└── ClientComponent        ← "use client" — everything below is client
    ├── AnotherClient      ← Client (inherited)
    └── ServerComponent2   ← ALSO client (imported by a client component)
```

To pass a Server Component into a Client Component without making it client-side, pass it as `children`:

```tsx
// layout.tsx (Server)
import ClientShell from "./ClientShell";
import ServerSidebar from "./ServerSidebar";

export default function Layout({ children }) {
  return (
    <ClientShell sidebar={<ServerSidebar />}>  {/* ServerSidebar stays server */}
      {children}
    </ClientShell>
  );
}
```

### In this project

Almost every component under `src/app/dashboard/` is `"use client"` because they use Redux (`useSelector`, `useDispatch`), RTK Query hooks, or React state. This is the pragmatic choice for a highly interactive app — don't fight it.

---

## 8. API Routes (Route Handlers)

Files named `route.ts` inside `src/app/` are server-side HTTP handlers, not pages.

```
src/app/api/auth/store-token/route.ts  →  POST /api/auth/store-token
src/app/api/auth/get-token/route.ts    →  GET /api/auth/get-token
src/app/api/media-proxy/route.ts       →  GET /api/media-proxy
```

### Writing a route handler

```ts
// src/app/api/auth/store-token/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { accessToken, refreshToken } = await request.json();

  const response = NextResponse.json({ message: "Stored" }, { status: 200 });

  // Set cookies server-side — only way to set httpOnly cookies from Next.js
  response.cookies.set("accessToken", accessToken, {
    httpOnly: false,   // false = readable by JS (needed for Authorization header)
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,  // 7 days
  });

  return response;
}
```

### Why use an API route for storing cookies?

Setting cookies in a browser via `document.cookie` or `js-cookie` makes them readable by JavaScript. Setting them via a Next.js API route lets you choose `httpOnly: true`, which hides them from JavaScript entirely (XSS protection). In this project, the route is used to store tokens after login and after token refresh.

### Supported HTTP methods

Export named functions: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`.

```ts
export async function GET(request: NextRequest) { ... }
export async function POST(request: NextRequest) { ... }
```

---

## 9. State Management — Redux Toolkit

Redux Toolkit (RTK) is the official, modern way to use Redux. This project has two categories of Redux state:

### Slices — local UI state

Slices hold state that doesn't come from the API: who is logged in, the current event form values, canvas state, UI flags.

```ts
// src/app/provider/slices/user.ts
const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, isAuthenticated: false },
  reducers: {
    setUser(state, action: PayloadAction<IUser | null>) {
      state.user = action.payload;  // Immer allows direct mutation
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});
```

**Slices in this project:**

| Slice | Purpose |
|---|---|
| `user` | Auth state: who is logged in, their role |
| `eventForm` | Multi-step event creation form values |
| `location` | User's selected location |
| `canvas` | Fabric.js canvas state for postcard editor |
| `ui` | UI flags like `hideHeader` |

### Using slice state in a component

```tsx
"use client";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/app/provider/store";
import { logout } from "@/app/provider/slices/user";

function ProfileButton() {
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();

  return (
    <div>
      <p>{user?.username}</p>
      <button onClick={() => dispatch(logout())}>Log out</button>
    </div>
  );
}
```

### The store — wiring everything together

```ts
// src/app/provider/store.ts
export const store = configureStore({
  reducer: {
    user: authReducer,
    eventForm: eventFormReducer,
    [authApi.reducerPath]: authApi.reducer,  // RTK Query APIs also go in the reducer
    // ... all other APIs
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      // ... all other API middlewares (required for caching, invalidation)
    ),
});
```

The store is provided to the app through `<Provider store={store}>` inside `ProviderWrapper`, which wraps the entire app in the root layout.

---

## 10. Data Fetching — RTK Query

RTK Query is a data fetching and caching layer built into Redux Toolkit. It replaces `useEffect + fetch + useState` for API calls.

### Defining an API

```ts
// src/app/provider/api/eventApi.ts
export const eventsApi = createApi({
  reducerPath: "eventsApi",       // key in the Redux store
  baseQuery: baseQueryWithReauth, // all requests go through this
  tagTypes: ["Events"],           // for cache invalidation
  endpoints: (builder) => ({

    // Query = GET — reads data, caches it
    getEvents: builder.query<EventsResponse, void>({
      query: () => "/v1/events",
      providesTags: ["Events"],
    }),

    // Mutation = POST/PUT/DELETE — writes data, can invalidate cache
    createEvent: builder.mutation<Event, CreateEventBody>({
      query: (body) => ({ url: "/v1/events", method: "POST", body }),
      invalidatesTags: ["Events"],  // clears the events cache after creating one
    }),
  }),
});

export const { useGetEventsQuery, useCreateEventMutation } = eventsApi;
```

### Using queries in components

```tsx
function EventList() {
  const { data, isLoading, isError, refetch } = useGetEventsQuery();

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorMessage onRetry={refetch} />;

  return <ul>{data?.data.map(e => <EventCard key={e.id} event={e} />)}</ul>;
}
```

RTK Query automatically:
- Deduplicates identical requests (if 3 components call `useGetEventsQuery()`, only 1 HTTP request goes out)
- Caches results
- Refetches when the cache is invalidated
- Manages loading/error state

### Using mutations

```tsx
function CreateEventButton() {
  const [createEvent, { isLoading }] = useCreateEventMutation();

  const handleCreate = async () => {
    try {
      const newEvent = await createEvent({ name: "My Event" }).unwrap();
      toast.success("Created!");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Something went wrong");
    }
  };

  return <button onClick={handleCreate} disabled={isLoading}>Create</button>;
}
```

`.unwrap()` throws on error instead of returning it — lets you use `try/catch`.

### Lazy queries — fetch on demand

```tsx
const [verifyPayment, { isLoading }] = useLazyVerifyOrganizerPaymentQuery();

// Called imperatively, not on mount
const result = await verifyPayment(paymentId).unwrap();
```

Used in the payment verify page to poll manually instead of fetching on mount.

### The `baseQueryWithReauth`

Every RTK Query API in this project uses a shared `baseQueryWithReauth` instead of a plain `fetchBaseQuery`. It adds:

1. **Token attachment** — reads `accessToken` from the cookie and adds `Authorization: Bearer <token>` to every request
2. **Token refresh** — on a 401, automatically calls `/v1/auth/refresh`, stores the new token, and retries the original request
3. **Queue pattern** — if multiple requests 401 at the same time, only one refresh happens; the rest wait

```
Request → prepareHeaders (attach token) → API → 401?
                                                  ↓
                                         isRefreshing?
                                           Yes → queue the request, wait
                                           No  → call /refresh, update cookie,
                                                 flush queue, retry all
```

---

## 11. Authentication Flow

This is the most complex part of the frontend. Understanding it end-to-end is essential.

### Token storage — cookies, not localStorage

Tokens live in browser cookies managed by `js-cookie`. There are two tokens:

| Cookie | `httpOnly` | Purpose |
|---|---|---|
| `accessToken` | `false` — readable by JS | Sent in `Authorization: Bearer` on every request |
| `refreshToken` | `false` — readable by JS | Sent in POST body to `/v1/auth/refresh` when access token expires |

> **Why cookies over localStorage?** Cookies can be scoped to a path and sent automatically by the browser. `httpOnly` cookies are invisible to JavaScript, protecting against XSS. This project makes both cookies JS-readable because the refresh token must be read and sent in a POST body.

### Login flow

```
User submits email + password
    ↓
POST /v1/auth/login
    ↓
Backend returns { accessToken, refreshToken, user }
    ↓
Frontend calls POST /api/auth/store-token (Next.js API route)
    ↓
API route sets both as cookies with correct expiry + flags
    ↓
Redux: dispatch(setUser(user)), dispatch(setIsAuthenticated(true))
    ↓
router.push("/dashboard/events")
```

Why go through the Next.js API route instead of using `Cookies.set()` directly? So the cookie attributes (secure, sameSite, maxAge) are set server-side and consistently — `js-cookie` on the client can't set `maxAge` in seconds, and its `expires` is always in days.

### Refresh token flow (the queue pattern)

When an access token expires, the server returns 401. The `baseQueryWithReauth` intercepts this:

```
Request A → 401
Request B → 401 (arrives 5ms later, refresh hasn't started yet)
Request C → 401 (arrives 10ms later)

baseQueryWithReauth for A:
  isRefreshing is false → own the refresh
  isRefreshing = true
  POST /v1/auth/refresh { refreshToken }
  → new accessToken
  → store-token (update cookie)
  → flushQueue(true) — resolves B and C's promises
  → retry A with new cookie

baseQueryWithReauth for B:
  isRefreshing is true → push to pendingRequests, await
  [waits...]
  → resolve() called → retry B (cookie already updated)

baseQueryWithReauth for C:
  same as B
```

Without the queue, A, B, and C would each call `/refresh`, rotating the token 3 times and invalidating the first two.

### Redirect to login with `?from=`

When a 401 is unrecoverable (refresh token also expired), the user is sent to login. The current URL is preserved so they land back where they were:

```ts
const from = encodeURIComponent(window.location.pathname + window.location.search);
window.location.href = `/auth/login?from=${from}`;
```

The login page reads this and redirects after successful login:

```ts
const from = searchParams.get("from") || "/dashboard/events";
router.push(from.startsWith("/") ? from : "/dashboard/events");
```

### Logout flow

```ts
// Call backend to invalidate the refresh token
await api.post("/v1/auth/logout", { refreshToken: Cookies.get("refreshToken") });

// Clear local state
Cookies.remove("accessToken");
Cookies.remove("refreshToken");
dispatch(logout());  // clear Redux user state
window.location.href = "/auth/login";
```

---

## 12. Real-Time with Socket.IO

The backend exposes two Socket.IO namespaces:

| Namespace | Purpose |
|---|---|
| `/messaging` | DM conversations + event chat rooms |
| `/notifications` | Per-user real-time notifications |

### Why Socket.IO, not raw WebSocket?

Socket.IO adds on top of WebSocket:
- Automatic reconnection
- Room management (server-side groups)
- Named events (`.emit("join:dm", data)` vs parsing JSON manually)
- Fallback to HTTP long-polling if WebSocket is blocked

The earlier implementation used native `WebSocket` with JSON-wrapped events — this was fundamentally wrong for a Socket.IO backend.

### The `useSocket` hook

```ts
// src/hooks/useSocket.ts
export function useSocket(namespace: "messaging" | "notifications", { enabled = true } = {}) {
  const [status, setStatus] = useState<SocketStatus>("disconnected");
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const token = Cookies.get("accessToken");
    if (!token) { setStatus("error"); return; }

    const socket = io(`${SOCKET_BASE}/${namespace}`, {
      auth: { token },          // ← sent in the handshake, not a query param
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => setStatus("connected"));
    socket.on("disconnect", () => setStatus("disconnected"));

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [namespace, enabled]);

  return { socketRef, status, isConnected: status === "connected" };
}
```

**Key design decisions:**
- `socketRef` is a `useRef` (not `useState`) so the socket instance doesn't cause re-renders. `status` is `useState` so components can react when connection state changes.
- Auth is via `auth: { token }` in the handshake — this is what the Socket.IO server reads. Query params (the old approach `?token=...`) are less secure and non-standard.

### Registering event handlers

```tsx
const { socketRef, isConnected } = useSocket("messaging", { enabled: !!token });

useEffect(() => {
  if (!isConnected) return;      // ← wait until connected
  const socket = socketRef.current;
  if (!socket) return;

  socket.emit("join:event-chat", { eventId, section: "PRE_EVENT" });

  const handleMessage = (msg: ChatMessage) => {
    setMessages(prev => [...prev, msg]);
  };
  socket.on("new:event-chat", handleMessage);

  return () => {
    socket.off("new:event-chat", handleMessage);  // ← always clean up
  };
}, [isConnected, eventId, section, socketRef]);
```

`isConnected` going from `false` to `true` triggers the effect. When the socket reconnects (after a drop), `isConnected` cycles `false → true` again, re-joining the room automatically.

### Enum values matter

The backend uses uppercase enums. The UI uses readable strings. Map them explicitly:

```ts
const SECTION_KEY = {
  "pre-event":  "PRE_EVENT",
  "during":     "DURING_EVENT",
  "post-event": "POST_EVENT",
} as const;

// Wrong ❌
socket.emit("join:event-chat", { section: "pre-event" });

// Right ✅
socket.emit("join:event-chat", { section: SECTION_KEY[activeSection] });
```

---

## 13. Payment Integration Pattern

### Why redirect-based, not widget-based

The original implementation used Juicyway's inline widget (a JS popup). Ercaspay uses a full redirect to a hosted payment page. The hosted approach is:
- More secure (card details never touch your app)
- PCI-compliant by default
- Works across all devices without JS compatibility issues

### The complete flow

```
1. User clicks "Pay & Publish"

2. POST /v1/organizer-payments/plan/initiate
   Body: { eventId, planType, couponCode? }
   Response: { paymentId, checkoutUrl, status, expiresAt }

3. Check status:
   - "COMPLETED" or checkoutUrl is null → coupon covered full cost, show success
   - "PENDING" → redirect: window.location.href = checkoutUrl

4. User pays on Ercaspay's page

5. Ercaspay redirects user back to:
   {FRONTEND_URL}/organizer/payment/verify?paymentId=<id>

6. Verify page polls GET /v1/organizer-payments/verify/:paymentId
   every 2 seconds, up to 10 attempts

7. Status:
   - "completed"  → show success, auto-redirect to /dashboard after 3s
   - "failed"     → show error, offer retry
   - "pending"    → keep polling
   - 10 attempts exhausted → show timeout message + "Check again" button
```

### The retry button bug (and the fix)

A subtle bug: when the polling times out and you click "Check again", the `useEffect` won't re-run because its dependency (`paymentId`) hasn't changed. Fix: add a `retryKey` state to the dependency array.

```tsx
const [retryKey, setRetryKey] = useState(0);

useEffect(() => {
  // polling logic
}, [paymentId, verifyPayment, retryKey]); // retryKey makes this re-trigger

// In the "Check again" button:
onClick={() => {
  attemptRef.current = 0;
  setPollState("polling");
  setRetryKey(k => k + 1);  // ← triggers the effect
}}
```

### Free publish path

When a coupon covers 100% of the cost, the backend returns `{ status: "COMPLETED", checkoutUrl: null }` immediately. The frontend must handle this without redirecting:

```tsx
const { status, checkoutUrl } = res.data;
if (status === "COMPLETED" || !checkoutUrl) {
  toast.success("Event published!");
  return;
}
window.location.href = checkoutUrl;
```

---

## 14. Forms — react-hook-form + zod

### Why react-hook-form?

The native `<form>` with `useState` for every field is verbose and re-renders on every keystroke. `react-hook-form` uses uncontrolled inputs internally — it only re-renders when validation state changes.

### Basic setup

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(8, { message: "At least 8 characters" }),
});

type FormValues = z.infer<typeof schema>;  // ← derive type from schema

function LoginForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    // values is fully typed and validated
    await login(values);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register("email")} />
      {form.formState.errors.email && (
        <p>{form.formState.errors.email.message}</p>
      )}
      <button type="submit">Login</button>
    </form>
  );
}
```

### With shadcn/ui Form components

shadcn provides `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` that wire into react-hook-form automatically:

```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />  {/* auto-shows validation error */}
        </FormItem>
      )}
    />
  </form>
</Form>
```

### Zod schema tips

```ts
// Optional fields
z.string().optional()

// With transformation
z.string().trim().toLowerCase().email()

// Nested objects
z.object({
  address: z.object({
    city: z.string(),
    country: z.string(),
  }),
})

// Arrays
z.array(z.object({ tierId: z.string(), quantity: z.number().int().min(1) }))

// Conditional validation
z.object({
  hasTickets: z.boolean(),
  ticketPrice: z.number().optional(),
}).refine(
  (data) => !data.hasTickets || data.ticketPrice !== undefined,
  { message: "Price required when selling tickets", path: ["ticketPrice"] }
)
```

---

## 15. UI Layer — shadcn/ui + Tailwind

### What shadcn/ui is (and is not)

shadcn/ui is **not** an npm package. It's a collection of copy-paste components built on Radix UI primitives and styled with Tailwind. When you run `npx shadcn add button`, it copies `src/components/ui/button.tsx` into your project.

This means:
- You own the component — edit it however you like
- No version lock-in
- The component is Radix UI under the hood (fully accessible, keyboard-navigable)

### `cn()` — the utility you'll use everywhere

```ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

`clsx` handles conditionals. `twMerge` resolves Tailwind conflicts (e.g. `"p-4 p-2"` → `"p-2"`).

```tsx
<div className={cn(
  "rounded-xl border p-3",                    // always
  selected && "border-primary bg-primary/5",  // conditional
  className                                   // override from props
)} />
```

### Tailwind v4 (used in this project)

Tailwind v4 is configured via CSS, not `tailwind.config.js`:

```css
/* globals.css */
@import "tailwindcss";
@import "tw-animate-css";
```

Custom variables are defined in `@layer base` as CSS custom properties and referenced as Tailwind utilities.

### Component patterns from this project

**Skeleton loading:**
```tsx
if (isLoading) return <Skeleton className="h-16 w-full rounded-xl" />;
```

**Conditional badge:**
```tsx
<Badge className={cn(
  "text-xs",
  status === "PUBLISHED" ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"
)}>
  {status}
</Badge>
```

**Toast notifications** (via sonner):
```tsx
import { toast } from "sonner";

toast.success("Event published!");
toast.error("Payment failed. Try again.");
```

---

## 16. Fonts, Images, and Scripts

### Fonts — `next/font`

```ts
// src/app/layout.tsx
import { Nunito_Sans } from "next/font/google";

const nunitoSans = Nunito_Sans({
  weight: ["400", "600", "700"],
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});
```

`next/font` downloads the font at build time and self-hosts it. No request to Google Fonts at runtime = better privacy and performance. The `variable` option creates a CSS custom property, used as `font-[--font-nunito-sans]` in Tailwind.

### Images — `next/image`

```tsx
import Image from "next/image";

<Image
  src="https://res.cloudinary.com/..."
  alt="Event banner"
  width={800}
  height={400}
  className="rounded-xl object-cover"
/>
```

`next/image` automatically:
- Lazy-loads (off-screen images don't load until near the viewport)
- Resizes to the needed dimensions
- Converts to WebP
- Prevents Cumulative Layout Shift (CLS) via `width`/`height`

External domains must be whitelisted in `next.config.ts`:

```ts
images: {
  remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
}
```

> This project has `unoptimized: true` — skipping image optimisation for faster builds. Remove this in production for real performance gains.

### Scripts — `next/script`

```tsx
import Script from "next/script";

// Load before any page rendering (blocks)
<Script src="https://..." strategy="beforeInteractive" />

// Load after page is interactive (default, good for analytics)
<Script src="https://..." strategy="afterInteractive" />

// Load during browser idle time
<Script src="https://..." strategy="lazyOnload" />
```

This project loads Google Maps and the old Juicyway script as `beforeInteractive` because they need to be available immediately. Analytics (Google Tag Manager) is `afterInteractive`.

---

## 17. Path Aliases and Project Structure

### The `@/` alias

`@/` maps to `src/`. Configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}
```

Instead of `../../../components/ui/button`, you write `@/components/ui/button`. Always use this.

### Project structure

```
src/
├── app/                    ← All routes live here (App Router)
│   ├── (admin)/            ← Admin panel routes
│   ├── (auth)/             ← Auth routes (login, register)
│   ├── api/                ← API routes (server-side handlers)
│   │   └── auth/
│   │       ├── store-token/route.ts
│   │       └── get-token/route.ts
│   ├── dashboard/          ← Main app
│   │   ├── (dashboard-route)/  ← Routes with navbar
│   │   └── [eventId]/          ← Organiser event management
│   ├── organizer/
│   │   └── payment/verify/page.tsx  ← Ercaspay redirect landing page
│   ├── provider/           ← Redux store + RTK Query APIs
│   │   ├── api/            ← One file per API domain
│   │   ├── slices/         ← Redux slices (local state)
│   │   ├── store.ts        ← Store configuration
│   │   └── provider.tsx    ← <Provider> wrapper component
│   └── layout.tsx          ← Root layout
├── components/
│   ├── navbar/             ← App-wide navigation components
│   └── ui/                 ← shadcn/ui components (button, card, etc.)
├── hooks/                  ← Custom React hooks
│   ├── useSocket.ts        ← Socket.IO connection manager
│   ├── getToken.ts         ← Cookie token reader
│   └── useWebSocket.ts     ← Legacy (native WebSocket, superseded)
├── lib/
│   └── utils.ts            ← cn() and other utilities
└── types/                  ← Shared TypeScript types
```

---

## 18. Performance and Optimization

### What slows Next.js apps down

1. **Too many Client Components** — every `"use client"` adds JavaScript to the bundle. Move data fetching and static rendering to Server Components where possible.

2. **Unoptimised images** — this project has `unoptimized: true`. In production, remove it. A 1MB banner image served as a 50KB WebP makes a measurable difference.

3. **Blocking scripts** — `strategy="beforeInteractive"` blocks page rendering. Only use it for scripts that are truly needed before the page appears (like auth checks). Move analytics to `afterInteractive`.

4. **No code splitting** — Next.js splits by route automatically. But large components imported at the top level still ship in the main bundle. Use dynamic imports for heavy non-critical components:

```tsx
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("./HeavyChart"), {
  ssr: false,        // don't render on server (useful for canvas/D3/etc.)
  loading: () => <Skeleton className="h-64" />,
});
```

5. **Missing `Suspense` boundaries** — without them, the entire page waits for the slowest data fetch. Wrap slow parts in `<Suspense>`:

```tsx
<Suspense fallback={<EventListSkeleton />}>
  <EventList />  {/* async Server Component */}
</Suspense>
```

6. **RTK Query over-fetching** — each `useGetXQuery()` call subscribes to the cache. If a component unmounts and remounts quickly, it'll refetch. Use `keepUnusedDataFor` to extend cache lifetime:

```ts
getEvents: builder.query({
  query: () => "/v1/events",
  keepUnusedDataFor: 300,  // keep cache for 5 minutes after component unmounts
})
```

### TypeScript `ignoreBuildErrors: true`

This project has this in `next.config.ts`. It makes CI faster but lets type errors ship to production. Disable it once the project is stable:

```ts
// next.config.ts
typescript: {
  ignoreBuildErrors: false,  // turn this on in production
}
```

### `"use client"` placement

Push the boundary as deep as possible. If only a button is interactive, only the button needs `"use client"` — not the entire page.

```tsx
// Bad ❌ — whole page becomes client-side for one button
"use client";
export default function EventPage() {
  return <div><h1>Event</h1><FavouriteButton /></div>;
}

// Good ✅ — only the interactive piece is client-side
// event-page.tsx (Server Component)
export default function EventPage() {
  return <div><h1>Event</h1><FavouriteButton /></div>;
}

// favourite-button.tsx
"use client";
export function FavouriteButton() { ... }
```

### Memoisation

```tsx
import { memo, useMemo, useCallback } from "react";

// Prevent re-render when parent re-renders but props haven't changed
const PlanCard = memo(function PlanCard({ plan, selected, onSelect }) { ... });

// Expensive calculation — recompute only when deps change
const sortedPlans = useMemo(() =>
  plans.sort((a, b) => a.finalAmount - b.finalAmount),
  [plans]
);

// Stable function reference — prevents child re-renders
const handleSelect = useCallback((planType: PlanType) => {
  setSelectedPlan(planType);
}, []);
```

---

## 19. Scaling Patterns

### Split RTK Query APIs by domain

Each API file in this project covers one domain (`eventApi.ts`, `paymentApi.ts`, `messagingApi.ts`). This keeps files manageable and allows independent cache invalidation. Never put everything in one giant `api.ts`.

### Centralise error handling

All API errors flow through `baseQueryWithReauth`. Add global error handling there instead of duplicating `try/catch` everywhere:

```ts
// In baseQueryWithReauth — handle 403 globally
if (result.error?.status === 403) {
  toast.error("You don't have permission to do that.");
}
```

### Environment variables

Next.js has two types:

| Variable | Accessible |
|---|---|
| `NEXT_PUBLIC_*` | Browser + server. Baked into the client bundle at build time. |
| Everything else | Server only. Never exposed to the browser. |

```ts
// Safe to use in browser code
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Server-only (API routes, Server Components)
const secretKey = process.env.ERCASPAY_SECRET_KEY;
```

Never put secrets in `NEXT_PUBLIC_` variables — they'll appear in the compiled JavaScript.

### Avoid prop drilling with context or Redux

When state needs to travel more than 2-3 levels, put it in Redux or a React Context instead of threading it through props:

```tsx
// Instead of: <A eventId={eventId}><B eventId={eventId}><C eventId={eventId} /></B></A>
// Use: useSelector or useContext inside C directly
```

### Debounce user inputs

Heavy operations (search, map panning, canvas manipulation) should be debounced:

```tsx
import { useDebouncedCallback } from "use-debounce";

const handleSearch = useDebouncedCallback((value: string) => {
  setQuery(value);
}, 300);  // wait 300ms after user stops typing
```

This project includes `use-debounce` — use it anywhere you're calling APIs or doing expensive work on keystrokes.

### Socket.IO reconnection

When a user's network drops and reconnects, Socket.IO auto-reconnects the socket. But **room membership is not preserved** — you must re-join. Always put your `socket.emit("join:*", ...)` inside the effect that depends on `isConnected`, so it fires again after every reconnection.

---

## 20. Concepts Not Used Here (But You Should Know)

### Middleware (`src/middleware.ts`)

Middleware runs on the **Edge Runtime** before a request reaches a page or API route. Use it for:
- Auth guards (redirect unauthenticated users before the page even renders)
- Geolocation-based routing
- Rate limiting
- A/B testing

```ts
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken");

  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/organizer/:path*"],
};
```

This project has no middleware — auth is handled client-side. Middleware would be faster and more secure (the redirect happens before the page renders).

### Server Components with direct data fetching

Instead of fetching data in `useEffect`, fetch it directly in a Server Component:

```tsx
// No RTK Query needed — just async/await
async function EventPage({ params }: { params: { id: string } }) {
  const event = await fetch(`https://api.nextvibe.com/v1/events/${params.id}`, {
    headers: { Authorization: `Bearer ${getTokenFromCookie()}` },
    cache: "no-store",  // always fresh, or "force-cache" for static
  }).then(r => r.json());

  return <EventDetail event={event.data} />;
}
```

### Parallel Routes (`@slot` folders)

Display multiple pages simultaneously in the same layout (e.g. a dashboard with a main panel and a side panel, both independently navigable).

```
app/dashboard/
├── @main/
│   └── page.tsx
├── @sidebar/
│   └── page.tsx
└── layout.tsx   ← receives { main, sidebar } as props
```

### Intercepting Routes

Show a modal for a route when navigating from within the app, but the full page when navigated to directly (e.g. clicking an image shows a modal, but opening the direct URL shows the full image page).

### Static Site Generation (SSG) and ISR

```tsx
// Force static rendering
export const dynamic = "force-static";

// Incremental Static Regeneration — rebuild every 60 seconds
export const revalidate = 60;

// On-demand revalidation
import { revalidatePath } from "next/cache";
revalidatePath("/events");
```

### Server Actions

Run server-side code directly from a form, without writing an API route:

```tsx
// In a Server Component
async function createEvent(formData: FormData) {
  "use server";
  const name = formData.get("name");
  await db.events.create({ name });
  revalidatePath("/events");
}

export default function CreateForm() {
  return <form action={createEvent}><input name="name" /><button>Create</button></form>;
}
```

### React Query / TanStack Query

An alternative to RTK Query. Better suited when you don't need Redux for local state — lighter and simpler API. RTK Query is the right choice when you already have Redux in the project (like here).

---

## 21. Common Mistakes and How to Avoid Them

### 1. Calling hooks inside conditionals or loops

```tsx
// ❌ Wrong
if (user) {
  const data = useGetEventsQuery();
}

// ✅ Right — hooks must always be called at the top level
const { data } = useGetEventsQuery(undefined, { skip: !user });
```

### 2. Mutating state directly in a reducer

RTK uses Immer under the hood, which allows direct mutation inside `createSlice`. But this only works inside reducers — not outside.

```ts
// ✅ Inside a reducer — Immer handles this
setUser(state, action) {
  state.user = action.payload;  // fine
}

// ❌ Outside Redux — this mutates the reference React holds
const user = useSelector(state => state.user.user);
user.name = "New Name";  // don't do this
```

### 3. Not cleaning up Socket.IO listeners

```tsx
// ❌ Leak — handleMessage accumulates on every render
useEffect(() => {
  socket.on("new:dm", handleMessage);
}, [isConnected]);

// ✅ Return cleanup
useEffect(() => {
  socket.on("new:dm", handleMessage);
  return () => socket.off("new:dm", handleMessage);
}, [isConnected]);
```

### 4. `window.location.href` inside Server Components

`window` doesn't exist on the server. Any code using browser globals must be inside a Client Component or guarded:

```ts
if (typeof window !== "undefined") {
  window.location.href = "/auth/login";
}
```

### 5. Stale closures in `useEffect`

When a `useEffect` captures a value that changes later, it sees the old value:

```tsx
// ❌ Stale — count is always 0 inside this effect
const [count, setCount] = useState(0);
useEffect(() => {
  const interval = setInterval(() => {
    console.log(count);  // always logs 0
  }, 1000);
  return () => clearInterval(interval);
}, []);  // count missing from deps

// ✅ Fix — add count to deps, or use functional update
useEffect(() => {
  const interval = setInterval(() => {
    setCount(c => c + 1);  // functional update avoids stale closure
  }, 1000);
  return () => clearInterval(interval);
}, []);
```

### 6. Sending `Authorization` header to Ercaspay webhook endpoints

Webhook routes are called by Ercaspay's servers, not by your users. They don't have your JWT. Don't put them behind `baseQueryWithReauth`. They're public routes secured by HMAC signature verification on the backend.

### 7. Forgetting `?from=` on auth redirects

Any time your code redirects to `/auth/login`, include the current path. The user expects to land back where they were after logging in.

```ts
// ❌
window.location.href = "/auth/login";

// ✅
const from = encodeURIComponent(window.location.pathname + window.location.search);
window.location.href = `/auth/login?from=${from}`;
```

### 8. Using `"PENDING"` vs `"pending"` — casing bugs

Backend enums are often uppercase (`"PENDING"`, `"COMPLETED"`), but some endpoints return lowercase (`"pending"`, `"completed"`). Always check the actual API response — don't assume.

In this project, `POST /organizer-payments/plan/initiate` returns uppercase `"PENDING"` / `"COMPLETED"`, but `GET /organizer-payments/verify/:id` returns lowercase `"completed"` / `"pending"` / `"failed"`. Mixing these up will break status checks silently.

---

## Quick Reference

### Most-used Next.js imports

```ts
import { useRouter, useSearchParams, useParams, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { redirect, notFound } from "next/navigation";  // server-side
```

### Most-used RTK Query patterns

```ts
// Query (read)
const { data, isLoading, isError, refetch } = useGetSomethingQuery(arg);

// Lazy query (on demand)
const [trigger, { data, isLoading }] = useLazyGetSomethingQuery();
await trigger(arg).unwrap();

// Mutation (write)
const [mutate, { isLoading }] = useSomeMutation();
await mutate(body).unwrap();
```

### Most-used Redux patterns

```ts
const value = useSelector((state: RootState) => state.sliceName.field);
const dispatch = useDispatch();
dispatch(someAction(payload));
```

### Socket.IO pattern

```tsx
const { socketRef, isConnected } = useSocket("messaging");

useEffect(() => {
  if (!isConnected) return;
  const socket = socketRef.current!;
  socket.emit("join:event-chat", { eventId, section: "PRE_EVENT" });
  const handler = (msg) => setMessages(prev => [...prev, msg]);
  socket.on("new:event-chat", handler);
  return () => socket.off("new:event-chat", handler);
}, [isConnected, eventId, socketRef]);
```

### Auth token access

```ts
import Cookies from "js-cookie";
const accessToken = Cookies.get("accessToken");
const refreshToken = Cookies.get("refreshToken");
```

---

## 22. Presigned Upload URLs — Streaming Files Directly to Storage

### The problem with the old approach

The original event creation sent files through the NestJS server as `multipart/form-data`:

```
Browser ──── POST (FormData, 200MB video) ──→ NestJS ──→ MinIO
```

Every byte of the file occupied NestJS process memory. A 350MB video would:
- Exhaust server memory on concurrent uploads (OOM kills)
- Hit Nginx/NestJS payload size limits
- Block the event loop for seconds

### The presigned URL architecture

The backend generates a short-lived signed URL that authorises the browser to write directly to MinIO:

```
Browser ─── POST /upload-intent ──→ NestJS (tiny JSON, fast)
Browser ←── { uploadUrl, fileUrl } ── NestJS
Browser ─────── PUT (binary) ──────→ MinIO  (NestJS never sees the file)
Browser ─── POST /v1/events (JSON) → NestJS  (fileUrl is now a plain string)
```

### Step A — request the presigned URL

```ts
// eventApi.ts
uploadIntent: builder.mutation<
  { success: boolean; data: { uploadUrl: string; fileUrl: string } },
  { filename: string; contentType: string; folder: string }
>({
  query: (body) => ({
    url: "/v1/events/upload-intent",
    method: "POST",
    body,
  }),
}),
```

```ts
const intent = await uploadIntent({
  filename: file.name,
  contentType: file.type,  // e.g. "video/mp4"
  folder: "events",
}).unwrap();

// intent.data.uploadUrl — sign PUT to MinIO
// intent.data.fileUrl   — the final CDN URL to store in the database
```

### Step B — stream the binary directly to storage

`fetch` cannot report upload progress. Use `XMLHttpRequest`:

```ts
const uploadFile = (
  file: File,
  uploadUrl: string,
  onProgress?: (pct: number) => void
): Promise<void> =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type); // must match contentType from Step A

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable)
          onProgress(Math.round((e.loaded * 100) / e.total));
      };
    }

    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed: ${xhr.status}`));
    xhr.onerror = () => reject(new Error("Upload network error"));
    xhr.send(file);
  });
```

> **Why XHR and not fetch?** `fetch` only has `response.body` (a readable stream for downloads). `XMLHttpRequest.upload` exposes progress events for uploads. There is no native upload progress API in the Fetch standard as of 2026.

### Step C — submit plain JSON

Once both uploads resolve, the event body is clean text:

```ts
const body = {
  name: "Tech Summit 2026",
  mode: "ONSITE",
  flierUrl: "https://cdn.nextvibe.com/events/17164-flier.jpg",    // from Step A
  promoVideoUrl: "https://cdn.nextvibe.com/events/17164-promo.mp4",
};

await createEvent(body).unwrap();
```

The backend no longer needs `FileFieldsInterceptor` — it just receives a JSON object.

### Showing upload progress in the UI

```tsx
const [uploadProgress, setUploadProgress] = useState<number | null>(null);

// In onSubmit:
setUploadProgress(0);
await uploadFile(file, intent.data.uploadUrl, setUploadProgress);
setUploadProgress(null);

// In JSX:
{uploadProgress !== null && (
  <div className="space-y-1">
    <div className="flex justify-between text-xs text-muted-foreground">
      <span>Uploading video…</span>
      <span>{uploadProgress}%</span>
    </div>
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div
        className="h-full bg-primary transition-all duration-150"
        style={{ width: `${uploadProgress}%` }}
      />
    </div>
  </div>
)}
```

The submit button should be `disabled={isLoading || uploadProgress !== null}` so the user can't double-submit while the upload is in progress.

### Full onSubmit flow

```ts
const onSubmit = async (values: FormValues) => {
  try {
    let flierUrl: string | undefined;
    let promoVideoUrl: string | undefined;

    if (values.flier) {
      const intent = await uploadIntent({
        filename: values.flier.name,
        contentType: values.flier.type,
        folder: "events",
      }).unwrap();
      await uploadFile(values.flier, intent.data.uploadUrl);
      flierUrl = intent.data.fileUrl;
    }

    if (values.promoVideo) {
      setUploadProgress(0);
      const intent = await uploadIntent({
        filename: values.promoVideo.name,
        contentType: values.promoVideo.type,
        folder: "events",
      }).unwrap();
      await uploadFile(values.promoVideo, intent.data.uploadUrl, setUploadProgress);
      promoVideoUrl = intent.data.fileUrl;
      setUploadProgress(null);
    }

    await createEvent({
      name: values.name,
      mode: values.eventMode,
      ...(flierUrl && { flierUrl }),
      ...(promoVideoUrl && { promoVideoUrl }),
    }).unwrap();

  } catch (err: any) {
    setUploadProgress(null);
    toast.error(err?.data?.message ?? err?.message ?? "Failed to create event");
  }
};
```

---

## 23. Next.js Middleware — How It Really Works

### The actual file convention

Section 20 described middleware as a concept not used here. That was wrong — this project has middleware at `src/proxy.ts`. Here is how Next.js picks it up.

Next.js recognises middleware in two ways:
1. A file named `middleware.ts` at `src/` or project root that exports `middleware` (the standard)
2. **Any file** that exports `export const config = { matcher: [...] }` — Turbopack treats the file that has this shape as the middleware module regardless of its name

In this project, `src/proxy.ts` exports:

```ts
export async function proxy(req: NextRequest) { ... }  // function can be named anything
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
```

Next.js/Turbopack compiles `proxy.ts` as the middleware entry point because of the `config` export. The function name (`proxy`) is just a convention documented by Next.js — it does not have to be `middleware`.

### What middleware can do

Middleware runs on the **Edge Runtime** — a lightweight V8 environment, not full Node.js. It executes **before** a request is matched to a page or API route. This makes it perfect for:

- **Auth guards** — redirect before the page renders (server-side, not client-side)
- **Token refresh** — check expiry, refresh silently, set new cookie, continue
- **Geo-routing** — redirect based on country header

### What middleware cannot do

- No Node.js APIs (no `fs`, no `Buffer`, no `crypto` from Node)
- No `import` of large npm packages (Edge runtime has a strict size limit)
- No `console.log` visible in browser devtools (logs appear in the server terminal)

### The `config.matcher` pattern

```ts
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

This regex matches every path **except** Next.js static files, optimised images, and favicon. Without this, middleware would run on every asset request — including JS bundles.

### Reading and setting cookies in middleware

```ts
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  // Read
  const token = req.cookies.get("accessToken")?.value;

  // Redirect
  if (!token) {
    const from = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(new URL(`/auth/login?from=${from}`, req.url));
  }

  // Set cookie on the continuing response
  const response = NextResponse.next();
  response.cookies.set("newCookie", "value", {
    httpOnly: true,
    maxAge: 3600,
  });
  return response;
}
```

> **Important**: `req.cookies` is read-only. To set cookies you must return a `NextResponse` and call `.cookies.set()` on it.

### Server-side token refresh in middleware

When an access token is expired at page-load time, middleware can refresh it before the page even starts rendering:

```ts
const refreshRes = await fetch(`${API_URL}/v1/auth/refresh`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    cookie: req.headers.get("cookie") ?? "",  // forward the browser's cookies
  },
});

if (refreshRes.ok) {
  const { data } = await refreshRes.json();
  const response = NextResponse.next();
  response.cookies.set("accessToken", data.accessToken, { ... });
  return response;
}
```

This is more efficient than the client-side queue pattern — the page receives a fresh token in its very first request and never gets a 401 at all.

### The `?from=` requirement

Every redirect to `/auth/login` must include the current path so the user lands back where they were after logging in:

```ts
// ❌ Bad — user loses context
return NextResponse.redirect(new URL("/auth/login", req.url));

// ✅ Good
const from = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search);
return NextResponse.redirect(new URL(`/auth/login?from=${from}`, req.url));
```

The login page reads `searchParams.get("from")` and calls `router.push(from)` after a successful login.

---

## 24. Multi-Role Auth Token Strategy

### The problem

This project has two user roles that need separate permissions: regular users and admins. The naive approach of one token caused a critical bug: **admins could not visit non-admin pages**.

### Why it broke

When an admin logged in, `store-token` prefixed the cookies with `admin_`:

```ts
// Before the fix — BAD
const prefix = isAdmin ? "admin_" : "";
response.cookies.set(`${prefix}accessToken`, accessToken);
// Admin gets: admin_accessToken
// Non-admin routes check: accessToken  ← undefined for admins → 401
```

Every API call on a non-admin page (`/dashboard`, `/profile`, etc.) had no token and immediately 401'd.

### The three-layer fix

The fix must be consistent across all three places that check for tokens:

#### Layer 1 — `store-token` route (cookie writing)

Write **both** the plain and the prefixed cookie whenever an admin logs in:

```ts
// Always write the unprefixed cookie
response.cookies.set("accessToken", accessToken, { ... });
if (refreshToken) response.cookies.set("refreshToken", refreshToken, { ... });

// Additionally write the admin-prefixed cookies
if (isAdmin) {
  response.cookies.set("admin_accessToken", accessToken, { ... });
  response.cookies.set("admin_refreshToken", refreshToken, { ... });
}
```

Non-admin pages find `accessToken`. Admin pages prefer `admin_accessToken` but fall back to `accessToken`.

#### Layer 2 — middleware (server-side page guard)

Fall back to admin tokens when checking non-admin routes:

```ts
const accessToken =
  req.cookies.get("accessToken")?.value ??
  req.cookies.get("admin_accessToken")?.value;  // fallback for admin users

const refreshToken =
  req.cookies.get("refreshToken")?.value ??
  req.cookies.get("admin_refreshToken")?.value;
```

This allows existing admin sessions (that only have `admin_accessToken`) to access non-admin pages without requiring a re-login.

#### Layer 3 — `baseQuery` (client-side API calls)

Same fallback pattern in `prepareHeaders` and the refresh token lookup:

```ts
// prepareHeaders
const accessToken = isAdminRoute
  ? (Cookies.get("admin_accessToken") ?? Cookies.get("accessToken"))
  : (Cookies.get("accessToken") ?? Cookies.get("admin_accessToken")); // ← fallback added

// refresh token lookup
const refreshToken = isAdminRoute
  ? (Cookies.get("admin_refreshToken") ?? Cookies.get("refreshToken"))
  : (Cookies.get("refreshToken") ?? Cookies.get("admin_refreshToken")); // ← fallback added
```

### Why all three layers matter

| Layer | Catches what |
|---|---|
| `store-token` | New logins — sets cookies correctly from day one |
| Middleware | Server-side redirect before page renders |
| `baseQuery` | Client-side API calls after page loads |

If only middleware is fixed, the page renders but every API call 401s. If only `baseQuery` is fixed, the middleware blocks the page before it renders. You need all three consistent.

### Token priority table

| Route | Access token used | Refresh token used |
|---|---|---|
| `/admin/*` | `admin_accessToken` → `accessToken` | `admin_refreshToken` → `refreshToken` |
| Everything else | `accessToken` → `admin_accessToken` | `refreshToken` → `admin_refreshToken` |

---

## 25. `useSearchParams()` and the Suspense Requirement

### The build error

```
useSearchParams() should be wrapped in a suspense boundary at page "/organizer/payment/verify"
```

This is a Next.js hard requirement, not a warning. Any page that uses `useSearchParams()` must have a `<Suspense>` boundary wrapping the component that calls it, or the build will fail with `exit code 1`.

### Why Next.js requires this

During static site generation (SSG), Next.js pre-renders pages at build time. `useSearchParams()` reads from the URL — but there is no URL at build time. Next.js needs a `<Suspense>` boundary so it can render the fallback statically while deferring the actual content (which needs the URL) to the client.

### The fix pattern

Split the page into a thin shell (exported default, no hooks) and the real component (does the work):

```tsx
// page.tsx
"use client";
import { Suspense } from "react";

// ✅ Default export — no useSearchParams here
export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={<LoadingShell />}>
      <VerifyPageInner />
    </Suspense>
  );
}

// The real component — useSearchParams is safe here because it's inside Suspense
function VerifyPageInner() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  // ... rest of the component
}
```

### This also applies to

- `usePathname()` — same requirement in some configurations
- Any component that reads query params at mount time

### The pattern generalises to any "loading" state

`<Suspense>` + a fallback is the correct way to handle async boundaries in the App Router:

```tsx
// For Server Components that fetch data:
<Suspense fallback={<EventListSkeleton />}>
  <EventList />  {/* async component — can await inside */}
</Suspense>

// For client components that need URL params:
<Suspense fallback={<Spinner />}>
  <ComponentThatUsesSearchParams />
</Suspense>
```

---

## 26. Discriminated AI Responses — Handling Type-Specific Shapes

### The problem with a single schema

The AI game generator returns different shapes depending on the game type. The old code used a single mapping and tried to find the correct answer by string-matching:

```ts
// Old approach — fragile
const correctIdx = options.findIndex(
  (o) => o.toLowerCase().trim() === correctAnswerStr.toLowerCase().trim()
);
```

If the AI phrased the answer slightly differently from the option text, the match failed silently and `correctIdx` defaulted to `0` — wrong answer selected.

### The new backend — per-type schemas

The backend now returns clean, type-specific shapes:

| Game type | `options` | `correctAnswerIndex` | `clue` | `correctAnswer` |
|---|---|---|---|---|
| `TRIVIA` | 4 items | 0–3 (the right answer) | — | — |
| `TWO_TRUTHS_ONE_LIE` | 3 items | index of the **lie** | — | — |
| `WORD_PUZZLE` | absent | absent | hint string | exact answer string |
| `THIS_OR_THAT` | 2 items | absent (opinion poll) | — | — |

### The correct mapping pattern — branch per type

```ts
if (gameType === "word-puzzle") {
  return {
    ...base,
    question: q.clue ?? q.text ?? "",
    clue: q.clue ?? q.text ?? "",
    correctAnswer: q.correctAnswer ?? q.answer ?? "",
    options: undefined,
    correctIndex: undefined,
  };
}

if (gameType === "two-truths") {
  const options: string[] = q.options ?? [];
  // Backend tells us exactly which index is the lie
  const lieIndex = q.correctAnswerIndex ??
    options.findIndex(o => o.toLowerCase() === (q.correctAnswer ?? "").toLowerCase());
  return {
    ...base,
    question: q.text ?? q.question ?? "",
    options,
    correctIndex: lieIndex >= 0 ? lieIndex : 0,
    correctAnswer: options[lieIndex >= 0 ? lieIndex : 0] ?? "",
  };
}

if (gameType === "this-or-that") {
  // Opinion poll — there is no correct answer
  return {
    ...base,
    question: q.text ?? q.question ?? "",
    options: q.options ?? [],
    correctIndex: undefined,
    correctAnswer: undefined,
  };
}

// TRIVIA — correctAnswerIndex is definitive
const options: string[] = q.options ?? [];
const correctIdx = q.correctAnswerIndex >= 0 ? q.correctAnswerIndex : 0;
return {
  ...base,
  question: q.text ?? q.question ?? "",
  options,
  correctIndex: correctIdx,
  correctAnswer: options[correctIdx] ?? "",
};
```

### Key lesson: prefer index over string matching

When a backend returns a numeric index (`correctAnswerIndex: 2`), use it directly. String matching is a fragile fallback — keep it only for backwards compatibility with old response shapes, and always prefer the index:

```ts
const correctIdx =
  q.correctAnswerIndex ??           // new backend: use directly
  options.findIndex(o => ...);      // old backend: fall back to string match
```

---

## 27. Debugging Real-World Production Issues

These are patterns that came up during active development of this project. Each one is a category of bug you will encounter.

### Dead code that looks live

`src/proxy.ts` exports `export const config = { matcher: [...] }`. This is a Next.js/Turbopack convention — the file was compiled as middleware because of this export shape, even though it's not named `middleware.ts`. The bugs inside it (no `?from=`, admin cookie not checked) were real and silent.

**Lesson**: When debugging redirect issues, always search for ALL places that call `redirect`, `router.push`, and `window.location.href`. Don't assume a file isn't running just because it has an unusual name.

### Wrong API endpoint buried in a query

The notification bell wasn't showing any notifications. The actual API call was:

```ts
// Wrong — this is a cron/admin trigger endpoint, not the user's notification list
query: () => "/v1/notifications/trigger-reminders",

// Right
query: () => "/v1/notifications",
```

The UI showed "All caught up!" correctly (empty state rendered properly) so no error appeared. The bug was invisible until you compared the endpoint against the API spec.

**Lesson**: When a feature shows empty state but you expect data, check the actual network request in devtools before assuming the UI is broken.

### Absolute-positioned badge with no relative parent

The notification count badge:

```tsx
// ❌ — badge floats away from the bell icon
<div aria-label="Notifications">
  <Bell />
  <span className="absolute top-1 right-1 ...">3</span>
</div>

// ✅ — relative creates the positioning context
<div aria-label="Notifications" className="relative cursor-pointer p-1.5">
  <Bell />
  <span className="absolute top-1 right-1 ...">3</span>
</div>
```

`absolute` positions an element relative to its **nearest ancestor with `position` set** (`relative`, `absolute`, `fixed`, `sticky`). Without `relative` on the parent, the badge positions relative to the page or a far-off ancestor.

**Lesson**: When an absolutely positioned element is in the wrong place, check its parent chain for `position: relative`.

### FormData vs JSON — silent backend mismatch

After the backend removed `FileFieldsInterceptor`, it expected `Content-Type: application/json` for event creation. The frontend was still sending `multipart/form-data` (FormData). The backend may have returned a 400 or silently ignored file fields. No explicit error was thrown on the frontend.

**Lesson**: When a backend changes its expected content type, the frontend must change too. Check the `Content-Type` header in devtools whenever a create/update flow breaks.

### Stale `useEffect` not re-triggering

```tsx
// ❌ "Check again" resets state but the effect doesn't re-run
const [pollState, setPollState] = useState("polling");
useEffect(() => { poll(); }, [paymentId]);  // paymentId never changes

// ✅ Add a retryKey to force the effect to re-run
const [retryKey, setRetryKey] = useState(0);
useEffect(() => { poll(); }, [paymentId, retryKey]);

// "Check again" button:
onClick={() => {
  attemptRef.current = 0;
  setPollState("polling");
  setRetryKey(k => k + 1);  // dependency changes → effect fires again
}}
```

**Lesson**: If a `useEffect` isn't re-running when you expect it to, the issue is almost always its dependency array. Add a counter state (`retryKey`, `refreshKey`, `key`) to its deps when you need to force a re-run without changing the actual data.

---

## Updated Quick Reference

### Presigned upload flow

```ts
// 1. Get permission
const intent = await uploadIntent({ filename, contentType, folder }).unwrap();

// 2. Stream to storage (with progress)
await new Promise((resolve, reject) => {
  const xhr = new XMLHttpRequest();
  xhr.open("PUT", intent.data.uploadUrl);
  xhr.setRequestHeader("Content-Type", file.type);
  xhr.upload.onprogress = (e) => setProgress(Math.round(e.loaded * 100 / e.total));
  xhr.onload = () => resolve();
  xhr.onerror = () => reject();
  xhr.send(file);
});

// 3. Submit JSON
await createEvent({ flierUrl: intent.data.fileUrl, ... }).unwrap();
```

### Middleware redirect with `?from=`

```ts
const from = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search);
return NextResponse.redirect(new URL(`/auth/login?from=${from}`, req.url));
```

### `useSearchParams()` page wrapper

```tsx
export default function Page() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PageInner />  {/* useSearchParams() lives here */}
    </Suspense>
  );
}
```

### Admin token fallback (both middleware and baseQuery)

```ts
const accessToken =
  Cookies.get("accessToken") ??
  Cookies.get("admin_accessToken");  // admin users can visit non-admin pages
```

---

*This guide covers the NextVibe frontend as of May 2026. Update it when significant architectural changes are made.*
