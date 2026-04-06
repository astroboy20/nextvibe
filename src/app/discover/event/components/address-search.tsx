/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState } from "react";
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

  // Separate internal input state so selecting doesn't re-trigger search
  const [inputValue, setInputValue] = useState(value);
  const isSelectingRef = useRef(false);

  const [debouncedValue] = useDebounce(inputValue, 300);

  // Sync external value into input only on mount or external reset
  useEffect(() => {
    if (!isSelectingRef.current) {
      setInputValue(value);
    }
  }, [value]);

  useEffect(() => {
    // Skip fetch if this change was caused by a selection
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      return;
    }

    if (!debouncedValue || !window.google) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions(
      {
        input: debouncedValue,
        types: ["geocode"],
        componentRestrictions: { country: "ng" },
      },
      (predictions: any[] | null) => {
        setSuggestions(predictions ?? []);
        setLoading(false);
        // Only open if there are actual results
        if (predictions && predictions.length > 0) {
          setOpen(true);
        }
      }
    );
  }, [debouncedValue]);

  const handleSelect = (place: any) => {
    // Mark as selecting so the debounce effect skips the next fetch
    isSelectingRef.current = true;

    setInputValue(place.description);
    setSuggestions([]);
    setOpen(false);

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
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative" onClick={(e) => e.preventDefault()}>
          <Input
            placeholder="Enter an address"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              onChange(e.target.value);
            }}
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
        onOpenAutoFocus={(e) => e.preventDefault()}
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
                <MapPin className="w-4 h-4 shrink-0" />
                {place.description}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
