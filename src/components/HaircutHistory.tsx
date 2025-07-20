import React from 'react';

interface HaircutHistoryProps {
  haircuts: any[];
}

export default function HaircutHistory({ haircuts }: HaircutHistoryProps) {
  return (
    <div className="max-w-2xl mx-auto mt-6 animate-fade-in">
      <h2 className="text-xl font-bold mb-4 text-white">Haircut History</h2>
      <ul className="space-y-4">
        {haircuts.map((cut, i) => (
          <li key={i} className="p-4 rounded-lg bg-gradient-to-r from-gray-800 to-gray-700 shadow hover:shadow-lg transition-all duration-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <span className="font-semibold text-purple-300">{cut.date}</span>
              <span className="text-white">{cut.barber} ({cut.location})</span>
              <span className="text-indigo-300">{cut.style}</span>
              <span className="text-green-400 font-bold">${cut.cost}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
