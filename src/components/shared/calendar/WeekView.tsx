import * as React from "react";
import { format, startOfWeek, addDays, startOfToday, isSameDay, setHours, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import type { Booking } from "@/features/booking/useBookings";
import { useCourtSettings, useRecurringBlocks } from "@/features/admin/useCourtSettings";
import { getPaymentStatusLabel, getPaymentStatusPillClassName, normalizePaymentStatus } from "@/features/booking/paymentStatus";

interface WeekViewProps {
  currentDate: Date;
  onTimeSlotClick: (date: Date, booking?: Booking) => void;
  bookings?: Booking[];
  readOnly?: boolean;
  isAdmin?: boolean;
}

// Parse "HH:MM:SS" or "HH:MM" -> decimal hours (e.g. "14:30:00" -> 14.5)
function timeStrToHours(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h + (m || 0) / 60
}

/**
 * WeekView - Calendar grid showing a full week with hourly booking cells
 * 
 * Displays:
 * - Admin view: Player name + status on each booking block
 * - Public view: Status only, read-only blocks
 * 
 * @param currentDate - A date within the week to display
 * @param onTimeSlotClick - Called when an empty time slot or booking is clicked
 * @param bookings - Array of bookings to display
 * @param readOnly - If true, removes click handlers (for public view)
 * @param isAdmin - If true, shows player names on booking blocks (for admin view)
 */
export default function WeekView({ currentDate, onTimeSlotClick, bookings = [], readOnly = false, isAdmin = false }: WeekViewProps) {
  const startDate = startOfWeek(currentDate);
  const today = startOfToday();

  const { data: settings } = useCourtSettings()
  const { data: recurringBlocks = [] } = useRecurringBlocks()

  // Derive court hours from settings — fallback to 6–23
  const startHour = settings ? Math.floor(timeStrToHours(settings.court_open_time)) : 6
  const endHour   = settings ? Math.ceil(timeStrToHours(settings.court_close_time)) : 23
  const hours = Array.from({ length: endHour - startHour }, (_, i) => i + startHour)

  const ROW_HEIGHT = 80 // px per hour

  return (
    <div className="relative flex h-full flex-col bg-white">
      <div className="w-full h-full flex flex-col">

          {/* Week Header */}
          <div className="sticky top-0 z-50 grid grid-cols-[56px_1fr] border-b border-neutral-200 bg-white shadow-sm sm:grid-cols-[64px_1fr] md:grid-cols-[80px_1fr]">
            <div className="p-2 sm:p-3 md:p-4 border-r border-neutral-200 flex items-end justify-center sticky left-0 bg-white z-50 shadow-[1px_0_0_rgba(0,0,0,0.05)]">
              <span className="text-xs font-medium text-neutral-400">GMT+5:30</span>
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: 7 }).map((_, i) => {
                const day = addDays(startDate, i);
                const isToday = isSameDay(day, today);
                return (
                  <div key={i} className="p-1.5 sm:p-2 md:p-3 text-center border-r border-neutral-200 relative">
                    <div className={cn("text-xs sm:text-sm font-medium", isToday ? "text-blue-600" : "text-neutral-500")}>
                      {format(day, "EEE")}
                    </div>
                    <div className={cn(
                      "mx-auto mt-1 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-sm sm:text-lg",
                      isToday ? "bg-blue-600 text-white font-bold" : "text-neutral-800"
                    )}>
                      {format(day, "d")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Grid */}
          <div className="grid grid-cols-[56px_1fr] sm:grid-cols-[64px_1fr] md:grid-cols-[80px_1fr] flex-1">
            {/* Sticky Time Labels */}
            <div className="border-r border-neutral-200 bg-white sticky left-0 z-30 shadow-[1px_0_0_rgba(0,0,0,0.05)]">
              {hours.map((hour) => (
                <div
                  key={hour}
                  style={{ height: `${ROW_HEIGHT}px` }}
                  className="relative flex items-start justify-end border-b border-neutral-200 pr-2 pt-1 sm:pr-3 md:pr-4 md:pt-2"
                >
                  <span className="block text-[11px] font-medium leading-none text-neutral-400 sm:text-xs">
                    {format(setHours(new Date(), hour), "h a")}
                  </span>
                </div>
              ))}
            </div>

            {/* Days / Slots */}
            <div className="grid grid-cols-7 relative">
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const day = addDays(startDate, dayIndex);
                const dayOfWeek = day.getDay(); // 0=Sun

                const dailyBookings = bookings.filter(b => isSameDay(new Date(b.start_time), day));

                // Recurring unavailable blocks that apply to this day of week
                const dayRecurringBlocks = recurringBlocks.filter(b => b.day_of_week === dayOfWeek)

                return (
                  <div key={dayIndex} className="border-r border-neutral-200 relative">
                    {/* Background time slot rows */}
                    {hours.map((hour) => {
                      const slotTime = setHours(startOfDay(day), hour);
                      return (
                        <div
                          key={hour}
                          onClick={() => !readOnly && onTimeSlotClick(slotTime)}
                          style={{ height: `${ROW_HEIGHT}px` }}
                          className={cn(
                            "border-b border-neutral-100 transition-colors",
                            readOnly ? "cursor-default" : "hover:bg-blue-50/50 cursor-pointer"
                          )}
                        />
                      );
                    })}

                    {/* Recurring unavailable blocks overlay */}
                    {dayRecurringBlocks.map(block => {
                      const blockStartH = timeStrToHours(block.start_time)
                      const blockEndH   = timeStrToHours(block.end_time)
                      const top    = (blockStartH - startHour) * ROW_HEIGHT
                      const height = (blockEndH - blockStartH) * ROW_HEIGHT
                      if (top < 0 || height <= 0) return null
                      return (
                        <div
                          key={block.id}
                          className="absolute left-0 right-0 mx-1 z-10 rounded-md bg-gray-200 border border-gray-300 overflow-hidden pointer-events-none"
                          style={{ top: `${top}px`, height: `${height}px` }}
                        >
                          <div className="text-[10px] font-semibold text-gray-500 px-1.5 pt-1 leading-tight">{block.label}</div>
                        </div>
                      )
                    })}

                    {/* Booking blocks overlay */}
                    {dailyBookings.map(booking => {
                      const bStart = new Date(booking.start_time);
                      const bEnd   = new Date(booking.end_time);
                      const startH = bStart.getHours() + bStart.getMinutes() / 60;
                      const endH   = bEnd.getHours()   + bEnd.getMinutes()   / 60;
                      const top    = (startH - startHour) * ROW_HEIGHT;
                      const height = (endH - startH)      * ROW_HEIGHT;

                      let colorClass = "bg-blue-100 border-blue-200 text-blue-800";
                      if (booking.status === "CONFIRMED")   colorClass = "bg-green-100 border-green-200 text-green-800 hover:bg-green-200";
                      if (booking.status === "PENDING")     colorClass = "bg-yellow-100 border-yellow-200 text-yellow-800 hover:bg-yellow-200";
                      if (booking.status === "UNAVAILABLE") colorClass = "bg-gray-300 border-gray-400 text-gray-600 opacity-90";
                      if (booking.status === "CANCELLED")   colorClass = "bg-red-100 border-red-200 text-red-800 hover:bg-red-200";
                      if (booking.status === "NO_SHOW")     colorClass = "bg-orange-100 border-orange-200 text-orange-800 hover:bg-orange-200";

                      // Status label for display (matches StatusBadge logic)
                      const statusLabel = booking.status === "CONFIRMED" ? "Reserved" :
                                         booking.status === "PENDING" ? "Pending" :
                                         booking.status === "UNAVAILABLE" ? "Unavailable" :
                                         booking.status === "CANCELLED" ? "Cancelled" :
                                         booking.status === "NO_SHOW" ? "No Show" : "Open";
                      const paymentStatus = normalizePaymentStatus(booking.payment_status)
                      const paymentLabel = getPaymentStatusLabel(paymentStatus)

                      return (
                        <div
                          key={booking.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (readOnly && booking.status === "UNAVAILABLE") return;
                            if (!readOnly) onTimeSlotClick(bStart, booking);
                          }}
                          className={cn(
                            "absolute left-0 right-0 mx-1 border z-20 rounded-md p-1.5 overflow-hidden shadow-sm transition-colors",
                            readOnly ? "cursor-default" : "cursor-pointer",
                            colorClass
                          )}
                          style={{ top: `${top}px`, height: `${height}px` }}
                        >
                          {/* Mobile: Stack vertically */}
                          <div className="md:hidden flex flex-col gap-0.5">
                            {isAdmin && booking.player_name && (
                              <div className="text-[10px] font-semibold text-inherit truncate">
                                {booking.player_name}
                              </div>
                            )}
                            <div className="text-[10px] font-semibold">{statusLabel}</div>
                            {isAdmin && (
                              <div className={`inline-flex w-fit rounded-full border px-1 py-0 text-[9px] font-semibold ${getPaymentStatusPillClassName(paymentStatus)}`}>
                                {paymentLabel}
                              </div>
                            )}
                            <div className="text-[9px] opacity-75 leading-none">
                              {format(bStart, "HH:mm")} – {format(bEnd, "HH:mm")}
                            </div>
                          </div>

                          {/* Desktop: Inline format */}
                          <div className="hidden md:block">
                            {isAdmin && booking.player_name && (
                              <div className="text-[10px] font-semibold text-inherit truncate">
                                {booking.player_name} - {statusLabel}
                              </div>
                            )}
                            {!isAdmin && (
                              <div className="text-[10px] font-semibold">{statusLabel}</div>
                            )}
                            {isAdmin && (
                              <div className={`inline-flex w-fit rounded-full border px-1 py-0 text-[9px] font-semibold mt-0.5 ${getPaymentStatusPillClassName(paymentStatus)}`}>
                                {paymentLabel}
                              </div>
                            )}
                            <div className="text-[10px] opacity-80 leading-none mt-0.5">
                              {format(bStart, "HH:mm")} – {format(bEnd, "HH:mm")}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

      </div>
    </div>
  );
}
