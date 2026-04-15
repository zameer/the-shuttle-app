# Implementation Plan: Badminton Booking App Architecture & Tech Stack

**Branch**: `001-booking-system-badminton` | **Date**: 2026-04-12 | **Spec**: [spec.md](spec.md)
**Input**: Built using `/plan` and provided user architecture constraints

## Summary

Build a mobile-browser-first, web-friendly badminton booking application. The app requires a Single Page Application (SPA) architecture with Progressive Web App (PWA) capabilities, optimized for 3G and unstable connections. It uses a BaaS-backed approach to leverage free-tier hosting and reduce backend maintenance. The app serves both players and admins from a single frontend and is designed for future extensibility (payments, tournaments, memberships).

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: React, Vite, React Router, TanStack Query, React Hook Form, Zod, shadcn/ui, Tailwind CSS, vite-plugin-pwa, Supabase-js
**Storage**: PostgreSQL (Supabase), Supabase Storage
**Testing**: Vitest, React Testing Library (Standard recommendations)
**Target Platform**: Mobile-first Web / PWA via Web Browser
**Project Type**: Single Page Application (SPA) with BaaS
**Performance Goals**: Fast initial load (Vite optimized), reliable on 3G connections (offline-tolerant)
**Constraints**: Free-tier hosting (Cloudflare Pages), single unified frontend codebase for both players and admins.
**Scale/Scope**: Realtime sync used minimally (only where truly needed). Extensible database schema.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*
Architecture aligns with free-tier constraints by leveraging fully managed BaaS (Supabase) + robust static CDN frontend hosting (Cloudflare Pages). Single frontend strategy perfectly maps to the requirement to avoid dual maintenance.

## Project Structure

### Documentation (this feature)

```text
specs/001-booking-system-badminton/
├── plan.md              # This file
├── spec.md              # Feature Specification
├── research.md          # Optional architecture details
├── data-model.md        # Optional schema design
├── quickstart.md        # Optional instructions
├── contracts/           # API definitions (if any abstractions used)
└── tasks.md             # Pending execution
```

### Source Code (repository root)

```text
# Single Frontend (Web application integrating directly with BaaS)
src/
├── assets/
├── components/
│   ├── ui/             # shadcn reusable components
│   └── shared/         # custom application-wide UI
├── features/           # Feature-based modular structure
│   ├── admin/          # Admin dash & metrics
│   ├── auth/           # Supabase Google SSO
│   ├── booking/        # Calendar, rates, workflow
│   └── players/        # Player public views
├── hooks/              # Global custom hooks (e.g., TanStack Query wrappers for Supabase)
├── layouts/            # Page shell layouts (AdminLayout, PublicLayout)
├── pages/              # React Router Views
├── services/           # Supabase client instantiation / raw fetch wrappers
└── utils/              # Data parsing, date-fns formats
public/                 # PWA manifest, service workers (vite-plugin-pwa), and icons
supabase/               # Supabase local config, edge functions, and SQL migrations
```

**Structure Decision**: 
A single frontend repository utilizing a feature-based modular structure, placed optimally at the root. The "backend" logic is kept inside the `supabase/` folder as SQL migrations and configuration, since the actual DB runs on Supabase. Server state (TanStack Query) is strictly separated from UI state (React context/props). Utilizing Cloudflare pages perfectly matches static Vite builds.
