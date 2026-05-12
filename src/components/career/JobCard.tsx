"use client";

import { useState } from 'react';
import { MapPin, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import type { Job } from '@/lib/careerApi';
import SkillBadge from './SkillBadge';
import MatchScore from './MatchScore';

interface JobCardProps {
  job: Job;
  showMatchScore?: boolean;
}

const levelLabel: Record<string, string> = {
  intern: 'Intern',
  junior: 'Junior',
  mid: 'Mid-Level',
  senior: 'Senior',
};

const levelColor: Record<string, string> = {
  intern: 'bg-sky-50 text-sky-700',
  junior: 'bg-green-50 text-green-700',
  mid: 'bg-yellow-50 text-yellow-700',
  senior: 'bg-red-50 text-red-700',
};

export default function JobCard({ job, showMatchScore = true }: JobCardProps) {
  const [descExpanded, setDescExpanded] = useState(false);
  const lvlClass = levelColor[job.experience_level] || levelColor.mid;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
      {/* Header: logo + title + score */}
      <div className="flex items-start gap-3">
        {job.image_url ? (
          <img
            src={job.image_url}
            alt={job.company}
            className="w-11 h-11 rounded-xl object-contain border border-slate-100 bg-slate-50 shrink-0"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-400 font-black text-sm">
            {job.company?.[0] ?? '?'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-slate-800 leading-snug line-clamp-2">{job.title}</h3>
          <p className="text-sm text-slate-500 font-semibold truncate mt-0.5">{job.company}</p>
        </div>
        {showMatchScore && job.match_score !== undefined && job.match_score > 0 && (
          <MatchScore score={job.match_score} />
        )}
      </div>

      {/* Meta badges */}
      <div className="flex flex-wrap gap-2 text-xs">
        {job.location && (
          <span className="flex items-center gap-1 text-slate-500">
            <MapPin size={11} />
            {job.location}
          </span>
        )}
        {job.experience_level && (
          <span className={`px-2 py-0.5 rounded-full font-bold ${lvlClass}`}>
            {levelLabel[job.experience_level] || job.experience_level}
          </span>
        )}
        {job.job_type && (
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold capitalize">
            {job.job_type}
          </span>
        )}
        {job.salary && (
          <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-semibold">
            {job.salary}
          </span>
        )}
      </div>

      {/* Description with expand toggle */}
      {job.description && (
        <div>
          <p className={`text-sm text-slate-500 ${descExpanded ? '' : 'line-clamp-2'}`}>
            {job.description}
          </p>
          {job.description.length > 120 && (
            <button
              onClick={() => setDescExpanded(e => !e)}
              className="flex items-center gap-0.5 text-xs font-bold text-slate-400 hover:text-brand-secondary mt-1 transition-colors"
            >
              {descExpanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Show more</>}
            </button>
          )}
        </div>
      )}

      {/* Skills */}
      {(job.matching_skills?.length || job.missing_skills?.length) ? (
        <div className="flex flex-wrap gap-1.5">
          {job.matching_skills?.slice(0, 4).map(s => (
            <SkillBadge key={s} skill={s} variant="match" />
          ))}
          {job.missing_skills?.slice(0, 3).map(s => (
            <SkillBadge key={s} skill={s} variant="missing" />
          ))}
        </div>
      ) : job.skills_required?.length ? (
        <div className="flex flex-wrap gap-1.5">
          {job.skills_required.slice(0, 6).map(s => (
            <SkillBadge key={s} skill={s} />
          ))}
        </div>
      ) : null}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-auto">
        <span className="text-xs text-slate-400 font-medium capitalize">{job.source}</span>
        {job.source_url && (
          <a
            href={job.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary/90 transition-colors shadow-sm"
          >
            Apply Now <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  );
}
