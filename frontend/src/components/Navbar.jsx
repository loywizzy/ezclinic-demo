import { useState, useRef, useEffect } from "react";
import { FiUser, FiChevronDown, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navRef = useRef(null);
  const navigate = useNavigate();
  // ดึงชื่อผู้ใช้จาก localStorage (หรือ fallback)
  const name = localStorage.getItem("username") || "Please login";

  // คลิกข้างนอก dropdown ปิดอัตโนมัติ
  useEffect(() => {
    function onClick(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.replace("/login");
  };

  return (
    <nav className="bg-white shadow-sm px-6 py-4 flex justify-end items-center">
      <div className="relative" ref={navRef}>
        <button
          onClick={() => setOpen((o) => !o)}
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
