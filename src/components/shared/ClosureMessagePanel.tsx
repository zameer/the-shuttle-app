import { Component, type ErrorInfo, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'

interface ClosureMessagePanelProps {
  heading?: string
  message: string | null
}

interface MarkdownErrorBoundaryProps {
  fallback: ReactNode
  children: ReactNode
}

interface MarkdownErrorBoundaryState {
  hasError: boolean
}

class MarkdownErrorBoundary extends Component<MarkdownErrorBoundaryProps, MarkdownErrorBoundaryState> {
  override state: MarkdownErrorBoundaryState = {
    hasError: false,
  }

  static override getDerivedStateFromError(): MarkdownErrorBoundaryState {
    return { hasError: true }
  }

  override componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {
    // Intentionally silent: player experience falls back to plain text message.
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

export default function ClosureMessagePanel({
  message,
}: ClosureMessagePanelProps) {
  const trimmedMessage = message?.trim() ?? ''
  const fallbackMessage = 'We are temporarily unable to accept bookings. Please check back later for reopening updates.'
  const displayMessage = trimmedMessage.length > 0 ? trimmedMessage : fallbackMessage

  return (
    <section className="w-full rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm md:p-7" aria-live="polite">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Player Guidelines & Expectations</p>
      <div className="closure-message-content mt-4 text-sm text-amber-900 md:text-base">
        <MarkdownErrorBoundary fallback={<p>{displayMessage}</p>}>
          <ReactMarkdown>{displayMessage}</ReactMarkdown>
        </MarkdownErrorBoundary>
      </div>
    </section>
  )
}
