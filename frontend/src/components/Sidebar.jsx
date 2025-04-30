import { NavLink } from "react-router-dom";
import {
  MdSpaceDashboard,
  MdPeople,
  MdWork,
  MdSettings,
} from "react-icons/md";

export default function Sidebar() {
  const menu = [
    { to: "/dashboard", icon: <MdSpaceDashboard />, label: "แดชบอร์ด" },
    { to: "/customers",  icon: <MdPeople />,          label: "ลูกค้า"     },
    { to: "/employees",  icon: <MdPeople />,          label: "พนักงาน"   },
    { to: "/positions",  icon: <MdWork />,            label: "ตำแหน่ง"   },
    { to: "/settings",   icon: <MdSettings />,        label: "ตั้งค่าระบบ" },
  ];

  return (
    <aside className="w-60 bg-white h-screen shadow-md p-4">
      <h1 className="text-2xl font-bold mb-6">LOGO</h1>
      <nav className="space-y-2">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center p-2 rounded-md hover:bg-gray-100 ${
                isActive ? "bg-gray-200 font-semibold" : ""
              }`
            }
          >
            <span className="text-xl mr-3">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto text-xs text-gray-400 pt-6">
        version 1.0.0
      </div>
    </aside>
  );
}
