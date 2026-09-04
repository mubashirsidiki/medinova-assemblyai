"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export function BehavioralRulesEditor() {
	const [endCallScenarios, setEndCallScenarios] = useState<string[]>([
		"OFF-TOPIC: Caller discusses topics completely unrelated to health after one gentle redirect",
		"CALLER REQUESTS TO END: Caller explicitly states they do not want to continue or want to hang up",
		"INTAKE COMPLETE: All intake questions answered and next steps communicated to caller",
	]);

	const [escalationScenarios, setEscalationScenarios] = useState<string[]>([
		"User requests to speak with a human",
		"User reports urgent or severe symptoms",
	]);

	const [newEndCall, setNewEndCall] = useState("");
	const [newEscalation, setNewEscalation] = useState("");

	const addEndCallScenario = () => {
		if (newEndCall.trim()) {
			setEndCallScenarios([...endCallScenarios, newEndCall.trim()]);
			setNewEndCall("");
		}
	};

	const removeEndCallScenario = (index: number) => {
		setEndCallScenarios(endCallScenarios.filter((_, i) => i !== index));
	};

	const addEscalationScenario = () => {
		if (newEscalation.trim()) {
			setEscalationScenarios([...escalationScenarios, newEscalation.trim()]);
			setNewEscalation("");
		}
	};

	const removeEscalationScenario = (index: number) => {
		setEscalationScenarios(escalationScenarios.filter((_, i) => i !== index));
	};

	return (
		<div className="field-grid">
			<div className="field-row">
				{/* End Call Scenarios */}
				<div className="field">
					<label>End-call scenarios</label>
					<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
						{endCallScenarios.map((scenario, idx) => (
							<div
								key={idx}
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									gap: "8px",
									padding: "10px 14px",
									background: "var(--surface-2)",
									borderRadius: "10px",
									fontSize: "0.85rem",
									color: "var(--text)",
									border: "1px solid var(--line-2)",
								}}
							>
								<span style={{ flex: 1, lineHeight: "1.5" }}>{scenario}</span>
								<button
									type="button"
									onClick={() => removeEndCallScenario(idx)}
									style={{
										background: "none",
										border: "none",
										color: "#d53f35",
										cursor: "pointer",
										display: "flex",
										alignItems: "center",
										padding: "4px",
									}}
									title="Remove scenario"
								>
									<Trash2 size={16} />
								</button>
							</div>
						))}
						<div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
							<input
								type="text"
								placeholder="Add new end-call scenario..."
								value={newEndCall}
								onChange={(e) => setNewEndCall(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										addEndCallScenario();
									}
								}}
								style={{ flex: 1 }}
							/>
							<button
								type="button"
								onClick={addEndCallScenario}
								className="action-btn primary"
								style={{
									padding: "10px 14px",
									borderRadius: "12px",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<Plus size={16} />
							</button>
						</div>
					</div>
				</div>

				{/* Escalation Scenarios */}
				<div className="field">
					<label>Escalation scenarios</label>
					<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
						{escalationScenarios.map((scenario, idx) => (
							<div
								key={idx}
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									gap: "8px",
									padding: "10px 14px",
									background: "var(--surface-2)",
									borderRadius: "10px",
									fontSize: "0.85rem",
									color: "var(--text)",
									border: "1px solid var(--line-2)",
								}}
							>
								<span style={{ flex: 1, lineHeight: "1.5" }}>{scenario}</span>
								<button
									type="button"
									onClick={() => removeEscalationScenario(idx)}
									style={{
										background: "none",
										border: "none",
										color: "#d53f35",
										cursor: "pointer",
										display: "flex",
										alignItems: "center",
										padding: "4px",
									}}
									title="Remove scenario"
								>
									<Trash2 size={16} />
								</button>
							</div>
						))}
						<div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
							<input
								type="text"
								placeholder="Add new escalation scenario..."
								value={newEscalation}
								onChange={(e) => setNewEscalation(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										addEscalationScenario();
									}
								}}
								style={{ flex: 1 }}
							/>
							<button
								type="button"
								onClick={addEscalationScenario}
								className="action-btn primary"
								style={{
									padding: "10px 14px",
									borderRadius: "12px",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<Plus size={16} />
							</button>
						</div>
					</div>
				</div>
			</div>
			<div className="control-row">
				<button className="action-btn primary" type="button">
					Save behavior rules
				</button>
			</div>
		</div>
	);
}
