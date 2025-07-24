import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';

interface AccountSettingsProps {
  user: User | null;
}

export default function AccountSettings({ user }: AccountSettingsProps) {
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user || !user.email) {
      alert('You must be logged in to delete your account.');
      return;
    }

    if (confirmationText !== 'DELETE MY ACCOUNT') {
      alert(`Please type "DELETE MY ACCOUNT" exactly to confirm.`);
      return;
    }

    setIsDeleting(true);
    
    try {
      const response = await fetch('/api/deleteAccount', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: user.email,
          confirmation_text: confirmationText,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Your account has been deleted successfully. You will be logged out.');
        // Sign out the user
        await supabase.auth.signOut();
        // Refresh the page to clear any cached data
        window.location.reload();
      } else {
        alert('Failed to delete account: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">Please log in to manage your account</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Account Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-700">Email:</span>
              <span className="ml-2 text-sm text-gray-900">{user.email}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Account Created:</span>
              <span className="ml-2 text-sm text-gray-900">
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
          <p className="text-sm text-red-700 mb-4">
            Once you delete your account, there is no going back. This will permanently delete your account and all your data.
          </p>
          
          {!showDeleteForm ? (
            <button
              onClick={() => setShowDeleteForm(true)}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Delete Account
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="confirmation" className="block text-sm font-medium text-red-900 mb-2">
                  Type &quot;DELETE MY ACCOUNT&quot; to confirm:
                </label>
                <input
                  id="confirmation"
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                  className="block w-full px-3 py-2 border border-red-300 rounded-lg shadow-sm bg-white text-gray-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || confirmationText !== 'DELETE MY ACCOUNT'}
                  className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 ${
                    isDeleting || confirmationText !== 'DELETE MY ACCOUNT'
                      ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {isDeleting ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting Account...
                    </div>
                  ) : (
                    'Confirm Deletion'
                  )}
                </button>
                
                <button
                  onClick={() => {
                    setShowDeleteForm(false);
                    setConfirmationText('');
                  }}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
