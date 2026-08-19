# Agency Landing — Sirketim Web Template

A clean, modern one-page landing site for agencies, design studios,
freelancers, and small businesses. Sections: sticky nav, hero, services,
work/portfolio grid, testimonials, call-to-action, footer.

This is a **Sirketim product** (`products/web-templates/agency-landing/`),
not a client project — it's meant to be sold as a reusable starting point,
then customized by whoever buys it.

## Stack

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)-style components (`Button`, `Card`)
- [lucide-react](https://lucide.dev/) for icons
- No backend, database, or auth — this is a static marketing page template. If a buyer needs a contact form that actually submits somewhere, that's an easy addition (e.g. a Next.js Route Handler + email provider, or a form service like Formspree) but is intentionally left out to keep the template a zero-dependency starting point.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint      # eslint
```

## Structure

```
app/
  layout.tsx        # root layout, fonts, metadata
  page.tsx           # assembles all sections
  globals.css        # Tailwind base + CSS theme variables
components/
  ui/                # shadcn-style primitives (button, card)
  sections/           # navbar, hero, features, work, testimonials, cta, footer
lib/
  utils.ts            # cn() class-merge helper
```

## Customizing for a buyer

- **Colors/theme**: edit the HSL CSS variables in `app/globals.css` (`--primary`, `--secondary`, `--accent`, etc.) — every component reads from these, so a palette swap is a one-file change.
- **Fonts**: swap the `Inter` import in `app/layout.tsx` for any other `next/font/google` font.
- **Copy**: all placeholder text (hero headline, service descriptions, testimonials, project names) lives directly in the section components under `components/sections/` — no CMS, just edit the arrays/JSX.
- **Images**: the `Work` section currently uses styled placeholder tiles instead of real images so the template has no external image dependencies out of the box. Replace the placeholder `div` in `components/sections/work.tsx` with `next/image` and real project photos.
- **Sections**: add/remove/reorder sections by editing the import list in `app/page.tsx`.
- **Contact form**: the CTA button currently points at a `mailto:` link as a zero-config default — swap for a real form/route handler if the buyer wants inline submission.

## License

Not yet defined — add a license file (e.g. a standard "single-site use" template license) before this goes up on a marketplace.
