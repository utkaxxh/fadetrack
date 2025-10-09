"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
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

  // Build options once; React won't properly pass object props to Custom Elements as properties,
  // so we assign via ref below once the element is defined.
  const options = useMemo(() => ({
    ...(chatkitOptions as unknown as Record<string, unknown>),
    api: {
      ...((chatkitOptions as unknown as { api?: Record<string, unknown> }).api || {}),
      url: '/api/chatkit',
    },
    // Hint to the widget that we're using a workflow-backed session; the server
    // returns the actual workflow id from env in /api/chatkit/session
    workflow: { id: 'server-provided' },
  }), []);

  useEffect(() => {
    let cancelled = false;
    const markReady = () => { if (!cancelled) setKitReady(true); };

    // If already defined, mark ready immediately
    if (typeof window !== 'undefined' && window.customElements?.get('openai-chatkit')) {
      markReady();
      return () => { cancelled = true; };
    }

    // Inject CDN script if not present
    const id = 'openai-chatkit-script';
    let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
      script = document.createElement('script');
      script.id = id;
      script.type = 'module';
      script.src = 'https://cdn.jsdelivr.net/npm/@openai/chatkit@latest/dist/chatkit.js';
      script.onload = async () => {
        try {
          if (window.customElements?.whenDefined) {
            await window.customElements.whenDefined('openai-chatkit');
          }
        } finally {
          markReady();
        }
      };
      script.onerror = () => {
        // Even on error, show fallback UI
        if (!cancelled) setKitReady(false);
      };
      document.head.appendChild(script);
    } else {
      // If script exists, wait for element definition or fallback after 1s
      const timeout = setTimeout(() => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('openai-chatkit element not defined in time; showing fallback');
        }
        markReady();
      }, 1200);
      window.customElements?.whenDefined?.('openai-chatkit').then(() => {
        clearTimeout(timeout);
        markReady();
      }).catch(() => {
        clearTimeout(timeout);
        if (!cancelled) setKitReady(false);
      });
    }

    return () => { cancelled = true; };
  }, []);

  // Once the custom element is defined and the ref is set, assign options as a property.
  useEffect(() => {
    if (!kitReady) return;
    const el = ref.current as unknown as { options?: unknown } | null;
    if (el) {
      try {
        // Assign options property for the web component
        (el as unknown as { options: unknown }).options = options;
      } catch (e) {
        // best-effort only; fallback UI will still be available
        console.warn('Failed to assign ChatKit options:', e);
      }
    }
  }, [kitReady, options]);

  if (!user) {
    return <div className="text-sm text-gray-500">Please sign in to use AI Search.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Primary: ChatKit widget */}
  {/* @ts-expect-error - Custom element provided by ChatKit */}
  <openai-chatkit ref={ref} style={{ display: kitReady ? 'block' : 'none' }}></openai-chatkit>

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
