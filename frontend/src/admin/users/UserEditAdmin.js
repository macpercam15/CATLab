import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Form, Input, Label } from "reactstrap";
import tokenService from "../../services/token.service";
import "../../static/css/admin/adminPage.css";
import getErrorModal from "../../util/getErrorModal";
import getIdFromUrl from "../../util/getIdFromUrl";
import useFetchData from "../../util/useFetchData";
import useFetchState from "../../util/useFetchState";

const jwt = tokenService.getLocalAccessToken();

export default function UserEditAdmin() {
  const emptyItem = {
    id: null,
    username: "",
    password: "",
    name: "",
    surname: "",
    email: "",
    authority: null,
  };

  const id = getIdFromUrl(2);

  const [classNameValue, setClassNameValue] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [visible, setVisible] = useState(false);

  const [user, setUser] = useFetchState(
    emptyItem,
    `/api/v1/users/${id}`,
    jwt,
    setMessage,
    setVisible,
    id
  );

  const auths = useFetchData(`/api/v1/users/authorities`, jwt);

  /**
   * 🔥 FETCH del rol + MERGE directo en user (SIN entity state)
   */
  useEffect(() => {
    if (!user?.id || !user?.authority?.authority) return;

    const role = user.authority.authority;

    const url =
      role === "ADMIN"
        ? `/api/administradores/user/${user.id}`
        : role === "ESTUDIANTE"
        ? `/api/estudiantes/user/${user.id}`
        : role === "PROFESOR"
        ? `/api/profesores/user/${user.id}`
        : null;

    if (!url) return;

    fetch(url, {
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data) return;

        setUser((prev) => ({
          ...prev,
          name: data.firstName ?? prev.name ?? "",
          surname: data.lastName ?? prev.surname ?? "",
          email: data.email ?? prev.email ?? "",
        }));
      })
      .catch(console.error);
  }, [user?.id, user?.authority?.authority]);

  function handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    if (name === "authority") {
      const auth = auths.find((a) => a.id === Number(value));
      setUser({ ...user, authority: auth });
    } else {
      setUser({ ...user, [name]: value });
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      username: user.username,
      name: user.name,
      surname: user.surname,
      email: user.email,
      authority: user.authority,
    };

    if (password && password.trim() !== "") {
      payload.password = password;
    }

    fetch("/api/v1/users" + (user.id ? "/" + user.id : ""), {
      method: user.id ? "PUT" : "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.message) {
          setMessage(json.message);
          setVisible(true);
        } else {
          window.location.href = "/users";
        }
      })
      .catch((error) => {
        console.error(error);
        alert("Error al guardar el usuario");
      });
  }

  const modal = getErrorModal(setVisible, visible, message);

  const authOptions = auths.map((auth) => (
    <option key={auth.id} value={auth.id}>
      {auth.authority}
    </option>
  ));

  const isEdit = !!user.id;

  return (
    <div className="admin-user-form-page">
      <div className="admin-user-form-card">
        <h1 className="admin-user-form-title">
          {isEdit ? "Edit user" : "New user"}
        </h1>

        {modal}

        <Form onSubmit={handleSubmit} className="admin-user-form">

          <div className="admin-user-form-group">
            <Label for="email" className="admin-user-form-label">
              Email
            </Label>
            <Input
              type="email"
              name="email"
              id="email"
              value={user.email || ""}
              onChange={handleChange}
              placeholder="email@test.com"
              className="admin-user-form-input"
            />
          </div>

          <div className="admin-user-form-group">
            <Label for="username" className="admin-user-form-label">
              Username
            </Label>
            <Input
              type="text"
              required
              name="username"
              id="username"
              value={user.username || ""}
              onChange={handleChange}
              placeholder="username"
              className="admin-user-form-input"
            />
          </div>

          <div className="admin-user-form-group">
            <Label for="name" className="admin-user-form-label">
              Name
            </Label>
            <Input
              type="text"
              required
              name="name"
              id="name"
              value={user.name || ""}
              onChange={handleChange}
              placeholder="name"
              className="admin-user-form-input"
            />
          </div>

          <div className="admin-user-form-group">
            <Label for="surname" className="admin-user-form-label">
              Surname
            </Label>
            <Input
              type="text"
              required
              name="surname"
              id="surname"
              value={user.surname || ""}
              onChange={handleChange}
              placeholder="surname"
              className="admin-user-form-input"
            />
          </div>

          <div className="admin-user-form-group">
            <Label for="authority" className="admin-user-form-label">
              Role
            </Label>

            <Input
              type="select"
              name="authority"
              id="authority"
              value={user.authority?.id || ""}
              onChange={handleChange}
              className="admin-user-form-input admin-user-form-select"
            >
              <option value="">None</option>
              {authOptions}
            </Input>
          </div>

          {!isEdit && (
            <div className="admin-user-form-group">
              <Label for="className" className="admin-user-form-label">
                Class
              </Label>
              <Input
                type="text"
                name="className"
                id="className"
                value={classNameValue}
                onChange={(e) => setClassNameValue(e.target.value)}
                placeholder="class-name"
                className="admin-user-form-input"
              />
            </div>
          )}

          {isEdit && (
            <div className="admin-user-form-group">
              <Label for="password" className="admin-user-form-label">
                Password
              </Label>
              <Input
                type="password"
                name="password"
                id="password"
                placeholder="Leave empty to keep current password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-user-form-input"
              />
            </div>
          )}

          <div className="admin-user-form-actions">
            <button className="admin-user-form-button">Save</button>
            <Link to={`/users`} className="admin-user-form-button outline">
              Cancel
            </Link>
          </div>

        </Form>
      </div>
    </div>
  );
}