import { Outlet } from "react-router";
export default function PublicOnlyRoute() {
  //  render on not authenticated
  return (
    <>
      <Outlet />
    </>
  );
}
