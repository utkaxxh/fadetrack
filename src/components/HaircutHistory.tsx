import React, { useState } from 'react';

import type { Haircut } from '../app/page';
import type { User } from '@supabase/supabase-js';

interface HaircutHistoryProps {
  haircuts: Haircut[];
  user: User | null;
  onDelete: (haircutId: number) => Promise<void>;
}

export default function HaircutHistory({ haircuts, user, onDelete }: HaircutHistoryProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Optionally, filter by user_email if needed:
  const filteredHaircuts = user && user.email
    ? haircuts.filter((cut) => cut.user_email === user.email)
    : haircuts;

  const handleDelete = async (haircutId: number) => {
    if (!haircutId) return;
    
    const isConfirmed = window.confirm('Are you sure you want to delete this haircut? This action cannot be undone.');
    if (!isConfirmed) return;

    setDeletingId(haircutId);
    try {
      await onDelete(haircutId);
    } catch (error) {
      console.error('Error deleting haircut:', error);
    } finally {
      setDeletingId(null);
    }
  };

  if (filteredHaircuts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">No haircuts logged yet</div>
        <div className="text-gray-500 text-sm">Start by logging your first haircut!</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-4">
        {filteredHaircuts.map((cut, i) => (
          <div key={cut.id || i} className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-semibold text-gray-900">{cut.barber}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {cut.style}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>📍 {cut.location}</div>
                  <div>📅 {new Date(cut.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</div>
                  {cut.notes && (
                    <div className="mt-2 text-gray-700">
                      <span className="font-medium">Notes:</span> {cut.notes}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <div className="text-2xl font-bold text-green-600">₹{cut.cost}</div>
                {cut.id && (
                  <button
                    onClick={() => handleDelete(cut.id!)}
                    disabled={deletingId === cut.id}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${
                      deletingId === cut.id
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800'
                    }`}
                  >
                    {deletingId === cut.id ? (
                      <div className="flex items-center gap-1">
                        <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </div>
                    ) : (
                      <>🗑️ Delete</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
