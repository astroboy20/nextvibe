/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Loader2, MapPin } from "lucide-react";

declare global {
  interface Window {
    google: any;
  }
}

interface AddressSearchProps {
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lon: number }) => void;
}

export default function AddressSearch({ value, onChange }: AddressSearchProps) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [debouncedValue] = useDebounce(value, 300);

  // 🔎 Fetch suggestions
  const fetchSuggestions = (input: string) => {
    if (!input || !window.google) return;

    setLoading(true);

    const service = new window.google.maps.places.AutocompleteService();

    service.getPlacePredictions(
      {
        input,
        types: ["geocode"],
        componentRestrictions: { country: "ng" },
      },
      (predictions = []) => {
        setSuggestions(predictions ?? []);
        setLoading(false);
        setOpen(true);
      }
    );
  };

  useEffect(() => {
    fetchSuggestions(debouncedValue);
  }, [debouncedValue]);

  // 📍 Get coordinates
  const handleSelect = (place: any) => {
    if (!window.google) {
      onChange(place.description);
      return;
    }

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode(
      { placeId: place.place_id },
      (results: any, status: any) => {
        if (status === "OK" && results?.[0]) {
          const location = results[0].geometry.location;

          onChange(place.description, {
            lat: location.lat(),
            lon: location.lng(),
          });
        } else {
          onChange(place.description);
        }
      }
    );

    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            placeholder="Enter an address"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#5B1A57] pr-10"
          />

          {loading && (
            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="p-0 w-(--radix-popover-trigger-width)"
        align="start"
      >
        <Command>
          <CommandEmpty>No location found.</CommandEmpty>

          <CommandGroup>
            {suggestions.map((place: any) => (
              <CommandItem
                key={place.place_id}
                onSelect={() => handleSelect(place)}
                className="flex gap-2 cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                {place.description}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
