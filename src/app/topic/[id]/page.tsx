"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, PlayCircle, ExternalLink, BookOpen, Video, FileText } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

// --- Types ---
interface Resource {
  title: string;
  url: string;
  type: string;
}

// --- Main Component ---
export default function TopicContentPage() {
  const params = useParams();
  const router = useRouter();
  
  // The ID is URL encoded when coming from router.push
  const decodedTopicName = decodeURIComponent(params.id as string);
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Resources
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true);
        // We use the new backend endpoint which auto-generates resources if missing
        const response = await api.get(`/api/topics/${encodeURIComponent(decodedTopicName)}/resources`);
        if (Array.isArray(response.data)) {
          setResources(response.data);
        } else {
          setResources([]);
        }
      } catch (err: any) {
        console.error("Failed to fetch resources", err);
        setError(err.message || 'Failed to fetch topic resources');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResources();
  }, [decodedTopicName]);

  const getResourceIcon = (type: string | null) => {
    if (!type) return <ExternalLink size={20} />;
    const lowerType = type.toLowerCase();
    if (lowerType.includes('video')) return <Video size={20} className="text-red-500" />;
    if (lowerType.includes('article')) return <FileText size={20} className="text-blue-500" />;
    if (lowerType.includes('course') || lowerType.includes('book')) return <BookOpen size={20} className="text-purple-500" />;
    return <ExternalLink size={20} />;
  };

  const getResourceTypeLabel = (type: string | null, url: string) => {
    if (type) return type;
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'Video Tutorial';
    if (url.includes('geeksforgeeks.org') || url.includes('medium.com')) return 'Article';
    if (url.includes('wikipedia.org')) return 'Wiki Page';
    return 'Web Resource';
  };

  const getResourceTitle = (title: string | null, url: string, index: number) => {
    if (title) return title;
    // Extract a nice name from URL if title is missing
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      const pathSegments = urlObj.pathname.split('/').filter(Boolean);
      const lastSegment = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1].replace(/-/g, ' ') : '';
      return lastSegment ? `${domain} - ${lastSegment}` : domain;
    } catch {
      return `Learning Resource ${index + 1}`;
    }
  };

  // Render
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col relative">
      {/* Header */}
      <div className="bg-brand-primary pt-8 pb-12 px-4 sm:px-8 xl:px-16 shadow-md z-10 shrink-0">
        <div className="w-full">
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white font-medium mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Module
          </button>
          
          <div className="flex items-center gap-4 mb-2">
            <span className="px-3 py-1 bg-white/10 rounded-full text-blue-100 text-xs font-bold uppercase tracking-widest backdrop-blur-sm border border-white/5">
              Current Topic
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            {decodedTopicName}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto w-full pb-32">
        <div className="w-full px-4 sm:px-8 xl:px-16 py-8">
          
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <PlayCircle size={28} className="text-brand-accent" />
              Learning Resources
            </h2>
            <div className="text-sm font-bold text-slate-400 bg-slate-100 px-4 py-2 rounded-full">
              {resources.length} {resources.length === 1 ? 'Resource' : 'Resources'}
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-slate-400 space-y-4">
              <Loader2 className="animate-spin text-brand-primary" size={40} />
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-700">Curating the best resources...</h3>
                <p className="text-sm mt-1">Checking our database and scanning the web.</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 rounded-3xl p-8 border border-red-100 text-center">
              <h3 className="text-lg font-bold text-red-600 mb-2">Error Loading Resources</h3>
              <p className="text-red-500">{error}</p>
            </div>
          ) : resources.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
              <BookOpen className="text-slate-200 mb-4" size={64} />
              <h3 className="text-xl font-bold text-slate-700 mb-2">No Resources Found</h3>
              <p className="text-slate-500 max-w-md">
                We couldn't generate resources for "{decodedTopicName}" right now. Check back later or ask the AI Assistant for help.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {resources.map((resource, i) => (
                <motion.a
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={resource.url + i}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-brand-primary/30 hover:shadow-md transition-all flex items-start gap-5 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-brand-primary/5 transition-colors">
                    {getResourceIcon(resource.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1 block">
                      {getResourceTypeLabel(resource.type, resource.url)}
                    </span>
                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-brand-primary transition-colors capitalize line-clamp-2 leading-tight">
                      {getResourceTitle(resource.title, resource.url, i)}
                    </h3>
                    <p className="text-sm text-slate-500 truncate">
                      {new URL(resource.url).hostname.replace('www.', '')}
                    </p>
                  </div>
                  
                  <div className="shrink-0 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-brand-primary group-hover:text-white transition-colors mt-2">
                    <ArrowLeft size={16} className="rotate-135" />
                  </div>
                </motion.a>
              ))}
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
