export default function StatCard({ title, value, diff }) {
    return (
      <div className="flex justify-between items-center bg-white shadow p-4 rounded-lg">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-xl font-bold">{value.toLocaleString()}</p>
          <p className="text-xs text-green-600">+{diff}%</p>
        </div>
        <div className="w-10 h-10 bg-sky-500 rounded-md flex justify-center items-center">
          <span className="text-white text-lg">🔔</span>
        </div>
      </div>
    );
  }
  