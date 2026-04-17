# Implementation Plan: Mobile Booking Manage Sections

**Branch**: 015-init-speckit-feature | **Date**: 2026-04-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from /specs/015-booking-manage-mobile-sections/spec.md

## Summary

This feature restructures the booking manage screen for mobile and PWA usability by introducing progressive disclosure sections while keeping primary actions reachable. The recommended approach is to keep core summary content always visible (player info, status, contact details), collapse non-core sections by default, and use a sticky action bar for save and critical operations. The implementation is UI-focused and reuses existing booking hooks and mutation paths.

## Technical Context

**Language/Version**: TypeScript 6.0.2  
**Primary Dependencies**: React 19.2.4, Vite 8.0, Tailwind CSS 3.4.17, React Query 5.99.0, date-fns 4.1.0, lucide-react 1.8, shadcn/ui primitives already present  
**Storage**: Supabase PostgreSQL with RLS (no schema changes for this feature)  
**Testing**: npm run lint + manual mobile/PWA QA scenarios from quickstart.md  
**Target Platform**: Web PWA, mobile-first (phone and tablet), desktop-compatible  
**Project Type**: Single-project React web application  
**Performance Goals**: Maintain responsive interactions during section toggling; no perceptible delay for common admin update flow  
**Constraints**: Keep existing business logic in hooks/services; avoid introducing new packages for section behavior; preserve current booking mutation semantics  
**Scale/Scope**: BookingDetailsModal interaction restructure and related integration points in admin booking flow

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Spec-First**: specs/015-booking-manage-mobile-sections/spec.md exists and defines prioritized user stories plus acceptance scenarios.
- [x] **II. Type Safety**: No any-based plan changes; new UI state uses typed section identifiers and existing typed booking payloads.
- [x] **III. Component Reusability**: Work is centered on feature component updates with shared styling patterns; no duplicated business logic in UI rendering layer.
- [x] **IV. Data Integrity & Security**: No RLS or route guard changes; all booking updates continue via existing hook/service mutation flow.
- [x] **V. Responsive Design**: Explicit behavior targets for >=375px, >=768px, >=1280px are captured in contracts and quickstart validation.

No constitution exceptions are required.

## Project Structure

### Documentation (this feature)

```text
specs/015-booking-manage-mobile-sections/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-mobile-booking-manage-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── features/
│   ├── booking/
│   │   └── BookingDetailsModal.tsx
│   └── admin/
│       └── AdminCalendarPage.tsx
├── components/
│   └── shared/
└── hooks/

tests/
└── (existing test structure; no new framework)
```

**Structure Decision**: Single-project web app structure. Primary implementation will be in BookingDetailsModal with minimal integration adjustments in admin booking entry points and existing hook usage.

## Phase 0: Research

Research outcomes are documented in [research.md](research.md).  
All technical unknowns are resolved, including default-visible content scope, section behavior contract, sticky action strategy, and PWA orientation/session continuity expectations.

## Phase 1: Design Artifacts

Generated artifacts:
- [data-model.md](data-model.md)
- [contracts/ui-mobile-booking-manage-contract.md](contracts/ui-mobile-booking-manage-contract.md)
- [quickstart.md](quickstart.md)

### Constitution Re-check (Post-Design)

- [x] Principle I remains satisfied with full traceability to feature spec.
- [x] Principle II remains satisfied with typed UI state model and existing typed booking contracts.
- [x] Principle III remains satisfied by extending current feature component rather than duplicating modal implementations.
- [x] Principle IV remains satisfied because data access patterns and RLS boundaries are unchanged.
- [x] Principle V remains satisfied via explicit responsive and PWA behavior contracts plus validation steps.

No post-design gate failures identified.
