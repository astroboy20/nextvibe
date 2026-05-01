"use client";

import { CheckCircle, Gift, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import PricingSkeleton from "./skeleton";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DOLLAR_SIGN, NAIRA_SIGN } from "@/utils/constants";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const vibeTag = [
  {
    name: "Micro",
    NGN: 5000,
    NGN_ALT: 8000,
    features: ["1-100 Attendees", "Featured listing", "Targeted discovery"],
  },
  {
    name: "Small",
    NGN: 10000,
    NGN_ALT: 15000,
    features: ["101-500 Attendees", "Featured listing", "Targeted discovery"],
  },
  {
    name: "Medium",
    NGN: 20000,
    NGN_ALT: 30000,
    features: ["501-1001 Attendees", "Priority promotion", "Boosted reach"],
  },
  {
    name: "Large",
    NGN: 35000,
    NGN_ALT: 50000,
    features: ["1001-5000 Attendees", "Premium event placement", "Ad support"],
  },
  {
    name: "Enterprise",
    NGN: 50000,
    NGN_ALT: 75000,
    features: [
      "5000+ Attendees",
      "Sponsored event placement",
      "High-visibility campaign",
    ],
    type: "custom",
  },
];

const gamification = [
  {
    name: "Micro",
    NGN: 5000,
    NGN_ALT: 8000,
    extraGames: 2000,
    features: ["1-100 Attendees", "Basic gamification"],
  },
  {
    name: "Small",
    NGN: 10000,
    NGN_ALT: 15000,
    extraGames: 3500,
    features: ["101-500 Attendees", "Social sharing incentives", "Giveaways"],
  },
  {
    name: "Medium",
    NGN: 20000,
    NGN_ALT: 30000,
    extraGames: 6000,
    features: [
      "501-1001 Attendees",
      "Multi-level challenges",
      "VIP ticket contests",
    ],
  },
  {
    name: "Large",
    NGN: 35000,
    NGN_ALT: 50000,
    extraGames: 10000,
    features: [
      "1001-5000 Attendees",
      "Full-scale gamification",
      "Analytics dashboard",
    ],
  },
  {
    name: "Enterprise",
    NGN: 50000,
    NGN_ALT: 75000,
    extraGames: 15000,
    features: [
      "5000+ Attendees",
      "Advanced gamification",
      "Sponsored challenges",
    ],
    type: "custom",
  },
];

const megaBundle = [
  {
    name: "Micro",
    NGN: 8000,
    NGN_ALT: 12000,
    features: ["1-100 Attendees", "Featured listing", "Basic gamification"],
  },
  {
    name: "Small",
    NGN: 15000,
    NGN_ALT: 25000,
    features: [
      "101-500 Attendees",
      "Featured listing",
      "Social sharing incentives",
      "Giveaways",
    ],
  },
  {
    name: "Medium",
    NGN: 30000,
    NGN_ALT: 50000,
    features: [
      "501-1001 Attendees",
      "Priority promotion",
      "Multi-level challenges",
      "VIP ticket contests",
    ],
  },
  {
    name: "Large",
    NGN: 55000,
    NGN_ALT: 85000,
    features: [
      "1001-5000 Attendees",
      "Premium event placement",
      "Full-scale gamification",
      "Analytics dashboard",
    ],
  },
  {
    name: "Enterprise",
    NGN: 85000,
    NGN_ALT: 135000,
    features: [
      "5000+ Attendees",
      "Sponsored event placement",
      "Advanced gamification",
      "Sponsored challenges",
    ],
    type: "custom",
  },
];

function formatNumber(value: number) {
  return value.toLocaleString();
}

type TabType = "Vibe Tag" | "Gamification" | "Mega Bundle";

