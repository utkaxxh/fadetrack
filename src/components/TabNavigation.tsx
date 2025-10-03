import React from 'react';
import { UserRole } from '../hooks/useUserRole';

// Updated tab types: removed haircut & reminder related tabs, added myreviews
export type TabType = 'myreviews' | 'reviews' | 'directory' | 'dashboard'; 
interface TabNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  userRole?: UserRole;
}

const getTabsForRole = (role: UserRole): { label: string; value: TabType }[] => {
  const commonTabs = [
    { label: 'Browse Reviews', value: 'directory' as TabType },
  ];

  if (role === 'professional') {
    return [
      { label: 'Dashboard', value: 'dashboard' as TabType },
      ...commonTabs,
    ];
  }

  // Customer tabs (focused experience: creating & managing reviews)
  return [
    { label: 'My Reviews', value: 'myreviews' as TabType },
    { label: 'Write Review', value: 'reviews' as TabType },
    ...commonTabs,
  ];
};

export default function TabNavigation({ activeTab, setActiveTab, userRole = 'customer' }: TabNavigationProps) {
  const tabs = getTabsForRole(userRole);

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
