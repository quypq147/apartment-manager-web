import { TrendingUp } from "lucide-react";

interface RevenueChartProps {
  data: Array<{
    month: string;
    expected: number;
    actual: number;
  }>;
}

const currency = new Intl.NumberFormat("vi-VN");

export function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Không có dữ liệu
      </div>
    );
  }

  const maxValue = Math.max(
    ...data.flatMap((d) => [d.expected, d.actual])
  );
  const scale = maxValue > 0 ? 100 / maxValue : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-lg text-foreground">
          So sánh doanh thu (6 tháng gần nhất)
        </h3>
      </div>

      <div className="space-y-6">
        {data.map((item) => (
          <div key={item.month}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-sm text-foreground">
                {item.month}
              </span>
              <div className="flex gap-4 text-xs">
                <span className="text-blue-600">
                  Dự kiến: {currency.format(item.expected)}
                </span>
                <span className="text-green-600">
                  Thực tế: {currency.format(item.actual)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 h-8 bg-gray-100 rounded-lg overflow-hidden">
              {/* Expected revenue bar */}
              <div
                className="bg-blue-300 transition-all"
                style={{
                  width: `${(item.expected * scale) / 2}%`,
                }}
                title={`Dự kiến: ${currency.format(item.expected)}`}
              />
              {/* Actual revenue bar */}
              <div
                className="bg-green-400 transition-all"
                style={{
                  width: `${(item.actual * scale) / 2}%`,
                }}
                title={`Thực tế: ${currency.format(item.actual)}`}
              />
            </div>

            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>
                {item.actual > 0
                  ? `${Math.round((item.actual / item.expected) * 100)}%`
                  : "0%"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface RoomOccupancyChartProps {
  totalRooms: number;
  rentedRooms: number;
  availableRooms: number;
  occupancyRate: number;
}

export function RoomOccupancyChart({
  totalRooms,
  rentedRooms,
  availableRooms,
  occupancyRate,
}: RoomOccupancyChartProps) {
  return (
    <div className="space-y-6">
      <h3 className="font-bold text-lg text-foreground">
        Tình trạng phòng
      </h3>

      <div className="flex gap-4 mb-6">
        {/* Pie chart representation using div */}
        <div className="relative w-32 h-32">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="2"
            />
            {/* Rented rooms arc */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#22c55e"
              strokeWidth="8"
              strokeDasharray={`${(rentedRooms / totalRooms) * 283} 283`}
              strokeDashoffset="0"
              transform="rotate(-90 50 50)"
            />
            {/* Available rooms arc */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="8"
              strokeDasharray={`${(availableRooms / totalRooms) * 283} 283`}
              strokeDashoffset={`-${(rentedRooms / totalRooms) * 283}`}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {occupancyRate}%
              </div>
              <div className="text-xs text-muted-foreground">
                Lấp đầy
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-foreground">
              Đã thuê: {rentedRooms}/{totalRooms}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="text-sm text-foreground">
              Trống: {availableRooms}/{totalRooms}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
