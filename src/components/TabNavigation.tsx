import React from 'react';

export type TabType = 'log' | 'history' | 'reminders' | 'reviews' | 'directory'; 
interface TabNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const tabs: { label: string; value: TabType }[] = [
  { label: 'Log Haircut', value: 'log' },
  { label: 'History', value: 'history' },
  { label: 'Reminders', value: 'reminders' },
  { label: 'Post Review', value: 'reviews' },
  { label: 'Browse Reviews', value: 'directory' },
];

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  return (
    <div style={{borderBottom: '1px solid rgba(17, 75, 95, 0.2)', backgroundColor: 'rgba(247, 240, 222, 0.3)'}}>
      <nav className="flex space-x-8 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === tab.value
                ? ''
                : ''
            }`}
            style={{
              borderBottomColor: activeTab === tab.value ? '#114B5F' : 'transparent',
              color: activeTab === tab.value ? '#114B5F' : 'rgba(17, 75, 95, 0.6)'
            }}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
