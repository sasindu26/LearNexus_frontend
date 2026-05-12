interface SkillBadgeProps {
  skill: string;
  variant?: 'match' | 'missing' | 'learn' | 'default';
}

const variantClasses: Record<string, string> = {
  match: 'bg-green-50 text-green-700 border-green-200',
  missing: 'bg-orange-50 text-orange-700 border-orange-200',
  learn: 'bg-blue-50 text-blue-700 border-blue-200',
  default: 'bg-slate-50 text-slate-600 border-slate-200',
};

export default function SkillBadge({ skill, variant = 'default' }: SkillBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${variantClasses[variant]}`}
    >
      {skill}
    </span>
  );
}
