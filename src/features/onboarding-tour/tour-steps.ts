import { TourStep } from "./types";

export const APP_TOUR_STEPS: TourStep[] = [
  {
    targetId: "tour-nav-home",
    title: "Discover Events 🎉",
    description: "Browse events happening near you. Tap here to explore your personalised feed.",
    placement: "top",
  },
  {
    targetId: "tour-nav-social",
    title: "Your Social Circle 👥",
    description: "Follow friends, see their activity, and discover who else is going to events.",
    placement: "top",
  },
  {
    targetId: "tour-nav-create",
    title: "Create an Event ✨",
    description: "Planning something? Tap the + button to create your own event in minutes.",
    placement: "top",
  },
  {
    targetId: "tour-nav-messages",
    title: "Messages 💬",
    description: "Chat with other attendees and event organisers directly.",
    placement: "top",
  },
  {
    targetId: "tour-nav-profile",
    title: "Your Profile 🙌",
    description: "Manage your account, view your events, and customise your experience.",
    placement: "top",
  },
];

export const EVENT_TOUR_STEPS: TourStep[] = [
  {
    targetId: "tour-tab-about",
    title: "About the Event 📋",
    description: "See all the details — date, location, organisers, and what to expect.",
    placement: "bottom",
  },
  {
    targetId: "tour-tab-rsvp",
    title: "RSVP & Tickets 🎟️",
    description: "Reserve your spot or buy tickets here. You can also check who else is attending.",
    placement: "bottom",
  },
  {
    targetId: "tour-tab-qr",
    title: "Your QR Code 📱",
    description: "Your entry pass lives here. Show this at the door to get in quickly.",
    placement: "bottom",
  },
  {
    targetId: "tour-tab-games",
    title: "Event Games 🎮",
    description: "Play interactive games with other attendees. Only shows when the organiser has set one up.",
    placement: "bottom",
  },
  {
    targetId: "tour-tab-postcard",
    title: "Postcards & VibeTags 🏷️",
    description: "Send personalised postcards and vibes to fellow guests at this event.",
    placement: "bottom",
  },
  {
    targetId: "tour-tab-wishlist",
    title: "Wishlist 🎁",
    description: "Contribute a gift or see what the host is wishing for. Great for special occasions!",
    placement: "bottom",
  },
  {
    targetId: "tour-tab-chat",
    title: "Event Chat 💬",
    description: "Talk with everyone going to this event in real-time. Hype it up before the day!",
    placement: "bottom",
  },
];
