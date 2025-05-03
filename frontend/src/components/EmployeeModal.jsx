import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../services/api";
import { FaTimes, FaCheck, FaEye, FaEyeSlash } from "react-icons/fa";

export default function EmployeeModal({ employee, onClose, onSave }) {
  const isEdit = Boolean(employee);
  const [form, setForm] = useState({
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
    role_id: "",
    email: "",
    password: "",
    status: true,
    pay_channel: "",
    account_type: "ออมทรัพย์",
    bank: "",
    account_number: "",
    bank_branch: ""
  });
  const [positions, setPositions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [showPass, setShowPass] = useState(false);

  const colorOptions = [
    { value: "", label: "เลือกสี" },
    { value: "แดง", label: "แดง" },
    { value: "เขียว", label: "เขียว" },
    { value: "น้ำเงิน", label: "น้ำเงิน" },
    { value: "เหลือง", label: "เหลือง" },
    { value: "ส้ม", label: "ส้ม" },
    { value: "ชมพู", label: "ชมพู" },
    { value: "ม่วง", label: "ม่วง" }
  ];

  // Fetch dropdown data and all employees
  useEffect(() => {
    (async () => {
      try {
        const [posRes, permRes, empRes] = await Promise.all([
          api.get("/positions"),
          api.get("/permissions"),
          api.get("/employees")
        ]);
        setPositions(posRes.data || []);
        setRoles(permRes.data || []);
        setAllEmployees(empRes.data || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // Populate form for editing
  useEffect(() => {
    if (employee) {
      setForm({
        prefix: employee.prefix || "",
        first_name: employee.first_name || "",
        last_name: employee.last_name || "",
        nickname: employee.nickname || "",
        position_id: employee.position_id || "",
        color: employee.color || "",
        salary: employee.salary?.toString() || "",
        pay_date: employee.pay_date || "",
        has_social_security: employee.has_social_security,
        social_security_number: employee.social_security_number || "",
        tax_deduction: employee.tax_deduction?.toString() || "",
        hour_rate: employee.hour_rate?.toString() || "",
        overtime_rate: employee.overtime_rate?.toString() || "",
        leave_personal: employee.leave_personal?.toString() || "",
        leave_vacation: employee.leave_vacation?.toString() || "",
        leave_sick: employee.leave_sick?.toString() || "",
        role_id: employee.role_id?.toString() || "",
        email: employee.email || "",
        password: "",
        status: employee.status,
        pay_channel: employee.pay_channel || "",
        account_type: employee.account_type || "ออมทรัพย์",
        bank: employee.bank || "",
        account_number: employee.account_number || "",
        bank_branch: employee.bank_branch || ""
      });
    }
  }, [employee]);

  const handleChange = e => {
    let { name, value, type, checked } = e.target;
    if (type === 'checkbox') value = checked;
    if (type === 'radio') value = (value === 'true');
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // Required field validation
    const requiredFields = [
      ['prefix','คำนำหน้า'], ['first_name','ชื่อ'], ['last_name','นามสกุล'],
      ['position_id','ตำแหน่ง'], ['color','สี'], ['salary','เงินเดือน'], ['pay_date','วันที่จ่าย'],
      ['social_security_number','เลขประกันสังคม'], ['tax_deduction','ค่าหัก ณ ที่จ่าย'],
      ['hour_rate','ค่าแรง/ชั่วโมง'], ['overtime_rate','ค่าโอที/ชั่วโมง'],
      ['leave_vacation','ลาพักร้อน'], ['leave_sick','ลาป่วย'], ['role_id','บทบาท'],
      ['email','อีเมล'], ['password','รหัสผ่าน'], ['pay_channel','ช่องทางการชำระ'],
      ['account_type','ประเภทบัญชี'], ['bank','ธนาคาร'], ['account_number','เลขที่บัญชี'], ['bank_branch','สาขา']
    ];
    const missing = requiredFields.filter(([key]) => {
      const val = form[key];
      return val === '' || val == null;
    }).map(([, label]) => label);
    if (missing.length) {
      Swal.fire({ icon:'warning', title:'ข้อมูลไม่ครบ', text:`กรุณากรอก: ${missing.join(', ')}` });
      return;
    }
    // Check duplicates
    const dupEmail = allEmployees.find(emp => emp.email === form.email && (!isEdit || emp.id !== employee.id));
    if (dupEmail) {
      Swal.fire({ icon:'warning', title:'อีเมลซ้ำ', text:'อีเมลนี้มีใช้งานแล้ว' });
      return;
    }
    const dupName = allEmployees.find(emp => emp.first_name === form.first_name && emp.last_name === form.last_name && (!isEdit || emp.id !== employee.id));
    if (dupName) {
      Swal.fire({ icon:'warning', title:'ชื่อซ้ำ', text:'มีชื่อ-นามสกุลนี้แล้ว' });
      return;
    }
    try {
      const payload = {
        ...form,
        salary: parseFloat(form.salary),
        tax_deduction: parseFloat(form.tax_deduction),
        hour_rate: parseFloat(form.hour_rate),
        overtime_rate: parseFloat(form.overtime_rate),
        leave_personal: parseInt(form.leave_personal,10) || 0,
        leave_vacation: parseInt(form.leave_vacation,10) || 0,
        leave_sick: parseInt(form.leave_sick,10) || 0,
        role_id: parseInt(form.role_id,10)
      };
      if (isEdit) await api.put(`/employees/${employee.id}`, payload);
      else await api.post('/employees', payload);
      Swal.fire({ icon:'success', title:'สำเร็จ', text:'บันทึกข้อมูลเรียบร้อย' });
      onSave();
    } catch (err) {
      Swal.fire({ icon:'error', title:'ผิดพลาด', text: err.response?.data?.error || err.message });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-11/12 max-w-5xl p-6 overflow-auto max-h-[90vh] shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-[#00B9FF]">{isEdit ? 'แก้ไขพนักงาน' : 'เพิ่มพนักงาน'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><FaTimes size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Employee Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[#00B9FF]">ข้อมูลพนักงาน</h3>
              <div className="space-y-2">
                <label>คำนำหน้า</label>
                <select name="prefix" value={form.prefix} onChange={handleChange} className="input">
                  <option value="">เลือกคำนำหน้า</option>
                  <option value="นาย">นาย</option>
                  <option value="นาง">นาง</option>
                  <option value="นางสาว">นางสาว</option>
                </select>
              </div>
              <div className="space-y-2">
                <label>ชื่อ</label>
                <input name="first_name" value={form.first_name} onChange={handleChange} className="input" />
              </div>
              <div className="space-y-2">
                <label>นามสกุล</label>
                <input name="last_name" value={form.last_name} onChange={handleChange} className="input" />
              </div>
              <div className="space-y-2">
                <label>ชื่อเล่น</label>
                <input name="nickname" value={form.nickname} onChange={handleChange} className="input" />
              </div>
              <div className="space-y-2">
                <label>ตำแหน่ง</label>
                <select name="position_id" value={form.position_id} onChange={handleChange} className="input">
                  <option value="">เลือกตำแหน่ง</option>
                  {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label>สี</label>
                <select name="color" value={form.color} onChange={handleChange} className="input">
                  {colorOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
            {/* Salary & Benefits */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[#00B9FF]">ข้อมูลเงินเดือน/สวัสดิการ</h3>
              <div className="space-y-2">
                <label>เงินเดือน</label>
                <input name="salary" type="number" value={form.salary} onChange={handleChange} className="input" />
              </div>
              <div className="space-y-2">
                <label>วันที่จ่าย</label>
                <input name="pay_date" type="date" value={form.pay_date} onChange={handleChange} className="input" />
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center"><input type="radio" name="has_social_security" value="true" checked={form.has_social_security} onChange={handleChange} /><span className="ml-2">มีประกันสังคม</span></label>
                <label className="flex items-center"><input type="radio" name="has_social_security" value="false" checked={!form.has_social_security} onChange={handleChange} /><span className="ml-2">ไม่มีประกันสังคม</span></label>
              </div>
              <div className="space-y-2">
                <label>เลขประกันสังคม</label>
                <input name="social_security_number" value={form.social_security_number} onChange={handleChange} className="input" />
              </div>
              <div className="space-y-2">
                <label>ค่าหัก ณ ที่จ่าย (%)</label>
                <input name="tax_deduction" type="number" value={form.tax_deduction} onChange={handleChange} className="input" />
              </div>
              <div className="space-y-2">
                <label>ค่าแรง/ชั่วโมง</label>
                <input name="hour_rate" type="number" value={form.hour_rate} onChange={handleChange} className="input" />
              </div>
              <div className="space-y-2">
                <label>ค่าโอที/ชั่วโมง</label>
                <input name="overtime_rate" type="number" value={form.overtime_rate} onChange={handleChange} className="input" />
              </div>
            </div>
            {/* Leave & Rights */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[#00B9FF]">จำนวนวันหยุด & สิทธิ์</h3>
              <div className="space-y-2">
                <label>ลาพักร้อน (วัน/ปี)</label>
                <input name="leave_vacation" type="number" value={form.leave_vacation} onChange={handleChange} className="input" />
              </div>
              <div className="space-y-2">
                <label>ลาป่วย (วัน/ปี)</label>
                <input name="leave_sick" type="number" value={form.leave_sick} onChange={handleChange} className="input" />
              </div>
              <div className="space-y-2">
                <label>บทบาท</label>
                <select name="role_id" value={form.role_id} onChange={handleChange} className="input">
                  <option value="">เลือกระดับสิทธิ์</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <h4 className="text-md font-medium text-[#00B9FF]">บัญชีผู้ใช้งาน</h4>
              <div className="space-y-2">
                <label>อีเมล</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className="input" />
              </div>
              <div className="space-y-2 relative">
                <label>รหัสผ่าน</label>
                <input name="password" type={showPass ? "text" : "password"} value={form.password} onChange={handleChange} className="input pr-8" />
                {showPass ? <FaEyeSlash className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer" onClick={()=>setShowPass(false)}/> : <FaEye className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer" onClick={()=>setShowPass(true)}/>}
              </div>
              <div className="flex items-center space-x-2">
                <input name="status" type="checkbox" checked={form.status} onChange={handleChange} />
                <span>สถานะใช้งาน</span>
              </div>
            </div>
          </div>
          {/* Bank Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#00B9FF]">ข้อมูลบัญชีธนาคาร</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label>ช่องทางการชำระ</label>
                <input name="pay_channel" value={form.pay_channel} onChange={handleChange} className="input" />
              </div>
              <div className="space-y-2">
                <label>ประเภทบัญชี</label>
                <div className="flex space-x-4">
                  {['ออมทรัพย์','สะสมทรัพย์'].map(type => <label key={type} className="flex items-center space-x-2"><input type="radio" name="account_type" value={type} checked={form.account_type===type} onChange={handleChange} /><span>{type}</span></label>)}
                </div>
              </div>
              <div className="space-y-2">
                <label>ธนาคาร</label>
                <input name="bank" value={form.bank} onChange={handleChange} className="input" />
              </div>
              <div className="space-y-2">
                <label>เลขที่บัญชี</label>
                <input name="account_number" value={form.account_number} onChange={handleChange} className="input" />
              </div>
              <div className="space-y-2">
                <label>สาขา</label>
                <input name="bank_branch" value={form.bank_branch} onChange={handleChange} className="input" />
              </div>
            </div>
          </div>
          {/* Actions */}
          <div className="flex justify-center space-x-4 mt-6">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg border border-[#00B9FF] text-[#00B9FF] hover:bg-[#E0F7FF]">ยกเลิก</button>
            <button type="submit" className="px-6 py-2 bg-[#00B9FF] text-white rounded-lg hover:bg-[#00A0D1] flex items-center space-x-2"><FaCheck/><span>ยืนยัน</span></button>
          </div>
        </form>
      </div>
    </div>
  );
}
