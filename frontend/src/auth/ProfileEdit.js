import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Form, Input, Label } from "reactstrap";
import tokenService from "../services/token.service";
import "../static/css/admin/adminPage.css";

export default function ProfileEdit() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    email: "",
  });

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  const jwt = tokenService.getLocalAccessToken();

  // 1. USER (auth base)
  useEffect(() => {
    if (!jwt) {
      setError("No hay sesión activa");
      return;
    }

    fetch("/api/v1/users/me", {
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar el perfil");
        return res.json();
      })
      .then((data) => setProfile(data))
      .catch((err) => {
        console.log("ERROR /me:", err);
        setError(err.message);
      });
  }, [jwt]);

  // 2. ENTITY (datos reales)
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
      .then((entity) => {
        setForm({
          firstName: entity?.firstName || "",
          lastName: entity?.lastName || "",
          email: entity?.email || "",
          username: profile?.username || "",
          password: "",
        });
      })
      .catch((err) => {
        console.log("ERROR entity:", err);
      });
  }, [profile, jwt]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const usernameChanged = form.username !== profile.username;
    const passwordChanged =
      form.password && form.password.trim() !== "";

    const authChanged = usernameChanged || passwordChanged;

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      username: form.username,
      email: form.email,
    };

    if (passwordChanged) {
      payload.password = form.password;
    }

    try {
      const res = await fetch("/api/v1/users/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${jwt}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("No se pudo actualizar el perfil");

      await res.json();

      // 💡 CASO NORMAL: no cambias credenciales
      if (!authChanged) {
        window.location.href = "/profile";
        return;
      }

      // 💥 CASO CRÍTICO: username o password cambiado
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      // rediriges a login
      window.location.href = "/login";

    } catch (err) {
      console.log("ERROR update:", err);
      setError(err.message);
    }
  }

  return (
    <div className="admin-user-form-page">
      <div className="admin-user-form-card">
        <h1 className="admin-user-form-title">Edit profile</h1>

        {error && <div className="auth-alert">{error}</div>}

        <Form onSubmit={handleSubmit} className="admin-user-form">

          <div className="admin-user-form-group">
            <Label className="admin-user-form-label">First name</Label>
            <Input
              className="admin-user-form-input"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="admin-user-form-group">
            <Label className="admin-user-form-label">Last name</Label>
            <Input
              className="admin-user-form-input"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="admin-user-form-group">
            <Label className="admin-user-form-label">Username</Label>
            <Input
              className="admin-user-form-input"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="admin-user-form-group">
            <Label className="admin-user-form-label">Email</Label>
            <Input
              className="admin-user-form-input"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="admin-user-form-group">
            <Label className="admin-user-form-label">Password</Label>
            <Input
              type="password"
              className="admin-user-form-input"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Leave empty to keep current password"
            />
          </div>

          <div className="admin-user-form-actions">
            <button className="admin-user-form-button" type="submit">
              Save
            </button>

            <Link to="/profile" className="admin-user-form-button outline">
              Cancel
            </Link>
          </div>

        </Form>
      </div>
    </div>
  );
}