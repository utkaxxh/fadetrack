"use client";

import React, { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import ChatKitUsageDisplay from './ChatKitUsageDisplay';

type Props = { user: User | null };

export default function ChatKitAISearch({ user }: Props) {
  const userEmail = user?.email || 'anonymous';
  const hasInitialized = useRef(false);
  const [usageLimitError, setUsageLimitError] = useState<string | null>(null);

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
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('ChatKit session error response:', errorData);
        
        // Handle usage limit errors
        if (res.status === 429) {
          setUsageLimitError(errorData.message || 'Usage limit exceeded');
          throw new Error(errorData.message || 'Usage limit exceeded');
        }
        
        throw new Error(`Session creation failed: ${res.status} - ${errorData.error}`);
      }

      const data = await res.json();
      console.log('ChatKit: Session created successfully, received client_secret');
      setUsageLimitError(null); // Clear any previous errors
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
    theme: {
      colorScheme: 'light' as const,
      radius: 'pill' as const,
      density: 'normal' as const,
      typography: {
        baseSize: 16
      }
    },
    composer: {
      placeholder: 'eg: Delhi, Jaipur, Mumbai...',
      attachments: {
        enabled: false
      },
    },
    startScreen: {
      greeting: 'What city are you looking for a MUA?',
      prompts: [],
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
      {/* Usage Display */}
      {user.email && <ChatKitUsageDisplay userEmail={user.email} />}

      {/* Usage Limit Error */}
      {usageLimitError && (
        <div className="mb-4 p-4 rounded-lg border-2 border-red-500 bg-red-50">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-red-800 mb-1">Usage Limit Reached</h3>
              <p className="text-sm text-red-700">{usageLimitError}</p>
            </div>
          </div>
        </div>
      )}

      {/* ChatKit Interface */}
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
