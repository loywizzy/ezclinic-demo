import { useEffect, useState } from "react";
import EmployeeModal from "../components/EmployeeModal.jsx";
import api from "../services/api";

export default function EmployeePage() {
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, [page]);

  const fetchEmployees = async () => {
    const res = await api.get(`/employees?page=${page}`);
    setList(res.data);
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      <aside className="col-span-2">
        <Sidebar />
      </aside>
      <div className="col-span-10 space-y-4">
        <button
          onClick={() => setShowModal(true)}
          className="bg-sky-500 text-white px-4 py-2 rounded-full float-right"
        >
          เพิ่มข้อมูล
        </button>
        <h2 className="text-xl font-semibold">ข้อมูลพนักงาน</h2>
        <div className="overflow-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">รหัส</th>
                <th className="px-4 py-2">ชื่อ - นามสกุล</th>
                <th className="px-4 py-2">ตำแหน่ง</th>
                <th className="px-4 py-2">อีเมล</th>
                <th className="px-4 py-2">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {list.map((e) => (
                <tr key={e.id} className="border-b">
                  <td className="px-4 py-2">{e.id}</td>
                  <td className="px-4 py-2">
                    {e.prefix} {e.first_name} {e.last_name}
                  </td>
                  <td className="px-4 py-2">{e.position_id}</td>
                  <td className="px-4 py-2">{e.email}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button className="text-yellow-500">✏️</button>
                    <button className="text-red-500">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* pagination */}
        <div className="flex justify-end space-x-1">
          {/* ปรับตาม totalPages */}
          {[...Array(10)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded ${
                page === i + 1 ? "bg-sky-500 text-white" : "hover:bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {showModal && (
        <EmployeeModal
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchEmployees();
          }}
        />
      )}
    </div>
  );
}
