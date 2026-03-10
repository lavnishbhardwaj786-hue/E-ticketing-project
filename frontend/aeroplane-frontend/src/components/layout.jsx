import { Outlet } from "react-router-dom";
import Navbar from "./navbar.jsx";
function Layout() {
  return (
    <div className="relative min-h-screen">

      <Navbar className="fixed top-0 left-0 w-full z-50 bg-blue-500" />

      <div className="flex relative min-h-[calc(100vh-80px)] items-center justify-center">
        <Outlet />
      </div>
    </div>
  );
}
export default Layout