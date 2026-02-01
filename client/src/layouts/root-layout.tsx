import { Outlet } from "react-router";

export default function RootLayout() {
  return (
    <div className="relative flex min-h-svh flex-col">
      <main className="flex-1">
        {/* <Toaster position="top-left" duration={4000} /> */}
        <Outlet />
      </main>
    </div>
  );
}
