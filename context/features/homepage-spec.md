# Homepage

## Overview

Build the marketing homepage at `/` (root route) based on the prototype in `prototypes/homepage/`. Unauthenticated users land here; authenticated users are redirected to `/dashboard`.

## Route & Files

- `src/app/page.tsx` — server component, redirects authenticated users to `/dashboard`, renders page sections
- `src/components/home/NavBar.tsx` — client component (mobile menu toggle)
- `src/components/home/HeroSection.tsx` — server component wrapper
- `src/components/home/HeroChaosCanvas.tsx` — client component (requestAnimationFrame animation + mouse repel)
- `src/components/home/FeaturesSection.tsx` — server component
- `src/components/home/AiSection.tsx` — server component
- `src/components/home/PricingSection.tsx` — server component wrapper
- `src/components/home/PricingToggle.tsx` — client component (monthly/yearly toggle state)
- `src/components/home/FinalCta.tsx` — server component
- `src/components/home/Footer.tsx` — server component

## Sections

### NavBar
- Logo (DevStash icon + name) links to `/`
- Nav links: Features (`#features`), Pricing (`#pricing`)
- Actions: Sign In → `/sign-in`, Get Started → `/register`
- Sticky on scroll (adds background + border on scroll — client side)
- Mobile: hamburger toggles a dropdown with same links
- Use ShadCN `Button` for actions

### Hero
- Badge: "Developer Knowledge Hub"
- Headline: "Stop Losing Your Developer Knowledge" with gradient on second line
- Subtext from prototype
- CTA: "Start for Free" → `/register`, "See Features" → `#features`
- Visual: two boxes with arrow between them
  - Left box: animated chaos canvas (icons floating, mouse repel) — `HeroChaosCanvas` client component
  - Right box: static mini dashboard preview (sidebar dots + stat strip + mini cards) — pure HTML/Tailwind, no JS

### Features
- Section id `features`
- Heading + subtext
- 6-card responsive grid (1 col mobile, 2 col md, 3 col lg)
- Cards: Code Snippets, AI Prompts, Commands, Notes & Docs, Instant Search, Collections
- Each card: colored icon circle, title, description — accent color from prototype

### AI Section
- "Pro Feature" badge, heading, subtext
- Two-column layout (text left, code mockup right) — stacks on mobile
- Checklist: Auto-tagging, AI Summaries, Explain Code, Prompt Optimization
- Code mockup: macOS window dots + `useDebounce.ts` snippet with syntax coloring + AI Generated Tags strip
- Code mockup is decorative static HTML (no Monaco)

### Pricing
- Section id `pricing`
- Monthly / Yearly toggle — client component, updates Pro price display only
  - Monthly: $8/mo
  - Yearly: $6/mo (billed as $72/yr) with "Save 25%" badge
- Two cards: Free and Pro
- Free card: features list from prototype, "Get Started Free" → `/register`
- Pro card: "Most Popular" badge, features list, "Start Pro" → `/register?plan=pro`
- Use ShadCN `Card` for pricing cards, `Badge` for Most Popular / Pro Feature / Save 25%

### Final CTA
- Full-width dark section
- "Ready to Organize Your Knowledge?" heading
- "Get Started — It's Free" button → `/register`

### Footer
- Brand: logo + tagline "Store Smarter. Build Faster."
- Three link columns: Product (Features, Pricing), Company (About, Blog), Legal (Privacy, Terms)
- Footer links that have no real pages yet use `#` as placeholder
- Copyright line with current year (rendered server-side)

## Guidelines

- Tailwind CSS v4 only — no separate config file
- ShadCN `Button`, `Card`, `Badge` where applicable
- Dark background (`bg-background`) consistent with rest of app
- Gradient text uses CSS `bg-clip-text` with blue→cyan gradient matching prototype colors
- Scroll fade-in animations via CSS `@keyframes` + `IntersectionObserver` in a single client component `ScrollReveal` wrapper, or pure CSS `animation-timeline: view()` if supported
- No inline styles — use Tailwind arbitrary values for accent colors per card
- `HeroChaosCanvas` replicates the floating icon + mouse repel logic from `prototypes/homepage/script.js` using `useRef` / `useEffect` with `requestAnimationFrame`
- All buttons and links point to correct app routes (listed above); dead footer links use `#`
- Page should be fully responsive (mobile-first)
