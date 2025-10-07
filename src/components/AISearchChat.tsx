"use client";

import React, { useState, useRef, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';

interface AISearchChatProps {
  user: User | null;
}

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export default function AISearchChat({ user }: AISearchChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi! Tell me a city and I will find Makeup Artists discussed on Reddit.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !user) return;
    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/aiSearch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg.content }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to get AI response');
      }
      const data = await res.json();
      const text: string = data.text || 'No results found.';
      setMessages((prev) => [...prev, { role: 'assistant', content: text }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I could not fetch results. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return <div className="text-sm text-gray-500">Please sign in to use AI Search.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="border rounded-lg p-4 bg-white shadow-sm mb-4 h-96 overflow-y-auto">
        {messages.map((m, idx) => (
          <div key={idx} className={`mb-3 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block px-3 py-2 rounded-lg text-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Enter a city..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded-md px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded-md text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Searching…' : 'Send'}
        </button>
      </form>
    </div>
  );
}
