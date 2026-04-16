/**
 * UI Contract: Public Player Header
 * Feature: 006-dashboard-header-updates
 *
 * Defines the prop interfaces and behavioural contract for the three new
 * components added to the player-facing public layout header area.
 */

import type { Quote, Announcement, Sponsor } from '../../../src/features/players/header/types'

// ---------------------------------------------------------------------------
// QuoteArea
// ---------------------------------------------------------------------------

/**
 * Displays a single motivational quote in the public page header.
 *
 * Placement: inline within the existing `<header>` blue bar in PublicLayout,
 * below the "THE SHUTTLE" h1 and the subtitle line.
 *
 * Responsive behaviour:
 *   - ≥375 px  : single line, truncated with ellipsis if > 200 chars visible
 *   - ≥768 px  : full text, no truncation (wraps to two lines max)
 *   - ≥1280 px : same as ≥768 px, no additional change
 */
export interface QuoteAreaProps {
  /** The quote to display. Passed from PublicLayout using day-of-year selection. */
  quote: Quote
}

/**
 * Acceptance criteria:
 * - When `quote.text` is provided, it is displayed in a `<p>` or `<blockquote>`.
 * - When `quote.author` is provided, it is displayed below the text prefixed with "— ".
 * - When `quote.text` is empty or undefined, nothing is rendered (component returns null).
 * - Text colour must remain readable against the blue-600 header background
 *   (white or blue-100 recommended; contrast ≥ 4.5:1 per WCAG 2.1 AA).
 */

// ---------------------------------------------------------------------------
// BellNotification
// ---------------------------------------------------------------------------

/**
 * Bell icon button that opens a shadcn/ui Popover listing current announcements.
 *
 * Placement: far-right of the public header bar, visually aligned with the
 * "THE SHUTTLE" h1.
 *
 * Responsive behaviour:
 *   - All breakpoints: icon is always visible; badge overlays icon top-right.
 *   - Popover anchors to the bell button; max-width 320 px, scrollable if > 5 items.
 */
export interface BellNotificationProps {
  /** List of current announcements. Pass ANNOUNCEMENTS from types.ts. */
  announcements: Announcement[]
}

/**
 * Acceptance criteria:
 * - When `announcements` is empty:
 *     - Bell icon is rendered with no badge.
 *     - Popover content shows "No announcements" text.
 * - When `announcements` is non-empty:
 *     - Bell icon shows a numeric badge; displays "9+" when count > 9.
 *     - Popover lists each announcement with `title` (bold), `date`, and `body`.
 * - Popover opens on button click and closes on Escape key or outside click.
 * - Bell button has `aria-label="Notifications"`.
 * - Badge is `aria-hidden="true"` (count communicated via aria-label on button).
 */

// ---------------------------------------------------------------------------
// SponsorsSection
// ---------------------------------------------------------------------------

/**
 * Sponsor showcase section rendered directly below the `<header>` element
 * in PublicLayout, above the `<main>` content area.
 *
 * Layout pattern: horizontal flex row of sponsor cards.
 *
 * Responsive behaviour:
 *   - ≥375 px  : horizontally scrollable row; each card min-width 100 px.
 *   - ≥768 px  : flex-wrap allowed; cards grow to fill available width.
 *   - ≥1280 px : centred row, max-width matches the main content container (1400 px).
 *
 * Section is always rendered (per FR-009: fallback state must not leave broken space).
 */
export interface SponsorsSectionProps {
  /** List of sponsors to display. Pass SPONSORS from types.ts. */
  sponsors: Sponsor[]
}

/**
 * Acceptance criteria:
 * - Section has a visible "Our Sponsors" label (muted, smaller text).
 * - When `sponsors` is empty:
 *     - Section renders a neutral fallback: "No current sponsors" text.
 *     - Fallback does NOT leave a blank strip with empty broken space.
 * - When `sponsors` is non-empty:
 *     - Each sponsor renders as a card.
 *     - If `logoUrl` is provided, an `<img>` is rendered with `alt={sponsor.name}`.
 *     - If `logoUrl` is absent, `sponsor.name` text is rendered as the card content.
 *     - If `websiteUrl` is provided, the card is wrapped in `<a>` with
 *       `target="_blank"` and `rel="noopener noreferrer"`.
 * - Sponsor section background must visually separate from the blue header
 *   (e.g., white or gray-50 background with a thin border-bottom).
 */
