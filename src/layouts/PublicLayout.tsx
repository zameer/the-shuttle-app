import { Outlet, Link } from "react-router-dom";
import { getDayOfYear } from "date-fns";
import QuoteArea from "@/features/players/header/QuoteArea";
import BellNotification from "@/features/players/header/BellNotification";
import { QUOTES, ANNOUNCEMENTS, SPONSORS } from "@/features/players/header/types";
import SponsorsSection from "@/features/players/header/SponsorsSection";

export default function PublicLayout() {
  const selectedQuote = QUOTES.length > 0
    ? QUOTES[getDayOfYear(new Date()) % QUOTES.length]
    : { text: '' }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <header className="w-full bg-blue-600 text-white shadow-md py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <h1 className="text-2xl font-black italic tracking-wider">THE SHUTTLE</h1>
            <p className="text-sm font-light opacity-90 mt-1">Badminton Court Availability</p>
          </div>
          <div className="flex-1 min-w-0">
            <QuoteArea quote={selectedQuote} />
          </div>
          <div className="shrink-0 self-start pt-1">
            <BellNotification announcements={ANNOUNCEMENTS} />
          </div>
        </div>
      </header>

      <SponsorsSection sponsors={SPONSORS} />

      <main className="flex-1 w-full max-w-[1400px] px-2 py-4 sm:px-4 lg:px-6">
        <Outlet />
      </main>
      
      <footer className="w-full py-6 text-center text-gray-400 text-xs mt-auto space-y-1">
        <div>
          <Link to="/terms" className="text-blue-400 hover:text-blue-600 underline-offset-2 hover:underline transition-colors">
            Terms &amp; Conditions
          </Link>
        </div>
        <div>&copy; {new Date().getFullYear()} The Shuttle Badminton Court</div>
      </footer>
    </div>
  );
}
