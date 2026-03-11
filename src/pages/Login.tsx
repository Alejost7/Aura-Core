import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { invoke } from "@tauri-apps/api/core";
import type { UserPublic } from "../types/auth";

interface LoginProps {
    onLogin: (user: UserPublic) => void;
}

export default function Login({ onLogin }: LoginProps) {
    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const user = await invoke<UserPublic>("login_usuario", { username: usuario, password });
            onLogin(user);
            navigate("/home");
        } catch {
            alert("Credenciales incorrectas (Prueba admin/admin123)");
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-rose-500/30 p-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(244,63,94,0.18),transparent_35%),radial-gradient(circle_at_85%_80%,rgba(251,191,36,0.2),transparent_40%)]" />
            <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-rose-300/35 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-amber-300/30 blur-3xl" />
            <div className="absolute left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 rounded-full bg-pink-200/30 blur-3xl" />

            <div className="beauty-glass relative w-full max-w-md rounded-3xl p-8">
                <div className="mb-10 text-center">
                    <h1 className="bg-gradient-to-r from-rose-200 via-rose-100 to-amber-200 bg-clip-text text-4xl font-black text-transparent">
                        Live Beauty
                    </h1>
                    <p className="mt-2 font-medium text-rose-100/70">Panel de Administracion</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="mb-2 ml-1 block text-xs font-bold uppercase text-rose-100/70">Usuario</label>
                        <input
                            type="text"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            className="beauty-input w-full rounded-2xl p-4"
                            placeholder="Tu usuario"
                        />
                    </div>

                    <div>
                        <label className="mb-2 ml-1 block text-xs font-bold uppercase text-rose-100/70">Contrasena</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="beauty-input w-full rounded-2xl p-4"
                            placeholder="********"
                        />
                    </div>

                    <Button type="submit" variant="into" size="full" className="hover:scale-[1.02]">
                        Entrar al sistema
                    </Button>
                </form>

                <p className="mt-8 text-center text-xs italic text-rose-100/65">Software de control nativo - v1.0</p>
            </div>
        </div>
    );
}
