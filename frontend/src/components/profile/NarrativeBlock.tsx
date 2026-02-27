export default function NarrativeBlock({ data, narrative }: { data: { theme?: string }; narrative: string | null }) {
  if (!narrative) return null;

  return (
    <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-5">
      {data?.theme && (
        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-400">{data.theme}</div>
      )}
      <p className="text-sm leading-relaxed text-zinc-700">{narrative}</p>
    </div>
  );
}
