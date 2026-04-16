import type { Sponsor } from './types'

export interface SponsorsSectionProps {
  sponsors: Sponsor[]
}

export default function SponsorsSection({ sponsors }: SponsorsSectionProps) {
  return (
    <div className="w-full border-b border-gray-200 bg-white py-3 px-4">
      <div className="mx-auto max-w-[1400px]">
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">
          Our Sponsors
        </p>
        {sponsors.length === 0 ? (
          <p className="text-center text-sm text-gray-400">No current sponsors</p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center sm:overflow-x-visible">
            {sponsors.map((sponsor) => {
              const card = (
                <div
                  key={sponsor.id}
                  className="flex min-w-[100px] shrink-0 flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-center sm:shrink"
                >
                  {sponsor.logoUrl ? (
                    <img
                      src={sponsor.logoUrl}
                      alt={sponsor.name}
                      className="max-h-[48px] max-w-[120px] object-contain"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-700">{sponsor.name}</span>
                  )}
                </div>
              )

              if (sponsor.websiteUrl) {
                return (
                  <a
                    key={sponsor.id}
                    href={sponsor.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                    aria-label={`Visit ${sponsor.name}`}
                  >
                    {card}
                  </a>
                )
              }

              return card
            })}
          </div>
        )}
      </div>
    </div>
  )
}
