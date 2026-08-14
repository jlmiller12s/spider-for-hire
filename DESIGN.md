# Design System — Spider for Hire

## Product Context
- **What this is:** A local booking website for an independent Spider-Man-inspired character performer.
- **Who it's for:** Parents planning children's birthdays, plus schools, hospitals, nonprofits, and community organizers.
- **Project type:** Conversion-focused marketing site with a playful arcade interface.

## Aesthetic Direction
- **Direction:** Spider for Hire HQ — a retro-futuristic pixel mission console layered over cinematic real-world photography.
- **Decoration level:** Expressive, using scanlines, web grids, hard shadows, pixel corners, and status indicators.
- **Mood:** Energetic and memorable for kids, trustworthy and easy to scan for parents.

## Typography
- **Display/Hero:** Bungee — bold comic energy without imitating licensed wordmarks.
- **UI/Labels:** Silkscreen — compact pixel-game flavor for navigation and controls.
- **Body:** Atkinson Hyperlegible — friendly, highly readable, and accessible.
- **Loading:** Google Fonts with display swap.

## Color
- **Approach:** Expressive primary colors anchored by midnight navy.
- **Hero red:** `#F04444`
- **Web blue:** `#35A7FF`
- **Signal yellow:** `#FFD166`
- **Paper:** `#F8F3E8`
- **Ink:** `#080D17`
- **Panel:** `#111C2E`

## Spacing and Layout
- **Base unit:** 8px, comfortable density.
- **Layout:** Hybrid 12-column grid with occasional overlaps and diagonal accents.
- **Max content width:** 1240px.
- **Corners:** Mostly clipped/pixel corners, not rounded cards.

## Motion
- **Approach:** Expressive GSAP choreography with Lenis smoothing.
- **Behaviors:** Loading boot sequence, hero reveal, pinned story beats, subtle parallax, hover responses.
- **Accessibility:** All nonessential movement is removed when reduced motion is requested.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-08-13 | Use Spider for Hire as working name | Direct, memorable, and immediately explains the service |
| 2026-08-13 | Lead with affordability and performance quality | These are the two things the user wants parents to remember |
| 2026-08-13 | Do not publish without approval | User explicitly requested local review before any Vercel deployment |
