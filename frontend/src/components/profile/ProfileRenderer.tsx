"use client";
import type { ProfileContent, ProfileComponent } from "@/lib/types";
import HeroSection from "./HeroSection";
import StatBar from "./StatBar";
import MilestoneCards from "./MilestoneCards";
import RaceTimeline from "./RaceTimeline";
import ProgressionChart from "./ProgressionChart";
import NarrativeBlock from "./NarrativeBlock";
import SignatureBadge from "./SignatureBadge";
import NextHorizon from "./NextHorizon";
import DistanceMap from "./DistanceMap";
import ConsistencyStreak from "./ConsistencyStreak";

const componentRegistry: Record<string, React.ComponentType<{ data: any; narrative: string | null }>> = {
  milestone_cards: MilestoneCards,
  race_timeline: RaceTimeline,
  progression_chart: ProgressionChart,
  narrative_block: NarrativeBlock,
  signature_badge: SignatureBadge,
  next_horizon: NextHorizon,
  distance_map: DistanceMap,
  consistency_streak: ConsistencyStreak,
};

interface Props {
  content: ProfileContent;
  archetype: string;
}

export default function ProfileRenderer({ content, archetype }: Props) {
  const sortedComponents = [...content.components].sort((a, b) => a.priority - b.priority);

  return (
    <div className="space-y-6">
      <HeroSection
        headline={content.headline}
        tagline={content.tagline}
        archetype={archetype}
        profileStage={content.profile_stage}
      />

      {content.stat_bar.length > 0 && <StatBar stats={content.stat_bar} />}

      {sortedComponents.map((component, i) => {
        const Component = componentRegistry[component.type];
        if (!Component) {
          return (
            <div key={i} className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4">
              <div className="text-xs text-zinc-400">Unknown component: {component.type}</div>
              {component.narrative && <p className="mt-1 text-sm text-zinc-600">{component.narrative}</p>}
            </div>
          );
        }
        return <Component key={i} data={component.data as any} narrative={component.narrative} />;
      })}

      {content.suggested_next_action && (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Next Step</div>
          <p className="mt-1 text-sm text-zinc-700">{content.suggested_next_action.action}</p>
          <p className="mt-0.5 text-xs text-zinc-500">{content.suggested_next_action.reason}</p>
        </div>
      )}
    </div>
  );
}
