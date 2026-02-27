'use client';

import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import {
  ArrowLeft, Bot, Send, Loader2, ThumbsUp, ThumbsDown,
  Trash2, Brain, Sparkles, Gamepad2, Music,
  Palette, Code, FlaskConical, Trophy, Zap, Heart,
  ChevronRight,
} from 'lucide-react';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';
import { useLmsT } from '@/hooks/useLmsT';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AiProfile {
  id?: string;
  interests?: string[];
  learningStyle?: string;
  personality?: string;
  motivation?: string;
  preferredPace?: string;
  surveyCompleted: boolean;
}

interface FeedbackItem {
  messageIndex: number;
  rating: number;
}

// ================================================================
// Survey Options
// ================================================================
const INTERESTS = [
  { value: 'gaming', key: 'interestGaming', icon: Gamepad2 },
  { value: 'music', key: 'interestMusic', icon: Music },
  { value: 'art', key: 'interestArtDesign', icon: Palette },
  { value: 'coding', key: 'interestProgramming', icon: Code },
  { value: 'science', key: 'interestScience', icon: FlaskConical },
  { value: 'sports', key: 'interestSports', icon: Trophy },
  { value: 'technology', key: 'interestTechnology', icon: Zap },
  { value: 'social', key: 'interestSocialMedia', icon: Heart },
];

const LEARNING_STYLES = [
  { value: 'visual', key: 'styleVisual', descKey: 'styleVisualDesc' },
  { value: 'reading', key: 'styleReading', descKey: 'styleReadingDesc' },
  { value: 'hands-on', key: 'styleHandsOn', descKey: 'styleHandsOnDesc' },
  { value: 'discussion', key: 'styleDiscussion', descKey: 'styleDiscussionDesc' },
];

const PERSONALITIES = [
  { value: 'competitive', key: 'personalityCompetitive', descKey: 'personalityCompetitiveDesc' },
  { value: 'collaborative', key: 'personalityFriendly', descKey: 'personalityFriendlyDesc' },
  { value: 'independent', key: 'personalityIndependent', descKey: 'personalityIndependentDesc' },
];

const MOTIVATIONS = [
  { value: 'career', key: 'motivationCareer' },
  { value: 'curiosity', key: 'motivationCuriosity' },
  { value: 'grades', key: 'motivationGrades' },
  { value: 'fun', key: 'motivationFun' },
];

const PACES = [
  { value: 'fast', key: 'paceFast' },
  { value: 'moderate', key: 'paceModerate' },
  { value: 'slow', key: 'paceSlow' },
];

export default function StudentAiTutorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 text-violet-600 animate-spin" /></div>}>
      <StudentAiTutorContent />
    </Suspense>
  );
}

function StudentAiTutorContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = params.courseId as string;
  const lessonId = searchParams.get('lessonId') || undefined;
  const assignmentId = searchParams.get('assignmentId') || undefined;
  const { token } = useAuthStore();
  const { t } = useLmsT();

  const [profile, setProfile] = useState<AiProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [feedbackMap, setFeedbackMap] = useState<Map<number, number>>(new Map());
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => { scrollToBottom(); }, [messages]);

  // Load initial data
  const fetchInitial = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [checkRes, profileRes, historyRes] = await Promise.all([
        fetch(`${API_URL}/api/ai-tutor/check/${courseId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/ai-tutor/profile`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/ai-tutor/history/${courseId}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [checkData, profileData, historyData] = await Promise.all([
        checkRes.json(), profileRes.json(), historyRes.json(),
      ]);

      setEnabled(checkData.data?.enabled || false);

      if (profileData.success && profileData.data) {
        setProfile(profileData.data);
        if (!profileData.data.surveyCompleted) setShowSurvey(true);
      } else {
        setProfile({ surveyCompleted: false });
        setShowSurvey(true);
      }

      if (historyData.success && historyData.data) {
        setMessages(historyData.data.messages || []);
        // Restore sessionId from history so feedback works after refresh
        if (historyData.data.sessionId) {
          setSessionId(historyData.data.sessionId);
        }
        const fMap = new Map<number, number>();
        (historyData.data.feedback || []).forEach((f: FeedbackItem) => {
          fMap.set(f.messageIndex, f.rating);
        });
        setFeedbackMap(fMap);
      }
    } catch (err) {
      console.error('Failed to load:', err);
    } finally {
      setLoading(false);
    }
  }, [token, courseId]);

  useEffect(() => { fetchInitial(); }, [fetchInitial]);

  // Send message
  const handleSend = async () => {
    if (!input.trim() || isStreaming || !token) return;
    const userMessage = input.trim();
    setInput('');
    setIsStreaming(true);

    const userMsg: Message = { role: 'user', content: userMessage, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);

    // Add placeholder for assistant
    const assistantMsg: Message = { role: 'assistant', content: '', timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const res = await fetch(`${API_URL}/api/ai-tutor/chat/${courseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: userMessage, lessonId, assignmentId }),
      });

      if (!res.ok) {
        throw new Error('Failed to get response');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader');

      let fullResponse = '';
      let buffer = ''; // Buffer for partial JSON lines across chunks
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete last line in buffer

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.token) {
              fullResponse += parsed.token;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { ...updated[updated.length - 1], content: fullResponse };
                return updated;
              });
            }
            if (parsed.sessionId) {
              setSessionId(parsed.sessionId);
            }
            if (parsed.error) {
              fullResponse = parsed.error;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { ...updated[updated.length - 1], content: `Error: ${parsed.error}` };
                return updated;
              });
            }
          } catch {
            // Partial JSON — will be completed in next chunk via buffer
          }
        }
      }
      // Process any remaining buffer content
      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer);
          if (parsed.token) {
            fullResponse += parsed.token;
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { ...updated[updated.length - 1], content: fullResponse };
              return updated;
            });
          }
          if (parsed.sessionId) setSessionId(parsed.sessionId);
        } catch {}
      }
    } catch (err: any) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], content: t('somethingWentWrong') };
        return updated;
      });
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  };

  // Submit feedback
  const handleFeedback = async (messageIndex: number, rating: number) => {
    if (!token || !sessionId) return;
    try {
      await fetch(`${API_URL}/api/ai-tutor/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sessionId, messageIndex, rating }),
      });
      setFeedbackMap(prev => new Map(prev).set(messageIndex, rating));
    } catch {}
  };

  // Clear history
  const handleClear = async () => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/ai-tutor/history/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages([]);
      setSessionId(null);
      setFeedbackMap(new Map());
    } catch {}
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
    );
  }

  if (!enabled) {
    return (
      <div className="text-center py-20">
        <Bot className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('aiTutorNotAvailable')}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{t('aiTutorNotEnabled')}</p>
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all">
          <ArrowLeft className="w-4 h-4" /> {t('goBack')}
        </button>
      </div>
    );
  }

  // Show survey if not completed or if user wants to update profile
  if (showSurvey) {
    return (
      <SurveyScreen
        token={token!}
        courseId={courseId}
        onComplete={(newProfile) => {
          setProfile(newProfile);
          setShowSurvey(false);
        }}
        onSkip={() => setShowSurvey(false)}
      />
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Chat Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t('aiTutor')}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {assignmentId ? t('homeworkHelpMode') : lessonId ? t('lessonContext') : t('courseAssistant')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSurvey(true)}
            className="p-2 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-all"
            title={t('updateAiProfile')}
          >
            <Brain className="w-5 h-5" />
          </button>
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
              title={t('clearChat')}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {assignmentId ? t('needHelpAssignment') : t('readyToLearn')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              {assignmentId
                ? t('guideStepByStep')
                : t('askAnythingCourse')}
            </p>
            {/* Quick prompts */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {[
                { key: 'promptExplainConcepts' },
                { key: 'promptPracticeProblem' },
                { key: 'promptFocusOn' },
                { key: 'promptHelpUnderstand' },
              ].map(prompt => (
                <button
                  key={prompt.key}
                  onClick={() => { setInput(t(prompt.key)); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-all"
                >
                  {t(prompt.key)}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
              {msg.role === 'assistant' ? (
                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  {msg.content ? (
                    <MarkdownRenderer content={msg.content} className="text-sm" />
                  ) : (isStreaming && idx === messages.length - 1 ? (
                    <span className="flex items-center gap-2 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" /> {t('thinking')}
                    </span>
                  ) : null)}
                </div>
              ) : (
                <div className="px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap bg-violet-600 text-white rounded-br-md">
                  {msg.content || ''}
                </div>
              )}
              {/* Feedback buttons for assistant messages */}
              {msg.role === 'assistant' && msg.content && !isStreaming && sessionId && (
                <div className="flex items-center gap-1 mt-1">
                  <button
                    onClick={() => handleFeedback(idx, 1)}
                    className={`p-1 rounded transition-all ${
                      feedbackMap.get(idx) === 1 ? 'text-green-500' : 'text-gray-300 hover:text-green-500'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleFeedback(idx, -1)}
                    className={`p-1 rounded transition-all ${
                      feedbackMap.get(idx) === -1 ? 'text-red-500' : 'text-gray-300 hover:text-red-500'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isStreaming}
            className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none disabled:opacity-50"
            placeholder={assignmentId ? t('describeStuckOn') : t('askQuestion')}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="p-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 text-center">
          {t('aiDisclaimer')}
        </p>
      </div>
    </div>
  );
}

// ================================================================
// Survey Screen
// ================================================================
function SurveyScreen({ token, courseId, onComplete, onSkip }: {
  token: string;
  courseId: string;
  onComplete: (profile: AiProfile) => void;
  onSkip: () => void;
}) {
  const { t } = useLmsT();
  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState<string[]>([]);
  const [learningStyle, setLearningStyle] = useState('');
  const [personality, setPersonality] = useState('');
  const [motivation, setMotivation] = useState('');
  const [preferredPace, setPreferredPace] = useState('');
  const [saving, setSaving] = useState(false);

  const steps = [
    {
      title: t('surveyInterests'),
      desc: t('surveyInterestsDesc'),
      component: (
        <div className="grid grid-cols-2 gap-3">
          {INTERESTS.map(i => {
            const Icon = i.icon;
            const selected = interests.includes(i.value);
            return (
              <button key={i.value} onClick={() => setInterests(prev => selected ? prev.filter(x => x !== i.value) : [...prev, i.value])}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${selected ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                <Icon className={`w-5 h-5 ${selected ? 'text-violet-600' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${selected ? 'text-violet-600 dark:text-violet-400' : 'text-gray-700 dark:text-gray-300'}`}>{t(i.key)}</span>
              </button>
            );
          })}
        </div>
      ),
    },
    {
      title: t('surveyLearningStyle'),
      desc: t('surveyLearningStyleDesc'),
      component: (
        <div className="space-y-3">
          {LEARNING_STYLES.map(s => (
            <button key={s.value} onClick={() => setLearningStyle(s.value)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${learningStyle === s.value ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${learningStyle === s.value ? 'border-violet-500' : 'border-gray-300'}`}>
                {learningStyle === s.value && <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />}
              </div>
              <div>
                <p className={`text-sm font-semibold ${learningStyle === s.value ? 'text-violet-600 dark:text-violet-400' : 'text-gray-900 dark:text-white'}`}>{t(s.key)}</p>
                <p className="text-xs text-gray-500">{t(s.descKey)}</p>
              </div>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: t('surveyPersonality'),
      desc: t('surveyPersonalityDesc'),
      component: (
        <div className="space-y-3">
          {PERSONALITIES.map(p => (
            <button key={p.value} onClick={() => setPersonality(p.value)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${personality === p.value ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${personality === p.value ? 'border-violet-500' : 'border-gray-300'}`}>
                {personality === p.value && <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />}
              </div>
              <div>
                <p className={`text-sm font-semibold ${personality === p.value ? 'text-violet-600 dark:text-violet-400' : 'text-gray-900 dark:text-white'}`}>{t(p.key)}</p>
                <p className="text-xs text-gray-500">{t(p.descKey)}</p>
              </div>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: t('surveyMotivation'),
      desc: t('surveyMotivationDesc'),
      component: (
        <div className="grid grid-cols-2 gap-3">
          {MOTIVATIONS.map(m => (
            <button key={m.value} onClick={() => setMotivation(m.value)}
              className={`p-4 rounded-xl border-2 transition-all text-center ${motivation === m.value ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
              <span className={`text-sm font-medium ${motivation === m.value ? 'text-violet-600 dark:text-violet-400' : 'text-gray-700 dark:text-gray-300'}`}>{t(m.key)}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: t('surveyPace'),
      desc: t('surveyPaceDesc'),
      component: (
        <div className="space-y-3">
          {PACES.map(p => (
            <button key={p.value} onClick={() => setPreferredPace(p.value)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${preferredPace === p.value ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${preferredPace === p.value ? 'border-violet-500' : 'border-gray-300'}`}>
                {preferredPace === p.value && <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />}
              </div>
              <p className={`text-sm font-medium ${preferredPace === p.value ? 'text-violet-600 dark:text-violet-400' : 'text-gray-700 dark:text-gray-300'}`}>{t(p.key)}</p>
            </button>
          ))}
        </div>
      ),
    },
  ];

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/ai-tutor/profile/survey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ interests, learningStyle, personality, motivation, preferredPace }),
      });
      const data = await res.json();
      if (data.success) onComplete(data.data);
    } catch (err) {
      console.error('Failed to save survey:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8">
      {/* Progress */}
      <div className="flex items-center gap-1 mb-8">
        {steps.map((_, i) => (
          <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? 'bg-violet-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
        ))}
      </div>

      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
          <Brain className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{steps[step].title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{steps[step].desc}</p>
      </div>

      <div className="mb-8">{steps[step].component}</div>

      <div className="flex items-center justify-between">
        {step > 0 ? (
          <button onClick={() => setStep(s => s - 1)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">
            {t('back')}
          </button>
        ) : (
          <button onClick={onSkip} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-600 transition-all">
            {t('skipForNow')}
          </button>
        )}

        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 transition-all shadow-sm"
          >
            {t('next')} <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 transition-all shadow-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {t('startLearning')}
          </button>
        )}
      </div>
    </div>
  );
}
