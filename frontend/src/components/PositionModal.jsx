import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../services/api";

export default function PositionModal({ position, onClose, onSave }) {
  const [form, setForm] = useState({ name: "", salary: "", status: true });

  useEffect(() => {
    if (position) {
      setForm({ name: position.name, salary: position.salary, status: position.status });
    }
  }, [position]);

  const handle = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const payload = {
    name: form.name,
    salary: parseFloat(form.salary),
    status: form.status
  };

  const submit = async () => {
    if (!form.name || !form.salary) {
      return Swal.fire('กรุณากรอกชื่อและเงินเดือน');
    }
    try {
      if (position) {
        await api.put(`/positions/${position.id}`, payload);
      } else {
        await api.post(`/positions`, payload);
      }
      await Swal.fire('สำเร็จ', 'บันทึกตำแหน่งแล้ว', 'success');
      onSave();
    } catch (err) {
      Swal.fire('ผิดพลาด', err.response?.data?.error || err.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500">✖️</button>
        <h3 className="text-lg font-semibold mb-4">{position ? 'แก้ไขตำแหน่ง' : 'เพิ่มตำแหน่ง'}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">ชื่อ</label>
            <input name="name" value={form.name} onChange={handle} className="input w-full" required />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">เงินเดือน</label>
            <input name="salary" type="number" value={form.salary} onChange={handle} className="input w-full" required />
          </div>
          <div className="flex items-center">
            <input name="status" type="checkbox" checked={form.status} onChange={handle} className="mr-2" />
            <span className="text-sm">ใช้งาน</span>
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded">ยกเลิก</button>
          <button onClick={submit} className="px-4 py-2 bg-sky-500 text-white rounded">บันทึก</button>
        </div>
      </div>
    </div>
  );
}