/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
// import { useAuth } from "@/hooks/use-auth";

export interface DiscoveredEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  attendees: number;
  hasGames: boolean;
  hasVibeTag: boolean;
  colorAccent: "pink" | "purple" | "cyan" | "plum";
  matchScore: number;
  matchReasons: string[];
}

interface UserInterest {
  id: string;
  interest: string;
}

interface UserLocation {
  city: string | null;
  country: string | null;
}

// Sample events data (in production, these would come from the database)
const sampleEventsData = [
  {
    id: "1",
    title: "Japan Group Trip",
    date: "Jan 2, 2026",
    location: "Tokyo, Japan",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=400&fit=crop",
    attendees: 50,
    hasGames: true,
    hasVibeTag: true,
    colorAccent: "pink" as const,
    tags: ["travel", "culture", "international"],
    category: "travel",
  },
  {
    id: "2",
    title: "Detty December 1",
    date: "Dec 20, 2025",
    location: "Lagos, Nigeria",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop",
    attendees: 102,
    hasGames: true,
    hasVibeTag: false,
    colorAccent: "purple" as const,
    tags: ["party", "music", "nightlife", "afrobeats"],
    category: "party",
  },
  {
    id: "3",
    title: "Tech Summit 2025",
    date: "Mar 15, 2025",
    location: "San Francisco, CA",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop",
    attendees: 320,
    hasGames: false,
    hasVibeTag: true,
    colorAccent: "cyan" as const,
    tags: ["tech", "networking", "startup", "innovation"],
    category: "tech",
  },
  {
    id: "4",
    title: "Birthday Bash",
    date: "Feb 14, 2025",
    location: "Miami, FL",
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=400&fit=crop",
    attendees: 25,
    hasGames: true,
    hasVibeTag: true,
    colorAccent: "plum" as const,
    tags: ["party", "celebration", "social"],
    category: "party",
  },
  {
    id: "5",
    title: "Music Festival Lagos",
    date: "Dec 27, 2025",
    location: "Lagos, Nigeria",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop",
    attendees: 500,
    hasGames: true,
    hasVibeTag: true,
    colorAccent: "pink" as const,
    tags: ["music", "festival", "afrobeats", "live"],
    category: "music",
  },
  {
    id: "6",
    title: "Startup Pitch Night",
    date: "Feb 20, 2025",
    location: "New York, NY",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop",
    attendees: 80,
    hasGames: false,
    hasVibeTag: true,
    colorAccent: "cyan" as const,
    tags: ["tech", "startup", "networking", "business"],
    category: "tech",
  },
  {
    id: "7",
    title: "Beach Party Vibes",
    date: "Mar 1, 2025",
    location: "Lagos, Nigeria",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
    attendees: 150,
    hasGames: true,
    hasVibeTag: true,
    colorAccent: "purple" as const,
    tags: ["party", "beach", "outdoor", "social"],
    category: "party",
  },
  {
    id: "8",
    title: "Art Exhibition Opening",
    date: "Feb 28, 2025",
    location: "London, UK",
    image: "https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=600&h=400&fit=crop",
    attendees: 45,
    hasGames: false,
    hasVibeTag: true,
    colorAccent: "plum" as const,
    tags: ["art", "culture", "exhibition", "creative"],
    category: "culture",
  },
];

// Interest to tag mapping
const interestToTagsMap: Record<string, string[]> = {
  "music-concerts": ["music", "concert", "live", "festival"],
  "tech-networking": ["tech", "startup", "networking", "innovation"],
  "beach-parties": ["beach", "party", "outdoor"],
  "art-culture": ["art", "culture", "exhibition", "creative"],
  "food-dining": ["food", "dining", "culinary"],
  "fitness-wellness": ["fitness", "wellness", "health", "sports"],
  "travel-adventure": ["travel", "adventure", "international"],
  "nightlife-clubs": ["nightlife", "party", "club", "afrobeats"],
};

