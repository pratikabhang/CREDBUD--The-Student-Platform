import React from "react";
import { Route, Redirect } from "react-router-dom";
import Cookies from "js-cookie";

const ProtectedRoute = ({ children, ...rest }) => {
  const authToken = Cookies.get("authToken");

  if (!authToken) {
    // Redirect to the login page if the authentication token is not present
    return <Redirect to="/login" />;
  }

  // Render the protected route if the authentication token is present
  return <Route {...rest}>{children}</Route>;
};

export default ProtectedRoute;
