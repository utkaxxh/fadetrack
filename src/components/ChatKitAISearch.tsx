"use client";

import React, { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { ChatKit, useChatKit } from '@openai/chatkit-react';

type Props = { user: User | null };

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export default function ChatKitAISearch({ user }: Props) {
  const [showFallback, setShowFallback] = useState(false);
  const [fallbackMsg, setFallbackMsg] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Set up ChatKit with proper session handling
  const { control } = useChatKit({
    api: {
      async getClientSecret(existingClientSecret?: string) {
        // If we have an existing client secret, implement session refresh
        if (existingClientSecret) {
          // For now, just create a new session
          // In production, you might want to implement proper session refresh
        }

        try {
          const res = await fetch('/api/chatkit/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!res.ok) {
            throw new Error(`Session creation failed: ${res.status}`);
          }

          const { client_secret } = await res.json();
          return client_secret;
        } catch (error) {
          console.error('Failed to get ChatKit client secret:', error);
          setShowFallback(true);
          throw error;
        }
      },
    },
  });

  if (!user) {
    return <div className="text-sm text-gray-500">Please sign in to use AI Search.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Primary: ChatKit widget using React bindings */}
      {!showFallback ? (
        <div className="chatkit-container">
          <ChatKit 
            control={control} 
            className="h-[600px] w-full border rounded-lg shadow-sm"
          />
        </div>
      ) : (
        /* Fallback: simple one-shot search UI using our existing API */
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <p className="text-sm text-gray-600 mb-3">
            AI Search is temporarily unavailable. Use this quick search instead:
          </p>
          <div className="space-y-3">
            {fallbackMsg.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <span 
                  className={`inline-block px-3 py-2 rounded-md text-sm ${
                    m.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {m.content}
                </span>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded-md px-3 py-2"
                placeholder="Search for makeup artists..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
              <button
                onClick={handleSearch}
                disabled={loading || !input.trim()}
                className={`px-4 py-2 rounded-md text-white ${
                  loading || !input.trim()
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Searching…' : 'Search'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  async function handleSearch() {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput('');
    setLoading(true);
    setFallbackMsg((prev) => [...prev, { role: 'user', content: q }]);
    
    try {
      const res = await fetch('/api/aiSearch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      
      const data: unknown = await res.json().catch(() => ({}));
      const text = (
        data && 
        typeof data === 'object' && 
        'text' in data && 
        typeof (data as { text?: unknown }).text === 'string'
      )
        ? (data as { text: string }).text
        : 'No results found.';
      
      setFallbackMsg((prev) => [...prev, { role: 'assistant', content: text }]);
    } catch {
      setFallbackMsg((prev) => [
        ...prev, 
        { role: 'assistant', content: 'Sorry, failed to fetch results.' }
      ]);
    } finally {
      setLoading(false);
    }
  }
}
