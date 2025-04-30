import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", show: false });
  const [err, setErr] = useState("");

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await login(form.email, form.password);
      // Save token and username
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.user.full_name);
      // Navigate to dashboard
      window.location.replace("/dashboard");
    } catch {
      setErr("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left side: login form */}
      <div className="flex flex-col justify-center items-center w-1/2">
        <h2 className="text-2xl font-bold text-sky-600 mb-6">ยินดีต้อนรับ</h2>
        {err && <p className="text-red-500 mb-2">{err}</p>}
        <form onSubmit={submit} className="w-64 space-y-3">
          <input
            name="email"
            type="email"
            placeholder="example@gmail.com"
            value={form.email}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="password"
            type={form.show ? "text" : "password"}
            placeholder="รหัสผ่าน"
            value={form.password}
            onChange={handleChange}
            className="input"
            required
          />
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={form.show}
              onChange={() => setForm({ ...form, show: !form.show })}
              className="mr-2"
            />
            <span className="text-sm">แสดง</span>
          </label>
          <button type="submit" className="btn-primary w-full">
            เข้าสู่ระบบ
          </button>
        </form>
        <span className="mt-6 text-xs">version 1.0.0</span>
      </div>

      {/* Right side: logo */}
      <div className="w-1/2 bg-sky-500 flex items-center justify-center">
        <h1 className="text-6xl font-extrabold text-white">LOGO</h1>
      </div>
    </div>
  );
}
