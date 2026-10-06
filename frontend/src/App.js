import React from "react";
import { Route, Routes } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { ErrorBoundary } from "react-error-boundary";
import AppNavbar from "./AppNavbar";
import Home from "./home";
import PrivateRoute from "./privateRoute";
import Login from "./auth/login";
import Logout from "./auth/logout";
import ProfileInfo from "./auth/ProfileInfo";
import ProfileEdit from "./auth/ProfileEdit";
import tokenService from "./services/token.service";
import UserListAdmin from "./admin/users/UserListAdmin";
import UserEditAdmin from "./admin/users/UserEditAdmin";
import About from "./home/About";
import SwaggerDocs from "./public/swagger";
import MyProjects from "./student/MyProjects";
import NewProject from "./student/NewProject";
import TeacherProjects from "./teacher/TeacherProjects";
import TranslateEditor from "./student/TranslateEditor";
import TeacherFeedbackEditor from "./teacher/TeacherFeedbackEditor";
import MyTms from "./student/tm/MyTms";
// import NewTm from "./student/tm/NewTm";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

function App() {
  const jwt = tokenService.getLocalAccessToken();
  let roles = []
  if (jwt) {
    roles = getRolesFromJWT(jwt);
  }

  function getRolesFromJWT(jwt) {
    return jwt_decode(jwt).authorities;
  }

  let adminRoutes = <></>;
  let studentRoutes = <></>;
  let teacherRoutes = <></>;
  let publicRoutes = <></>;
  let userRoutes = <></>;

  roles.forEach((role) => {
    if (role === "ADMIN") {
      adminRoutes = (
        <>
          <Route path="/users" exact={true} element={<PrivateRoute><UserListAdmin /></PrivateRoute>} />
          <Route path="/users/new" exact={true} element={<PrivateRoute><UserEditAdmin /></PrivateRoute>} />
          <Route path="/users/:username" exact={true} element={<PrivateRoute><UserEditAdmin /></PrivateRoute>} />
          
        </>)
    }
    if (role === "ESTUDIANTE") {
      studentRoutes = (
        <>
          <Route path="/my-projects" exact={true} element={<PrivateRoute><MyProjects /></PrivateRoute>} />
          <Route path="/my-projects/new" exact={true} element={<PrivateRoute><NewProject /></PrivateRoute>} />
          <Route path="/translate/:projectId" exact={true} element={<PrivateRoute><TranslateEditor /></PrivateRoute>} />
          <Route path="/student/tms" exact={true} element={<PrivateRoute><MyTms /></PrivateRoute>} />
          {/* <Route path="/student/tms/new" exact={true} element={<PrivateRoute><NewTm /></PrivateRoute>} /> */}
          {/* <Route path="/dashboard" element={<PrivateRoute><OwnerDashboard /></PrivateRoute>} /> */}
        </>)
    }
    if (role === "PROFESOR") {
      teacherRoutes = (
        <>
          {/* <Route path="/dashboard" element={<PrivateRoute><OwnerDashboard /></PrivateRoute>} /> */}
          <Route path="/teacher/projects" exact={true} element={<PrivateRoute><TeacherProjects /></PrivateRoute>} />
          <Route path="/teacher/projects/:projectId/feedback" exact={true} element={<PrivateRoute><TeacherFeedbackEditor /></PrivateRoute>} />
          
        </>)
    }
  })
  if (!jwt) {
    publicRoutes = (
      <>        
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
      </>
    )
  } else {
    userRoutes = (
      <>
        {/* <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} /> */}        
        <Route path="/logout" element={<Logout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<PrivateRoute><ProfileInfo /></PrivateRoute>} />
        <Route path="/profile/edit" element={<PrivateRoute><ProfileEdit /></PrivateRoute>} />
      </>
    )
  }

  return (
    <div>
      <ErrorBoundary FallbackComponent={ErrorFallback} >
        <AppNavbar />
        <Routes>
          <Route path="/" exact={true} element={<Home />} />
          <Route path="/docs" element={<SwaggerDocs />} />
          {publicRoutes}
          {userRoutes}
          {adminRoutes}
          {studentRoutes}
          {teacherRoutes}
        </Routes>
      </ErrorBoundary>
    </div>
  );
}

export default App;
