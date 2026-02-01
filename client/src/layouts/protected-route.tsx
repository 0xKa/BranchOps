import { Outlet } from "react-router";

export default function ProtectedRoute() {
  // render on authenticated
  return (
    <>
      <Outlet />
    </>
  );
}
