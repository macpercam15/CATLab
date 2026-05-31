import React from "react";
import { Link } from "react-router-dom";
import "../../static/css/auth/authButton.css";
import "../../static/css/auth/authPage.css";
import tokenService from "../../services/token.service";

const Logout = () => {
  function sendLogoutRequest() {
    const jwt = window.localStorage.getItem("jwt");
    if (jwt || typeof jwt === "undefined") {
      tokenService.removeUser();
      window.location.href = "/";
    } else {
      alert("There is no user logged in");
    }
  }

  return (
    <div className="auth-page-container centered">
      <div className="logout-card">
        <h2 className="logout-title">Are you sure you want to log out?</h2>
        <p className="logout-subtitle">You can always log in again later.</p>
        <div className="logout-actions">
          <Link className="auth-button outline" to="/" style={{ textDecoration: "none" }}>
            No
          </Link>
          <button className="auth-button danger" onClick={() => sendLogoutRequest()}>
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Logout;
