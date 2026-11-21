import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import DepartmentLoginPage from './components/DepartmentLoginPage';
import FirebaseModal from './components/FirebaseModal';

import ProductionTab from './tabs/ProductionTab';
import ElectricalTab from './tabs/ElectricalTab';
import GodownTab from './tabs/GodownTab';
import SalesTab from './tabs/SalesTab';
import PlantManagerTab from './tabs/PlantManagerTab';

import { 
  initSeedData, 
  getActiveUser, 
  saveActiveUser, 
  getLeaveApplications,
  getDayProductionReport
} from './services/storage';
import { getTodayDateString } from './constants/feedData';
import { isFirebaseConnected } from './services/firebase';

export default function App() {
  // Start at 'home' by default so the user sees the 5 Login Cards!
  const [activeTab, setActiveTab] = useState('home');
  const [selectedDeptForLogin, setSelectedDeptForLogin] = useState(null);
  const [selectedSubRole, setSelectedSubRole] = useState('shift');
  
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('sml_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [activeUser, setActiveUser] = useState(getActiveUser());
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  // Initialize seed data
  useEffect(() => {
    initSeedData();
    checkPendingApprovals();
  }, []);

  const checkPendingApprovals = async () => {
    const leaves = getLeaveApplications();
    const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
    const todayReport = await getDayProductionReport(getTodayDateString());
    const pendingReport = todayReport?.status === 'Pending' ? 1 : 0;
    setPendingApprovalsCount(pendingLeaves + pendingReport);
  };

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sml_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sml_theme', 'light');
    }
  }, [darkMode]);

  // Handle Login into specific Department Dashboard
  const handleLoginToDepartment = (deptId, userData) => {
    setActiveUser(userData);
    saveActiveUser(userData);
    setSelectedDeptForLogin(null);
    setSelectedSubRole('shift');
    setActiveTab(deptId); // Open that specific section dashboard!
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateActiveUser = (updated) => {
    setActiveUser(updated);
    saveActiveUser(updated);
  };

  const handleLogout = () => {
    // Return to 5 Login Cards on Home Page
    setSelectedDeptForLogin(null);
    setSelectedSubRole('shift');
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setSelectedDeptForLogin(null);
    setSelectedSubRole('shift');
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#07131b] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeUser={activeUser}
        onLogout={handleLogout}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        pendingApprovalsCount={pendingApprovalsCount}
        onGoHome={handleGoHome}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* 1. WELCOME & LOGIN FLOW */}
        {activeTab === 'home' && (
          selectedDeptForLogin ? (
            // DEDICATED DEPARTMENT LOGIN PAGE WITH FIREBASE AUTH
            <DepartmentLoginPage
              dept={selectedDeptForLogin}
              initialSubRole={selectedSubRole}
              onLogin={(userData) => handleLoginToDepartment(selectedDeptForLogin.id, userData)}
              onBack={() => setSelectedDeptForLogin(null)}
            />
          ) : (
            // 5 DEPARTMENT CARDS (2 in Row 1, 2 in Row 2, Plant Manager Big)
            <HomePage
              onOpenLogin={(dept, subRole = 'shift') => {
                setSelectedDeptForLogin(dept);
                setSelectedSubRole(subRole);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )
        )}

        {/* 2. SECTION DASHBOARDS (AFTER AUTHENTICATION) */}
        {activeTab === 'production' && (
          <ProductionTab
            activeUser={activeUser}
            onUpdateActiveUser={handleUpdateActiveUser}
          />
        )}
        {activeTab === 'electrical' && (
          <ElectricalTab 
            activeUser={activeUser}
            onUpdateActiveUser={handleUpdateActiveUser}
          />
        )}
        {activeTab === 'godown' && (
          <GodownTab 
            activeUser={activeUser}
            onUpdateActiveUser={handleUpdateActiveUser}
          />
        )}
        {activeTab === 'sales' && (
          <SalesTab 
            activeUser={activeUser}
            onUpdateActiveUser={handleUpdateActiveUser}
          />
        )}
        {activeTab === 'manager' && (
          <PlantManagerTab 
            activeUser={activeUser}
            onUpdateActiveUser={handleUpdateActiveUser}
          />
        )}

      </main>

      {/* Footer with GI Creative Space modal button */}
      <Footer />

      {/* Cloud Firestore Configuration Modal */}
      <FirebaseModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />
    </div>
  );
}
