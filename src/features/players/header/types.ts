// ---------------------------------------------------------------------------
// Data types and static content for the player-facing public header sections
// (quote area, bell notification, sponsors showcase).
//
// All content is managed here and takes effect on next deploy.
// No Supabase tables are involved — MVP uses static in-memory data.
// ---------------------------------------------------------------------------

export interface Quote {
  /** Short motivational text displayed in the header. Max 200 characters. */
  text: string
  /** Optional attribution (coach, author, club slogan). Max 80 characters. */
  author?: string
}

export interface Announcement {
  /** Stable unique identifier used as React key. */
  id: string
  /** Short title shown in the notification list. Max 80 characters. */
  title: string
  /** Full body text shown in the popover. Max 500 characters. */
  body: string
  /** ISO 8601 date string (YYYY-MM-DD) for display. */
  date: string
}

export interface Sponsor {
  /** Stable unique identifier used as React key. */
  id: string
  /** Display name — shown as text fallback when logoUrl is absent. Max 60 characters. */
  name: string
  /** Optional absolute URL to sponsor logo image (≤120 px tall recommended). */
  logoUrl?: string
  /** Optional sponsor website URL. Opens in new tab with rel="noopener noreferrer". */
  websiteUrl?: string
}

// ---------------------------------------------------------------------------
// Static content — edit these arrays to update header content.
// Quote rotates daily: QUOTES[dayOfYear(today) % QUOTES.length]
// ---------------------------------------------------------------------------

export const QUOTES: Quote[] = [
  {
    text: 'Eat and drink, but do not be excessive.',
    author: 'Qur\’an 7:31',
  },
  {
    text: 'Whoever follows a path in pursuit of knowledge, Allah will make a path to Paradise easy for him.',
  },
  {
    text: 'The best day on which the sun has risen is Friday.',
    author: 'Prophet Muhammad ﷺ',
  },
  {
    text: 'My Lord, increase me in knowledge.',
    author: 'Qur\’an 20:114',
  },
  {
    text: 'Your body has a right over you.',
  },
  {
    text: 'Seeking knowledge is an obligation upon everyone.',
  },
  {
    text: 'Footwork, focus, finesse — in that order.',
  },
]

// Set to non-empty to show an announcement badge on the bell icon.
export const ANNOUNCEMENTS: Announcement[] = []

// Add sponsor entries to display the sponsors section below the header.
export const SPONSORS: Sponsor[] = []
