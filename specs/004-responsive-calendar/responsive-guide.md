# Responsive Design Guide (T004)

## Breakpoint Strategy
- Mobile: 320px - 640px
- Tablet: 641px - 1024px
- Desktop: 1025px+

## Tailwind Breakpoints in Use
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Component Rules
1. Calendar container:
- Default `w-full`.
- Wider screens use constrained percentage widths to reduce edge-to-edge fatigue:
  - `md:w-[95%]`
  - `lg:w-[90%]`

2. Month grid:
- Keep 7-day semantics with responsive spacing/typography.
- Avoid forced minimum widths that create horizontal scrollbars.

3. Week grid:
- Use responsive side column widths:
  - `grid-cols-[56px_1fr]` mobile
  - `sm:grid-cols-[64px_1fr]`
  - `md:grid-cols-[80px_1fr]`

4. Booking cells:
- Touch target minimum: `min-h-[44px]`.
- Spacing scale:
  - mobile: `px-2 py-2`
  - tablet: `md:px-3 md:py-3`
  - desktop: `lg:px-4 lg:py-4`

5. Navigation controls:
- Mobile arrows: `h-10 w-10` (>= 44px target with surrounding padding).
- Desktop arrows: `md:h-8 md:w-8`.

## Typography Baseline
- Mobile minimum: `text-xs` (12px)
- Scale up progressively with `sm:text-sm`, `md:text-base` where needed.

## Scroll Behavior
- Calendar content area can scroll (`overflow-auto`).
- Avoid layout-level horizontal overflow unless content truly exceeds semantic constraints.

## Validation Checklist
- No unnecessary horizontal scrollbars at 320/375/768/1024/1920.
- Header and grid alignment preserved across breakpoints.
- Tap targets usable on touch devices.
- No clipping for day labels and booking content.
