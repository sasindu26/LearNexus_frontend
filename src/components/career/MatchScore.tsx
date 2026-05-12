interface MatchScoreProps {
  score: number;
  size?: 'sm' | 'md';
}

export default function MatchScore({ score, size = 'md' }: MatchScoreProps) {
  const color =
    score >= 70 ? 'text-green-600 bg-green-50 border-green-200' :
    score >= 40 ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                  'text-slate-500 bg-slate-50 border-slate-200';

  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border font-bold ${textSize} ${color}`}>
      <span>{score}%</span>
      <span className="font-normal opacity-70">match</span>
    </span>
  );
}
