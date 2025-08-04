import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'customer' | 'professional';

export function useUserRole(user: User | null) {
  const [role, setRole] = useState<UserRole>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRole = async (userEmail: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/userRole?email=${encodeURIComponent(userEmail)}`);
      const data = await response.json();
      
      if (response.ok) {
        setRole(data.role || 'customer');
      } else {
        setError(data.error || 'Failed to fetch user role');
        setRole('customer'); // Default fallback
      }
    } catch (err) {
      console.error('Error fetching user role:', err);
      setError('Failed to fetch user role');
      setRole('customer'); // Default fallback
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
      console.log('useUserRole: Making API call to /api/userRole');
      const response = await fetch('/api/userRole', {
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
      fetchUserRole(user.email);
    } else {
      setRole('customer');
      setError(null);
    }
  }, [user?.email]);

  return {
    role,
    isLoading,
    error,
    updateUserRole,
    isProfessional: role === 'professional',
    isCustomer: role === 'customer',
    refetch: () => user?.email && fetchUserRole(user.email)
  };
}
