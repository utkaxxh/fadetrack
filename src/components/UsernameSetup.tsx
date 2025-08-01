import React, { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';

interface UsernameSetupProps {
  user: User | null;
  onUsernameSet?: (username: string) => void;
  currentUsername?: string | null;
}

export default function UsernameSetup({ user, onUsernameSet, currentUsername }: UsernameSetupProps) {
  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (currentUsername) {
      setUsername(currentUsername);
      setIsAvailable(true);
    }
  }, [currentUsername]);

  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setIsAvailable(null);
      return;
    }

    // If it's the user's current username, it's available to them
    if (usernameToCheck === currentUsername) {
      setIsAvailable(true);
      return;
    }

    setIsChecking(true);
    setError('');

    try {
      const response = await fetch(`/api/username?username=${encodeURIComponent(usernameToCheck)}`);
      const data = await response.json();
      setIsAvailable(data.available);
    } catch (err) {
      console.error('Error checking username:', err);
      setError('Error checking username availability');
    } finally {
      setIsChecking(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(value);
    setError('');
    setSuccess(false);

    // Debounce the availability check
    if (value.length >= 3) {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(value);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setIsAvailable(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email || !username || !isAvailable) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: user.email,
          username: username,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set username');
      }

      setSuccess(true);
      onUsernameSet?.(username);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = () => {
    if (isChecking) return <span className="text-gray-500">⏳</span>;
    if (isAvailable === true) return <span className="text-green-500">✓</span>;
    if (isAvailable === false) return <span className="text-red-500">✗</span>;
    return null;
  };

  const getStatusMessage = () => {
    if (isChecking) return 'Checking availability...';
    if (isAvailable === true && username !== currentUsername) return 'Username is available!';
    if (isAvailable === true && username === currentUsername) return 'This is your current username';
    if (isAvailable === false) return 'Username is already taken';
    return '';
  };

  return (
    <div className="p-6 rounded-lg" style={{backgroundColor: '#F7F0DE', border: '1px solid #114B5F'}}>
      <h3 className="text-xl font-semibold mb-4" style={{color: '#114B5F'}}>
        {currentUsername ? 'Update Username' : 'Choose Your Username'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-2" style={{color: '#114B5F'}}>
            Username
          </label>
          <div className="relative">
            <input
              type="text"
              id="username"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Enter your username"
              className="input pr-10"
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_]+"
              required
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {getStatusIcon()}
            </div>
          </div>
          
          {username && (
            <p className={`text-sm mt-1 ${
              isAvailable === true ? 'text-green-600' : 
              isAvailable === false ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {getStatusMessage()}
            </p>
          )}
          
          <p className="text-xs mt-1" style={{color: '#114B5F'}}>
            3-20 characters, letters, numbers, and underscores only
          </p>
        </div>

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        {success && (
          <p className="text-green-600 text-sm">Username updated successfully! ✓</p>
        )}

        <button
          type="submit"
          disabled={!username || !isAvailable || isSubmitting || username === currentUsername}
          className="w-full px-4 py-2 font-semibold text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: username && isAvailable && username !== currentUsername 
              ? 'linear-gradient(to right, #114B5F, #0d3a4a)' 
              : '#94a3b8',
          }}
        >
          {isSubmitting ? 'Saving...' : currentUsername ? 'Update Username' : 'Set Username'}
        </button>
      </form>
    </div>
  );
}
