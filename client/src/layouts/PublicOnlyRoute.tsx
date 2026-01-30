import { Outlet } from "react-router";
const PublicOnlyRoute = () => {
  //  render on not authenticated
  return (
    <>
      <h1>Public Only Route</h1>
      <Outlet />
    </>
  );
};

export default PublicOnlyRoute;
