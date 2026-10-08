/**
 * JsonLd — injects structured data (Schema.org JSON-LD) into the page <head>.
 * Rendered server-side so search engines and AI crawlers can parse it.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
