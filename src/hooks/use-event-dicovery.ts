import { useMemo } from "react";

interface UserInterest {
  id: string;
  interest: string;
}

export function useEventDiscovery() {
  const userInterests = useMemo<UserInterest[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("nextvibe_interests");
      if (!stored) return [];
      const interests = JSON.parse(stored) as string[];
      return interests.map((i, idx) => ({ id: String(idx), interest: i }));
    } catch {
      return [];
    }
  }, []);

  return { userInterests };
}
