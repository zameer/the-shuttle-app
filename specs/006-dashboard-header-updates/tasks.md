---
description: "Task list for Admin Filter and Player Header Updates"
---

# Tasks: Admin Filter and Player Header Updates

**Input**: Design documents from `/specs/006-dashboard-header-updates/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the new `header/` directory and shared types file that US2 and US3 components depend on.

- [X] T001 Create `src/features/players/header/types.ts` with `Quote`, `Announcement`, and `Sponsor` TypeScript interfaces; export `QUOTES`, `ANNOUNCEMENTS`, and `SPONSORS` static arrays with sample data per data-model.md

**Checkpoint**: `types.ts` exists and compiles — US2 and US3 components can now import from it.

---

## Phase 2: Foundational (Blocking Prerequisites)

No foundational phase needed — this feature touches two independent areas (admin and public)
with no shared blocking prerequisite beyond Phase 1.

---

## Phase 3: User Story 1 — Remove Admin Dashboard Date Filter (Priority: P1) 🎯 MVP

**Goal**: Admin dashboard page displays today's metrics on load with no date-navigation UI.

**Independent Test**: Log in as admin, navigate to `/admin`, confirm no Prev/Next buttons or date
display text is present, and confirm metrics cards render immediately without user interaction.

- [X] T002 [US1] Modify `src/features/admin/AdminDashboardPage.tsx`: remove `selectedDate` useState and `setSelectedDate`; replace `format(selectedDate, 'yyyy-MM-dd')` with `format(new Date(), 'yyyy-MM-dd')` computed inline; remove unused `useState`, `subDays`, and `addDays` imports
- [X] T003 [US1] Modify `src/features/admin/AdminDashboardPage.tsx`: delete the date-navigation JSX block (the `<div>` containing Prev button, date `<span>`, and Next button) from the header row per `contracts/AdminDashboardUI.ts`
- [X] T004 [US1] Run `npm run lint` and fix any errors introduced by the AdminDashboardPage changes

**US1 complete when**: Admin dashboard loads today's metrics with no date controls visible; lint passes.

---

## Phase 4: User Story 2 — Quote and Notifications Area in Player Header (Priority: P2)

**Goal**: Player calendar page header shows a motivational quote and a bell icon with announcement popover.

**Independent Test**: Open `/` as a player; confirm quote text is visible in the blue header bar;
click the bell icon and verify a popover opens; press Escape to close it; resize to 375 px and
confirm both areas remain readable with no layout overlap.

- [X] T005 [P] [US2] Create `src/features/players/header/QuoteArea.tsx`: accepts `QuoteAreaProps` (quote: Quote) from `types.ts`; renders quote text and optional author; returns null when quote text is empty; styled with Tailwind for readability on blue-600 background (white/blue-100 text, ≥4.5:1 contrast); truncates on mobile (≥375 px), wraps on larger screens per `contracts/PublicHeaderUI.ts`
- [X] T006 [P] [US2] Create `src/features/players/header/BellNotification.tsx`: accepts `BellNotificationProps` (announcements: Announcement[]) from `types.ts`; uses shadcn/ui `Popover` + `PopoverTrigger` + `PopoverContent`; bell button has `aria-label="Notifications"`; renders numeric badge (capped at "9+") when announcements non-empty, no badge when empty; popover lists each announcement (title bold, date, body) or shows "No announcements" when empty; closes on Escape / outside click via shadcn behaviour per `contracts/PublicHeaderUI.ts`
- [X] T007 [US2] Modify `src/layouts/PublicLayout.tsx`: import `QuoteArea` and `BellNotification` from `src/features/players/header/`; import `QUOTES` and `ANNOUNCEMENTS` from `src/features/players/header/types`; compute `selectedQuote` using day-of-year index (`QUOTES[dayOfYear(new Date()) % QUOTES.length]`); add `QuoteArea` and `BellNotification` inside the existing `<header>` element below the subtitle line, with bell right-aligned; use flexbox to keep quote and bell on the same row, wrapping gracefully on narrow screens
- [X] T008 [US2] Run `npm run lint` and fix any errors introduced by QuoteArea, BellNotification, and PublicLayout changes

**US2 complete when**: Quote and bell appear in the player header across all three breakpoints; lint passes.

---

## Phase 5: User Story 3 — Sponsors Section Below Player Header (Priority: P3)

**Goal**: A clearly labelled sponsors showcase section appears directly below the player page header.

**Independent Test**: Open `/` as a player; confirm an "Our Sponsors" labelled section is visible
immediately below the blue header; with `SPONSORS = []` confirm a "No current sponsors" fallback
renders; with sponsors populated confirm each card shows logo or name text, and linked cards open
the sponsor website; resize to 375 px and confirm the row scrolls horizontally without layout
breakage.

- [X] T009 [US3] Create `src/features/players/header/SponsorsSection.tsx`: accepts `SponsorsSectionProps` (sponsors: Sponsor[]) from `types.ts`; renders "Our Sponsors" label; when array empty, renders "No current sponsors" fallback text (no blank space); when non-empty, renders horizontal flex row of sponsor cards; each card shows `<img alt={name}>` if `logoUrl` provided else `name` text; wraps card in `<a target="_blank" rel="noopener noreferrer">` if `websiteUrl` provided; horizontal scroll on mobile (≥375 px), flex-wrap on ≥768 px, centred max-width 1400 px on ≥1280 px; section background separates visually from blue header (white/gray-50 + border-bottom) per `contracts/PublicHeaderUI.ts`
- [X] T010 [US3] Modify `src/layouts/PublicLayout.tsx`: import `SponsorsSection` and `SPONSORS` from `src/features/players/header/`; render `<SponsorsSection sponsors={SPONSORS} />` as a direct sibling element between `<header>` and `<main>` (not inside either)
- [X] T011 [US3] Run `npm run lint` and fix any errors introduced by SponsorsSection and PublicLayout changes

**US3 complete when**: Sponsors section renders below the header with fallback and populated states working across all breakpoints; lint passes.

---

## Final Phase: Polish & Cross-Cutting Concerns

- [X] T012 [P] Visual verification at 375 px — open `/admin` and `/` in browser at 375 px width; confirm no date filter on admin dashboard; confirm quote + bell readable and non-overlapping in player header; confirm sponsors section horizontally scrollable and not clipped
- [X] T013 [P] Visual verification at 768 px and 1280 px — confirm quote wraps naturally, bell badge visible, sponsors flex-wrap on tablet and centred on desktop
- [X] T014 Run final `npm run lint` across all changed files; confirm zero errors before marking feature complete

---

## Dependencies

```
T001 (types.ts)
  └── T005 (QuoteArea)        ← parallel with T006
  └── T006 (BellNotification) ← parallel with T005
        └── T007 (PublicLayout US2 integration)
              └── T008 (lint US2)
  └── T009 (SponsorsSection)
        └── T010 (PublicLayout US3 integration)
              └── T011 (lint US3)

T002 → T003 → T004 (US1 — independent of T001+)

T008 + T011 + T004 → T012 → T013 → T014
```

## Parallel Execution Examples

**Session A (US1)**: T002 → T003 → T004  
**Session B (US2 components)**: T001 → T005 and T006 (parallel) → T007 → T008  
**Session C (US3 component)**: after T001 → T009 → T010 → T011  

Sessions A and B/C are fully independent and can run simultaneously.

## Implementation Strategy

1. **MVP = US1 only** (T002–T004): Smallest diff, immediately improves admin UX. Ship-ready on its own.
2. **Increment 2 = US2** (T001, T005–T008): Adds informational value to the player header.
3. **Increment 3 = US3** (T009–T011): Adds sponsor visibility without affecting core booking flows.
4. **Final polish** (T012–T014): Cross-breakpoint verification and final lint gate.
