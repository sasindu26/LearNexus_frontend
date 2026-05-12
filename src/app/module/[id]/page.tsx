"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, CheckCircle, Circle, PlayCircle, Loader2, Bot, Send, ArrowLeft, ExternalLink, Newspaper } from 'lucide-react';
import api from '@/lib/api';

// --- Types ---
interface Article {
  id: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  relevance_score?: number;
}

interface ModuleTopic {
  id: string;
  name: string;
  title: string;
  description: string;
  isCompleted: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeEstimate: string;
  progress: number;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isPinned?: boolean;
}

// --- Main Component ---
export default function ModuleContentPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params.id as string;
  
  const [moduleName, setModuleName] = useState<string>('Loading Module...');
  const [topics, setTopics] = useState<ModuleTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [expandedSection, setExpandedSection] = useState<'topics' | 'resources' | null>('topics');
  const [progressPercentage, setProgressPercentage] = useState(0);

  const [articles, setArticles] = useState<Article[]>([]);
  const [isArticlesLoading, setIsArticlesLoading] = useState(false);

  // Chat State
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize Module Info
  useEffect(() => {
    const stored = localStorage.getItem('mento_modules');
    let resolvedName = `Module ${rawId}`;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const match = parsed.find((m: any) => m.id === rawId || m.name.includes(rawId));
        if (match) resolvedName = match.name;
      } catch (e) {}
    }
    if (resolvedName.startsWith('Module ') && rawId.length > 3) {
      resolvedName = decodeURIComponent(rawId);
    }
    setModuleName(resolvedName);
  }, [rawId]);

  // Load persistent chat history once moduleName is resolved
  useEffect(() => {
    if (!moduleName || moduleName === 'Loading Module...') return;
    const token = localStorage.getItem('mento_token');
    api.get(`/api/module-chat/history?module=${encodeURIComponent(moduleName)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }).then(res => {
      const history: { id: string; role: string; text: string }[] = res.data?.messages || [];
      if (history.length > 0) {
        setMessages(history.map(m => ({
          id: m.id,
          text: m.text,
          sender: m.role === 'user' ? 'user' : 'assistant',
          timestamp: new Date(),
        })));
      } else {
        setMessages([{
          id: '1',
          text: `Hey! Ready to dive into ${moduleName}? Ask me anything about this module!`,
          sender: 'assistant',
          timestamp: new Date(),
        }]);
      }
    }).catch(() => {
      setMessages([{
        id: '1',
        text: `Hey! Ready to dive into ${moduleName}? Ask me anything about this module!`,
        sender: 'assistant',
        timestamp: new Date(),
      }]);
    });
  }, [moduleName]);

  // Fetch Topics
  useEffect(() => {
    if (moduleName === 'Loading Module...') return;
    
    const fetchTopics = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('mento_token');
        // POST request per the old React Native api
        const response = await api.post(`/module-content/${encodeURIComponent(moduleName)}/topics`, { moduleName }, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        let topicsData = [];
        if (Array.isArray(response.data)) {
          topicsData = response.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          topicsData = response.data.data;
        }
        
        if (topicsData.length > 0) {
          const formatted = topicsData.map((topic: any) => ({
            id: topic.id || `topic-${Math.random().toString(36).substr(2, 9)}`,
            name: topic.name || topic.title || 'Untitled',
            title: topic.title || topic.name || 'Untitled',
            description: topic.description || 'No description available.',
            isCompleted: topic.isCompleted || false,
            difficulty: topic.difficulty || 'beginner',
            timeEstimate: topic.timeEstimate || '15 mins',
            progress: topic.progress || 0,
          }));
          setTopics(formatted);
          updateProgress(formatted);
        } else {
          // Fallback Default Topics if backend returns empty
          const defaults: ModuleTopic[] = [
            { id: `default-1`, name: `Introduction`, title: `Intro to ${moduleName}`, description: `Basics of ${moduleName}.`, isCompleted: false, difficulty: 'beginner', timeEstimate: '15 mins', progress: 0 },
            { id: `default-2`, name: `Core Concepts`, title: `Core Concepts`, description: `Fundamental principles.`, isCompleted: false, difficulty: 'intermediate', timeEstimate: '20 mins', progress: 0 }
          ];
          setTopics(defaults);
          updateProgress(defaults);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to fetch topics');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTopics();
    
    const fetchArticles = async () => {
      try {
        setIsArticlesLoading(true);
        const response = await api.get(`/api/module-articles?module=${encodeURIComponent(moduleName)}`);
        if (Array.isArray(response.data)) {
          setArticles(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch articles", err);
      } finally {
        setIsArticlesLoading(false);
      }
    };
    
    fetchArticles();
  }, [moduleName]);

  const updateProgress = (currentTopics: ModuleTopic[]) => {
    if (currentTopics.length === 0) {
      setProgressPercentage(0);
      return;
    }
    const completed = currentTopics.filter(t => t.isCompleted).length;
    setProgressPercentage(Math.round((completed / currentTopics.length) * 100));
  };

  const handleTopicCompletion = async (topicId: string, topicName: string, currentState: boolean) => {
    const original = topics;
    const updated = topics.map(t => t.id === topicId ? { ...t, isCompleted: !currentState } : t);
    setTopics(updated);
    updateProgress(updated);

    try {
      const token = localStorage.getItem('mento_token');
      await api.put(`/topics/${topicId}/completion`,
        { isCompleted: !currentState, topicName, moduleName },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
    } catch (err) {
      console.error('[TopicCompletion] Failed to save to DB:', err);
      setTopics(original);
      updateProgress(original);
    }
  };

  // Chat Handlers
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => { scrollToBottom(); }, [messages, isChatExpanded]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isChatLoading) return;

    const currentInput = inputText.trim();
    const newMsg: ChatMessage = { id: Date.now().toString(), text: currentInput, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setIsChatLoading(true);

    try {
      const token = localStorage.getItem('mento_token');
      const response = await api.post(
        '/api/module-chat/message',
        {
          message: currentInput,
          module_name: moduleName,
          history: messages.map(m => ({ role: m.sender, text: m.text })),
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (response.data?.message) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: response.data.message,
          sender: 'assistant',
          timestamp: new Date(),
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: 'Failed to connect to LearNexus AI. Please try again.',
        sender: 'assistant',
        timestamp: new Date(),
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Render
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col relative">
      {/* Header */}
      <div className="bg-brand-primary pt-8 pb-12 px-4 sm:px-8 xl:px-16 shadow-md z-10 shrink-0">
        <div className="lg:mr-[340px]">
          <button onClick={() => router.push('/dashboard?tab=modules')} className="inline-flex items-center gap-2 text-blue-200 hover:text-white font-medium mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to Modules
          </button>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-6">{moduleName}</h1>
          
          {/* Progress Bar */}
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
            <div className="flex justify-between items-end mb-3">
              <span className="text-sm font-bold text-blue-100 uppercase tracking-widest">Module Progress</span>
              <span className="text-2xl font-black text-brand-accent">{progressPercentage}%</span>
            </div>
            <div className="h-2 bg-black/20 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} transition={{ duration: 0.5 }}
                className="h-full bg-brand-accent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Scrollable Content — right margin reserves space for fixed right panel */}
      <div className="flex-1 overflow-y-auto w-full">
        <div className="px-4 sm:px-8 xl:px-12 lg:mr-[340px] py-8 pb-32">

          {/* Topics Accordion */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === 'topics' ? null : 'topics')}
              className="w-full flex justify-between items-center p-6 bg-slate-50 hover:bg-blue-50 transition-colors border-b border-slate-100"
            >
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <PlayCircle size={20} className="text-brand-primary" /> Module Topics
              </h2>
              {expandedSection === 'topics' ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
            </button>

            <AnimatePresence initial={false}>
              {expandedSection === 'topics' && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="p-6 space-y-4">
                    {isLoading ? (
                      <div className="flex flex-col items-center py-8 text-slate-400">
                        <Loader2 className="animate-spin mb-2" size={24} />
                        <span className="text-sm font-medium">Loading syllabus...</span>
                      </div>
                    ) : error ? (
                      <div className="p-4 bg-red-50 text-red-500 rounded-xl text-center font-medium">{error}</div>
                    ) : topics.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">No topics available.</div>
                    ) : (
                      topics.map((topic) => (
                        <div
                          key={topic.id}
                          className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-brand-primary/30 transition-all shadow-sm hover:shadow-md cursor-pointer"
                          onClick={() => router.push(`/topic/${encodeURIComponent(topic.name)}`)}
                        >
                          <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors ${topic.isCompleted ? 'bg-brand-success' : 'bg-transparent group-hover:bg-slate-200'}`} />
                          <div className="p-5 pl-6 flex items-start gap-4">
                            <button
                              className="mt-1 shrink-0"
                              onClick={(e) => { e.stopPropagation(); handleTopicCompletion(topic.id, topic.name, topic.isCompleted); }}
                            >
                              {topic.isCompleted
                                ? <CheckCircle size={24} className="text-brand-success" />
                                : <Circle size={24} className="text-slate-300 group-hover:text-brand-primary" />}
                            </button>
                            <div className="flex-1">
                              <h3 className="font-bold text-slate-800 text-lg mb-1">{topic.title}</h3>
                              <p className="text-slate-500 text-sm mb-3 line-clamp-2">{topic.description}</p>
                              <div className="flex gap-4">
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${
                                  topic.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                                  topic.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                }`}>
                                  {topic.difficulty}
                                </span>
                                <span className="text-xs font-bold text-slate-400">{topic.timeEstimate}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* ── Fixed Right Panel (desktop only) ── */}
      <div className="hidden lg:flex fixed top-20 right-0 bottom-0 w-[340px] flex-col z-40 border-l border-slate-200 bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.06)]">

        {/* News Feed — fills space above chatbot bar */}
        <div className="flex flex-col flex-1 overflow-hidden border-b border-slate-100">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 shrink-0">
            <Newspaper size={15} className="text-brand-secondary" />
            <h3 className="font-black text-slate-800 text-sm">Related Articles</h3>
          </div>

          {isArticlesLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 size={22} className="animate-spin text-brand-secondary" />
            </div>
          ) : articles.length === 0 ? (
            <div className="flex flex-1 items-center justify-center px-6 text-center">
              <p className="text-slate-400 text-sm">No articles found for this module yet.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {articles.map((article, i) => (
                <a
                  key={article.id || i}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-1.5 px-5 py-4 hover:bg-slate-50 transition-colors group"
                >
                  {article.tags && article.tags.length > 0 && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary">
                      {article.tags[0]}
                    </span>
                  )}
                  <p className="text-sm font-bold text-slate-700 group-hover:text-brand-secondary transition-colors leading-snug line-clamp-2">
                    {article.title}
                  </p>
                  {article.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {article.description}
                    </p>
                  )}
                  <span className="flex items-center gap-1 text-[11px] font-bold text-brand-secondary mt-0.5">
                    Read <ExternalLink size={10} />
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Chatbot — sits at the bottom of the right panel, expands upward */}
        <div className={`shrink-0 bg-white transition-all duration-500 ease-in-out ${isChatExpanded ? 'flex flex-col absolute inset-0 z-10' : ''}`}>
          <button
            onClick={() => setIsChatExpanded(!isChatExpanded)}
            className="w-full h-16 flex items-center justify-between px-5 bg-brand-primary hover:bg-brand-secondary transition-colors text-white shrink-0"
          >
            <div className="flex items-center gap-3">
              <Bot size={18} />
              <span className="font-bold text-sm truncate">LearNexus AI</span>
            </div>
            {isChatExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>

          {isChatExpanded && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-brand-primary text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'}`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin text-brand-secondary" />
                      <span className="text-xs font-medium text-slate-500">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} className="h-2" />
              </div>
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 shrink-0">
                <div className="relative">
                  <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder={`Ask about ${moduleName}...`}
                    className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 pl-4 pr-11 text-sm outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                  />
                  <button type="submit" disabled={!inputText.trim() || isChatLoading} className="absolute right-1 top-1 w-9 h-9 bg-brand-primary text-white rounded-full flex items-center justify-center hover:bg-brand-secondary disabled:opacity-50">
                    <Send size={14} />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Mobile chatbot — full width fixed bottom (shown only on small screens) */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-all duration-500 ease-in-out z-50 ${isChatExpanded ? 'h-[80vh] flex flex-col' : 'h-16'}`}>
        <button
          onClick={() => setIsChatExpanded(!isChatExpanded)}
          className="w-full h-16 flex items-center justify-between px-6 bg-brand-primary hover:bg-brand-secondary transition-colors text-white shrink-0"
        >
          <div className="flex items-center gap-3">
            <Bot size={20} />
            <span className="font-bold">LearNexus AI</span>
          </div>
          {isChatExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
        {isChatExpanded && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-brand-primary text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-brand-secondary" />
                    <span className="text-xs font-medium text-slate-500">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} className="h-2" />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 shrink-0">
              <div className="relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder={`Ask about ${moduleName}...`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 pl-4 pr-12 text-sm outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                />
                <button type="submit" disabled={!inputText.trim() || isChatLoading} className="absolute right-1 top-1 w-9 h-9 bg-brand-primary text-white rounded-full flex items-center justify-center hover:bg-brand-secondary disabled:opacity-50">
                  <Send size={14} />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
      
    </div>
  );
}
