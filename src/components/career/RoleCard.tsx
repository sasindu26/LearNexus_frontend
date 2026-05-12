"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp, Briefcase } from 'lucide-react';
import type { JobRole } from '@/lib/careerApi';
import SkillBadge from './SkillBadge';

interface RoleCardProps {
  role: JobRole;
  variant?: 'eligible' | 'future';
}

const seniorityColors: Record<string, string> = {
  intern: 'bg-sky-50 text-sky-700 border-sky-200',
  junior: 'bg-green-50 text-green-700 border-green-200',
  mid: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  senior: 'bg-red-50 text-red-700 border-red-200',
};

const seniorityLabel: Record<string, string> = {
  intern: 'Intern',
  junior: 'Junior',
  mid: 'Mid-Level',
  senior: 'Senior',
};

export default function RoleCard({ role, variant = 'eligible' }: RoleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const seniorityClass = seniorityColors[role.seniority] || seniorityColors.mid;
  const confidencePct = Math.min(Math.round(role.confidence ?? 0), 100);
  const accentBorder = variant === 'eligible'
    ? 'border-l-4 border-l-brand-secondary'
    : 'border-l-4 border-l-purple-400';

  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3 ${accentBorder}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            <Briefcase size={16} className="text-slate-400" />
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-slate-800 leading-snug">{role.title}</h3>
            <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-bold border ${seniorityClass}`}>
              {seniorityLabel[role.seniority] || role.seniority}
            </span>
          </div>
        </div>
        {/* Confidence bar */}
        <div className="text-right shrink-0">
          <p className="text-xs font-bold text-slate-400">Match</p>
          <p className="text-lg font-black text-slate-700">{confidencePct}%</p>
        </div>
      </div>

      {/* Matched skills */}
      {role.matched_skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {role.matched_skills.slice(0, 5).map(s => (
            <SkillBadge key={s} skill={s} variant="match" />
          ))}
          {role.matched_skills.length > 5 && (
            <span className="text-xs text-slate-400 font-medium self-center">
              +{role.matched_skills.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Expandable reason */}
      {role.reason && (
        <div>
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-brand-secondary transition-colors"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {expanded ? 'Hide details' : 'Why this role?'}
          </button>
          {expanded && (
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">{role.reason}</p>
          )}
        </div>
      )}
    </div>
  );
}
