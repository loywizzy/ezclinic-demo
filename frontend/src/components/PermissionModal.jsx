import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../services/api";

export default function PermissionModal({ group, onClose, onSave, modules }) {
  const [name, setName] = useState("");
  const [details, setDetails] = useState([]);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDetails(group.details);
    } else {
      setName("");
      // initialize default details all false
      setDetails(modules.map(m => ({ module: m.key, can_view: false, can_create: false, can_update: false, can_delete: false })));
    }
  }, [group]);

  const toggle = (idx, key) => {
    setDetails(d => d.map((item,i) => i===idx ? { ...item, [key]: !item[key] } : item));
  };

  const submit = async () => {
    if (!name) {
      return Swal.fire('กรุณากรอกชื่อกลุ่ม');
    }
    const payload = { name, details };
    try {
      if (group) await api.put(`/permissions/${group.id}`, payload);
      else await api.post(`/permissions`, payload);
      await Swal.fire('สำเร็จ', 'บันทึกสิทธิ์แล้ว', 'success');
      onSave();
    } catch (err) {
      Swal.fire('ผิดพลาด', err.response?.data?.error || err.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500">✖️</button>
        <h3 className="text-xl font-semibold mb-4">{group ? 'แก้ไขสิทธิ์ผู้ใช้งาน' : 'เพิ่มสิทธิ์ผู้ใช้งาน'}</h3>
        <input
          type="text"
          placeholder="ชื่อสิทธิ์ผู้ใช้งาน"
          value={name}
          onChange={e => setName(e.target.value)}
          className="input w-full mb-4"
          required
        />
        <table className="min-w-full text-left mb-6">
          <thead className="bg-sky-500 text-white">
            <tr>
              <th className="px-4 py-2">รายการ</th>
              <th className="px-4 py-2">ดู</th>
              <th className="px-4 py-2">สร้าง</th>
              <th className="px-4 py-2">แก้ไข</th>
              <th className="px-4 py-2">ลบ</th>
            </tr>
          </thead>
          <tbody>
            {details.map((d, idx) => {
              const label = modules.find(m => m.key===d.module)?.label;
              return (
                <tr key={d.module} className="border-b">
                  <td className="px-4 py-2">{label}</td>
                  <td className="px-4 py-2 text-center"><input type="checkbox" checked={d.can_view} onChange={() => toggle(idx, 'can_view')} /></td>
                  <td className="px-4 py-2 text-center"><input type="checkbox" checked={d.can_create} onChange={() => toggle(idx, 'can_create')} /></td>
                  <td className="px-4 py-2 text-center"><input type="checkbox" checked={d.can_update} onChange={() => toggle(idx, 'can_update')} /></td>
                  <td className="px-4 py-2 text-center"><input type="checkbox" checked={d.can_delete} onChange={() => toggle(idx, 'can_delete')} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-6 py-2 border rounded">ยกเลิก</button>
          <button onClick={submit} className="px-6 py-2 bg-sky-500 text-white rounded">บันทึก</button>
        </div>
      </div>
    </div>
  );
}