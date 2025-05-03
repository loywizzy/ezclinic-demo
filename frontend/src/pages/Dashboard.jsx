// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { getDashboard } from "../services/api";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    getDashboard()
      .then((res) => setStats(res.data || []))
      .catch((err) => {
        console.error("dashboard API error:", err);
        setStats([]);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <StatCard
            key={s.name}
            title={s.name}
            value={s.value}
            diff={s.diff}
          />
        ))}
      </div>
      <p className="text-xs text-gray-400">@ 2025, Made with SmartCanePro</p>
    </div>
  );
}
