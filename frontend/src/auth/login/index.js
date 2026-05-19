import React, { useState } from "react";
import { Alert } from "reactstrap";
import FormGenerator from "../../components/formGenerator/formGenerator";
import tokenService from "../../services/token.service";
import "../../static/css/auth/authButton.css";
import "../../static/css/auth/authPage.css";
import { loginFormInputs } from "./form/loginFormInputs";

export default function Login() {
  const [message, setMessage] = useState(null);
  const loginFormRef = React.createRef();

  async function handleSubmit({ values }) {
    const reqBody = values;
    setMessage(null);
    await fetch("/api/v1/auth/signin", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify(reqBody),
    })
      .then(function (response) {
        if (response.status === 200) return response.json();
        else return Promise.reject("Invalid login attempt");
      })
      .then(function (data) {
        tokenService.setUser(data);
        tokenService.updateLocalAccessToken(data.token);
        window.location.href = "/";
      })
      .catch((error) => {
        setMessage(error);
      });
  }

  return (
    <div className="auth-page-container">
        <div className="login-card-left">
          <h2>Looking to join us?</h2>
          <p>Accounts are managed by administrators.</p>

          <h3>For Students:</h3>
          <p>Please ask your teacher for your login details.</p>

          <h3>For Educators:</h3>
          <p>
            Want to bring CATLab to your classroom? To request access, please
            email us at:
          </p>

          <div className="contact-row">
            <span style={{ fontFamily: "'Anonymous Pro', monospace" , fontSize: '2rem' }}>✉ catlab@outlook.es</span>
          </div>
        </div>

        <div className="login-card-right">
          {message ? (
            <Alert className="auth-alert" color="danger">
              {message}
            </Alert>
          ) : null}
          <h1>Login</h1>

          <FormGenerator 
            ref={loginFormRef}
            inputs={loginFormInputs}
            onSubmit={handleSubmit}
            numberOfColumns={1}
            listenEnterKey
            buttonText="Login"
            buttonClassName="auth-button"
            childrenPosition={-1}
          >
            <a className="forgot-link" href="/password-recovery">
              Forgot your password?
            </a>
          </FormGenerator>
        </div>
      </div>
  );
}