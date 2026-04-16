import type { Quote } from './types'

export interface QuoteAreaProps {
  quote: Quote
}

export default function QuoteArea({ quote }: QuoteAreaProps) {
  if (!quote.text) return null

  return (
    <div className="px-2">
      <p className="text-sm text-blue-100 italic leading-snug line-clamp-2 sm:line-clamp-none">
        &ldquo;{quote.text}&rdquo;
      </p>
      {quote.author && (
        <p className="text-xs text-blue-200 mt-0.5">— {quote.author}</p>
      )}
    </div>
  )
}
