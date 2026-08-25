/**
 * Shared affiliate-site-kit: renders a JSON-LD builder's output as a
 * <script type="application/ld+json"> tag. Content here is agent-authored,
 * not raw user input, but stringify safely regardless rather than
 * string-templating JSON by hand.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
