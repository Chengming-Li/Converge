import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Home from './Pages/Home';
import Rooms from './Pages/Rooms';
import Projects from './Pages/Projects';
import Settings from './Pages/Settings';
import Reports from './Pages/Reports';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path='/rooms' element={<Rooms />} />
        <Route path='/projects' element={<Projects />} />
        <Route path='/settings' element={<Settings />} />
        <Route path='/reports' element={<Reports />} />
        <Route path='*' element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;