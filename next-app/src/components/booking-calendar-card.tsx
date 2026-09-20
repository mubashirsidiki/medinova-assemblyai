"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import bookingStyles from "@/app/(auth)/user/booking/booking.module.css";
import { SectionTitle } from "@/components/ui";

type CalendarSlot = {
	id: string;
	time: string;
	department: string;
	patientName: string;
};

type CalendarDay = {
	key: string;
	isoDate?: string;
	day: number;
	isCurrentMonth: boolean;
	slots: CalendarSlot[];
	moreCount: number;
};

type BookingCalendarCardProps = {
	organizationId: string;
	defaultScheduledAt: string;
	patientNames: string[];
	monthDays: CalendarDay[];
	createAppointmentAction: (formData: FormData) => Promise<void>;
	prevMonthHref: string;
	nextMonthHref: string;
	monthLabel: string;
	currentYear?: number;
	currentMonth?: number;
};

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

const START_YEAR = 2023;
const END_YEAR = 2032;
const YEARS = Array.from(
	{ length: END_YEAR - START_YEAR + 1 },
	(_, i) => START_YEAR + i,
);

export function BookingCalendarCard({
	organizationId,
	defaultScheduledAt,
	patientNames,
	monthDays,
	createAppointmentAction,
	prevMonthHref,
	nextMonthHref,
	monthLabel,
	currentYear = new Date().getFullYear(),
	currentMonth = new Date().getMonth(),
}: BookingCalendarCardProps) {
	const router = useRouter();
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const [customScheduledAt, setCustomScheduledAt] = useState<string | null>(
		null,
	);

	function handleMonthChange(newMonth: number) {
		const mStr = String(newMonth + 1).padStart(2, "0");
		router.push(`/user/booking?month=${currentYear}-${mStr}`);
	}

	function handleYearChange(newYear: number) {
		const mStr = String(currentMonth + 1).padStart(2, "0");
		router.push(`/user/booking?month=${newYear}-${mStr}`);
	}

	function handleToday() {
		router.push("/user/booking");
	}

	const selectedDayEntry = selectedDate
		? monthDays.find((day) => day.isoDate === selectedDate)
		: null;

	return (
		<div className="card card-pad calendar-card">
			<div className="calendar-card-top">
				<SectionTitle title="Monthly calendar" subtitle={monthLabel} />
				<div className="calendar-top-actions">
					<button type="button" className="action-btn calendar-sync-btn">
						<Image
							src="/assets/google-calendar.svg"
							alt="Google Calendar"
							className="calendar-sync-logo"
							width={18}
							height={18}
						/>
						Sync with Google Calendar
					</button>
					<button type="button" className="action-btn calendar-sync-btn">
						<Image
							src="/assets/outlook.svg"
							alt="Outlook Calendar"
							className="calendar-sync-logo"
							width={18}
							height={18}
						/>
						Sync with Outlook Calendar
					</button>
					<button
						type="button"
						className="action-btn primary"
						onClick={() => {
							if (selectedDate) {
								setCustomScheduledAt(`${selectedDate}T09:00`);
							}
							setIsCreateOpen(true);
						}}
					>
						Create appointment
					</button>
				</div>
			</div>

			<div className={bookingStyles.calendarNavToolbar}>
				<div className={bookingStyles.calendarNavGroup}>
					<Link
						href={prevMonthHref}
						className={bookingStyles.calendarNavBtn}
						title="Previous month"
						aria-label="Previous month"
					>
						‹
					</Link>
					<select
						className={bookingStyles.calendarNavSelect}
						value={currentMonth}
						onChange={(e) => handleMonthChange(Number(e.target.value))}
						aria-label="Select month"
					>
						{MONTHS.map((name, idx) => (
							<option key={name} value={idx}>
								{name}
							</option>
						))}
					</select>
					<select
						className={bookingStyles.calendarNavSelect}
						value={currentYear}
						onChange={(e) => handleYearChange(Number(e.target.value))}
						aria-label="Select year"
					>
						{YEARS.map((yr) => (
							<option key={yr} value={yr}>
								{yr}
							</option>
						))}
					</select>
					<Link
						href={nextMonthHref}
						className={bookingStyles.calendarNavBtn}
						title="Next month"
						aria-label="Next month"
					>
						›
					</Link>
					<button
						type="button"
						className={`${bookingStyles.calendarNavBtn} ${bookingStyles.calendarTodayBtn}`}
						onClick={handleToday}
						title="Jump to current date"
					>
						Today
					</button>
				</div>

				{selectedDate ? (
					<div className={bookingStyles.calendarSelectedPill}>
						<span>
							Selected: <strong>{selectedDate}</strong>
						</span>
						{selectedDayEntry && selectedDayEntry.slots.length > 0 ? (
							<span>({selectedDayEntry.slots.length} booked)</span>
						) : (
							<span>(Open)</span>
						)}
						<button
							type="button"
							className="action-btn primary"
							style={{ fontSize: "0.74rem", padding: "3px 8px" }}
							onClick={() => {
								setCustomScheduledAt(`${selectedDate}T09:00`);
								setIsCreateOpen(true);
							}}
						>
							+ Book Date
						</button>
					</div>
				) : (
					<small className="subtle">Click any day to inspect or book</small>
				)}
			</div>

			<div className="calendar-real">
				<div className="calendar-real-head">
					{DAY_HEADERS.map((header) => (
						<div key={header} className="calendar-real-head-cell">
							<span>{header}</span>
						</div>
					))}
				</div>

				<div className="calendar-real-grid">
					{monthDays.map((entry) => {
						const isSelected = selectedDate === entry.isoDate;
						return (
							<div
								className={`calendar-real-day${!entry.isCurrentMonth ? " calendar-other-month" : ""} ${bookingStyles.calendarDayClickable}${isSelected ? ` ${bookingStyles.calendarDaySelected}` : ""}`}
								key={entry.key}
								onClick={() => {
									if (entry.isoDate) setSelectedDate(entry.isoDate);
								}}
								role="button"
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										if (entry.isoDate) setSelectedDate(entry.isoDate);
									}
								}}
								title={entry.isoDate ? `Select ${entry.isoDate}` : undefined}
							>
								<div className="calendar-day-num">{entry.day}</div>
								{entry.slots.length > 0 ? (
									<>
										{entry.slots.map((slot) => (
											<div className="calendar-event" key={slot.id}>
												<span className="calendar-event-time">{slot.time}</span>
												<span className="calendar-event-dept">
													{slot.department}
												</span>
											</div>
										))}
										{entry.moreCount > 0 ? (
											<div className="calendar-more">
												+{entry.moreCount} more
											</div>
										) : null}
									</>
								) : (
									<div className="calendar-open">Open</div>
								)}
							</div>
						);
					})}
				</div>
			</div>

			{isCreateOpen ? (
				<div
					className={bookingStyles.bookingModalBackdrop}
					role="presentation"
					onClick={() => setIsCreateOpen(false)}
				>
					<div
						className={`card ${bookingStyles.bookingModal}`}
						role="dialog"
						aria-modal="true"
						aria-label="Create appointment"
						onClick={(event) => event.stopPropagation()}
					>
						<div className="card-pad">
							<div className={bookingStyles.bookingModalHead}>
								<SectionTitle
									title="Create appointment"
									subtitle="Create and confirm visit"
								/>
								<button
									type="button"
									className="action-btn"
									onClick={() => setIsCreateOpen(false)}
								>
									Close
								</button>
							</div>

							<form action={createAppointmentAction} className="field-grid">
								<input
									type="hidden"
									name="organizationId"
									value={organizationId}
								/>
								<div className="field-row">
									<div className="field">
										<label htmlFor="patientName">Patient</label>
										<input
											id="patientName"
											name="patientName"
											type="text"
											list="patient-name-suggestions"
											placeholder="Enter patient name"
											required
										/>
										<datalist id="patient-name-suggestions">
											{patientNames.map((name) => (
												<option key={name} value={name} />
											))}
										</datalist>
									</div>
									<div className="field">
										<label htmlFor="reason">Reason</label>
										<input
											id="reason"
											name="reason"
											type="text"
											placeholder="Enter visit reason"
											required
										/>
									</div>
								</div>

								<div className="field-row">
									<div className="field">
										<label htmlFor="department">Department</label>
										<select
											id="department"
											name="department"
											required
											defaultValue="Cardiology"
										>
											<option value="Cardiology">Cardiology</option>
											<option value="General Medicine">General Medicine</option>
											<option value="Endocrinology">Endocrinology</option>
											<option value="Obstetrics">Obstetrics</option>
											<option value="Pediatrics">Pediatrics</option>
										</select>
									</div>
									<div className="field">
										<label htmlFor="channel">Channel</label>
										<select
											id="channel"
											name="channel"
											required
											defaultValue="voice"
										>
											<option value="voice">Voice</option>
											<option value="sms">SMS</option>
											<option value="email">Email</option>
										</select>
									</div>
								</div>

								<div className="field-row">
									<div className="field">
										<label htmlFor="scheduledAt">Scheduled time</label>
										<input
											id="scheduledAt"
											name="scheduledAt"
											type="datetime-local"
											required
											key={customScheduledAt || defaultScheduledAt}
											defaultValue={customScheduledAt || defaultScheduledAt}
										/>
									</div>
									<div className="field">
										<label>Booking source</label>
										<div className="summary-pill">Voice assistant</div>
									</div>
								</div>

								<div className="control-row">
									<button className="action-btn primary" type="submit">
										Book appointment
									</button>
									<button
										className="action-btn"
										type="button"
										onClick={() => setIsCreateOpen(false)}
									>
										Cancel
									</button>
								</div>
								<small className="subtle">
									Automation path: Voice classification → calendar sync → SMS
									confirmation
								</small>
							</form>
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
}
