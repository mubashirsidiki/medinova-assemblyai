import { createAppointmentAction } from "@/app/actions";
import { BookingCalendarCard } from "@/components/booking-calendar-card";
import { PageHeader, SectionTitle } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import { getBookingData } from "@/lib/data";

export const dynamic = "force-dynamic";

import { clockTime, compactDate } from "@/lib/format";
import styles from "./booking.module.css";

function toDateInputValue(date: Date) {
	const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
	return local.toISOString().slice(0, 16);
}

function startOfMonthGrid(year: number, month: number) {
	const startOfMonth = new Date(year, month, 1);
	const start = new Date(startOfMonth);
	while (start.getDay() !== 0) {
		start.setDate(start.getDate() - 1);
	}
	start.setHours(0, 0, 0, 0);
	return start;
}

export default async function BookingPage({
	searchParams,
}: {
	searchParams?: Promise<{ month?: string }>;
}) {
	await requireSession("user");
	const { org, appointments, patients, notifications } = await getBookingData();

	const resolvedSearchParams = (await searchParams) ?? {};
	const monthParam = resolvedSearchParams.month;

	let year: number;
	let month: number;
	if (monthParam) {
		const [y, m] = monthParam.split("-").map(Number);
		year = y;
		month = m - 1;
	} else {
		const now = new Date();
		year = now.getFullYear();
		month = now.getMonth();
	}

	const monthDate = new Date(year, month, 1);
	const monthLabel = monthDate.toLocaleDateString("en-US", {
		month: "long",
		year: "numeric",
	});

	const gridStart = startOfMonthGrid(year, month);

	const monthDays = Array.from({ length: 42 }, (_, index) => {
		const dayDate = new Date(gridStart);
		dayDate.setDate(gridStart.getDate() + index);

		const daySlots = appointments
			.filter((appointment) => {
				const appointmentDate = new Date(appointment.scheduledAt);
				return (
					appointmentDate.getFullYear() === dayDate.getFullYear() &&
					appointmentDate.getMonth() === dayDate.getMonth() &&
					appointmentDate.getDate() === dayDate.getDate()
				);
			})
			.slice(0, 2)
			.map((appointment) => ({
				id: appointment.id,
				time: clockTime(appointment.scheduledAt),
				department: appointment.department,
				patientName: appointment.patient.name,
			}));

		const moreCount = Math.max(
			appointments.filter((appointment) => {
				const appointmentDate = new Date(appointment.scheduledAt);
				return (
					appointmentDate.getFullYear() === dayDate.getFullYear() &&
					appointmentDate.getMonth() === dayDate.getMonth() &&
					appointmentDate.getDate() === dayDate.getDate()
				);
			}).length - daySlots.length,
			0,
		);

		return {
			key: dayDate.toISOString(),
			day: dayDate.getDate(),
			isCurrentMonth: dayDate.getMonth() === monthDate.getMonth(),
			slots: daySlots,
			moreCount,
		};
	});

	const prevMonthDate = new Date(year, month - 1, 1);
	const nextMonthDate = new Date(year, month + 1, 1);
	const prevMonthHref = `/user/booking?month=${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}`;
	const nextMonthHref = `/user/booking?month=${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, "0")}`;

	const defaultScheduledAt = new Date();
	defaultScheduledAt.setMinutes(0, 0, 0);
	defaultScheduledAt.setHours(defaultScheduledAt.getHours() + 1);

	return (
		<div className={`screen-grid ${styles.bookingPageStatic}`}>
			<PageHeader
				title="Appointment Booking"
				subtitle={`${org.name} books from the voice flow into appointments, then syncs calendar and notification records.`}
			/>

			<BookingCalendarCard
				organizationId={org.id}
				defaultScheduledAt={toDateInputValue(defaultScheduledAt)}
				patientNames={patients.map((patient) => patient.name)}
				monthDays={monthDays}
				monthLabel={monthLabel}
				createAppointmentAction={createAppointmentAction}
				prevMonthHref={prevMonthHref}
				nextMonthHref={nextMonthHref}
			/>

			<div className="grid-2">
				<div className="card card-pad">
					<SectionTitle
						title="Upcoming appointments"
						subtitle="Confirmed and scheduled visits"
					/>
					<div className={`list ${styles.bookingUpcomingList}`}>
						{appointments.map((appointment) => (
							<div className="list-item" key={appointment.id}>
								<div>
									<strong>{appointment.patient.name}</strong>
									<small>
										{appointment.department} ·{" "}
										{appointment.provider?.name ?? "Unassigned"}
									</small>
								</div>
								<div className="right">
									<div>{compactDate(appointment.scheduledAt)}</div>
									<div>{clockTime(appointment.scheduledAt)}</div>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="card card-pad">
					<SectionTitle
						title="SMS confirmation"
						subtitle="Recent patient messages"
					/>
					<div className="note-stack">
						{notifications.map((note) => (
							<div className="notify-item" key={note.id}>
								<div>
									<strong>{note.title}</strong>
									<small>{note.body}</small>
								</div>
								<div className="right">
									<div>
										{note.scheduledAt
											? compactDate(note.scheduledAt)
											: compactDate(note.createdAt)}
									</div>
									<div>
										{note.scheduledAt
											? clockTime(note.scheduledAt)
											: clockTime(note.createdAt)}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
