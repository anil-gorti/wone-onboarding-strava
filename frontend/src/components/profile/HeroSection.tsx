interface HeroSectionProps {
  headline: string;
  tagline: string | null;
  archetype: string;
  profileStage: string;
}

const archetypeColors: Record<string, string> = {
  "THE PROGRESSION CHASER": "from-blue-600 to-indigo-600",
  "THE CIRCUIT REGULAR": "from-amber-500 to-orange-600",
  "THE SUNDAY FAITHFUL": "from-emerald-500 to-teal-600",
  "THE COMEBACK RUNNER": "from-rose-500 to-pink-600",
  "THE LATE BLOOMER": "from-violet-500 to-purple-600",
  "THE DISTANCE MIGRATOR": "from-cyan-500 to-blue-600",
  "THE PODIUM HUNTER": "from-yellow-500 to-amber-600",
  "THE FESTIVAL RUNNER": "from-red-500 to-rose-600",
  "THE ORGANIZER-ATHLETE": "from-teal-500 to-emerald-600",
  "THE QUIET GRINDER": "from-zinc-500 to-zinc-700",
  UNCLASSIFIED: "from-zinc-400 to-zinc-500",
};

export default function HeroSection({ headline, tagline, archetype, profileStage }: HeroSectionProps) {
  const gradient = archetypeColors[archetype] || "from-zinc-600 to-zinc-800";

  return (
    <div className={`rounded-xl bg-gradient-to-br ${gradient} p-8 text-white`}>
      <div className="mb-2 text-xs font-medium uppercase tracking-widest opacity-70">
        {archetype}
      </div>
      <h1 className="text-2xl font-bold leading-tight md:text-3xl">{headline}</h1>
      {tagline && <p className="mt-2 text-base opacity-85">{tagline}</p>}
      <div className="mt-4">
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
          {profileStage}
        </span>
      </div>
    </div>
  );
}
