"use client";

import React, { useState, useRef, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';

type Props = { user: User | null };

type ChatMessage = { 
  role: 'user' | 'assistant'; 
  content: string;
  timestamp: Date;
};

export default function ChatKitAISearch({ user }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!user) {
    return <div className="text-sm text-gray-500">Please sign in to use AI Search.</div>;
  }

  const handleSearch = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setInput('');
    setLoading(true);
    
    // Add user message
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    
    try {
      const res = await fetch('/api/aiSearch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage }),
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
      
      // Add assistant message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Search error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, failed to fetch results. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[600px] flex flex-col border rounded-lg shadow-sm bg-white">
      {/* Header */}
      <div className="border-b px-4 py-3 bg-gray-50 rounded-t-lg">
        <h3 className="font-semibold text-gray-800">AI Search</h3>
        <p className="text-sm text-gray-600">Ask me about makeup artists in any city</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-lg font-medium mb-2">Start a conversation</p>
            <p className="text-sm">Try asking:</p>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => setInput('Show me makeup artists in New York')}
                className="block w-full max-w-md mx-auto px-4 py-2 text-left bg-blue-50 hover:bg-blue-100 rounded-md text-blue-700 text-sm"
              >
                💄 Show me makeup artists in New York
              </button>
              <button
                onClick={() => setInput('Find MUAs in Los Angeles')}
                className="block w-full max-w-md mx-auto px-4 py-2 text-left bg-blue-50 hover:bg-blue-100 rounded-md text-blue-700 text-sm"
              >
                ✨ Find MUAs in Los Angeles
              </button>
              <button
                onClick={() => setInput('Best rated makeup artists near me')}
                className="block w-full max-w-md mx-auto px-4 py-2 text-left bg-blue-50 hover:bg-blue-100 rounded-md text-blue-700 text-sm"
              >
                ⭐ Best rated makeup artists near me
              </button>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-gray-50 rounded-b-lg">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search for makeup artists..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading && input.trim()) {
                e.preventDefault();
                handleSearch();
              }
            }}
            disabled={loading}
          />
          <button
            onClick={handleSearch}
            disabled={loading || !input.trim()}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              loading || !input.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
