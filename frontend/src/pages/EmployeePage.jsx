import React, { useEffect, useState } from "react";
import EmployeeModal from "../components/EmployeeModal";
import api from "../services/api";
import Swal from "sweetalert2";

export default function EmployeePage() {
  const [list, setList] = useState([]);
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState(null);

  // Normalize sql.NullString/NullTime objects to primitive values or null
  const normalizeEmployee = (e) => ({
    ...e,
    position_id:
      e.position_id && typeof e.position_id === 'object'
        ? e.position_id.Valid
          ? e.position_id.String
          : null
        : e.position_id,
    nickname:
      e.nickname && typeof e.nickname === 'object'
        ? e.nickname.Valid
          ? e.nickname.String
          : null
        : e.nickname,
    pay_date:
      e.pay_date && typeof e.pay_date === 'object'
        ? e.pay_date.Valid
          ? e.pay_date.String
          : null
        : e.pay_date,
  });

  const fetchData = () =>
    api
      .get("/employees")
      .then((res) => {
        const data = res.data || [];
        setList(data.map(normalizeEmployee));
      })
      .catch(console.error);

  useEffect(() => {
    fetchData();
  }, []);

  const onDelete = async (id) => {
    const result = await Swal.fire({
      title: 'ยืนยันลบ?',
      text: 'ข้อมูลพนักงานจะถูกลบถาวร',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    });
    if (result.isConfirmed) {
      await api.delete(`/employees/${id}`);
      Swal.fire('ลบแล้ว!', '', 'success');
      fetchData();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">ข้อมูลพนักงาน</h2>
        <button
          onClick={() => {
            setEdit(null);
            setShow(true);
          }}
          className="btn-primary px-4 py-2"
        >
          เพิ่มพนักงาน
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs text-left font-medium uppercase">รหัส</th>
              <th className="px-6 py-3 text-xs text-left font-medium uppercase">ชื่อ-นามสกุล</th>
              <th className="px-6 py-3 text-xs text-left font-medium uppercase">ตำแหน่ง</th>
              <th className="px-6 py-3 text-xs text-left font-medium uppercase">อีเมล</th>
              <th className="px-6 py-3 text-xs text-left font-medium uppercase">จัดการ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {list.length > 0 ? (
              list.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">{e.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {e.first_name} {e.last_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {e.position_id || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{e.email}</td>
                  <td className="px-6 py-4 text-sm space-x-4">
                    <button
                      onClick={() => {
                        setEdit(e);
                        setShow(true);
                      }}
                      className="text-yellow-500 hover:text-yellow-700"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(e.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  ไม่มีข้อมูลพนักงาน
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {show && (
        <EmployeeModal
          employee={edit}
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
