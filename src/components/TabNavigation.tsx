import React from 'react';

export type TabType = 'log' | 'history' | 'reminders'; 
interface TabNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const tabs: { label: string; value: TabType }[] = [
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
          className={`px-4 py-2 rounded-lg transition-all duration-200 font-semibold text-white bg-gradient-to-r from-teal-900 to-teal-700 hover:from-teal-800 hover:to-teal-600 ${activeTab === tab.value ? 'ring-2 ring-teal-400' : ''}`}
          onClick={() => setActiveTab(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
