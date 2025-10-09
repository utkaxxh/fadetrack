"use client";

import React, { useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { ChatKit, useChatKit } from '@openai/chatkit-react';

type Props = { user: User | null };

export default function ChatKitAISearch({ user }: Props) {
  useEffect(() => {
    console.log('ChatKit component mounted, user:', user?.email);
  }, [user]);

  // Set up ChatKit with the session endpoint
  const { control } = useChatKit({
    api: {
      async getClientSecret(existingClientSecret?: string) {
        // If we have an existing client secret, we could refresh it
        // For now, we'll just create a new session
        if (existingClientSecret) {
          console.log('ChatKit: Refreshing session with existing secret');
        } else {
          console.log('ChatKit: Creating new session');
        }

        try {
          console.log('ChatKit: Requesting client secret from /api/chatkit/session');
          const res = await fetch('/api/chatkit/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user: user?.email || 'anonymous',
            }),
          });

          console.log('ChatKit: Session response status:', res.status);

          if (!res.ok) {
            const errorText = await res.text();
            console.error('ChatKit session error response:', errorText);
            throw new Error(`Session creation failed: ${res.status} - ${errorText}`);
          }

          const data = await res.json();
          console.log('ChatKit: Session created successfully, received client_secret');
          return data.client_secret;
        } catch (error) {
          console.error('ChatKit: Failed to get client secret:', error);
          throw error;
        }
      },
    },
  });

  useEffect(() => {
    console.log('ChatKit: Control object:', control);
  }, [control]);

  if (!user) {
    return <div className="text-sm text-gray-500">Please sign in to use AI Search.</div>;
  }

  console.log('ChatKit: Rendering ChatKit component');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="chatkit-wrapper" style={{ height: '600px', width: '100%' }}>
        <ChatKit 
          control={control}
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
