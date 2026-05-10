import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";
import { useAuthStore } from "../store/authStore";
import api from "../lib/axios";
import StatCard from "../components/ui/StatCard";
import Spinner from "../components/ui/Spinner";
import { TrendingUp, Clock, Users, Table2 } from "lucide-react";

// Fetch analytics from backend
const fetchAnalytics = (restaurantId) =>
  api.get(`/orders/${restaurantId}/active`).then((res) => res.data);

export default function Analytics() {
  const restaurantId = useAuthStore((s) => s.restaurantId);

  const { data, isLoading } = useQuery({
    queryKey: ["analytics", restaurantId],
    queryFn:  () => fetchAnalytics(restaurantId),
    enabled:  !!restaurantId,
  });

  // Mock chart data — replace with real aggregation endpoint when ready
  const weeklyOrders = [
    { day: "Mon", orders: 34, revenue: 8200 },
    { day: "Tue", orders: 28, revenue: 6800 },
    { day: "Wed", orders: 42, revenue: 10500 },
    { day: "Thu", orders: 38, revenue: 9100 },
    { day: "Fri", orders: 56, revenue: 14200 },
    { day: "Sat", orders: 71, revenue: 18400 },
    { day: "Sun", orders: 65, revenue: 16100 },
  ];

  const peakHours = [
    { hour: "12pm", guests: 22 }, { hour: "1pm",  guests: 38 },
    { hour: "2pm",  guests: 29 }, { hour: "7pm",  guests: 31 },
    { hour: "8pm",  guests: 45 }, { hour: "9pm",  guests: 40 },
    { hour: "10pm", guests: 18 },
  ];

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* KPI stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Avg wait time"    value="18 min" sub="last 7 days"  color="blue"   icon={Clock} />
        <StatCard label="Total guests"     value="334"    sub="this week"    color="green"  icon={Users} />
        <StatCard label="Table turnover"   value="4.2×"   sub="per table/day"color="amber"  icon={Table2} />
        <StatCard label="Weekly revenue"   value="₹83.3k" sub="est."         color="purple" icon={TrendingUp} />
      </div>

      {/* Weekly orders chart */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Weekly orders & revenue</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weeklyOrders} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
              cursor={{ fill: "#f9fafb" }}
            />
            <Bar dataKey="orders" fill="#1D9E75" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Peak hours */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Peak hours (guests)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={peakHours}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="hour" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
            <Line
              type="monotone" dataKey="guests"
              stroke="#1D9E75" strokeWidth={2}
              dot={{ r: 4, fill: "#1D9E75" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}