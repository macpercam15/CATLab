import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import tokenService from "../services/token.service";
import "../static/css/auth/authPage.css";

export default function ProfileEdit() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", surname: "", password: "" });
  const [error, setError] = useState("");
  const jwt = tokenService.getLocalAccessToken();

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
      .then((data) => {
        setProfile(data);
        setForm({
          name: data?.name || "",
          surname: data?.surname || "",
          password: "",
        });
      })
      .catch((err) => setError(err.message));
  }, [jwt]);

  const role =
    profile?.authority?.authority ||
    profile?.authority ||
    (Array.isArray(profile?.roles) ? profile.roles[0] : "-");
  const classesValue =
    profile?.classes ||
    profile?.className ||
    profile?.class ||
    profile?.classroom ||
    profile?.course ||
    "-";

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const payload = {
      name: form.name,
      surname: form.surname,
    };

    if (form.password.trim() !== "") {
      payload.password = form.password;
    }

    fetch("/api/v1/users/me", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) throw new Error("No se pudo actualizar el perfil");
        return response.json();
      })
      .then(() => {
        window.location.href = "/profile";
      })
      .catch((err) => setError(err.message));
  }

  return (
    <div className="profile-page-container">
      <div className="profile-edit-card">
        <h1 className="profile-title">Edit profile</h1>
        {error && <div className="auth-alert">{error}</div>}
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-form-group">
            <label className="profile-form-label" htmlFor="name">
              Name
            </label>
            <input
              className="profile-form-input"
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
            />
          </div>
          <div className="profile-form-group">
            <label className="profile-form-label" htmlFor="surname">
              Surname
            </label>
            <input
              className="profile-form-input"
              id="surname"
              name="surname"
              type="text"
              required
              value={form.surname}
              onChange={handleChange}
            />
          </div>
          <div className="profile-form-group">
            <label className="profile-form-label" htmlFor="role">
              Role
            </label>
            <input
              className="profile-form-input"
              id="role"
              type="text"
              value={role}
              disabled
            />
          </div>
          <div className="profile-form-group">
            <label className="profile-form-label" htmlFor="classes">
              My classes
            </label>
            <input
              className="profile-form-input"
              id="classes"
              type="text"
              value={classesValue}
              disabled
            />
          </div>
          <div className="profile-form-group">
            <label className="profile-form-label" htmlFor="password">
              Password
            </label>
            <input
              className="profile-form-input"
              id="password"
              name="password"
              type="password"
              placeholder="Leave empty to keep current password"
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <div className="profile-form-actions">
            <button className="profile-action-button edit" type="submit">
              Save
            </button>
            <Link to="/profile" className="profile-action-button cancel">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
