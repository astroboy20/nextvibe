import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What do I get for $5 / ₦5,000?",
    a: "One full MEGA_BUNDLE_FULL package — VibeTags, Postcards, Gamification and VibePod — for one event at the tier you pick. You receive a redemption code by email and use it when you publish your event.",
  },
  {
    q: "Is there really only 1,000 spots?",
    a: "Yes. When all 1,000 are claimed the campaign closes. The spots counter reflects paid signups only — people currently at checkout also hold a spot, so it may fill before the counter reaches zero.",
  },
  {
    q: "How do I use the redemption code?",
    a: "Create your event on NextVibe, choose MEGA_BUNDLE_FULL at the plan-payment step, and enter your XMAS- code. The event publishes immediately at no further cost.",
  },
  {
    q: "Does the code work for any event tier?",
    a: "No. The code is locked to the tier you purchase. A SMALL code (51–200 guests) cannot be used on a MICRO or MEDIUM event. Pick the tier that matches your expected guest count.",
  },
  {
    q: "Can I buy more than one spot?",
    a: "One spot per email address. Use a different email address for each additional spot.",
  },
  {
    q: "When does my code expire?",
    a: "Codes do not expire and are single use. Use yours when you are ready to publish your event.",
  },
  {
    q: "I paid but did not receive the email — what do I do?",
    a: "Check your spam folder first. If nothing arrives within an hour, contact us at hello@mynextvibe.com with your payment reference.",
  },
  {
    q: "Do guests need to pay or install anything?",
    a: "No. Guests open your VibeTag link in any browser. No download, no account required.",
  },
  {
    q: "What is the cancellation policy?",
    a: "Because the redemption code is generated and emailed at payment confirmation, all sales are final. If you have an issue, contact hello@mynextvibe.com.",
  },
];

export default function FAQ() {
  return (
    <section className="border-t border-border/50 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-extrabold tracking-tight md:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-center text-muted-foreground">
            Everything you need to know before claiming your spot.
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
