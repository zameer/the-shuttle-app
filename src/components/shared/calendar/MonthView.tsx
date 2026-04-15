import * as React from "react";
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, isSameMonth, isSameDay, startOfToday } from "date-fns";
import { cn } from "@/lib/utils";
import CalendarSlot from "./CalendarSlot";

import type { Booking } from "@/features/booking/useBookings";

interface MonthViewProps {
  currentDate: Date;
  onDateClick: (date: Date) => void;
  bookings?: Booking[];
  onSlotClick?: (date: Date, booking?: Booking) => void;
  readOnly?: boolean;
  isAdmin?: boolean;
}

/**
 * MonthView - Calendar grid showing a full month with booking cells
 * 
 * Displays:
 * - Admin view: Player name + status on each booking
 * - Public view: Status only, read-only cells
 * 
 * @param currentDate - The month to display
 * @param onDateClick - Called when date header is clicked
 * @param bookings - Array of bookings to display
 * @param onSlotClick - Called when a booking cell is clicked
 * @param readOnly - If true, removes click handlers (for public view)
 * @param isAdmin - If true, shows player names on cells (for admin view)
 */
export default function MonthView({ currentDate, onDateClick, bookings = [], onSlotClick, readOnly = false, isAdmin = false }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  const today = startOfToday();

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;

      days.push(
        <div
          key={day.toString()}
          onClick={() => onDateClick(cloneDay)}
          className={cn(
            "min-h-[120px] p-2 border-r border-b border-neutral-200 transition-colors hover:bg-neutral-50 cursor-pointer relative",
            !isSameMonth(day, monthStart) && "text-neutral-400 bg-neutral-50/30",
            isSameDay(day, today) && "bg-blue-50/30"
          )}
        >
          <div className="flex justify-between items-start">
            <span
              className={cn(
                "flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium",
                isSameDay(day, today) ? "bg-blue-600 text-white" : "text-neutral-700"
              )}
            >
              {formattedDate}
            </span>
          </div>
          {/* Bookings rendering */}
          <div className="mt-1 flex flex-col gap-1 overflow-y-auto max-h-[80px]">
            {bookings.filter(b => isSameDay(new Date(b.start_time), cloneDay)).map(b => (
              <CalendarSlot
                key={b.id}
                booking={b}
                isAdmin={isAdmin}
                readOnly={readOnly}
                onClick={() => {
                  if (readOnly && b.status === "UNAVAILABLE") return;
                  onSlotClick?.(new Date(b.start_time), b);
                }}
              />
            ))}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  const weekDays = [];
  let weekStartDate = startOfWeek(currentDate);
  for (let i = 0; i < 7; i++) {
    weekDays.push(
      <div key={i} className="text-center py-3 text-sm font-semibold text-neutral-500 border-r border-b border-neutral-200 uppercase tracking-wider">
        {format(addDays(weekStartDate, i), "EEE")}
      </div>
    );
  }

  return (
    <div className="w-full flex-col overflow-x-auto">
      <div className="min-w-[700px]">
        <div className="grid grid-cols-7">{weekDays}</div>
        {rows}
      </div>
    </div>
  );
}
