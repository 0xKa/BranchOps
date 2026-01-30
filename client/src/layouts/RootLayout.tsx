import { Outlet } from "react-router";

const RootLayout = () => {
  return (
    <div className="relative flex min-h-svh flex-col">
      <main className="flex-1">
        {/* <Toaster position="top-left" duration={4000} /> */}
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
