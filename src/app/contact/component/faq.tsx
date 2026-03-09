"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What is Nextvibe?",
    answer:
      "Nextvibe is an event discovery, engagement, and ticketing platform that helps attendees find events, organizers sell out their tickets, and brands connect with live audiences through interactive experiences.",
  },
  {
    question: "What is NextvibePilot?",
    answer:
      "NextvibePilot is a gamified ticketing tool that allows event organizers to boost ticket sales using trivia, puzzles, and social challenges. It turns ticket sales into an interactive experience that increases engagement and drives conversions.",
  },
  {
    question: "How does NextvibePilot help me sell more tickets?",
    answer: (
      <>
        Instead of relying only on ads, NextvibePilot helps organizers:
        <br />
        <br />
        ✅ <strong>Gamify ticket giveaways</strong> to attract more attendees.
        <br />
        ✅ <strong>Encourage social sharing</strong> to increase event visibility.
        <br />
        ✅ <strong>Create fun, engaging challenges</strong> that turn potential attendees into ticket buyers.
      </>
    ),
  },
  {
    question: "Who can use NextvibePilot?",
    answer:
      "NextvibePilot is perfect for: Event organizers who want to sell more tickets. Concert & festival promoters looking to increase engagement. Brands that want to sponsor interactive ticketing experiences.",
  },
  {
    question: "What is NextvibePod?",
    answer:
      "NextvibePod is our event discovery tool that helps attendees find events based on location and interests. Whether it's a concert, rave, or conference, NextvibePod ensures you never miss out on the perfect vibe.",
  },
  {
    question: "How do I promote my event on Nextvibe?",
    answer:
      "Simply sign up, create your event, and activate NextvibePilot to start gamifying ticket sales and increasing engagement.",
  },
  {
    question: "Can I use Nextvibe if I'm not an event organizer?",
    answer: (
      <>
        Yes! As an attendee, you can:
        <br />
        <br />
        🎟️ <strong>Find and book events</strong> near you.
        <br />
        🎮 <strong>Play interactive games</strong> for ticket discounts.
        <br />
        📍 <strong>Discover new experiences</strong> based on your vibe!
      </>
    ),
  },
  {
    question: "How much does NextvibePilot cost?",
    answer: (
      <>
        Pricing depends on the size and type of your event. We offer flexible
        packages to suit both small and large-scale events.
        <br />
        <br />
        🔗 <strong>Contact us for pricing</strong>
      </>
    ),
  },
  {
    question: "What makes Nextvibe different from other event platforms?",
    answer: (
      <>
        Unlike traditional event platforms, Nextvibe offers:
        <br />
        <br />
        🚀 <strong>Gamified ticket sales</strong> (not just listing events).
        <br />
        🎯 <strong>Interest-based event discovery</strong> (personalized to you).
        <br />
        🔥 <strong>Social engagement tools</strong> to make events more interactive.
      </>
    ),
  },
  {
    question: "How do I get started?",
    answer: (
      <>
        <strong>Organizers:</strong> Sign up, create an event, and start selling
        tickets with NextvibePilot!
        <br />
        <br />
        <strong>Attendees:</strong> Browse NextvibePod and find your next event
        today!
      </>
    ),
  },
];

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="relative max-w-3xl mx-auto">
      {/* Decorative vertical line */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-linear-to-b from-[#5B1A57]/40 via-[#C00096]/20 to-transparent hidden sm:block" />

      <div className="flex flex-col gap-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={cn(
                "group relative sm:pl-16 transition-all duration-300"
              )}
            >
              {/* Index dot on the left line */}
              <div
                className={cn(
                  "absolute left-4.5p-5 w-4 h-4 rounded-full border-2 transition-all duration-300 hidden sm:flex items-center justify-center",
                  isOpen
                    ? "bg-[#5B1A57] border-[#5B1A57] scale-125"
                    : "bg-white border-[#5B1A57]/40 group-hover:border-[#5B1A57]"
                )}
              />

              <button
                onClick={() => toggle(index)}
                className={cn(
                  "w-full text-left rounded-2xl border transition-all duration-300 overflow-hidden",
                  isOpen
                    ? "border-[#5B1A57] bg-[#5B1A57]/4 shadow-md shadow-[#5B1A57]/10"
                    : "border-gray-200 bg-white hover:border-[#5B1A57]/40 hover:shadow-sm"
                )}
              >
                {/* Question row */}
                <div className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "text-xs font-bold tabular-nums transition-colors duration-300",
                        isOpen ? "text-[#5B1A57]" : "text-gray-300"
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "font-semibold text-sm sm:text-base transition-colors duration-300",
                        isOpen ? "text-[#5B1A57]" : "text-gray-800"
                      )}
                    >
                      {faq.question}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300",
                      isOpen
                        ? "bg-[#5B1A57] text-white"
                        : "bg-gray-100 text-gray-500 group-hover:bg-[#FFEBEB] group-hover:text-[#5B1A57]"
                    )}
                  >
                    {isOpen ? (
                      <Minus className="w-3.5 h-3.5" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                  </span>
                </div>

                {/* Answer */}
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 pt-0">
                      <div className="h-px bg-[#5B1A57]/10 mb-4" />
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}