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
    <div className="flex flex-col w-full h-full bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-neutral-200 gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto pb-2 sm:pb-0">
          <h2 className="text-lg sm:text-xl font-bold text-neutral-800 min-w-[140px] whitespace-nowrap">
            {view === "month" 
              ? format(currentDate, "MMMM yyyy")
              : `${format(currentDate, "MMM d")} - ${format(addWeeks(currentDate, 1), "MMM d")}`}
          </h2>
          <div className="flex items-center bg-neutral-100 rounded-md p-1 min-w-max">
            <button
              onClick={prev}
              className="p-1.5 hover:bg-white rounded-md text-neutral-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={today}
              className="px-3 py-1.5 text-sm font-medium hover:bg-white rounded-md text-neutral-600 transition-colors"
            >
              Today
            </button>
            <button
              onClick={next}
              className="p-1.5 hover:bg-white rounded-md text-neutral-600 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-neutral-100 rounded-md p-1 mt-2 sm:mt-0 min-w-max">
          <button
            onClick={() => onViewChange("week")}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
              view === "week" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
            )}
          >
            Week
          </button>
          <button
            onClick={() => onViewChange("month")}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
              view === "month" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
            )}
          >
            Month
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto bg-neutral-50/50">
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
  );
}
