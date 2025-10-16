import React, { useState } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Database, Settings as SettingsIcon, Crown, Home } from 'lucide-react';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Settings from './components/Settings';
import Premium from './components/Premium';
import { RunRecord, AppSettings } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';

const App: React.FC = () => {
  const [records, setRecords] = useLocalStorage<RunRecord[]>('ganhospro_records', []);
  const [settings, setSettings] = useLocalStorage<AppSettings>('ganhospro_settings', { costPerKm: 0.75 });

  const addOrUpdateRecord = (record: RunRecord) => {
    const existingIndex = records.findIndex(r => r.id === record.id);
    if (existingIndex > -1) {
      const updatedRecords = [...records];
      updatedRecords[existingIndex] = record;
      setRecords(updatedRecords);
    } else {
      setRecords([...records, record]);
    }
  };

  const deleteRecord = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
  };

  return (
    <HashRouter>
      <div className="flex flex-col h-screen font-sans">
        <main className="flex-grow overflow-y-auto bg-brand-dark p-4 pb-20">
          <Routes>
            <Route path="/" element={<Dashboard settings={settings} addOrUpdateRecord={addOrUpdateRecord} />} />
            {/* FIX: Removed unused 'addOrUpdateRecord' prop from History component to resolve TypeScript error. */}
            <Route path="/history" element={<History records={records} deleteRecord={deleteRecord} settings={settings} />} />
            <Route path="/settings" element={<Settings settings={settings} setSettings={setSettings} />} />
            <Route path="/premium" element={<Premium records={records} />} />
          </Routes>
        </main>
        <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 shadow-lg">
          <nav className="flex justify-around items-center h-16">
            <NavLink to="/" className={({ isActive }) => `flex flex-col items-center justify-center w-full text-xs transition-colors ${isActive ? 'text-brand-primary' : 'text-gray-400 hover:text-brand-primary'}`}>
              <Home size={24} />
              <span>Início</span>
            </NavLink>
            <NavLink to="/history" className={({ isActive }) => `flex flex-col items-center justify-center w-full text-xs transition-colors ${isActive ? 'text-brand-primary' : 'text-gray-400 hover:text-brand-primary'}`}>
              <Database size={24} />
              <span>Histórico</span>
            </NavLink>
             <NavLink to="/premium" className={({ isActive }) => `flex flex-col items-center justify-center w-full text-xs transition-colors ${isActive ? 'text-brand-primary' : 'text-gray-400 hover:text-brand-primary'}`}>
               <div className="relative">
                <Crown size={24} className="text-brand-accent" />
                <span className="absolute -top-2 -right-2 bg-brand-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">PRO</span>
               </div>
              <span>Premium</span>
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `flex flex-col items-center justify-center w-full text-xs transition-colors ${isActive ? 'text-brand-primary' : 'text-gray-400 hover:text-brand-primary'}`}>
              <SettingsIcon size={24} />
              <span>Ajustes</span>
            </NavLink>
          </nav>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;