import { NavLink } from "react-router-dom";
import { MdDashboard, MdPeople, MdPerson, MdWork, MdLock } from "react-icons/md";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-50 h-screen flex flex-col items-center pt-8 space-y-6">
      {/* Logo */}
      <h1 className="text-3xl font-bold">LOGO</h1>

      {/* Dashboard */}
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex items-center w-11/12 py-3 px-4 rounded-lg transition-colors ${
            isActive ? "bg-white shadow text-sky-500" : "text-gray-600 hover:bg-white hover:shadow"
          }`
        }
      >
        <div className="p-2 rounded-full bg-sky-500 text-white mr-3">
          <MdDashboard size={20} />
        </div>
        <span className="font-medium">แดชบอร์ด</span>
      </NavLink>

      {/* ข้อมูลผู้ใช้ */}
      <div className="w-full px-4">
        <p className="text-gray-500 uppercase text-sm mb-2">ข้อมูลผู้ใช้</p>
        <NavLink
          to="/customers"
          className={({ isActive }) =>
            `flex items-center py-2 px-4 rounded-lg transition-colors ${
              isActive ? "bg-white shadow text-sky-500" : "text-gray-600 hover:bg-white hover:shadow"
            }`
          }
        >
          <div className="p-2 rounded-full bg-white shadow mr-3 text-gray-600">
            <MdPeople size={20} />
          </div>
          <span>ลูกค้า</span>
        </NavLink>
        <NavLink
          to="/employees"
          className={({ isActive }) =>
            `flex items-center py-2 px-4 rounded-lg transition-colors ${
              isActive ? "bg-white shadow text-sky-500" : "text-gray-600 hover:bg-white hover:shadow"
            }`
          }
        >
          <div className="p-2 rounded-full bg-white shadow mr-3 text-gray-600">
            <MdPerson size={20} />
          </div>
          <span>พนักงาน</span>
        </NavLink>
      </div>

      {/* ตั้งค่าระบบ */}
      <div className=" w-full px-4">
        <p className="text-gray-500 uppercase text-sm mb-2">ตั้งค่าระบบ</p>
        <NavLink
          to="/positions"
          className={({ isActive }) =>
            `flex items-center py-2 px-4 rounded-lg transition-colors ${
              isActive ? "bg-white shadow text-sky-500" : "text-gray-600 hover:bg-white hover:shadow"
            }`
          }
        >
          <div className="p-2 rounded-full bg-white shadow mr-3 text-gray-600">
            <MdWork size={20} />
          </div>
          <span>ตำแหน่ง</span>
        </NavLink>
        <NavLink
          to="/permissions"
          className={({ isActive }) =>
            `flex items-center py-2 px-4 rounded-lg transition-colors ${
              isActive ? "bg-white shadow text-sky-500" : "text-gray-600 hover:bg-white hover:shadow"
            }`
          }
        >

          
          <div className="p-2 rounded-full bg-white shadow mr-3 text-gray-600">
            <MdLock size={20} />
          </div>
          <span>สิทธิ์ผู้ใช้งาน</span>
        </NavLink>
      </div>

      {/* Version */}
      <span className="text-xs text-gray-400 mt-6">version 1.0.0</span>
    </aside>
  );
}