"use client";

import { useState } from 'react';
import { ExternalLink, Clock, Award, ChevronDown, ChevronUp } from 'lucide-react';
import type { Certificate } from '@/lib/careerApi';
import SkillBadge from './SkillBadge';
import MatchScore from './MatchScore';

interface CertificateCardProps {
  cert: Certificate;
  showScore?: boolean;
}

const difficultyColor: Record<string, string> = {
  beginner: 'bg-green-50 text-green-700',
  intermediate: 'bg-yellow-50 text-yellow-700',
  advanced: 'bg-red-50 text-red-700',
};

export default function CertificateCard({ cert, showScore = true }: CertificateCardProps) {
  const [descExpanded, setDescExpanded] = useState(false);
  const diffClass = difficultyColor[cert.difficulty] || difficultyColor.intermediate;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
      {/* Header: logo + title + score */}
      <div className="flex items-start gap-3">
        {cert.image_url ? (
          <img
            src={cert.image_url}
            alt={cert.provider}
            className="w-11 h-11 rounded-xl object-contain border border-slate-100 bg-slate-50 shrink-0"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <Award size={20} className="text-slate-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-slate-800 leading-snug line-clamp-2">{cert.title}</h3>
          <p className="text-sm text-slate-500 font-semibold mt-0.5 truncate">{cert.provider}</p>
        </div>
        {showScore && cert.relevance_score !== undefined && cert.relevance_score > 0 && (
          <MatchScore score={cert.relevance_score} />
        )}
      </div>

      {/* Meta badges */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className={`px-2 py-0.5 rounded-full font-bold capitalize ${diffClass}`}>
          {cert.difficulty}
        </span>
        {cert.duration && (
          <span className="flex items-center gap-1 text-slate-500">
            <Clock size={11} />
            {cert.duration}
          </span>
        )}
        {cert.category && (
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
            {cert.category}
          </span>
        )}
      </div>

      {/* Description with expand toggle */}
      {cert.description && (
        <div>
          <p className={`text-sm text-slate-500 ${descExpanded ? '' : 'line-clamp-2'}`}>
            {cert.description}
          </p>
          {cert.description.length > 120 && (
            <button
              onClick={() => setDescExpanded(e => !e)}
              className="flex items-center gap-0.5 text-xs font-bold text-slate-400 hover:text-brand-secondary mt-1 transition-colors"
            >
              {descExpanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Show more</>}
            </button>
          )}
        </div>
      )}

      {/* Career relevance */}
      {cert.career_relevance && (
        <div className="flex items-center gap-1.5 text-xs text-brand-secondary font-bold">
          <Award size={12} />
          {cert.career_relevance}
        </div>
      )}

      {/* Skills you'll learn vs already know */}
      {(cert.skills_to_learn?.length || cert.skills_you_know?.length) ? (
        <div className="flex flex-wrap gap-1.5">
          {cert.skills_to_learn?.slice(0, 4).map(s => (
            <SkillBadge key={s} skill={s} variant="learn" />
          ))}
          {cert.skills_you_know?.slice(0, 2).map(s => (
            <SkillBadge key={s} skill={s} variant="match" />
          ))}
        </div>
      ) : cert.skills_taught?.length ? (
        <div className="flex flex-wrap gap-1.5">
          {cert.skills_taught.slice(0, 5).map(s => (
            <SkillBadge key={s} skill={s} />
          ))}
        </div>
      ) : null}

      {/* Footer */}
      {cert.url && (
        <div className="pt-2 border-t border-slate-50 mt-auto flex justify-end">
          <a
            href={cert.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors shadow-sm"
          >
            View Certificate <ExternalLink size={11} />
          </a>
        </div>
      )}
    </div>
  );
}
