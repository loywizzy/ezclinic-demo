import { useEffect, useState } from "react";
import PermissionModal from "../components/PermissionModal";
import api from "../services/api";

const modules = [
  { key: 'customers', label: 'ลูกค้า' },
  { key: 'employees', label: 'พนักงาน' },
  { key: 'positions', label: 'ตำแหน่ง' },
];

export default function PermissionPage() {
  const [groups, setGroups] = useState([]);
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fixed useEffect - now properly handles Promise-based API call
  useEffect(() => {
    // Create an async function inside the effect
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/permissions");
        setGroups(response.data || []);
      } catch (err) {
        console.error("Error fetching permissions:", err);
        setError(err.message || "Failed to load permissions");
        setGroups([]);
      } finally {
        setLoading(false);
      }
    }
    
    // Call the async function immediately
    fetchData();
    
    // No return value from useEffect (or return a cleanup function)
  }, []);

  // Separated fetchData for reuse in event handlers
  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/permissions");
      setGroups(response.data || []);
    } catch (err) {
      console.error("Error fetching permissions:", err);
      setError(err.message || "Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this permission?")) {
      try {
        await api.delete(`/permissions/${id}`);
        await refreshData();
      } catch (err) {
        console.error("Error deleting permission:", err);
        alert("Failed to delete permission: " + (err.message || "Unknown error"));
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">สิทธิ์ผู้ใช้งาน</h2>        
        <button
          onClick={() => { setEdit(null); setShow(true); }}
          className="btn-primary px-4 py-2"
        >
          เพิ่มข้อมูล
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <p className="text-sm">You may need to authenticate. Check your API configuration.</p>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs text-left font-medium uppercase">รหัส</th>
                <th className="px-6 py-3 text-xs text-left font-medium uppercase">ชื่อกลุ่ม</th>
                <th className="px-6 py-3 text-xs text-left font-medium uppercase">รายละเอียด</th>
                <th className="px-6 py-3 text-xs text-left font-medium uppercase">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {groups.length > 0 ? groups.map(g => {
                // เปลี่ยนใช้ JSON field names (lowercase)
                const detailLabels = (g.details || [])
                  .filter(d => d.can_view)
                  .map(d => {
                    const m = modules.find(mo => mo.key === d.module);
                    return m ? m.label : d.module;
                  });
                return (
                  <tr key={g.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">{String(g.id).padStart(7,'0')}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{g.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{detailLabels.join(', ')}</td>
                    <td className="px-6 py-4 text-sm space-x-4">
                      <button onClick={() => { setEdit(g); setShow(true); }} className="text-yellow-500 hover:text-yellow-700">✏️</button>
                      <button onClick={() => handleDelete(g.id)} className="text-red-500 hover:text-red-700">🗑️</button>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">ไม่มีข้อมูลสิทธิ์</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {show && <PermissionModal
        group={edit}
        onClose={() => setShow(false)}
        onSave={async () => { 
          setShow(false); 
          await refreshData(); 
        }}
        modules={modules}
      />}
    </div>
  );
}