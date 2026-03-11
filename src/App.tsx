import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import TitleBar from "./components/layout/TitleBar";
import type { UserPublic } from "./types/auth";

export default function App() {
    const [user, setUser] = useState<UserPublic | null>(null);
    const isLoggedIn = Boolean(user);

    return (
        <HashRouter>
            <div className="flex h-screen w-screen flex-col overflow-hidden">
                <TitleBar />

                <main className="custom-scrollbar flex-1 overflow-auto">
                    <Routes>
                        <Route
                            path="/"
                            element={isLoggedIn ? <Navigate to="/home" /> : <Login onLogin={(u) => setUser(u)} />}
                        />
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
