# Feature Specification: Player Rules — Prominent Banner and Categorised Detail Modal

**Feature Branch**: `008-player-rules-modal`
**Created**: 2026-04-16
**Status**: Draft
**Input**: User description: "player calendar page, rules very important and attention is very high, a modal popup for rule detail is preferred. In player rule detail modal, prefer categorized by section and on click load detail. detail rule page should support formatting as well, now it is only text."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Prominent Rules Banner (Priority: P1)

As a player, I see a compact, attention-grabbing rules banner at the top of the calendar page —
with the most critical rules summarised as icon-and-label chips — so I am immediately aware of
the court's most important conduct requirements when the page loads.

**Why this priority**: Court rules are non-negotiable for the club's residential-area setting.
Players must be aware of them before booking or playing. A highly visible banner at the top of
the page ensures rules are seen on every visit without requiring any extra interaction.

**Independent Test**: Open the player calendar page. The rules banner (titled "IMPORTANT –
PLEASE FOLLOW THE RULES") is immediately visible between the sponsors area and the calendar.
Each rule chip displays an icon and a short label.

**Acceptance Scenarios**:

1. **Given** a player opens the calendar page, **When** the page loads, **Then** a rules banner
   is immediately visible between the sponsors area and the calendar, showing condensed rules
   as icon-and-label chips.
2. **Given** the rules banner is visible, **When** the player views it, **Then** it includes a
   "View Full Rules" action that opens the rules detail modal.
3. **Given** no rules are configured, **When** the calendar page loads, **Then** the banner
   does not render (no empty box).

---

### User Story 2 - Categorised Rules Detail Modal with Formatted Content (Priority: P2)

As a player, I can open a full rules view in a modal — either from the "Rules" button in the
header or the "View Full Rules" link in the sticky banner — where rules are organised by named
sections and clicking a section reveals its formatted detail content.

**Why this priority**: The modal lets players read the full rules without leaving the calendar.
The section/accordion approach makes long rule lists digestible. Formatting support (bold, lists,
emphasis) makes each rule clearer than a wall of plain text.

**Independent Test**: Click the "Rules" button in the header. A modal opens. At least two named
sections are listed (e.g., "Noise & Conduct", "Dress Code"). Click a section header — its
formatted detail content expands. Click it again — it collapses. The modal closes on Escape or
by clicking the close button.

**Acceptance Scenarios**:

1. **Given** the player is on the calendar page, **When** they click the "Rules" button in the
   header, **Then** a modal dialog opens displaying the court rules.
2. **Given** the rules modal is open, **When** the player views it, **Then** rules are displayed
   as a list of named sections with titles and icons.
3. **Given** a section is shown in the modal, **When** the player clicks its header, **Then**
   the detail content for that section expands in place below the header.
4. **Given** a section is expanded, **When** the player clicks its header again, **Then** the
   section collapses.
5. **Given** detail content contains formatted text (bold, bullet lists, line breaks), **When**
   the modal renders it, **Then** the formatting is reflected visually — raw markup is never
   shown to the player.
6. **Given** the rules modal is open, **When** the player presses Escape or clicks the close
   button, **Then** the modal closes and focus returns to the triggering element.
7. **Given** the player clicks "View Full Rules" on the rules banner, **When** the modal
   opens, **Then** it shows the same categorised rules detail.

---

### User Story 3 - Admin Can Manage Court Rules (Priority: P2)

As an admin, I can add, edit, reorder, and delete court rule sections from the admin settings
panel — including the section title, icon, chip summary, and formatted detail text — so that
rule content stays accurate without requiring a code deployment.

**Why this priority**: Static rules become stale as court policies change. Admin-managed rules
mean the club owner can update conduct requirements, seasonal notices, or new policies
immediately through the settings UI.

**Independent Test**: In admin settings, add a new rule section with a title and detail text.
Save. Open the player calendar page — the new section appears in the banner chips and in the
rules modal. Delete the section in admin settings — it disappears from the player view.

**Acceptance Scenarios**:

1. **Given** the admin is in the settings panel, **When** they navigate to the Rules tab,
   **Then** they see a list of existing rule sections and controls to add, edit, and delete them.
2. **Given** the admin adds a new rule section with a title and detail content, **When** they
   save, **Then** the new section immediately appears in the player-facing banner and modal.
3. **Given** the admin edits an existing rule section's title or detail, **When** they save,
   **Then** the updated content is reflected in the player view on next load.
4. **Given** the admin deletes a rule section, **When** the deletion is saved, **Then** the
   section no longer appears in the player banner or modal.
5. **Given** the admin reorders rule sections, **When** the new order is saved, **Then** the
   banner chips and modal sections appear in the updated order.

### Edge Cases

- If the rules list is empty, neither the "Rules" header button nor the rules banner renders.
- Very long section detail content must scroll within the modal without overflowing the viewport.
- On mobile (≥375 px), the modal must fill the available width and be scrollable vertically.
- A section with no detail content shows no expand affordance and is non-interactive.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The player calendar page MUST display a prominent rules banner between the
  sponsors area and the calendar, showing condensed rule chips (icon + short label) for each
  rule section.
- **FR-002**: The rules banner MUST include a "View Full Rules" action that opens the rules
  detail modal.
- **FR-003**: The public header MUST include a "Rules" icon button (visible alongside the bell
  icon) that opens the rules detail modal.
- **FR-004**: The rules detail modal MUST display court rules organised as named, collapsible
  sections.
- **FR-005**: Each section in the modal MUST expand on click to reveal its detail content, and
  collapse on a second click (accordion or toggle behaviour).
- **FR-006**: Rule detail content MUST support and render formatted text — at minimum: bold,
  bullet lists, and line breaks — without displaying raw markup syntax.
- **FR-007**: Rules data MUST be stored persistently and managed by the admin — admins can
  create, update, reorder, and delete rule sections from the admin settings panel without a
  code change or deployment.
- **FR-010**: The admin settings panel MUST include a Rules management tab where rule sections
  can be added (title, icon, chip label, detail content), edited, reordered, and deleted.
- **FR-011**: Rule detail content entered by the admin MUST support markdown formatting (bold,
  bullet lists, line breaks) and render correctly in the player modal.
- **FR-008**: When no rules are configured, the rules banner and "Rules" header button MUST
  NOT render — leaving no empty container.
- **FR-009**: The modal MUST be keyboard-accessible: closeable via Escape, all interactive
  elements reachable by Tab, meeting WCAG 2.1 AA contrast requirements.

### Key Entities *(include if feature involves data)*

- **Rule Section**: A named grouping of related court rules. Attributes: `id` (stable key),
  `title` (section heading), `icon` (icon identifier for chip and modal), `chip_label` (short
  text for the banner chip), `detail` (formatted markdown string for modal expansion),
  `sort_order` (integer controlling display order).
- **Rules Configuration**: The ordered collection of Rule Sections persisted in the database
  and fetched by both the player view and admin management UI. An empty collection disables
  the banner and header button.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The rules banner is visible on page load at ≥375 px, ≥768 px, and ≥1280 px
  viewport widths without any scrolling required.
- **SC-002**: The rules modal opens with a single click from both the header button and the
  banner's "View Full Rules" link.
- **SC-003**: All rule sections in the modal are individually expandable — clicking each
  section header reveals or hides its detail without page navigation.
- **SC-004**: Formatted detail content (bold, bullet points) renders visually correctly — no
  raw markdown syntax is visible to the player.
- **SC-005**: The rules banner and "Rules" header button do not render when the rules array
  is empty — zero empty containers visible.
- **SC-006**: Modal closes via Escape key and close button on all tested viewports.
- **SC-007**: An admin can add a new rule section in the settings panel and see it reflected
  in the player view without any code change or redeployment.

## Assumptions

- Rules data is stored in the database (Supabase) in a new `court_rules` table and managed
  through a new Rules tab in the admin settings panel. A new migration is required.
- The player view fetches rules via a React Query hook; unauthenticated read access to
  `court_rules` will be permitted by RLS (rules are public information).
- The admin write operations (insert, update, delete) require an authenticated admin session
  and are protected by RLS consistent with other admin-only tables.
- Markdown rendering for rule detail will use `react-markdown` (to be added as a dependency)
  or a simple custom renderer limited to bold, lists, and line breaks.
- The "Rules" header button uses a lucide-react icon (e.g., `ClipboardList`) styled consistently
  with the existing `BellNotification` button.
- The modal uses the project's existing dialog primitive (`@base-ui/react` or `shadcn/ui Dialog`)
  rather than a custom modal implementation.
- The existing `/terms` page route remains unchanged — this feature adds a complementary
  in-calendar experience.
- The rules banner is a normal in-flow element placed between the sponsors section and the
  calendar — no sticky or fixed positioning required.
- The initial rules data array will be seeded with the five rules shown in the reference image:
  No Music Allowed, Dress Code Required, Maintain Silence, Respect Time Slots, Be Respectful &
  Responsible.
