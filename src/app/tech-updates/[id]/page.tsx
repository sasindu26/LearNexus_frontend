"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Globe, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface Article {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  url?: string;
  image?: string;
  source?: string;
  created_at?: string;
}

function isHtml(text: string) {
  return /<[a-z][\s\S]*>/i.test(text);
}

function ArticleBody({ content }: { content: string }) {
  if (isHtml(content)) {
    return (
      <div
        className="article-content text-slate-700 leading-relaxed text-base"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Plain text — split into readable paragraphs by sentence chunks
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
  const chunks: string[] = [];
  let current = '';
  for (const s of sentences) {
    current += s;
    if (current.length > 300) {
      chunks.push(current.trim());
      current = '';
    }
  }
  if (current.trim()) chunks.push(current.trim());

  return (
    <div className="space-y-4 text-slate-700 leading-relaxed text-base">
      {chunks.map((chunk, i) => (
        <p key={i}>{chunk}</p>
      ))}
    </div>
  );
}

function formatDate(raw?: string) {
  if (!raw) return null;
  try { return new Date(raw).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); }
  catch { return null; }
}

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = decodeURIComponent(rawId as string);

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/api/tech-recommendations/${encodeURIComponent(id)}`)
      .then(res => {
        if (res.data?.id || res.data?.title) setArticle(res.data);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <Loader2 size={36} className="animate-spin text-brand-secondary" />
    </div>
  );

  if (notFound || !article) return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center gap-4">
      <p className="text-slate-500 font-bold text-lg">Article not found.</p>
      <button onClick={() => router.push('/tech-updates')} className="flex items-center gap-2 text-brand-primary font-bold hover:text-brand-secondary transition-colors">
        <ArrowLeft size={18} /> Back to Tech Radar
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-bg pt-8 pb-24 px-4 sm:px-8 xl:px-16">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-brand-secondary font-bold transition-colors mb-8 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Tech Radar
      </button>

      <div className="max-w-4xl mx-auto">
        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {article.tags.map((tag, i) => (
              <span key={i} className="text-[11px] font-black text-brand-secondary bg-brand-secondary/10 px-3 py-1 rounded-full uppercase tracking-widest">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-5">
          {article.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 font-medium mb-8 pb-6 border-b border-slate-200">
          {article.source && (
            <span className="flex items-center gap-1.5">
              <Globe size={14} />
              {article.source}
            </span>
          )}
          {formatDate(article.created_at) && (
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {formatDate(article.created_at)}
            </span>
          )}
          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-brand-primary hover:text-brand-secondary font-bold transition-colors ml-auto"
            >
              View Original Source <ExternalLink size={14} />
            </a>
          )}
        </div>

        {/* Cover image */}
        {article.image && (
          <div className="rounded-3xl overflow-hidden mb-8 shadow-lg max-h-96">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
            />
          </div>
        )}

        {/* Article content */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-lg p-8 sm:p-12">
          {article.description ? (
            <ArticleBody content={article.description} />
          ) : (
            <p className="text-slate-400 text-center py-12">No content available for this article.</p>
          )}
        </div>

        {/* Bottom source link */}
        {article.url && (
          <div className="mt-8 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
            <div>
              <p className="font-black text-slate-800 text-sm mb-0.5">Read the full article</p>
              <p className="text-xs text-slate-400">Continue reading on {article.source || 'the original source'}</p>
            </div>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-brand-primary text-white font-bold px-5 py-2.5 rounded-xl hover:bg-brand-secondary transition-colors shrink-0 text-sm"
            >
              Open Article <ExternalLink size={14} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
