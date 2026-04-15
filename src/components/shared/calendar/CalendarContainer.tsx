import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, addWeeks, subWeeks, startOfToday } from "date-fns";
import { cn } from "@/lib/utils";
import MonthView from "./MonthView";
import WeekView from "./WeekView";

import type { Booking } from "@/features/booking/useBookings";

export type CalendarView = "month" | "week";

interface CalendarContainerProps {
  currentDate: Date;
  view: CalendarView;
  onDateChange: (date: Date) => void;
  onViewChange: (view: CalendarView) => void;
  bookings?: Booking[];
  onSlotClick?: (date: Date, booking?: Booking) => void;
  readOnly?: boolean;
  isAdmin?: boolean;
}

/**
 * Responsive strategy:
 * - Mobile-first full width layout
 * - `md:w-[95%]` and `lg:w-[90%]` for readable desktop density
 * - Navigation controls use mobile touch targets (44px) then compact on desktop
 */

export default function CalendarContainer({
  currentDate,
  view,
  onDateChange,
  onViewChange,
  bookings = [],
  onSlotClick,
  readOnly = false,
  isAdmin = false,
}: CalendarContainerProps) {
  const next = () => {
    if (view === "month") {
      onDateChange(addMonths(currentDate, 1));
    } else {
      onDateChange(addWeeks(currentDate, 1));
    }
  };

  const prev = () => {
    if (view === "month") {
      onDateChange(subMonths(currentDate, 1));
    } else {
      onDateChange(subWeeks(currentDate, 1));
    }
  };

  const today = () => {
    onDateChange(startOfToday());
  };

  return (
    <div className="mx-auto flex h-full w-full flex-col rounded-xl border border-neutral-200 bg-white shadow-sm md:w-[95%] lg:w-[90%]">
      {/* Header */}
      <div className="flex flex-col items-stretch justify-between gap-3 border-b border-neutral-200 p-3 sm:p-4 md:flex-row md:items-center">
        <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:gap-4">
          <h2 className="min-w-[140px] whitespace-nowrap text-base font-bold text-neutral-800 sm:text-lg md:text-xl">
            {view === "month" 
              ? format(currentDate, "MMMM yyyy")
              : `${format(currentDate, "MMM d")} - ${format(addWeeks(currentDate, 1), "MMM d")}`}
          </h2>
          <div className="flex items-center rounded-md bg-neutral-100 p-1 space-x-2 md:space-x-4">
            <button
              onClick={prev}
              className="h-10 w-10 rounded-md text-neutral-600 transition-colors hover:bg-white md:h-8 md:w-8"
            >
              <ChevronLeft className="mx-auto h-5 w-5 md:h-4 md:w-4" />
            </button>
            <button
              onClick={today}
              className="rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-white md:py-1.5"
            >
              Today
            </button>
            <button
              onClick={next}
              className="h-10 w-10 rounded-md text-neutral-600 transition-colors hover:bg-white md:h-8 md:w-8"
            >
              <ChevronRight className="mx-auto h-5 w-5 md:h-4 md:w-4" />
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="mt-1 flex items-center self-start rounded-md bg-neutral-100 p-1 md:mt-0 md:self-auto">
          <button
            onClick={() => onViewChange("week")}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors md:py-1.5",
              view === "week" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
            )}
          >
            Week
          </button>
          <button
            onClick={() => onViewChange("month")}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors md:py-1.5",
              view === "month" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
            )}
          >
            Month
          </button>
        </div>
      </div>

      {/* Body: single internal scroller for both axes */}
      <div className="flex-1 bg-neutral-50/50">
        <div className="calendar-scroll h-full overflow-auto overscroll-contain">
          <div className={cn("h-full", view === "week" ? "min-w-[760px] sm:min-w-0" : "min-w-[640px] sm:min-w-0")}>
            {view === "month" ? (
              <MonthView 
                currentDate={currentDate} 
                onDateClick={onDateChange} 
                bookings={bookings}
                onSlotClick={onSlotClick}
                readOnly={readOnly}
                isAdmin={isAdmin}
              />
            ) : (
              <WeekView 
                currentDate={currentDate} 
                onTimeSlotClick={(date, booking) => onSlotClick?.(date, booking)}
                bookings={bookings}
                readOnly={readOnly}
                isAdmin={isAdmin}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
