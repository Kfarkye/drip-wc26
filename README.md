# The Drip WC26

Public-facing pages now run on Next.js App Router. The migrated SEO surface currently includes:

- `/`
- `/today`
- `/group/[letter]`
- `/match/[slug]`
- `/edges/[slug]`

## Commands

- `npm run dev` starts Next.js
- `npm run build` builds the Next.js app
- `npm run start` runs the Next.js production server
- `npm run lint` runs ESLint
- `npm run typecheck` runs the shared TypeScript check

## Legacy Vite Surface

The older Vite/React Router app is still present for reference while the migration settles, but it is no longer the primary app.

- `npm run legacy:dev`
- `npm run legacy:build`
- `npm run legacy:preview`
- `npm run legacy:prerender`

Legacy scripts are intentionally opt-in so the repo defaults stay aligned with the public Next.js app.
