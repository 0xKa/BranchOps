import { Outlet } from "react-router";

const ProtectedRoute = () => {
  // render on authenticated
  return (
    <>
      <Outlet />
    </>
  );
};

export default ProtectedRoute;
