import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import tokenService from "../services/token.service";
import "../static/css/auth/authPage.css";

export default function ProfileInfo() {
	const [profile, setProfile] = useState(null);
	const [entity, setEntity] = useState(null);
	const [error, setError] = useState("");

	const jwt = tokenService.getLocalAccessToken();

	// USER (login info)
	useEffect(() => {
		if (!jwt) return;

		fetch("/api/v1/users/me", {
			headers: {
				Authorization: `Bearer ${jwt}`,
				Accept: "application/json",
			},
		})
			.then((response) => {
				if (!response.ok) throw new Error("No se pudo cargar el perfil");
				return response.json();
			})
			.then((data) => setProfile(data))
			.catch((err) => setError(err.message));
	}, [jwt]);

	// ENTITY (perfil real)
	useEffect(() => {
		if (!profile?.id || !profile?.authority?.authority) return;

		const role = profile.authority.authority;

		let url = null;

		if (role === "ESTUDIANTE") {
			url = `/api/estudiantes/user/${profile.id}`;
		} else if (role === "PROFESOR") {
			url = `/api/profesores/user/${profile.id}`;
		} else if (role === "ADMIN") {
			url = `/api/administradores/user/${profile.id}`;
		}

		if (!url) return;

		fetch(url, {
			headers: {
				Authorization: `Bearer ${jwt}`,
				Accept: "application/json",
			},
		})
			.then((res) => res.json())
			.then((data) => setEntity(data))
			.catch((err) => console.error(err));
	}, [profile, jwt]);

	const role =
		profile?.authority?.authority ||
		profile?.authority ||
		(Array.isArray(profile?.roles) ? profile.roles[0] : "-");

	function handleDelete() {
		const confirmed = window.confirm("Eliminar la cuenta definitivamente?");
		if (!confirmed) return;

		fetch("/api/v1/users/me", {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${jwt}`,
				Accept: "application/json",
			},
		})
			.then((response) => {
				if (!response.ok) throw new Error("No se pudo eliminar la cuenta");
				tokenService.removeUser();
				window.location.href = "/login";
			})
			.catch((err) => setError(err.message));
	}

	return (
		<div className="profile-page-container">
			<div>
				<h1 className="profile-title">Profile info</h1>

				<div className="profile-card">
					{error && <div className="auth-alert">{error}</div>}

					<div className="profile-list">

						<div className="profile-row">
							<span className="profile-label">Username:</span>
							<span className="profile-value">
								{profile?.username || "-"}
							</span>
						</div>

						<div className="profile-row">
							<span className="profile-label">Name:</span>
							<span className="profile-value">
								{entity?.firstName || "-"}
							</span>
						</div>

						<div className="profile-row">
							<span className="profile-label">Surname:</span>
							<span className="profile-value">
								{entity?.lastName || "-"}
							</span>
						</div>

						<div className="profile-row">
							<span className="profile-label">Email:</span>
							<span className="profile-value">
								{entity?.email || "-"}
							</span>
						</div>

						<div className="profile-row">
							<span className="profile-label">Role:</span>
							<span className="profile-value">
								{role}
							</span>
						</div>

					</div>
				</div>

				<div className="profile-actions">
					<Link to="/profile/edit" className="profile-action-button edit">
						Edit profile
					</Link>

					<button
						type="button"
						className="profile-action-button delete"
						onClick={handleDelete}
					>
						Delete account
					</button>
				</div>
			</div>
		</div>
	);
}