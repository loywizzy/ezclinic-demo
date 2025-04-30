import { useEffect, useState } from "react";
import { getDashboard } from "../services/api";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    getDashboard().then((res) => setStats(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">แดชบอร์ด</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <StatCard key={s.name} title={s.name} value={s.value} diff={55} />
        ))}
      </div>
    </div>
  );
}
