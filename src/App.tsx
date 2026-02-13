import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import TitleBar from './components/layout/TitleBar'; // Importa tu nueva barra
import type { UserPublic } from './types/auth';

export default function App() {
  const [user, setUser] = useState<UserPublic | null>(null);
  const isLoggedIn = Boolean(user);

  return (
    <HashRouter>
      <div className="flex flex-col w-screen h-screen overflow-hidden bg-[#0f172a]  border border-slate-800">
        
        <TitleBar />

        {/* Contenedor del contenido que cambia según el estado */}
        <main className="flex-1 overflow-auto custom-scrollbar"> 
          <Routes> 
            {/* Ruta de Login */}
            <Route 
              path="/"
              element={
                isLoggedIn ? <Navigate to="/home"/> : <Login onLogin={(u) => setUser(u)} />
              }
            />
            {/* Ruta de Home (Protegida) */}
            <Route 
              path="/home" 
              element={isLoggedIn && user ? <Home user={user} onLogOut={() => setUser(null)} /> : <Navigate to="/" />} 
            />
          </Routes>
        </main>
        
      </div>
    </HashRouter>
  );
}
