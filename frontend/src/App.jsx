import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Layout from "./components/Layout.jsx";
import CustomerPage from "./pages/CustomerPage";
import PositionPage from "./pages/PositionPage.jsx";
import PermissionPage from "./pages/PermissionPage.jsx";
import EmployeePage from "./pages/EmployeePage.jsx";


// เพจ placeholder สำหรับ Customers, Employees, Positions
function Placeholder({ title }) {
  return (
    <div className="text-center text-gray-600">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-4">กำลังอยู่ระหว่างพัฒนา...</p>
    </div>
  );
}


export default function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        {/* Root → login หรือ dashboard */}
        <Route
          path="/"
          element={<Navigate to={token ? "/dashboard" : "/login"} replace />}
        />

        {/* หน้า Login */}
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        {/* หน้าแดชบอร์ด (ต้อง login) */}
        <Route
          path="/dashboard"
          element={
            token ? (
              <Layout>
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* หน้า Customers (placeholder) */}
        <Route
          path="/customers"
          element={
            token ? (
              <Layout>
                <CustomerPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* หน้า Employees (placeholder) */}
        <Route
          path="/employees"
          element={
            token ? (
              <Layout>
                <EmployeePage/>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* หน้า Positions (placeholder) */}
        <Route
          path="/positions"
          element={
            token ? (
              <Layout>
                <PositionPage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

<Route
          path="/permissions"
          element={
            token ? (
              <Layout>
                <PermissionPage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* หน้า Settings (placeholder) */}
        <Route
          path="/settings"
          element={
            token ? (
              <Layout>
                <Placeholder title="ตั้งค่าระบบ" />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* ถ้าไม่มี route ตรงกับข้างต้น ให้ไปที่ root */}
        <Route
          path="*"
          element={<Navigate to={token ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
