import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import TitleBar from './components/layout/TitleBar'; // Importa tu nueva barra

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
                isLoggedIn ? <Navigate to="/home"/> : <Login onLogin={() => setIsLoggedIn(true)} />
              }
            />
            {/* Ruta de Home (Protegida) */}
            <Route 
              path="/home" 
              element={isLoggedIn ? <Home onLogOut={() => setIsLoggedIn(false)} /> : <Navigate to="/" />} 
            />
          </Routes>
        </main>
        
      </div>
    </HashRouter>
  );
}