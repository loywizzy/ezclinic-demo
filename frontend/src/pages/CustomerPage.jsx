import { useEffect, useState } from "react";
import CustomerModal from "../components/CustomerModal";
import api from "../services/api";
import Swal from 'sweetalert2';


export default function CustomerPage() {
  const [list, setList] = useState([]);
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState(null);

  // โหลดข้อมูลลูกค้า
  const fetchData = () =>
    api
      .get("/customers")
      .then((res) => setList(res.data || []))
      .catch((err) => {
        console.error(err);
        setList([]);
      });

  useEffect(() => {
    fetchData();
  }, []);


  const handleDelete = (id) => {
    Swal.fire({
      title: 'คุณต้องการลบใช่หรือไม่?',
      text: 'ข้อมูลนี้จะถูกลบอย่างถาวร!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (result.isConfirmed) {
        api
          .delete(`/customers/${id}`)
          .then(() => {
            fetchData();
            Swal.fire('ลบแล้ว!', 'ข้อมูลถูกลบเรียบร้อย', 'success');
          })
          .catch((err) => {
            console.error(err);
            Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error');
          });
      }
    });
  };

  
  return (
    <div className="p-2 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">ข้อมูลลูกค้า</h2>
        <button
          onClick={() => {
            setEdit(null);
            setShow(true);
          }}
          className="btn-primary px-4 py-2"
        >
          เพิ่มข้อมูล
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัส</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ - นามสกุล</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เบอร์โทรศัพท์</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อีเมล</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {list.length > 0 ? (
              list.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{c.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{c.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{c.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{c.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                    <button
                      onClick={() => {
                        setEdit(c);
                        setShow(true);
                      }}
                      className="text-yellow-500 hover:text-yellow-700"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  ไม่มีข้อมูลลูกค้า
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>
          แสดง {list.length > 0 ? `1-${list.length}` : "0"} จากทั้งหมด {list.length} รายการ
        </span>
        <div className="space-x-2">
          <button className="px-2 py-1 rounded hover:bg-gray-100">&lt;</button>
          <button className="px-2 py-1 rounded bg-sky-500 text-white">1</button>
          <button className="px-2 py-1 rounded hover:bg-gray-100">2</button>
          <button className="px-2 py-1 rounded hover:bg-gray-100">3</button>
          <button className="px-2 py-1 rounded hover:bg-gray-100">&gt;</button>
        </div>
      </div>

      {/* Modal */}
      {show && (
        <CustomerModal
          customer={edit}
          onClose={() => setShow(false)}
          onSave={() => {
            setShow(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
