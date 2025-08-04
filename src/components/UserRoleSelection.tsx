import React, { useState } from 'react';
import { UserRole } from '../hooks/useUserRole';

interface UserRoleSelectionProps {
  currentRole: UserRole;
  onRoleUpdate: (role: UserRole) => Promise<boolean>;
  onComplete: () => void;
}

export default function UserRoleSelection({ currentRole, onRoleUpdate, onComplete }: UserRoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelection = async () => {
    if (selectedRole === currentRole) {
      onComplete();
      return;
    }

    setIsSubmitting(true);
    setError('');

    const success = await onRoleUpdate(selectedRole);
    
    if (success) {
      onComplete();
    } else {
      setError('Failed to update your role. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="p-8 rounded-lg max-w-md w-full mx-4" style={{backgroundColor: '#F7F0DE', border: '2px solid #114B5F'}}>
        <h2 className="text-2xl font-bold mb-6 text-center" style={{color: '#114B5F'}}>
          Choose Your Account Type
        </h2>
        
        <div className="space-y-4 mb-6">
          {/* Customer Option */}
          <label className={`block p-4 rounded-lg cursor-pointer transition-all border-2 ${
            selectedRole === 'customer' 
              ? 'border-solid' 
              : 'border-dashed opacity-70'
          }`} style={{
            borderColor: '#114B5F',
            backgroundColor: selectedRole === 'customer' ? 'rgba(17, 75, 95, 0.1)' : 'transparent'
          }}>
            <input
              type="radio"
              name="role"
              value="customer"
              checked={selectedRole === 'customer'}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="sr-only"
            />
            <div className="flex items-start space-x-3">
              <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                selectedRole === 'customer' ? 'border-solid' : 'border-dashed'
              }`} style={{borderColor: '#114B5F'}}>
                {selectedRole === 'customer' && (
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: '#114B5F'}}></div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg" style={{color: '#114B5F'}}>I&apos;m a Customer</h3>
                <p className="text-sm" style={{color: '#114B5F', opacity: 0.8}}>
                  Track my haircuts, find great barbers, and leave reviews
                </p>
              </div>
            </div>
          </label>

          {/* Professional Option */}
          <label className={`block p-4 rounded-lg cursor-pointer transition-all border-2 ${
            selectedRole === 'professional' 
              ? 'border-solid' 
              : 'border-dashed opacity-70'
          }`} style={{
            borderColor: '#114B5F',
            backgroundColor: selectedRole === 'professional' ? 'rgba(17, 75, 95, 0.1)' : 'transparent'
          }}>
            <input
              type="radio"
              name="role"
              value="professional"
              checked={selectedRole === 'professional'}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="sr-only"
            />
            <div className="flex items-start space-x-3">
              <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                selectedRole === 'professional' ? 'border-solid' : 'border-dashed'
              }`} style={{borderColor: '#114B5F'}}>
                {selectedRole === 'professional' && (
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: '#114B5F'}}></div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg" style={{color: '#114B5F'}}>I&apos;m a Professional</h3>
                <p className="text-sm" style={{color: '#114B5F', opacity: 0.8}}>
                  Barber, beautician, or stylist - manage my profile and showcase my work
                </p>
              </div>
            </div>
          </label>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg" style={{backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)'}}>
            <p className="text-red-600 text-sm text-center font-medium">{error}</p>
            {error.includes('Database not properly set up') && (
              <div className="mt-2 text-xs text-red-500 text-center">
                <p>The database tables need to be set up in your Supabase project.</p>
                <p>Please check the COMPLETE_DATABASE_SETUP.md file for instructions.</p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleRoleSelection}
          disabled={isSubmitting}
          className="w-full px-6 py-3 font-semibold text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{background: 'linear-gradient(to right, #114B5F, #0d3a4a)'}}
        >
          {isSubmitting ? 'Setting up...' : 'Continue'}
        </button>
        
        <p className="text-xs text-center mt-4" style={{color: '#114B5F', opacity: 0.7}}>
          You can change this later in your account settings
        </p>
      </div>
    </div>
  );
}
