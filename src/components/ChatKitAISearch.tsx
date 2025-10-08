"use client";

import React, { useEffect, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import chatkitOptions from './chatkitOptions';

type Props = { user: User | null };

export default function ChatKitAISearch({ user }: Props) {
  const ref = useRef<HTMLElement | null>(null);

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
  };

  return (
    <div className="max-w-2xl mx-auto">
  {/* @ts-expect-error - Custom element provided by ChatKit */}
  <openai-chatkit ref={ref} options={options}></openai-chatkit>
    </div>
  );
}
