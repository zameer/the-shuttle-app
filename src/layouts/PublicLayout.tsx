import { Outlet, Link } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <header className="w-full bg-blue-600 text-white shadow-md py-4 px-6 text-center">
        <h1 className="text-2xl font-black italic tracking-wider">THE SHUTTLE</h1>
        <p className="text-sm font-light opacity-90 mt-1">Badminton Court Availability</p>
      </header>
      
      <main className="flex-1 w-full max-w-md p-4">
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
