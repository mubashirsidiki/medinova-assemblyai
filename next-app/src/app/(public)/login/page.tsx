import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getSessionFromCookies } from "@/lib/auth";

export default async function LoginPage() {
	const session = await getSessionFromCookies();

	if (session) {
		redirect(session.defaultRoute);
	}

	return (
		<div className="auth-page">
			<div className="auth-shell">
				<div className="auth-copy">
					<div className="auth-brand">
						<div className="brand-badge">
							<Image
								className="brand-logo"
								src="/medinova.svg"
								alt="Medinova logo"
								width={40}
								height={40}
								priority
							/>
						</div>
						<div>
							<p>Medinova Health</p>
							<h1>Secure access for healthcare teams</h1>
						</div>
					</div>

					<p className="auth-lead">
						Sign in with your account credentials. The system will open the
						correct workspace automatically.
					</p>
				</div>

				<div className="auth-panel card card-pad">
					<div className="auth-panel-head">
						<h2>Sign in</h2>
						<p>Enter your account details to continue.</p>
					</div>
					<LoginForm />
				</div>
			</div>
		</div>
	);
}