const PricingContent = () => {
  const [currency, setCurrency] = useState<"NGN" | "USD">("USD");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabType>("Vibe Tag");

  useEffect(() => {
    const fetchLocation = async () => {
      setLoading(true);
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data.country_code === "NG") {
          setCurrency("NGN");
        }
      } catch (error) {
        console.error("Error fetching location", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLocation();
  }, []);

  const items =
    tab === "Vibe Tag"
      ? vibeTag
      : tab === "Gamification"
      ? gamification
      : megaBundle;

  return (
    <div className="min-h-screen flex flex-col pt-40">
      {loading ? (
        <PricingSkeleton />
      ) : (
        <div className="max-w-5xl mx-auto w-full px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[#5B1A57] mb-4">
              Plans For Your Needs
            </h1>
            <p className="text-base md:text-lg text-[#4B4B4B] max-w-xl mx-auto">
              Select from the best plan, ensuring a perfect match. Need more or
              less? Customize your subscription for a seamless fit!
            </p>
          </div>

          {/* Tab toggle */}
          <div className="flex justify-center mb-10">
            <div className="flex items-center bg-gray-100 rounded-full p-1 gap-1">
              {(["Vibe Tag", "Gamification", "Mega Bundle"] as const).map(
                (t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer",
                      tab === t
                        ? "bg-[#5B1A57] text-white shadow-sm"
                        : "text-gray-500 hover:text-[#5B1A57]"
                    )}
                  >
                    {t === "Vibe Tag" ? (
                      <Zap className="w-4 h-4" />
                    ) : t === "Gamification" ? (
                      <Sparkles className="w-4 h-4" />
                    ) : (
                      <Gift className="w-4 h-4" />
                    )}
                    {t}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Ticketing note */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#FFEBEB] text-[#5B1A57] text-sm font-medium px-4 py-2 rounded-full">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Ticketing — 0% fee, you keep 100% for both free and paid events
            </div>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item, index) => {
              const isCustom = item.type === "custom";
              const extraGames = "extraGames" in item ? item.extraGames : null;

              return (
                <Card
                  key={index}
                  className={cn(
                    "relative rounded-2xl border p-6 flex flex-col shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
                    isCustom
                      ? "bg-[#5B1A57] border-[#5B1A57] text-white"
                      : "bg-white border-gray-200 text-gray-900"
                  )}
                >
                  {/* Icon avatar */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center mb-4",
                      isCustom ? "bg-white/20" : "bg-[#FFEBEB]"
                    )}
                  >
                    {isCustom ? (
                      <Sparkles className="w-5 h-5 text-white" />
                    ) : tab === "Mega Bundle" ? (
                      <Gift className="w-5 h-5 text-[#5B1A57]" />
                    ) : (
                      <Zap className="w-5 h-5 text-[#5B1A57]" />
                    )}
                  </div>

                  {/* Plan name */}
                  <p
                    className={cn(
                      "font-semibold text-base mb-5",
                      isCustom ? "text-white/80" : "text-gray-500"
                    )}
                  >
                    {item.name}
                  </p>

                  {/* Price */}
                  <div className="h-24 flex flex-col justify-start mb-1">
                    {isCustom ? (
                      <>
                        <span className="text-3xl font-semibold leading-tight">
                          Custom Pricing
                        </span>
                        <span
                          className={cn(
                            "text-xs mt-1",
                            isCustom ? "text-white/60" : "text-gray-400"
                          )}
                        >
                          / per event
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl font-semibold leading-tight">
                          {NAIRA_SIGN}
                          {formatNumber(item.NGN)}
                          <span className="text-xl text-gray-400 font-normal">
                            {" "}
                            / {NAIRA_SIGN}
                            {formatNumber(item.NGN_ALT)}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "text-xs mt-1",
                            isCustom ? "text-white/60" : "text-gray-400"
                          )}
                        >
                          / per event
                        </span>
                        {extraGames !== null && (
                          <span className="text-xs mt-1 text-[#5B1A57] font-medium">
                            + Extra Games: {NAIRA_SIGN}
                            {extraGames !== null &&
                              extraGames !== undefined &&
                              typeof extraGames === "number" ? formatNumber(extraGames) : ""}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* CTA */}
                  <Button
                    variant={isCustom ? "secondary" : "outline"}
                    className={cn(
                      "w-full rounded-lg font-medium mb-0 transition-all",
                      isCustom
                        ? "bg-white text-[#5B1A57] hover:bg-white/90"
                        : "border-gray-300 text-gray-800 hover:border-[#5B1A57] hover:text-[#5B1A57]"
                    )}
                    asChild
                  >
                    <Link
                      href={
                        isCustom ? "mailto:hi@nextvibe.co" : "/events/create"
                      }
                    >
                      Get Started
                    </Link>
                  </Button>

                  <Separator
                    className={cn("my-7", isCustom ? "bg-white/20" : "")}
                  />

                  {/* Features */}
                  <p
                    className={cn(
                      "text-sm font-semibold mb-4",
                      isCustom ? "text-white" : "text-gray-800"
                    )}
                  >
                    Features
                  </p>
                  <ul className="flex flex-col gap-3">
                    {item.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2.5">
                        <CheckCircle
                          className={cn(
                            "w-4 h-4 shrink-0",
                            isCustom ? "text-white/70" : "text-[#5B1A57]"
                          )}
                        />
                        <span
                          className={cn(
                            "text-sm",
                            isCustom ? "text-white/80" : "text-gray-600"
                          )}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>

          {/* Examples */}
          <div className="mt-14">
            <h2 className="text-center text-xl font-bold text-[#5B1A57] mb-6">
              Pricing Examples
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Birthday Party (40 pax)", price: 8000 },
                { label: "House Party (30 pax)", price: 8000 },
                { label: "Small Wedding (150 pax)", price: 25000 },
                { label: "Conference (300 pax)", price: 50000 },
                { label: "Concert (1,000 pax)", price: 85000 },
              ].map((example, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-[#FFEBEB] rounded-xl px-5 py-4"
                >
                  <span className="text-sm text-gray-700 font-medium">
                    {example.label}
                  </span>
                  <span className="text-sm font-bold text-[#5B1A57]">
                    {NAIRA_SIGN}
                    {formatNumber(example.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingContent;
