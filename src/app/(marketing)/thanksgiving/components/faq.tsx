import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What exactly do I pay for?",
    a: "One full NextVibe Thanksgiving package — VibeTag, postcards, family trivia, VibePod and analytics — at $29 instead of $58.",
  },
  {
    q: "We're Canadian — is this for us too?",
    a: "Absolutely. The package works the same for Canadian Thanksgiving and Friendsgiving. If your date has already passed this year, pick next year's date and your setup is ready well ahead.",
  },
  {
    q: "Why is it 50% off?",
    a: "We are onboarding our first 500 paying hosts. You get founder pricing, we get real celebrations to grow with.",
  },
  {
    q: "When does the price go back up?",
    a: "The moment the 500th spot is claimed, or on Thanksgiving Day — whichever comes first.",
  },
  {
    q: "Do I need my exact dinner date now?",
    a: "An approximate date is enough. It lets us time your setup reminders and event-day support.",
  },
  {
    q: "Do guests need to pay or install anything?",
    a: "No. They open your VibeTag link in any browser and start capturing — even the grandparents.",
  },
  {
    q: "How do relatives join?",
    a: "You share one VibeTag link — by text, on the invite, or a QR code on the fridge. One tap and they're in.",
  },
  {
    q: "Can guests upload videos?",
    a: "Yes. Photos and short videos are both supported as postcards.",
  },
  {
    q: "Is there an upload or guest limit?",
    a: "Guests are unlimited. Each guest can add up to 20 postcards per event so the gallery stays browsable.",
  },
  {
    q: "What happens to the gallery after the weekend?",
    a: "It stays live as your permanent memory bank — you keep access and can revisit or download it later.",
  },
  {
    q: "What is the cancellation or refund policy?",
    a: "Cancel before your VibeTag is designed and we refund in full. After setup begins we can move your date instead.",
  },
];

export default function FAQ() {
  return (
    <section className="border-t border-border/50 py-12 md:py-16">
      <div className="container px-4">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-extrabold tracking-tight md:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-center text-muted-foreground">
            Everything you need to know before reserving your spot.
          </p>

          <Accordion type="single" collapsible className="mt-8 w-full">
            {faqs.map(({ q, a }, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`}>
                <AccordionTrigger className="text-left font-semibold text-sm leading-snug hover:no-underline">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
