"use client";

import React, { useEffect, useState } from 'react';

interface UsageData {
  daily_sessions: number;
  monthly_sessions: number;
  total_sessions: number;
  last_session_at: string | null;
}

interface Props {
  userEmail: string;
  dailyLimit?: number;
  monthlyLimit?: number;
}

export default function ChatKitUsageDisplay({ userEmail, dailyLimit = 20, monthlyLimit = 100 }: Props) {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch(`/api/chatkit/usage?email=${encodeURIComponent(userEmail)}`);
        if (response.ok) {
          const data = await response.json();
          setUsage(data);
        }
      } catch (error) {
        console.error('Error fetching usage:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) {
      fetchUsage();
    }
  }, [userEmail]);

  if (loading) {
    return null;
  }

  if (!usage) {
    return null;
  }

  const dailyRemaining = Math.max(0, dailyLimit - usage.daily_sessions);
  const dailyPercentage = (usage.daily_sessions / dailyLimit) * 100;

  return (
    <div className="mb-4 p-4 rounded-lg border" style={{ 
      backgroundColor: 'rgba(248, 250, 252, 0.8)', 
      borderColor: 'rgba(17, 75, 95, 0.2)' 
    }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold" style={{ color: '#114B5F' }}>
          AI Search Usage
        </h3>
        <span className="text-xs" style={{ color: '#114B5F', opacity: 0.7 }}>
          {dailyRemaining} queries left today
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className="h-2 rounded-full transition-all duration-300"
          style={{ 
            width: `${Math.min(dailyPercentage, 100)}%`,
            backgroundColor: dailyPercentage >= 90 ? '#ef4444' : dailyPercentage >= 70 ? '#f59e0b' : '#10b981'
          }}
        />
      </div>

      <div className="flex justify-between text-xs" style={{ color: '#114B5F', opacity: 0.6 }}>
        <span>Daily: {usage.daily_sessions}/{dailyLimit}</span>
        <span>Monthly: {usage.monthly_sessions}/{monthlyLimit}</span>
      </div>
    </div>
  );
}
