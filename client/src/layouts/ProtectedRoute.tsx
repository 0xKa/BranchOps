import { Outlet } from "react-router";

const ProtectedRoute = () => {
  // render on authenticated
  return (
    <>
      <h1>Protected Route</h1>
      <Outlet />
    </>
  );
};

export default ProtectedRoute;
