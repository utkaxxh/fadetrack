import React from 'react';

import type { Haircut } from '../app/page';
import type { User } from '@supabase/supabase-js';

interface HaircutHistoryProps {
  haircuts: Haircut[];
  user: User | null;
}

export default function HaircutHistory({ haircuts, user }: HaircutHistoryProps) {
  // Optionally, filter by user_email if needed:
  const filteredHaircuts = user && user.email
    ? haircuts.filter((cut) => cut.user_email === user.email)
    : haircuts;

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
          <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
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
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">${cut.cost}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
