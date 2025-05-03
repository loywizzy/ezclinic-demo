import { useState, useEffect } from "react";
import api from "../services/api";
import Swal from "sweetalert2";

export default function CustomerModal({ customer, onClose, onSave }) {
  const [form, setForm] = useState({ full_name: "", phone: "", email: "" });

  useEffect(() => {
    if (customer) {
      setForm({
        full_name: customer.full_name,
        phone: customer.phone,
        email: customer.email,
      });
    } else {
      setForm({ full_name: "", phone: "", email: "" });
    }
  }, [customer]);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submit = async () => {
    // Validation: require all fields
    if (!form.full_name || !form.phone || !form.email) {
      await Swal.fire({
        icon: 'warning',
        title: 'กรุณากรอกทุกช่อง',
        confirmButtonText: 'ตกลง',
        customClass: { popup: 'rounded-lg p-6' }
      });
      return;
    }

    try {
      if (customer) {
        await api.put(`/customers/${customer.id}`, form);
      } else {
        await api.post(`/customers`, form);
      }
      // Success alert
      await Swal.fire({
        icon: 'success',
        title: 'บันทึกข้อมูลสำเร็จ',
        confirmButtonText: 'ตกลง',
        customClass: { popup: 'rounded-lg p-6' }
      });
      onSave();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: "Email นี้มีอยู่ในระบบแล้ว",
        confirmButtonText: 'ตกลง',
      });
    }
  };
  

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-30 flex items-center justify-center p-6 z-50  ">
      <div className="bg-white rounded-2xl w-full max-w-lg p-8 space-y-6 relative shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl"
        >
          &times;
        </button>
        <h3 className="text-xl font-semibold">ลูกค้า</h3>
  
        <div className="grid grid-cols-1 gap-4">
          {/* ชื่อ - นามสกุล */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ - นามสกุล</label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handle}
              placeholder="placeholder"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>
          {/* เบอร์โทรศัพท์ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handle}
              placeholder="tel"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>
          {/* อีเมล */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handle}
              placeholder="example@email.com"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>
        </div>
  
        {/* Buttons */}
        <div className="flex justify-end space-x-4  border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-sky-500 text-sky-500 rounded-md hover:bg-sky-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={submit}
            className="px-6 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
  
}

