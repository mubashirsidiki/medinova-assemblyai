"use client";

import { Loader2, ShieldCheck, Stethoscope } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { type LoginActionState, loginAction } from "@/app/actions";

function SubmitButton() {
	const { pending } = useFormStatus();
	return (
		<button
			className="action-btn primary auth-submit"
			type="submit"
			disabled={pending}
		>
			{pending ? (
				<Loader2 size={16} className="spin" />
			) : (
				<ShieldCheck size={16} />
			)}
			{pending ? "Signing in…" : "Continue"}
		</button>
	);
}

export function LoginForm() {
	const [state, formAction] = useActionState<LoginActionState, FormData>(
		loginAction,
		{},
	);

	return (
		<form action={formAction} className="auth-form">
			<div className="field">
				<label htmlFor="email">Email</label>
				<input
					id="email"
					name="email"
					type="email"
					placeholder="name@medinova.co.uk"
					autoComplete="email"
					required
				/>
			</div>

			<div className="field">
				<label htmlFor="password">Password</label>
				<input
					id="password"
					name="password"
					type="password"
					placeholder="••••••••"
					autoComplete="current-password"
					required
				/>
			</div>

			{state?.error ? <div className="auth-error">{state.error}</div> : null}

			<SubmitButton />

			<div className="auth-foot">
				<Stethoscope size={16} />
				<span>Protected access uses account sign-in.</span>
			</div>
		</form>
	);
}
