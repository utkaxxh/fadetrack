import React from 'react';

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs = [
  { label: 'Log Haircut', value: 'log' },
  { label: 'History', value: 'history' },
  { label: 'Reminders', value: 'reminders' },
];

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  return (
    <nav className="flex justify-center gap-4 py-4">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`px-4 py-2 rounded-lg transition-all duration-200 font-semibold text-white bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-500 ${activeTab === tab.value ? 'ring-2 ring-purple-400' : ''}`}
          onClick={() => setActiveTab(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
