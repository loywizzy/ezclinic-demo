import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  // ถ้ามี token อยู่แล้ว (ล็อกอินสำเร็จก่อนหน้านี้)
  if (localStorage.getItem("token")) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await login(form.email, form.password);
      // เก็บ token และ user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.user.full_name);
      // กระโดดไปหน้า dashboard ทันที
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setErr("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div className="flex h-screen">
      <div className="m-auto w-80">
        <h2 className="text-2xl font-bold text-center mb-6">เข้าสู่ระบบ</h2>
        {err && <p className="text-red-500 mb-4">{err}</p>}
        <form onSubmit={submit} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="อีเมล"
            value={form.email}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="รหัสผ่าน"
            value={form.password}
            onChange={handleChange}
            className="input"
            required
          />
          <button type="submit" className="btn-primary w-full">
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
}
