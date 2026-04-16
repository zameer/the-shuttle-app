/**
 * Contract: Public Header UI — Quote Beside Title
 * Feature: 007-header-quote-dashboard-all
 *
 * Documents the required layout changes in `PublicLayout.tsx` and the
 * class adjustments needed in `QuoteArea.tsx`.
 */

// ---------------------------------------------------------------------------
// Component: PublicLayout — Header Flex Structure
// Location: src/layouts/PublicLayout.tsx
// ---------------------------------------------------------------------------

/**
 * BEFORE:
 *
 * <header className="w-full bg-blue-600 text-white shadow-md py-4 px-6">
 *   <div className="flex items-start justify-between gap-3">
 *     <div className="flex-1 text-center">
 *       <h1 className="text-2xl font-black italic tracking-wider">THE SHUTTLE</h1>
 *       <p className="text-sm font-light opacity-90 mt-1">Badminton Court Availability</p>
 *       <QuoteArea quote={selectedQuote} />   ← stacked below subtitle
 *     </div>
 *     <div className="shrink-0 pt-1">
 *       <BellNotification announcements={ANNOUNCEMENTS} />
 *     </div>
 *   </div>
 * </header>
 *
 *
 * AFTER (required):
 *
 * <header className="w-full bg-blue-600 text-white shadow-md py-4 px-6">
 *   <div className="flex items-center gap-3">
 *
 *     {/* Zone 1: Title block — fixed width, no shrink *\/}
 *     <div className="shrink-0">
 *       <h1 className="text-2xl font-black italic tracking-wider">THE SHUTTLE</h1>
 *       <p className="text-sm font-light opacity-90 mt-1">Badminton Court Availability</p>
 *     </div>
 *
 *     {/* Zone 2: Quote — fills remaining space, truncates on narrow viewports *\/}
 *     <div className="flex-1 min-w-0">
 *       <QuoteArea quote={selectedQuote} />
 *     </div>
 *
 *     {/* Zone 3: Bell — fixed, always on far right *\/}
 *     <div className="shrink-0 self-start pt-1">
 *       <BellNotification announcements={ANNOUNCEMENTS} />
 *     </div>
 *
 *   </div>
 * </header>
 *
 * Responsive behaviour:
 *   ≥375 px  — all three zones on one row; quote may show line-clamp-2
 *   ≥768 px  — quote expands, line-clamp relaxed
 *   ≥1280 px — full quote visible, comfortable spacing
 */

// ---------------------------------------------------------------------------
// Component: QuoteArea (modified classes)
// Location: src/features/players/header/QuoteArea.tsx
// ---------------------------------------------------------------------------

/**
 * BEFORE (wrapper div):
 *   <div className="mt-2 text-center px-2">
 *     <p className="text-sm text-blue-100 italic leading-snug line-clamp-2 sm:line-clamp-none">
 *       &ldquo;{quote.text}&rdquo;
 *     </p>
 *     {quote.author && (
 *       <p className="text-xs text-blue-200 mt-0.5">— {quote.author}</p>
 *     )}
 *   </div>
 *
 * AFTER (required):
 *   <div className="px-2">
 *     <p className="text-sm text-blue-100 italic leading-snug line-clamp-2 sm:line-clamp-none">
 *       &ldquo;{quote.text}&rdquo;
 *     </p>
 *     {quote.author && (
 *       <p className="text-xs text-blue-200 mt-0.5">— {quote.author}</p>
 *     )}
 *   </div>
 *
 * Changes:
 *   - Removed `mt-2`  (no top margin needed; flex vertical alignment handles it)
 *   - Removed `text-center` (left-to-right reading order; parent flex zone handles width)
 *
 * `QuoteAreaProps` interface is UNCHANGED.
 */
