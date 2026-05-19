"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, X, BookOpen, GraduationCap } from 'lucide-react';
import api from '@/lib/api';
import { useSession } from '@/context/SessionContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
}

interface Module {
  name: string;
  description: string;
  level?: string | number;
}

interface Course {
  name: string;
  description: string;
  level?: string;
  similarity?: number;
  modules: Module[];
}

export default function ChatPage() {
  const router = useRouter();
  const { cachedCourses, updateCourses } = useSession();

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', type: 'bot', text: 'Hello! I am LearNexus AI. Tell me about your career goals, and I will craft a personalized learning pathway for you.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);
  
  // Tab state for the popup (to switch between academic years)
  const [activeYearTab, setActiveYearTab] = useState<string>('1');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      const scrollHeight = scrollContainerRef.current.scrollHeight;
      const height = scrollContainerRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      scrollContainerRef.current.scrollTo({
        top: maxScrollTop > 0 ? maxScrollTop : 0,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), type: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Send the current message and the entire previous chat history
      const response = await api.post('/chat', {
        message: currentInput,
        history: messages.map(m => ({ role: m.type, content: m.text }))
      }, { timeout: 120000 });
      
      if (response.data && response.data.message) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: response.data.message
        }]);

        // If the backend returns course recommendations, store them in session context
        if (response.data.courses && response.data.courses.length > 0) {
          updateCourses(response.data.courses);
          setShowRecommendation(true);
          setTimeout(() => setShowPopup(true), 1000);
        }
      }
    } catch (error: unknown) {
      console.error('Chat error:', error);
      const isTimeout = error && typeof error === 'object' && 'code' in error && error.code === 'ECONNABORTED';
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: isTimeout
          ? "The AI is still warming up on first launch. Please wait 30 seconds and try again."
          : "I'm sorry, I couldn't connect to the backend server. Please try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollCourse = async () => {
    if (cachedCourses && cachedCourses.length > 0) {
      // Persist enrollment to the database
      try {
        const token = localStorage.getItem('mento_token');
        if (token) {
          await api.post('/api/auth/enroll',
            { course_name: cachedCourses[0].name },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } catch (error) {
        console.error('Failed to persist enrollment:', error);
      }
      setShowPopup(false);
      router.push('/course');
    }
  };

  // Helper to group modules by academic year (level)
  const getModulesByYear = (course: Course) => {
    if (!course || !course.modules) return {};
    
    const grouped: Record<string, Module[]> = {};
    course.modules.forEach(mod => {
      // Default to "1" if no level is specified
      const level = mod.level ? String(mod.level) : "1";
      if (!grouped[level]) {
        grouped[level] = [];
      }
      grouped[level].push(mod);
    });
    
    return grouped;
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-page-wrapper">
      {/* Animated mesh background */}
      <div className="chat-mesh-bg" />

      <div className="chat-container">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header-inner">
            <div className="chat-header-left">
              <div className="chat-avatar-badge">
                <Bot size={18} />
              </div>
              <div>
                <h1 className="chat-title">LearNexus AI</h1>
                <p className="chat-subtitle">Powered by Gemini · Knowledge graph grounded</p>
              </div>
            </div>
            <div className="chat-status">
              <span className="chat-status-dot" />
              <span className="chat-status-text">Online</span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="chat-messages-area" ref={scrollContainerRef}>
          <div className="chat-messages-inner">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`chat-message-row ${msg.type === 'user' ? 'chat-message-user' : 'chat-message-bot'}`}
                >
                  {msg.type === 'bot' && (
                    <div className="chat-bot-avatar">
                      <span className="chat-bot-avatar-text">AI</span>
                    </div>
                  )}
                  <div className={msg.type === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                    <p className="chat-bubble-text">{msg.text}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="chat-message-row chat-message-bot"
              >
                <div className="chat-bot-avatar">
                  <span className="chat-bot-avatar-text">AI</span>
                </div>
                <div className="chat-bubble-ai">
                  <span className="chat-typing-dots">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="chat-typing-dot"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Inline Recommendations Carousel */}
            {showRecommendation && cachedCourses.length > 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="chat-recommendation-card"
              >
                <div className="chat-recommendation-header">
                  <Sparkles size={18} className="chat-recommendation-icon" />
                  <h3 className="chat-recommendation-title">Recommended Degree</h3>
                </div>
                <div className="chat-recommendation-body">
                  {cachedCourses.slice(0, 1).map((course, idx) => (
                    <div key={idx} className="chat-recommendation-course">
                      <div className="chat-recommendation-course-header">
                        <GraduationCap size={18} />
                        <h4 className="chat-recommendation-course-name">{course.name}</h4>
                      </div>
                      <p className="chat-recommendation-course-desc">{course.description}</p>
                      <button
                        onClick={() => setShowPopup(true)}
                        className="chat-recommendation-btn"
                      >
                        View Details & Enroll
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Scroll anchor removed, using container scrolling instead */}
          </div>
        </div>

        {/* Input Area */}
        <div className="chat-input-area">
          <div className="chat-input-inner">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask about modules, careers, or anything study-related…"
              className="chat-input-field"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="chat-send-btn"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="chat-input-hint">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Course Enrollment Popup Modal */}
      <AnimatePresence>
        {showPopup && cachedCourses.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="chat-modal-overlay"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="chat-modal-content"
            >
              <button onClick={() => setShowPopup(false)} className="chat-modal-close">
                <X size={20} />
              </button>
              
              <div className="chat-modal-icon-wrapper">
                <Sparkles size={32} />
              </div>
              
              <h2 className="chat-modal-title">Congratulations! 🎉</h2>
              <p className="chat-modal-subtitle">
                Based on your skills and interests, we&apos;ve found the perfect degree pathway for you.
              </p>
              
              {/* Course Details */}
              {cachedCourses[0] && (() => {
                const course = cachedCourses[0];
                const modulesByYear = getModulesByYear(course);
                const years = Object.keys(modulesByYear).sort();
                const currentTab = years.includes(activeYearTab) ? activeYearTab : years[0];

                return (
                  <div className="chat-modal-course-card">
                    <div className="chat-modal-course-header">
                      <div className="chat-modal-course-icon">
                        <GraduationCap size={24} />
                      </div>
                      <div>
                        <h3 className="chat-modal-course-name">{course.name}</h3>
                        <p className="chat-modal-course-desc">{course.description}</p>
                      </div>
                    </div>
                    
                    {/* Enroll Buttons */}
                    <div className="chat-modal-actions">
                      <button onClick={handleEnrollCourse} className="chat-modal-enroll-btn">
                        <GraduationCap size={20} />
                        Enroll in Degree
                      </button>
                      <button onClick={() => setShowPopup(false)} className="chat-modal-dismiss-btn">
                        Not Now
                      </button>
                    </div>

                    <div className="chat-modal-modules-section">
                      <h4 className="chat-modal-modules-title">
                        <BookOpen size={18} className="chat-modal-modules-icon" />
                        Degree Structure by Academic Year
                      </h4>
                      
                      {/* Year Tabs */}
                      {years.length > 0 ? (
                        <>
                          <div className="chat-modal-year-tabs">
                            {years.map(year => (
                              <button
                                key={year}
                                onClick={() => setActiveYearTab(year)}
                                className={`chat-modal-year-tab ${currentTab === year ? 'active' : ''}`}
                              >
                                Year {year}
                              </button>
                            ))}
                          </div>
                          
                          {/* Module Cards for Active Year */}
                          <div className="chat-modal-module-grid">
                            {modulesByYear[currentTab]?.map((mod, idx) => (
                              <div key={idx} className="chat-modal-module-card">
                                <h5 className="chat-modal-module-name">{mod.name}</h5>
                                {mod.description && (
                                  <p className="chat-modal-module-desc">{mod.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="chat-modal-no-modules">No modules detailed for this course yet.</p>
                      )}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
