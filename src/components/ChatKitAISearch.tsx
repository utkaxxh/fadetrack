"use client";

import React, { useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';

type Props = { user: User | null };

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export default function ChatKitAISearch({ user }: Props) {
  const chatKitRef = useRef<HTMLElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFallback, setShowFallback] = useState(false);
  const [fallbackMsg, setFallbackMsg] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    let mounted = true;

    // Load ChatKit script
    const loadChatKit = async () => {
      try {
        // Inject script if not already present
        if (!document.getElementById('chatkit-script')) {
          const script = document.createElement('script');
          script.id = 'chatkit-script';
          script.src = 'https://cdn.platform.openai.com/deployments/chatkit/chatkit.js';
          script.async = true;
          
          script.onload = () => {
            if (mounted) {
              initializeChatKit();
            }
          };
          
          script.onerror = () => {
            console.error('Failed to load ChatKit script');
            if (mounted) {
              setIsLoading(false);
              setShowFallback(true);
            }
          };
          
          document.head.appendChild(script);
        } else {
          // Script already exists, initialize
          initializeChatKit();
        }
      } catch (error) {
        console.error('Error loading ChatKit:', error);
        if (mounted) {
          setIsLoading(false);
          setShowFallback(true);
        }
      }
    };

    const initializeChatKit = async () => {
      try {
        // Wait for custom element to be defined
        if (window.customElements) {
          await window.customElements.whenDefined('openai-chatkit');
        }

        if (!mounted || !chatKitRef.current) return;

        // Set options on the web component
        const element = chatKitRef.current as HTMLElement & {
          setOptions: (options: {
            apiURL: string;
            theme?: { colorScheme: string };
            composer?: { placeholder: string };
            newThreadView?: { greeting: string; prompts?: Array<{ label: string; prompt: string }> };
          }) => void;
        };

        if (element.setOptions) {
          element.setOptions({
            apiURL: '/api/chatkit',
            theme: {
              colorScheme: 'light',
            },
            composer: {
              placeholder: 'Search for makeup artists...',
            },
            newThreadView: {
              greeting: 'What city are you looking for a MUA?',
              prompts: [
                {
                  label: 'Find MUAs in New York',
                  prompt: 'Show me makeup artists in New York',
                },
                {
                  label: 'Find MUAs in Los Angeles',
                  prompt: 'Show me makeup artists in Los Angeles',
                },
              ],
            },
          });

          setIsLoading(false);
        } else {
          throw new Error('setOptions method not available');
        }
      } catch (error) {
        console.error('Error initializing ChatKit:', error);
        if (mounted) {
          setIsLoading(false);
          setShowFallback(true);
        }
      }
    };

    loadChatKit();

    return () => {
      mounted = false;
    };
  }, [user]);

  if (!user) {
    return <div className="text-sm text-gray-500">Please sign in to use AI Search.</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI Search...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {!showFallback ? (
        <div className="chatkit-container">
          {/* @ts-expect-error - Custom element provided by ChatKit */}
          <openai-chatkit 
            ref={chatKitRef}
            style={{ 
              display: 'block',
              height: '600px',
              width: '100%',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            }}
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
