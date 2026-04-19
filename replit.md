# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: Clerk (Google OAuth + email)
- **AI**: Google Gemini Vision (via Replit AI Integrations)

## Artifacts

### calorie-detector (React + Vite, preview path: /)
AI-powered calorie detector and daily food journal. Features:
- Clerk auth with Google OAuth
- Personalized greeting by time of day using user's first name
- Food detection via Gemini Vision AI (take photo or upload from gallery)
- Goal selector: Weight Loss / Balanced / Weight Gain
- Manual Indian food dropdown with 70+ Indian foods/beverages
- Daily calorie tracker with entry deletion
- Minimalist earthy green color theme

### api-server (Express 5, path: /api)
Backend REST API serving the calorie detector frontend.
- Routes: /api/food/analyze, /api/food/entries, /api/food/daily-summary
- Uses Gemini gemini-2.5-flash for food image analysis
- PostgreSQL via Drizzle ORM

## Database Schema

- `food_entries` — user food log entries with calories, macros, goal, and optional image

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Important Notes

- After running codegen (orval), manually fix `lib/api-zod/src/index.ts` to only export from `./generated/api` (not `./generated/types`) to avoid duplicate export errors.
- The `@google/genai` package must be installed as a direct dependency of `api-server` since it's externalized in esbuild but needed at runtime.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