export function useEventDiscovery() {
//   const { user, isAuthenticated } = useAuth();
  const [events, setEvents] = useState<DiscoveredEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userInterests, setUserInterests] = useState<UserInterest[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [pastEventIds, setPastEventIds] = useState<string[]>([]);

  // For now, use localStorage for interests until types are regenerated
  const loadStoredPreferences = useCallback(() => {
    try {
      const storedInterests = localStorage.getItem("nextvibe_interests");
      if (storedInterests) {
        const interests = JSON.parse(storedInterests) as string[];
        setUserInterests(interests.map((i, idx) => ({ id: String(idx), interest: i })));
      }

      const storedLocation = localStorage.getItem("nextvibe_location");
      if (storedLocation) {
        setUserLocation(JSON.parse(storedLocation));
      }
    } catch (error) {
      console.error("Error loading stored preferences:", error);
    }
  }, []);

  // Calculate match score for an event
  const calculateMatchScore = useCallback(
    (event: typeof sampleEventsData[0]): { score: number; reasons: string[] } => {
      let score = 0;
      const reasons: string[] = [];

      // Interest matching (up to 40 points)
      const userTags = userInterests.flatMap(
        (i) => interestToTagsMap[i.interest] || []
      );
      const matchingTags = event.tags.filter((tag) =>
        userTags.some((ut) => ut.toLowerCase().includes(tag.toLowerCase()) || 
                              tag.toLowerCase().includes(ut.toLowerCase()))
      );
      if (matchingTags.length > 0) {
        score += Math.min(40, matchingTags.length * 15);
        reasons.push(`Matches your interests`);
      }

      // Location matching (up to 30 points)
      if (userLocation) {
        if (
          userLocation.city &&
          event.location.toLowerCase().includes(userLocation.city.toLowerCase())
        ) {
          score += 30;
          reasons.push(`Near you in ${userLocation.city}`);
        } else if (
          userLocation.country &&
          event.location.toLowerCase().includes(userLocation.country.toLowerCase())
        ) {
          score += 15;
          reasons.push(`In your country`);
        }
      }

      // Past attendance patterns (up to 20 points)
      const attendedCategories = sampleEventsData
        .filter((e) => pastEventIds.includes(e.id))
        .map((e) => e.category);
      
      if (attendedCategories.includes(event.category)) {
        score += 20;
        reasons.push(`Similar to events you've attended`);
      }

      // Popularity bonus (up to 10 points)
      if (event.attendees > 100) {
        score += 10;
        reasons.push("Popular event");
      } else if (event.attendees > 50) {
        score += 5;
      }

      // Games/VibeTags bonus (5 points each)
      if (event.hasGames) {
        score += 5;
      }
      if (event.hasVibeTag) {
        score += 5;
      }

      return { score, reasons };
    },
    [userInterests, userLocation, pastEventIds]
  );

  // Main discovery algorithm
  const discoverEvents = useCallback(() => {
    const scoredEvents = sampleEventsData.map((event) => {
      const { score, reasons } = calculateMatchScore(event);
      return {
        id: event.id,
        title: event.title,
        date: event.date,
        location: event.location,
        image: event.image,
        attendees: event.attendees,
        hasGames: event.hasGames,
        hasVibeTag: event.hasVibeTag,
        colorAccent: event.colorAccent,
        matchScore: score,
        matchReasons: reasons,
      };
    });

    // Sort by match score (descending)
    scoredEvents.sort((a, b) => b.matchScore - a.matchScore);

    setEvents(scoredEvents);
    setIsLoading(false);
  }, [calculateMatchScore]);

  // Save user interests
  const saveInterests = (interests: string[]) => {
    localStorage.setItem("nextvibe_interests", JSON.stringify(interests));
    setUserInterests(interests.map((i, idx) => ({ id: String(idx), interest: i })));
  };

  // Save user location
  const saveLocation = (city: string, country: string) => {
    const location = { city, country };
    localStorage.setItem("nextvibe_location", JSON.stringify(location));
    setUserLocation(location);
  };

  // Initialize
  useEffect(() => {
    loadStoredPreferences();
    
    // Show all events sorted by popularity as default
    const defaultEvents = sampleEventsData.map((event) => ({
      id: event.id,
      title: event.title,
      date: event.date,
      location: event.location,
      image: event.image,
      attendees: event.attendees,
      hasGames: event.hasGames,
      hasVibeTag: event.hasVibeTag,
      colorAccent: event.colorAccent,
      matchScore: event.attendees,
      matchReasons: [] as string[],
    }));
    defaultEvents.sort((a, b) => b.attendees - a.attendees);
    setEvents(defaultEvents);
    setIsLoading(false);
  }, [loadStoredPreferences]);

  // Recalculate when data changes
  useEffect(() => {
    if (!isLoading && (userInterests.length > 0 || userLocation || pastEventIds.length > 0)) {
      discoverEvents();
    }
  }, [userInterests, userLocation, pastEventIds, isLoading, discoverEvents]);

  return {
    events,
    isLoading,
    userInterests,
    userLocation,
    saveInterests,
    saveLocation,
    refetch: discoverEvents,
  };
}
