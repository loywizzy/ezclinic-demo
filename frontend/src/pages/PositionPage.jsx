import { useEffect, useState } from "react";
import PositionModal from "../components/PositionModal";
import api from "../services/api";

export default function PositionPage() {
  const [list, setList] = useState([]);
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState(null);

  const fetchData = () =>
    api.get("/positions").then(res => setList(res.data || []));

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">ตำแหน่ง</h2>
        <button
          onClick={() => { setEdit(null); setShow(true); }}
          className="btn-primary px-4 py-2"
        >เพิ่มตำแหน่ง</button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">รหัส</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">ชื่อ</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">เงินเดือน</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">สถานะ</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">จัดการ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {list.length > 0 ? list.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-700">{p.id}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{p.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{p.salary.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{p.status ? 'ใช้งาน' : 'ปิดใช้งาน'}</td>
                <td className="px-6 py-4 text-sm space-x-4">
                  <button onClick={() => { setEdit(p); setShow(true); }} className="text-yellow-500 hover:text-yellow-700">✏️</button>
                  <button onClick={() => api.delete(`/positions/${p.id}`).then(fetchData)} className="text-red-500 hover:text-red-700">🗑️</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">ไม่มีข้อมูลตำแหน่ง</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {show && <PositionModal
        position={edit}
        onClose={() => setShow(false)}
        onSave={() => { setShow(false); fetchData(); }}
      />}
    </div>
  );
}