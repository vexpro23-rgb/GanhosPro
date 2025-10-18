import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './components/Landing';
import AppLayout from './components/AppLayout';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/app/*" element={<AppLayout />} />
        <Route path="/*" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;