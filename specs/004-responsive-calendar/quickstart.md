# Quickstart: Responsive Player Calendar (Phase 1)

## Prerequisites
- Node.js installed
- Dependencies installed (`npm install`)

## Run the app
```bash
npm run dev
```

## Manual validation flow
1. Open the public calendar route in browser.
2. Test viewport widths: 320, 375, 667 (landscape), 768, 1024, 1920.
3. Verify:
   - No unnecessary page-level horizontal scrollbar.
   - Calendar uses internal scrolling when content density requires it.
   - Week/month headers remain sticky while scrolling calendar content.
   - Touch targets remain usable on mobile.

## Regression checks
- Verify admin calendar still renders booking blocks correctly.
- Verify booking interactions are unchanged in admin mode.
- Verify public mode remains read-only and privacy-safe.

## Performance check
- Use DevTools throttling (LTE/3G profile) and ensure perceived loading remains within feature target.
