"use client";

import React, { useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import chatkitOptions from './chatkitOptions';

type Props = { user: User | null };

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export default function ChatKitAISearch({ user }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [kitReady, setKitReady] = useState(false);
  const [fallbackMsg, setFallbackMsg] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // On mount, load the web component script if not already loaded
    const id = 'openai-chatkit-script';
    if (!document.getElementById(id)) {
      const s = document.createElement('script');
      s.id = id;
      s.type = 'module';
      s.src = 'https://cdn.jsdelivr.net/npm/@openai/chatkit@latest/dist/chatkit.js';
      document.head.appendChild(s);
    }
    // Detect when the custom element is defined; set a timeout fallback
    let cancelled = false;
    const t = setTimeout(() => {
      if (!cancelled) setKitReady(false);
    }, 1500);
    if (window?.customElements?.whenDefined) {
      window.customElements.whenDefined('openai-chatkit')
        .then(() => {
          if (!cancelled) {
            clearTimeout(t);
            setKitReady(true);
          }
        })
        .catch(() => {
          if (!cancelled) setKitReady(false);
        });
    }
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  if (!user) {
    return <div className="text-sm text-gray-500">Please sign in to use AI Search.</div>;
  }

  // Provide the API base url and ensure our session endpoint is reachable.
  const options: unknown = {
    ...(chatkitOptions as unknown as Record<string, unknown>),
    api: {
      ...((chatkitOptions as unknown as { api?: Record<string, unknown> }).api || {}),
      url: '/api/chatkit',
    },
    // Hint to the widget that we're using a workflow-backed session; the server
    // returns the actual workflow id from env in /api/chatkit/session
    workflow: { id: 'server-provided' },
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Primary: ChatKit widget */}
      {/* @ts-expect-error - Custom element provided by ChatKit */}
      <openai-chatkit ref={ref} options={options} style={{ display: kitReady ? 'block' : 'none' }}></openai-chatkit>

      {/* Fallback: simple one-shot search UI using our existing API */}
      {!kitReady && (
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <p className="text-sm text-gray-600 mb-3">AI Search is loading… If it doesn&apos;t load, use this quick search:</p>
          <div className="space-y-3">
            {fallbackMsg.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <span className={`inline-block px-3 py-2 rounded-md text-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>{m.content}</span>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded-md px-3 py-2"
                placeholder="Name a city"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                onClick={async () => {
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
                    const text = (data && typeof data === 'object' && 'text' in data && typeof (data as { text?: unknown }).text === 'string')
                      ? (data as { text: string }).text
                      : 'No results found.';
                    setFallbackMsg((prev) => [...prev, { role: 'assistant', content: text }]);
                  } catch {
                    setFallbackMsg((prev) => [...prev, { role: 'assistant', content: 'Sorry, failed to fetch results.' }]);
                  } finally {
                    setLoading(false);
                  }
                }}
                className={`px-4 py-2 rounded-md text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {loading ? 'Searching…' : 'Search'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
