# Paws & Prefs

A modern, interactive cat-swiping application built with Next.js 16, React 19, and Framer Motion.

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router)
- **UI & State:** React 19 (Client-side swiping logic)
- **Animations:** Framer Motion (Gesture-based swiping and transitions)
- **Styling:** Tailwind CSS 4.0
- **Icons:** Lucide React
- **Data Source:** [CATAAS (Cat as a Service)](https://cataas.com)
- **Deployment:** Configured for static export (`output: 'export'`)

## Project Structure

- `app/page.tsx`: The main application entry point. Contains the swiping logic and the `SwipeCard` sub-component.
- `hooks/useCats.ts`: Custom hook for fetching and formatting cat data from the API.
- `components/MatchSummary.tsx`: Displays the final results (liked cats) after all cards are swiped.
- `app/layout.tsx`: Global layout, fonts, and styles.
- `next.config.ts`: Configuration for static exports and unoptimized images for external URLs.

## Development Guidelines

- **Styling:** Use Tailwind CSS 4 utility classes. The project uses the new CSS-first configuration in `app/globals.css`.
- **Animations:** All gestures and card transitions should use Framer Motion's `AnimatePresence` and `motion` components.
- **Data Fetching:** Use the `useCats` hook for all cat-related data retrieval.
- **Component Design:** The `SwipeCard` logic is currently encapsulated within `app/page.tsx` for tight state integration with the swiping engine.
- **Builds:** The project is designed for static export. Ensure any new features are compatible with `next export`.

## Key Logic

- **Swiping:** Managed via `framer-motion`'s `drag` gesture. `handleSwipe` determines the direction (left for dislike, right for like) and updates the `liked` and `swiped` states.
- **Transitions:** Uses `AnimatePresence` with `custom` variants to ensure smooth exit animations in the correct direction regardless of state timing.
- **Results:** The app transitions to the `MatchSummary` component once all fetched cats have been swiped.
