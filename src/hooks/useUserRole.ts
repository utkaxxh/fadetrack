import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'customer' | 'professional';

export function useUserRole(user: User | null) {
  const [role, setRole] = useState<UserRole>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRecord, setHasRecord] = useState<boolean>(false);

  const fetchUserRole = async (userEmail: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('useUserRole: Fetching role for email:', userEmail);
  const response = await fetch(`/api/userRoleSimple?email=${encodeURIComponent(userEmail)}`);
      const data = await response.json();
      
      console.log('useUserRole: Fetch response:', { response: response.status, data });
      
      if (response.ok) {
        const resolvedRole: UserRole = data.role || 'customer';
        setRole(resolvedRole);
        setHasRecord(!!data.hasRecord);
        // Persist locally so future sessions don't flash modal while network fetch occurs
        try {
          localStorage.setItem(`cached-role-${userEmail}`, resolvedRole);
          if (data.hasRecord) {
            localStorage.setItem(`role-selected-${userEmail}`, 'true');
          }
  } catch { /* ignore storage errors */ }
      } else {
        setError(data.error || 'Failed to fetch user role');
        setRole('customer'); // Default fallback
        setHasRecord(false);
      }
    } catch (err) {
      console.error('useUserRole: Fetch error:', err);
      setError('Failed to fetch user role');
      setRole('customer'); // Default fallback
      setHasRecord(false);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (newRole: UserRole) => {
    console.log('useUserRole: updateUserRole called with:', { newRole, userEmail: user?.email });
    
    if (!user?.email) {
      console.log('useUserRole: No user email, returning false');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('useUserRole: Making API call to /api/userRoleSimple');
      const response = await fetch('/api/userRoleSimple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: user.email,
          role: newRole,
        }),
      });

      console.log('useUserRole: API response status:', response.status);
      const data = await response.json();
      console.log('useUserRole: API response data:', data);

      if (response.ok) {
        console.log('useUserRole: Success, setting role to:', newRole);
        setRole(newRole);
        setHasRecord(true);
        try {
          localStorage.setItem(`cached-role-${user.email}`, newRole);
          localStorage.setItem(`role-selected-${user.email}`, 'true');
  } catch { /* ignore storage errors */ }
        return true;
      } else {
        console.error('useUserRole: API error:', data);
        setError(data.error || 'Failed to update user role');
        
        // Provide more specific error messages
        if (data.error?.includes('table not found') || data.error?.includes('relation "user_roles" does not exist')) {
          setError('Database not properly set up. Please contact support or check the setup documentation.');
        }
        
        return false;
      }
    } catch (err: unknown) {
      console.error('useUserRole: Network error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(`Network error: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      // First seed from cache to avoid UI flicker while fetching from DB
      try {
        const cached = localStorage.getItem(`cached-role-${user.email}`) as UserRole | null;
        const hasSelected = localStorage.getItem(`role-selected-${user.email}`);
        if (cached) {
          setRole(cached);
          setHasRecord(!!hasSelected);
        }
      } catch { /* ignore */ }
      
      // ALWAYS fetch from database to ensure we have the latest role
      // This ensures role persists across browsers and devices
      fetchUserRole(user.email);
    } else {
      setRole('customer');
      setError(null);
      setHasRecord(false);
    }
  }, [user?.email]); // fetchUserRole is stable, no need to disable eslint

  return {
    role,
    isLoading,
    error,
    updateUserRole,
    isProfessional: role === 'professional',
    isCustomer: role === 'customer',
    hasRecord,
    refetch: () => user?.email && fetchUserRole(user.email)
  };
}
