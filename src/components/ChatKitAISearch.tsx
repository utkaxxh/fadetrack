"use client";

import React, { useEffect, useMemo, useCallback, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { ChatKit, useChatKit } from '@openai/chatkit-react';

type Props = { user: User | null };

export default function ChatKitAISearch({ user }: Props) {
  const userEmail = user?.email || 'anonymous';
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      console.log('ChatKit component mounted, user:', userEmail);
      hasInitialized.current = true;
    }
    
    // Return cleanup function to log unmounting
    return () => {
      console.log('⚠️ ChatKit component is unmounting!');
    };
  }, [userEmail]);

  // Memoize the getClientSecret function to prevent re-creation on every render
  const getClientSecret = useCallback(async (existingClientSecret?: string) => {
    if (existingClientSecret) {
      console.log('ChatKit: Refreshing session with existing secret');
      // Return existing secret if still valid
      return existingClientSecret;
    }

    console.log('ChatKit: Creating new session');

    try {
      console.log('ChatKit: Requesting client secret from /api/chatkit/session');
      const res = await fetch('/api/chatkit/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: userEmail,
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
  }, [userEmail]);

  // Memoize the ChatKit options to prevent re-initialization
  const chatKitOptions = useMemo(() => ({
    api: {
      getClientSecret,
    },
  }), [getClientSecret]);

  // Set up ChatKit with stable options
  const { control } = useChatKit(chatKitOptions);

  // Log control state
  useEffect(() => {
    console.log('🎮 ChatKit control state:', {
      hasControl: !!control,
      controlType: typeof control,
      controlValue: control
    });
  }, [control]);

  // Monitor ChatKit DOM presence
  useEffect(() => {
    const timer = setTimeout(() => {
      const chatKitElements = document.querySelectorAll('openai-chatkit, [class*="chatkit"]');
      console.log('🔍 ChatKit DOM check:', {
        found: chatKitElements.length,
        elements: Array.from(chatKitElements).map(el => ({
          tag: el.tagName,
          visible: el.clientHeight > 0,
          height: el.clientHeight,
          display: window.getComputedStyle(el).display
        }))
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!user) {
    return <div className="text-sm text-gray-500">Please sign in to use AI Search.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div 
        className="chatkit-wrapper" 
        style={{ 
          height: '600px', 
          width: '100%',
          minHeight: '600px',
          display: 'block',
          position: 'relative'
        }}
      >
        <ChatKit 
          control={control}
          className="h-full w-full"
          style={{ height: '100%', display: 'block' }}
        />
      </div>
    </div>
  );
}
