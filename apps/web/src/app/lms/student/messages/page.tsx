'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth';
import { MessageSquare, Send, Plus, X, Users, Search, ArrowLeft } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Conversation { id: string; title?: string; isGroup: boolean; updatedAt: string; participants?: any[]; lastMessage?: { text: string; createdAt: string }; unreadCount?: number; }
interface Message { id: string; senderId: string; senderType: string; senderName?: string; text: string; createdAt: string; }

export default function StudentMessagesPage() {
  const { user, token } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/messages`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json.success) setConversations(json.data || []);
    } catch (e) { console.error(e); }
  }, [token]);

  const fetchMessages = useCallback(async (convId: string) => {
    if (!token) return;
    setLoadingMsgs(true);
    try {
      const res = await fetch(`${API_URL}/api/messages/${convId}/messages?limit=50`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json.success) {
        setMessages((json.data || []).reverse());
        fetch(`${API_URL}/api/messages/${convId}/read`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
      }
    } catch (e) { console.error(e); }
    setLoadingMsgs(false);
  }, [token]);

  useEffect(() => { fetchConversations().then(() => setLoading(false)); }, [fetchConversations]);

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => { fetchMessages(activeConvId); fetchConversations(); }, 5000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeConvId, fetchMessages, fetchConversations]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (showNewChat && token) {
      fetch(`${API_URL}/api/student/courses`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(j => { if (j.success) setCourses(j.data || []); }).catch(() => {});
    }
  }, [showNewChat, token]);

  const handleSend = async () => {
    if (!messageText.trim() || !activeConvId || !token || sending) return;
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/api/messages/${activeConvId}/messages`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: messageText.trim() }),
      });
      const json = await res.json();
      if (json.success) { setMessages(prev => [...prev, json.data]); setMessageText(''); fetchConversations(); }
    } catch (e) { console.error(e); }
    setSending(false);
  };

  const startDirectChat = async (targetId: string, targetType: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/messages/direct`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: targetId, targetUserType: targetType }),
      });
      const json = await res.json();
      if (json.success) { setShowNewChat(false); await fetchConversations(); setActiveConvId(json.data.id); setMobileShowChat(true); }
    } catch (e) { console.error(e); }
  };

  const getConvName = (c: Conversation) => {
    if (c.isGroup && c.title) return c.title;
    const other = c.participants?.find(p => p.userId !== user?.id);
    return other?.userName || c.title || 'Chat';
  };

  const formatTime = (d: string) => {
    const date = new Date(d); const now = new Date();
    if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filtered = conversations.filter(c => !search || getConvName(c).toLowerCase().includes(search.toLowerCase()));
  const activeConv = conversations.find(c => c.id === activeConvId);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Chat with your teachers</p>
      </div>

      <div className="flex-1 min-h-0 flex bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* LEFT */}
        <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 flex flex-col ${mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-3 space-y-2 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-gray-100 dark:bg-gray-800 border-0 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={() => setShowNewChat(true)} className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4" /> New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? <div className="p-4 text-center text-gray-400">Loading...</div> :
              filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <MessageSquare className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm text-gray-500">No conversations yet</p>
                </div>
              ) : filtered.map(conv => (
                <button key={conv.id} onClick={() => { setActiveConvId(conv.id); setMobileShowChat(true); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${conv.id === activeConvId ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${conv.isGroup ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-green-500 to-emerald-500'}`}>
                    {conv.isGroup ? <Users className="w-5 h-5" /> : getConvName(conv).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{getConvName(conv)}</span>
                      {conv.lastMessage && <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{formatTime(conv.lastMessage.createdAt)}</span>}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-gray-500 truncate">{conv.lastMessage?.text || 'No messages'}</p>
                      {(conv.unreadCount || 0) > 0 && <span className="ml-2 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">{conv.unreadCount}</span>}
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className={`flex-1 flex flex-col min-w-0 ${!mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
          {!activeConv ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <MessageSquare className="w-16 h-16 text-gray-200 dark:text-gray-700 mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Select a conversation</h2>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <button onClick={() => setMobileShowChat(false)} className="md:hidden p-1 text-gray-500"><ArrowLeft className="w-5 h-5" /></button>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${activeConv.isGroup ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-green-500 to-emerald-500'}`}>
                  {activeConv.isGroup ? <Users className="w-5 h-5" /> : getConvName(activeConv).charAt(0).toUpperCase()}
                </div>
                <div><h3 className="text-sm font-semibold text-gray-900 dark:text-white">{getConvName(activeConv)}</h3></div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-gray-50 dark:bg-gray-950">
                {loadingMsgs ? <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div> :
                  messages.length === 0 ? <div className="text-center py-8 text-sm text-gray-400">No messages yet. Say hi!</div> :
                    messages.map(msg => {
                      const isMine = msg.senderId === user?.id;
                      return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className="max-w-[75%]">
                            {!isMine && activeConv.isGroup && <p className="text-[10px] text-gray-400 ml-3 mb-0.5">{msg.senderName}</p>}
                            <div className={`px-3.5 py-2 rounded-2xl text-sm break-words ${isMine ? 'bg-blue-600 text-white rounded-br-md' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md shadow-sm border border-gray-100 dark:border-gray-700'}`}>{msg.text}</div>
                            <p className="text-[10px] text-gray-400 mt-0.5 px-1">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      );
                    })}
                <div ref={messagesEndRef} />
              </div>

              <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="flex items-center gap-2">
                  <input type="text" placeholder="Type a message..." value={messageText} onChange={e => setMessageText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-gray-100 dark:bg-gray-800 border-0 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button onClick={handleSend} disabled={!messageText.trim() || sending}
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">New Chat</h2>
              <button onClick={() => setShowNewChat(false)} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select a course to message the teacher:</p>
              {courses.length === 0 ? <p className="text-sm text-gray-400">Loading courses...</p> :
                courses.map((c: any) => {
                  const course = c.course || c;
                  const teachers = course.teachers || [];
                  return (
                    <div key={course.id} className="mb-3">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{course.titleEn || course.titleAz}</p>
                      {teachers.length === 0 ? <p className="text-xs text-gray-400 ml-2">No teachers assigned</p> :
                        teachers.map((tc: any) => {
                          const t = tc.teacher || tc;
                          const name = t.nameEn || t.nameAz || 'Teacher';
                          return (
                            <button key={t.id} onClick={() => startDirectChat(t.id, 'teacher')}
                              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-left">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">{name.charAt(0)}</div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{name}</span>
                            </button>
                          );
                        })}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
