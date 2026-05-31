import { useState } from "react";
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
    authority: null,
  };
  const id = getIdFromUrl(2);
  const [email, setEmail] = useState("");
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

  function handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    if (name === "authority") {
      const auth = auths.find((a) => a.id === Number(value));
      setUser({ ...user, authority: auth });
    } else setUser({ ...user, [name]: value });
  }

 function handleSubmit(event) {
  event.preventDefault();

  const payload = {
    username: user.username,
    authority: user.authority,
  };

  // Solo enviar password si se ha escrito algo
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
          {!isEdit && (
            <div className="admin-user-form-group">
              <Label for="email" className="admin-user-form-label">
                Email
              </Label>
              <Input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email@test.com"
                className="admin-user-form-input"
              />
            </div>
          )}
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
            <Label for="authority" className="admin-user-form-label">
              Role
            </Label>
            {user.id ? (
              <Input
                type="select"
                disabled
                name="authority"
                id="authority"
                value={user.authority?.id || ""}
                onChange={handleChange}
                className="admin-user-form-input admin-user-form-select"
              >
                <option value="">None</option>
                {authOptions}
              </Input>
            ) : (
              <Input
                type="select"
                required
                name="authority"
                id="authority"
                value={user.authority?.id || ""}
                onChange={handleChange}
                className="admin-user-form-input admin-user-form-select"
              >
                <option value="">None</option>
                {authOptions}
              </Input>
            )}
            {!isEdit && (
              <div className="admin-user-form-note">
                Password will be set automatically based on role.
              </div>
            )}
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
                onChange={(event) => setClassNameValue(event.target.value)}
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
                onChange={(event) => setPassword(event.target.value)}
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
