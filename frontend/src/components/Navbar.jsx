import { useState, useRef, useEffect } from "react";
import { FiUser, FiChevronDown, FiLogOut } from "react-icons/fi";
import { useLocation } from "react-router-dom";

// Mapping pathnames to titles
const titles = {
  "/dashboard": "แดชบอร์ด",
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();

  // Determine title based on current path
  const title = titles[location.pathname] || "";

  // User info
  const name = localStorage.getItem("username") || "";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.replace("/login");
  };

  return (
    <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
      {/* Dynamic page title */}
      <h2 className="text-2xl font-semibold">{title}</h2>

      {/* User dropdown */}
      <div className="relative" ref={navRef}>
        <button
          onClick={() => setOpen(o => !o)}
          className="inline-flex items-center space-x-2 hover:bg-gray-100 px-3 py-1 rounded"
        >
          <FiUser className="text-gray-600" />
          <span className="text-gray-700">{name}</span>
          <FiChevronDown className="text-gray-600" />
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-10">
            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
            >
              <FiLogOut /> <span>ออกจากระบบ</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
