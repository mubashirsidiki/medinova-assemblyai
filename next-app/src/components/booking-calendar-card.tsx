"use client";

import Image from "next/image";
import Link from "next/link";
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
};

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function BookingCalendarCard({
	organizationId,
	defaultScheduledAt,
	patientNames,
	monthDays,
	createAppointmentAction,
	prevMonthHref,
	nextMonthHref,
	monthLabel,
}: BookingCalendarCardProps) {
	const [isCreateOpen, setIsCreateOpen] = useState(false);

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
						onClick={() => setIsCreateOpen(true)}
					>
						Create appointment
					</button>
				</div>
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
					{monthDays.map((entry) => (
						<div
							className={`calendar-real-day${!entry.isCurrentMonth ? " calendar-other-month" : ""}`}
							key={entry.key}
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
										<div className="calendar-more">+{entry.moreCount} more</div>
									) : null}
								</>
							) : (
								<div className="calendar-open">Open</div>
							)}
						</div>
					))}
				</div>
			</div>

			<div
				style={{
					display: "flex",
					justifyContent: "flex-end",
					gap: "8px",
					marginTop: "8px",
				}}
			>
				<Link
					href={prevMonthHref}
					className="action-btn primary"
					style={{ fontSize: "0.78rem", padding: "5px 10px" }}
				>
					‹ Prev month
				</Link>
				<Link
					href={nextMonthHref}
					className="action-btn primary"
					style={{ fontSize: "0.78rem", padding: "5px 10px" }}
				>
					Next month ›
				</Link>
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
											defaultValue={defaultScheduledAt}
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
