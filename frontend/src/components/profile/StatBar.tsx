import { Activity, Calendar, MapPin, Medal, Timer, TrendingUp, Trophy, Users } from "lucide-react";
import type { StatBarItem } from "@/lib/types";

const iconMap: Record<string, React.ElementType> = {
  races: Trophy,
  distance: MapPin,
  time: Timer,
  calendar: Calendar,
  trending: TrendingUp,
  medal: Medal,
  activity: Activity,
  community: Users,
};

export default function StatBar({ stats }: { stats: StatBarItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
      {stats.map((stat, i) => {
        const Icon = iconMap[stat.icon_hint] || Activity;
        return (
          <div key={i} className="rounded-lg border border-zinc-200 bg-white p-4 text-center">
            <Icon className="mx-auto mb-2 h-5 w-5 text-zinc-400" />
            <div className="text-2xl font-bold text-zinc-900">{stat.value}</div>
            <div className="mt-1 text-xs text-zinc-500">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}
