import Image from "next/image";
import {
	updateBotBasicSettingsAction,
	updateBotBehaviorAction,
	updateBotIntegrationSettingsAction,
	updateUrgentNotificationSettingsAction,
} from "@/app/actions";
import { BehavioralRulesEditor } from "@/components/behavioral-rules-editor";
import { VoiceSession } from "@/components/livekit/voice-session";
import { PageHeader, SectionTitle } from "@/components/ui";
import { VoiceModelSelector } from "@/components/voice-model-selector";
import { requireSession } from "@/lib/auth";
import { getBotSettingsData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AIBotSettingsPage() {
	const session = await requireSession("user");
	const { org, settings, teamMembers, voiceModels } =
		await getBotSettingsData(session);

	return (
		<div className="screen-grid">
			<PageHeader
				title="AI Bot Settings"
				subtitle={`${org.name} personal bot profile for ${session.displayName}. Configure voice, numbers, behavior, and urgent escalations.`}
			/>

			<div className="card card-pad">
				<SectionTitle
					title="Basic bot details"
					subtitle="Core identity and voice profile"
				/>
				<form action={updateBotBasicSettingsAction} className="field-grid">
					<input type="hidden" name="botSettingsId" value={settings.id} />
					<div className="field-row">
						<div className="field-stack">
							<div className="field">
								<label htmlFor="botName">Bot name</label>
								<input
									id="botName"
									name="botName"
									defaultValue={settings.botName}
									required
								/>
							</div>
							<div className="field">
								<label htmlFor="language">
									Language
									<span className="lock-badge">
										<svg width="10" height="10" viewBox="0 0 16 16" fill="none">
											<rect
												x="3.5"
												y="6.5"
												width="9"
												height="7"
												rx="1.5"
												stroke="currentColor"
												strokeWidth="1.3"
											/>
											<path
												d="M5 6V4.5a3 3 0 0 1 6 0V6"
												stroke="currentColor"
												strokeWidth="1.3"
												strokeLinecap="round"
											/>
										</svg>
										Locked
									</span>
								</label>
								<input
									id="language"
									name="language"
									defaultValue="British English, German"
									disabled
									required
								/>
							</div>
							<div className="field">
								<label htmlFor="liveNumber">
									Live number
									<span className="lock-badge">
										<svg width="10" height="10" viewBox="0 0 16 16" fill="none">
											<rect
												x="3.5"
												y="6.5"
												width="9"
												height="7"
												rx="1.5"
												stroke="currentColor"
												strokeWidth="1.3"
											/>
											<path
												d="M5 6V4.5a3 3 0 0 1 6 0V6"
												stroke="currentColor"
												strokeWidth="1.3"
												strokeLinecap="round"
											/>
										</svg>
										Locked
									</span>
								</label>
								<input
									id="liveNumber"
									name="liveNumber"
									defaultValue="+1 484 481 3551"
									disabled
									required
								/>
							</div>
						</div>
						<VoiceModelSelector
							voiceModels={voiceModels}
							defaultVoiceModelName={settings.voiceModelName}
						/>
					</div>
					<div className="control-row">
						<button className="action-btn primary" type="submit">
							Save basic details
						</button>
					</div>
				</form>
			</div>

			<div className="card card-pad">
				<SectionTitle
					title="Bot test section"
					subtitle="Run an instant voice simulation"
				/>
				<VoiceSession botName={settings.botName} />
			</div>

			<div className="card card-pad">
				<SectionTitle
					title="Bot instructions"
					subtitle="Primary system instructions for the AI agent"
				/>
				<form action={updateBotBehaviorAction} className="field-grid">
					<input type="hidden" name="botSettingsId" value={settings.id} />
					<div className="field">
						<textarea
							id="instructions"
							name="instructions"
							defaultValue={settings.instructions}
							required
							rows={20}
							style={{ overflowY: "auto", resize: "vertical" }}
						/>
					</div>
					<div className="control-row">
						<button className="action-btn primary" type="submit">
							Save bot instructions
						</button>
					</div>
				</form>
			</div>

			<div className="card card-pad">
				<SectionTitle
					title="Behavioral rules"
					subtitle="Scenario handling policies"
				/>
				<BehavioralRulesEditor />
			</div>

			<div className="card card-pad">
				<SectionTitle
					title="Integrations"
					subtitle="CRM and calendar synchronization"
				/>
				<form
					action={updateBotIntegrationSettingsAction}
					className="field-grid"
				>
					<input type="hidden" name="botSettingsId" value={settings.id} />
					<div className="role-switch">
						<label className="role-option">
							<input
								type="checkbox"
								name="crmSyncEnabled"
								value="true"
								defaultChecked={settings.crmSyncEnabled}
							/>
							<span className="integration-row">
								<span>
									<strong>CRM sync</strong>
									<small>
										Write call summaries and contact updates to CRM.
									</small>
								</span>
								<span className="integration-icons">
									<Image
										src="/assets/hubspot-logo.svg"
										alt=""
										width={90}
										height={40}
									/>
									<Image
										src="/assets/zoho-logo.svg"
										alt=""
										width={90}
										height={40}
									/>
								</span>
							</span>
						</label>
						<label className="role-option">
							<input
								type="checkbox"
								name="calendarSyncEnabled"
								value="true"
								defaultChecked={settings.calendarSyncEnabled}
							/>
							<span className="integration-row">
								<span>
									<strong>Calendar sync</strong>
									<small>
										Sync booked appointments to integrated calendars.
									</small>
								</span>
								<span className="integration-icons">
									<Image
										src="/assets/google-calendar.svg"
										alt=""
										width={40}
										height={40}
									/>
									<Image
										src="/assets/outlook.svg"
										alt=""
										width={40}
										height={40}
									/>
								</span>
							</span>
						</label>
					</div>
					<div className="control-row">
						<button className="action-btn primary" type="submit">
							Save integration settings
						</button>
					</div>
				</form>
			</div>

			<div className="card card-pad">
				<SectionTitle
					title="Urgent-call notifications"
					subtitle="Who gets alerted for urgent classifications"
				/>
				<form
					action={updateUrgentNotificationSettingsAction}
					className="field-grid"
				>
					<input type="hidden" name="botSettingsId" value={settings.id} />
					<div className="field-row">
						<div className="field">
							<label htmlFor="notifyTargetType">Notify target</label>
							<select
								id="notifyTargetType"
								name="notifyTargetType"
								defaultValue={settings.notifyTargetType}
							>
								<option value="team_member">
									Team member + optional override
								</option>
								<option value="custom_contact">Custom contact</option>
							</select>
						</div>
						<div className="field">
							<label htmlFor="urgentTeamMemberId">Person/team to notify</label>
							<select
								id="urgentTeamMemberId"
								name="urgentTeamMemberId"
								defaultValue={settings.urgentTeamMemberId ?? ""}
							>
								<option value="">Not assigned</option>
								{teamMembers.map((member) => (
									<option key={member.id} value={member.id}>
										{member.name} - {member.role}
									</option>
								))}
							</select>
						</div>
					</div>
					<div className="field">
						<label htmlFor="contactName">Contact name</label>
						<input
							id="contactName"
							name="contactName"
							defaultValue={settings.contactName ?? ""}
						/>
					</div>
					<div className="field">
						<label htmlFor="contactEmail">Email address</label>
						<input
							id="contactEmail"
							name="contactEmail"
							type="email"
							defaultValue={settings.contactEmail ?? ""}
						/>
					</div>
					<div className="field-row">
						<div className="field">
							<label htmlFor="emailTemplate">Email template</label>
							<textarea
								id="emailTemplate"
								name="emailTemplate"
								defaultValue={settings.emailTemplate}
								required
								rows={6}
							/>
						</div>
						<div className="field">
							<label htmlFor="smsTemplate">SMS template</label>
							<textarea
								id="smsTemplate"
								name="smsTemplate"
								defaultValue={settings.smsTemplate}
								required
								rows={6}
							/>
						</div>
					</div>
					<div className="control-row">
						<button className="action-btn primary" type="submit">
							Save urgent-call settings
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
