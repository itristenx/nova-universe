# Unified ITSM App

Goal: Merge Core (admin), Pulse (technician), Orbit (end-user) into one Next.js app with role-based surfaces and Apple-inspired UI. PWA support for technicians.

## Tech
- Next.js 15 App Router
- TypeScript, TailwindCSS 4
- Design system aligned to Apple HIG patterns
- Auth via BFF + PKCE to Nova Helix

## Run
- dev: pnpm --filter unified-itsm dev
- build: pnpm --filter unified-itsm build
- start: pnpm --filter unified-itsm start