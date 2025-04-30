import { useState } from "react";
import api from "../services/api";

export default function EmployeeModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    id: "",
    prefix: "",
    first_name: "",
    last_name: "",
    nickname: "",
    position_id: "",
    color: "",
    salary: "",
    pay_date: "",
    has_social_security: true,
    social_security_number: "",
    tax_deduction: "",
    hour_rate: "",
    overtime_rate: "",
    leave_personal: "",
    leave_vacation: "",
    leave_sick: "",
    role: "user",
    email: "",
    password: "",
    status: true,
    pay_channel: "",
    account_type: "ออมทรัพย์",
    bank: "",
    account_number: "",
    bank_branch: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const submit = async () => {
    await api.post("/employees", {
      ...form,
      password_hash: form.password, // hash in backend
    });
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-center p-6 z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl overflow-auto">
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold">เพิ่มพนักงาน</h3>
          <button onClick={onClose}>✖️</button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {/* ข้อมูลพนักงาน */}
            <div className="space-y-3">
              <h4 className="font-medium">ข้อมูลพนักงาน</h4>
              <div className="flex flex-col items-center">
                <img
                  src="/avatar-placeholder.png"
                  alt="avatar"
                  className="w-24 h-24 rounded-full"
                />
                <button className="text-sky-500 mt-2">✏️</button>
              </div>
              <label>คำนำหน้า</label>
              <input
                name="prefix"
                onChange={handleChange}
                className="input"
              />
              <label>ชื่อ</label>
              <input
                name="first_name"
                onChange={handleChange}
                className="input"
              />
              <label>นามสกุล</label>
              <input
                name="last_name"
                onChange={handleChange}
                className="input"
              />
              <label>ชื่อเล่น</label>
              <input
                name="nickname"
                onChange={handleChange}
                className="input"
              />
              <label>ตำแหน่ง</label>
              <select
                name="position_id"
                onChange={handleChange}
                className="input"
              >
                <option value="">เลือกตำแหน่ง</option>
                {/* map positions จาก API */}
              </select>
              <label>สี</label>
              <select
                name="color"
                onChange={handleChange}
                className="input"
              >
                <option value="">เลือกสี</option>
              </select>
            </div>

            {/* ข้อมูลเงินเดือน/ค่าจ้าง */}
            <div className="space-y-3">
              <h4 className="font-medium">ข้อมูลเงินเดือน/ค่าจ้าง</h4>
              <label>เงินเดือน</label>
              <input
                name="salary"
                type="number"
                onChange={handleChange}
                className="input"
              />
              <label>วันที่จ่าย</label>
              <input
                name="pay_date"
                type="date"
                onChange={handleChange}
                className="input"
              />
              <label>ประกันสังคม</label>
              <div className="flex items-center space-x-4">
                <label>
                  <input
                    type="radio"
                    name="has_social_security"
                    checked={form.has_social_security}
                    onChange={() => setForm((f) => ({ ...f, has_social_security: true }))}
                  />{" "}
                  มีประกันสังคม
                </label>
                <label>
                  <input
                    type="radio"
                    name="has_social_security"
                    checked={!form.has_social_security}
                    onChange={() => setForm((f) => ({ ...f, has_social_security: false }))}
                  />{" "}
                  ไม่มีประกันสังคม
                </label>
              </div>
              {form.has_social_security && (
                <>
                  <label>เลขประกันสังคม</label>
                  <input
                    name="social_security_number"
                    onChange={handleChange}
                    className="input"
                  />
                </>
              )}
              <label>หัก ณ ที่จ่าย</label>
              <input
                name="tax_deduction"
                type="number"
                onChange={handleChange}
                className="input"
              />
              <label>ค่าบุ่ง/ชั่วโมง</label>
              <input
                name="hour_rate"
                type="number"
                onChange={handleChange}
                className="input"
              />
              <label>ค่าโอที</label>
              <input
                name="overtime_rate"
                type="number"
                onChange={handleChange}
                className="input"
              />
            </div>

            {/* จำนวนวันหยุดประจำปี */}
            <div className="space-y-3">
              <h4 className="font-medium">จำนวนวันหยุดประจำปี</h4>
              <label>ลากิจ</label>
              <input
                name="leave_personal"
                type="number"
                onChange={handleChange}
                className="input"
              />
              <label>ลาพักร้อน</label>
              <input
                name="leave_vacation"
                type="number"
                onChange={handleChange}
                className="input"
              />
              <label>ลาป่วย</label>
              <input
                name="leave_sick"
                type="number"
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          {/* สิทธิ์การใช้งาน */}
          <div>
            <h4 className="font-medium mb-2">สิทธิ์การใช้งาน</h4>
            <select
              name="role"
              onChange={handleChange}
              className="input w-1/3"
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          {/* ข้อมูลผู้ใช้งาน */}
          <div>
            <h4 className="font-medium mb-2">ข้อมูลผู้ใช้งาน</h4>
            <label>อีเมล</label>
            <input
              name="email"
              type="email"
              onChange={handleChange}
              className="input w-1/2"
            />
            <label>รหัสผ่าน</label>
            <input
              name="password"
              type="password"
              onChange={handleChange}
              className="input w-1/2"
            />
            <label>สถานะ</label>
            <div className="flex items-center space-x-4 mb-4">
              <label>
                <input
                  type="radio"
                  name="status"
                  checked={form.status}
                  onChange={() => setForm((f) => ({ ...f, status: true }))}
                />{" "}
                ใช้งาน
              </label>
              <label>
                <input
                  type="radio"
                  name="status"
                  checked={!form.status}
                  onChange={() => setForm((f) => ({ ...f, status: false }))}
                />{" "}
                พักใช้งาน
              </label>
            </div>
          </div>

          {/* ข้อมูลบัญชีธนาคาร */}
          <div>
            <h4 className="font-medium mb-2">ข้อมูลบัญชีธนาคาร</h4>
            <label>ช่องทางการชำระ</label>
            <input
              name="pay_channel"
              onChange={handleChange}
              className="input w-1/2"
            />
            <label>ประเภทบัญชี</label>
            <div className="flex items-center space-x-4 mb-4">
              <label>
                <input
                  type="radio"
                  name="account_type"
                  checked={form.account_type === "ออมทรัพย์"}
                  onChange={() =>
                    setForm((f) => ({ ...f, account_type: "ออมทรัพย์" }))
                  }
                />{" "}
                ออมทรัพย์
              </label>
              <label>
                <input
                  type="radio"
                  name="account_type"
                  checked={form.account_type === "สะสมทรัพย์"}
                  onChange={() =>
                    setForm((f) => ({ ...f, account_type: "สะสมทรัพย์" }))
                  }
                />{" "}
                สะสมทรัพย์
              </label>
            </div>
            <label>ธนาคาร</label>
            <input
              name="bank"
              onChange={handleChange}
              className="input w-1/2"
            />
            <label>เลขที่บัญชี</label>
            <input
              name="account_number"
              onChange={handleChange}
              className="input w-1/2"
            />
            <label>สาขาธนาคาร</label>
            <input
              name="bank_branch"
              onChange={handleChange}
              className="input w-1/2"
            />
          </div>
        </div>

        {/* ปุ่มยืนยัน / ยกเลิก */}
        <div className="flex justify-end space-x-4 border-t p-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border rounded-md"
          >
            ยกเลิก
          </button>
          <button
            onClick={submit}
            className="px-6 py-2 bg-sky-500 text-white rounded-md"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
}
