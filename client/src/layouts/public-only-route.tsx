import { Outlet } from "react-router";
export default function PublicOnlyRoute() {
  //  render on not authenticated
  return (
    <>
      <h1>Public Only Route</h1>
      <Outlet />
    </>
  );
}
