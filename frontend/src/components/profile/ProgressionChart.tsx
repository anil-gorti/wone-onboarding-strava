"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DataPoint {
  date: string;
  time_minutes: number;
  label?: string;
}

export default function ProgressionChart({ data, narrative }: { data: { distance: string; points: DataPoint[] }; narrative: string | null }) {
  const points = data?.points || [];
  if (points.length < 2) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
        {data.distance} Progression
      </h3>
      {narrative && <p className="text-sm text-zinc-600">{narrative}</p>}
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={points}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#a1a1aa" />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="#a1a1aa"
              label={{ value: "Minutes", angle: -90, position: "insideLeft", style: { fontSize: 11 } }}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7" }}
              formatter={(value: number) => {
                const h = Math.floor(value / 60);
                const m = Math.floor(value % 60);
                const s = Math.round((value % 1) * 60);
                return [`${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`, "Time"];
              }}
            />
            <Line
              type="monotone"
              dataKey="time_minutes"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4, fill: "#3b82f6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
