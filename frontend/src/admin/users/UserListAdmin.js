import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, ButtonGroup, Table } from "reactstrap";
import tokenService from "../../services/token.service";
import "../../static/css/admin/adminPage.css";
import deleteFromList from "../../util/deleteFromList";
import getErrorModal from "../../util/getErrorModal";
import useFetchState from "../../util/useFetchState";

const jwt = tokenService.getLocalAccessToken();

export default function UserListAdmin() {
  const [message, setMessage] = useState(null);
  const [visible, setVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [appliedRole, setAppliedRole] = useState("");
  const [appliedClass, setAppliedClass] = useState("");
  const [users, setUsers] = useFetchState(
    [],
    `/api/v1/users`,
    jwt,
    setMessage,
    setVisible
  );
  const [alerts, setAlerts] = useState([]);

  const roleOptions = Array.from(
    new Set(
      users
        .map((user) => user?.authority?.authority)
        .filter((role) => typeof role === "string" && role.trim() !== "")
    )
  ).sort((a, b) => a.localeCompare(b));

  const classOptions = Array.from(
    new Set(
      users
        .map(
          (user) =>
            user?.className || user?.class || user?.classroom || user?.course
        )
        .filter(
          (value) => typeof value === "string" && value.trim() !== ""
        )
    )
  ).sort((a, b) => a.localeCompare(b));

  const filteredUsers = users.filter((user) => {
    const role = user?.authority?.authority || "";
    const userClass =
      user?.className || user?.class || user?.classroom || user?.course || "";
    const roleMatch = !appliedRole || role === appliedRole;
    const classMatch = !appliedClass || userClass === appliedClass;
    return roleMatch && classMatch;
  });

  const userList = filteredUsers.map((user) => {
    const userClass =
      user.className ||
      user.class ||
      user.classroom ||
      user.course ||
      "-";
    return (
      <tr key={user.id}>
        <td>{user.username}</td>
        <td>{user.authority.authority}</td>
        <td>{userClass}</td>
        <td>
          <ButtonGroup>
            <Button
              size="sm"
              color="primary"
              aria-label={"edit-" + user.id}
              tag={Link}
              to={"/users/" + user.id}
              className="admin-users-action admin-users-edit"
            >
              Edit
            </Button>
            <Button
              size="sm"
              color="danger"
              aria-label={"delete-" + user.id}
              onClick={() =>
                deleteFromList(
                  `/api/v1/users/${user.id}`,
                  user.id,
                  [users, setUsers],
                  [alerts, setAlerts],
                  setMessage,
                  setVisible
                )
              }
              className="admin-users-action admin-users-delete"
            >
              Delete
            </Button>
          </ButtonGroup>
        </td>
      </tr>
    );
  });
  const modal = getErrorModal(setVisible, visible, message);

  return (
    <div className="admin-page-container admin-users-page">
      <div className="admin-users-header">
        <h1>Users</h1>
        <Button className="admin-users-new" tag={Link} to="/users/new">
          New User
        </Button>
      </div>
      {alerts.map((a) => a.alert)}
      {modal}
      <div className="admin-users-filters">
        <select
          className="admin-users-select"
          aria-label="role-filter"
          value={selectedRole}
          onChange={(event) => setSelectedRole(event.target.value)}
        >
          <option value="">Role</option>
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <select
          className="admin-users-select"
          aria-label="class-filter"
          value={selectedClass}
          onChange={(event) => setSelectedClass(event.target.value)}
        >
          <option value="">Class</option>
          {classOptions.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <Button
          className="admin-users-filter-apply"
          onClick={() => {
            setAppliedRole(selectedRole);
            setAppliedClass(selectedClass);
          }}
        >
          Apply
        </Button>
      </div>
      <div className="admin-users-card">
        <Table aria-label="users" className="admin-users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Class</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{userList}</tbody>
        </Table>
      </div>
    </div>
  );
}
