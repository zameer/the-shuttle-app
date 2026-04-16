<!--
  SYNC IMPACT REPORT
  Version change: (none) → 1.0.0  (initial ratification)
  Modified principles: N/A (first constitution)
  Added sections: Core Principles, Technology Stack, Development Workflow, Governance
  Removed sections: N/A
  Templates requiring updates:
    ✅ .specify/templates/plan-template.md — Constitution Check gates align with principles below
    ✅ .specify/templates/spec-template.md — Scope/requirements sections align with Spec-First principle
    ✅ .specify/templates/tasks-template.md — Task types reflect component, type-safety, and security principles
  Follow-up TODOs: None — all placeholders resolved
-->

# The Shuttle KSC Constitution

## Core Principles

### I. Spec-First Development

Every feature MUST begin with a spec.md that defines user stories with independently testable
acceptance scenarios before any implementation work starts. Plan.md and tasks.md MUST be derived
from that spec. No code is written without an approved spec in `specs/###-feature-name/`.

Rationale: Prevents scope creep, keeps the team aligned on observable outcomes, and enables
parallel development across user stories.

### II. Type Safety (NON-NEGOTIABLE)

TypeScript strict mode MUST be active throughout the codebase. The use of `any` is prohibited
except at third-party library boundaries where no types are available, and MUST be accompanied
by an explanatory comment. All cross-boundary data (API responses, form submissions, URL params)
MUST be validated with Zod schemas before use. Typed interfaces MUST be co-located with the
feature that owns them.

Rationale: The Shuttle KSC handles financial data (LKR amounts, payment states) and booking
records; type errors at runtime in these domains are unacceptable.

### III. Component Reusability & Design Consistency

UI components MUST be built as composable, standalone units on top of shadcn/ui primitives.
Raw inline styles are prohibited; all styling MUST use Tailwind CSS utility classes. Shared
components (e.g., `Calendar`, `StatusBadge`) live under `src/components/shared/` and MUST NOT
embed business logic. Feature-specific components live under `src/features/`.

Rationale: Ensures a consistent visual language across admin and public views and avoids
duplicated, hard-to-maintain styling.

### IV. Data Integrity & Security

All database reads and writes MUST go through Supabase Row Level Security (RLS) policies.
Admin-only routes MUST be protected by the authentication guard at the router level. No
business logic (e.g., price calculations, booking overlap checks) may live exclusively in UI
components — it MUST live in a service or hook layer that can be tested independently of
rendering. Payment amounts MUST never be accepted from the client without server-side validation.

Rationale: Booking and payment data is sensitive; a misconfigured RLS policy or exposed
admin route would directly compromise business operations.

### V. Responsive & Accessible Design

All screens MUST be functional and visually correct at three breakpoints: mobile (≥375 px),
tablet (≥768 px), and desktop (≥1280 px). Interactive elements MUST meet WCAG 2.1 AA contrast
ratios and keyboard-navigability requirements. The calendar view MUST degrade gracefully on
small screens (e.g., switching from week/month to day-list layout).

Rationale: Players check available slots from mobile devices; admin may manage bookings from
a tablet. Inaccessible UI blocks real users.

## Technology Stack

- **Language**: TypeScript 6.0.2
- **UI Framework**: React 19.2.4 with Vite 8.0
- **Styling**: Tailwind CSS 3.4.17 + shadcn/ui
- **State / Data Fetching**: React Query 5.99.0, react-hook-form 7.72.1
- **Backend / Storage**: Supabase PostgreSQL with RLS; `@supabase/supabase-js` 2.103.0
- **Utilities**: date-fns 4.1.0, Zod 4.x, lucide-react 1.8, react-router-dom 7.x
- **Testing commands**: `npm test` (unit/integration), `npm run lint` (ESLint)

Deviations from this stack MUST be justified in the relevant plan.md and recorded here via a
constitution amendment before merging.

## Development Workflow

1. **Spec**: Run `/speckit.specify` — produces `specs/###/spec.md` with prioritized user stories.
2. **Plan**: Run `/speckit.plan` — produces research, data-model, contracts, and plan.md.
3. **Tasks**: Run `/speckit.tasks` — produces dependency-ordered tasks.md organized by user story.
4. **Implement**: Run `/speckit.implement` — executes tasks; each task is committed on completion.
5. **Lint gate**: `npm run lint` MUST pass with zero errors before marking a task complete.
6. **Branching**: Feature branches follow `###-kebab-feature-name` sequential numbering.

PRs MUST reference the spec user story they satisfy. Tasks labelled `[P]` in tasks.md may be
implemented in parallel by different sessions. No task may be marked complete while lint errors
remain in files it touched.

## Governance

This constitution supersedes all other development practices within the repository. Amendments
MUST be made via the `/speckit.constitution` command, which increments the version, produces a
Sync Impact Report, and propagates changes to dependent templates. The amendment MUST be
committed separately with the message format:

```
docs: amend constitution to vX.Y.Z (<one-line rationale>)
```

- **MAJOR** bump: removal or redefinition of an existing principle.
- **MINOR** bump: new principle or materially expanded section.
- **PATCH** bump: clarifications, wording, or non-semantic refinements.

Compliance is reviewed at the start of every `/speckit.plan` run via the Constitution Check gate
in plan.md. Any feature that cannot satisfy a principle MUST document an explicit exception in
its plan.md under a "Constitution Exceptions" heading before implementation begins.

**Version**: 1.0.0 | **Ratified**: 2026-04-12 | **Last Amended**: 2026-04-16
