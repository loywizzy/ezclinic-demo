export default function StatCard({ title, value, diff }) {
  // ถ้า diff เป็นบวก ให้เติมสัญลักษณ์ + ข้างหน้า, ถ้าไม่ใช่บวก ก็แสดงตามตัวเลข
  const label = `${diff > 0 ? '+' : ''}${diff}%`;

  return (
    <div className="flex justify-between items-center bg-white shadow p-4 rounded-lg">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-bold">{value.toLocaleString()}</p>
        <p className={`text-xs ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {label}
        </p>
      </div>
      <div className="w-10 h-10 bg-sky-500 rounded-md flex justify-center items-center">
        <span className="text-white text-lg">🔔</span>
      </div>
    </div>
  );
}
