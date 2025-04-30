import { useEffect, useState } from "react";
import { getDashboard } from "../services/api";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    getDashboard().then((res) => setStats(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <StatCard
            key={s.name}
            title={s.name}
            value={s.value}
            diff={55}
          />
        ))}
      </div>
      <p className="text-xs text-gray-400">@ 2025, Made with SmartCanePro</p>
    </div>
  );
}
