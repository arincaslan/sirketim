/**
 * Signature micro-interaction: a fixed, ultra-subtle film-grain texture over
 * the whole site. Fragrance/small-batch positioning reads as tactile and
 * paper-like (warm cream palette, serif display type), so a faint grain adds
 * that print-like texture without competing with the existing Framer Motion
 * work (hover-lift, stagger reveals, cart badge). It's a static SVG noise
 * pattern layered with `mix-blend-mode: overlay` at very low opacity, purely
 * decorative (`aria-hidden`, `pointer-events-none`), so it never affects
 * product photo color perception or blocks interaction/hit targets.
 */
export function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] opacity-[0.035] mix-blend-overlay"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E\")",
        backgroundRepeat: "repeat",
      }}
    />
  );
}
