const BASE_URL = "https://mynextvibe.com";

/** Organization schema — tells AI engines who NextVibe is */
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "NextVibe",
  url: BASE_URL,
  logo: `${BASE_URL}/logos/new/logo_black_text.png`,
  description:
    "NextVibe is the digital memory bank for events — party photo sharing, VibeTags, event games, smart RSVP, and brand sponsorships for organizers, attendees, and brands.",
  sameAs: [
    "https://twitter.com/mynextvibe",
    "https://instagram.com/mynextvibe",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    url: `${BASE_URL}/contact`,
  },
};

/** SoftwareApplication schema — surfaces NextVibe in "best app for X" AI answers */
export const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "NextVibe",
  url: BASE_URL,
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web, iOS, Android",
  description:
    "NextVibe is a party photo sharing and event memory app. Capture shared albums via QR code, use VibeTags for structured memory capture, play event games, manage smart RSVP, and enable brand sponsorships at weddings, birthday parties, festivals, and corporate events.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free to get started",
  },
  featureList: [
    "Shared event photo albums via QR code",
    "VibeTags for structured memory capture",
    "Interactive event games with live leaderboards",
    "Digital postcards from event memories",
    "Smart RSVP management",
    "Brand sponsorship integration",
    "Social discovery for events",
    "Rewards and prizes for attendees",
  ],
  screenshot: `${BASE_URL}/images/gallery1.png`,
};

/** FAQ schema — answers the questions AI engines are already fielding */
export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is NextVibe?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "NextVibe is a digital memory bank for events. It lets guests share photos and videos at parties, weddings, festivals, and corporate events using a simple QR code — no app download required for basic sharing. It also includes VibeTags for structured memory capture, interactive event games, smart RSVP, digital postcards, and brand sponsorship tools.",
      },
    },
    {
      "@type": "Question",
      name: "How does party photo sharing work on NextVibe?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Organizers create an event and generate a unique QR code or VibeTag link. Guests scan the code and instantly upload photos and videos to a shared album. All content is automatically organized, searchable, and available for every guest to browse and download.",
      },
    },
    {
      "@type": "Question",
      name: "What is a VibeTag?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A VibeTag is NextVibe's unique memory-capture system. It's a custom tag (like a hashtag for your event) that makes every photo, video, and moment searchable and shareable. VibeTags let attendees and organizers find all the content from a specific event long after it's over.",
      },
    },
    {
      "@type": "Question",
      name: "Does NextVibe work for weddings?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. NextVibe is a popular choice for wedding photo sharing. Couples can set up a shared album with a QR code on each table, so every guest's photos end up in one place automatically. The smart RSVP feature also helps manage guest lists, dietary requirements, and reminders.",
      },
    },
    {
      "@type": "Question",
      name: "How is NextVibe different from disposable cameras or shared Google Photos albums?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Disposable cameras require film development and don't let guests share digitally in real time. Google Photos albums require a Google account and manual sharing. NextVibe is purpose-built for events: guests join instantly via QR code, content is automatically tagged and organized by event, and you get extra layers like games, rewards, RSVP management, and brand sponsorship — all in one platform.",
      },
    },
    {
      "@type": "Question",
      name: "Can brands and sponsors use NextVibe?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. NextVibe lets brands sponsor specific moments and experiences within events rather than static banner ads. Sponsors get authentic engagement data and user-generated content from real event attendees, making it more effective than traditional event sponsorships.",
      },
    },
    {
      "@type": "Question",
      name: "What types of events work best with NextVibe?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "NextVibe works for any event where people create memories together: birthday parties (especially milestone birthdays like 50th and 18th), weddings, engagement parties, music festivals, corporate events and conferences, family reunions, graduation parties, holiday parties, and sports events.",
      },
    },
  ],
};

/** WebSite schema — enables Sitelinks Search Box in Google */
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "NextVibe",
  url: BASE_URL,
  description:
    "The digital memory bank for events. Party photo sharing, VibeTags, event games, and smart RSVP.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/events?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};
