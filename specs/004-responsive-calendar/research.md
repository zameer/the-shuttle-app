# Research: Responsive Player Calendar (Phase 0)

## Decision 1: Use mobile-first Tailwind utility classes for responsive layout
- Decision: Implement responsive behavior with Tailwind breakpoints (`sm`, `md`, `lg`, `xl`, `2xl`) and utility-first classes.
- Rationale: The project already uses Tailwind extensively, reducing implementation risk and ensuring consistency.
- Alternatives considered:
  - Custom CSS media queries in separate stylesheet: rejected due to style drift risk and added maintenance overhead.
  - CSS-in-JS responsive solution: rejected because it adds complexity and is inconsistent with current stack.

## Decision 2: Keep calendar scrolling internal to calendar container
- Decision: Constrain overflow to the calendar body with internal scrolling and sticky headers.
- Rationale: Matches UX requirement that the whole page should not scroll unnecessarily when browsing dense calendar content.
- Alternatives considered:
  - Page-level scrolling only: rejected because headers lose context while navigating time rows.
  - Fully fixed-height non-scroll calendar: rejected because dense booking content would clip or compress too much.

## Decision 3: Use fixed minimum touch targets and responsive typography
- Decision: Enforce minimum 44x44 interactive areas on mobile and minimum readable typography (`text-xs` baseline).
- Rationale: Aligns with usability and accessibility expectations for touch interfaces and spec success criteria.
- Alternatives considered:
  - Device-specific styles only: rejected due to brittle behavior and poor maintainability.
  - Uniform desktop sizing on mobile: rejected due to readability and tap precision issues.

## Decision 4: Preserve existing data flow and avoid API/schema changes
- Decision: Keep existing booking fetch and calendar rendering data contracts unchanged for this feature.
- Rationale: Feature scope is presentation/layout responsiveness; data model and persistence are out of scope.
- Alternatives considered:
  - New responsive-specific API endpoint: rejected as unnecessary for UI-only requirements.

## Constitution/Gate Clarification
- Observation: `.specify/memory/constitution.md` contains unresolved template placeholders.
- Decision: Treat constitution gates as provisional pass for this planning cycle and mark governance constraints as NEEDS CLARIFICATION for later project governance completion.
- Risk: Formal constitutional compliance cannot be strictly validated until constitution is finalized.
