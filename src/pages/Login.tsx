import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

interface LoginProps {
    onLogin: (user: string) => void;
    }

    export default function Login({ onLogin }: LoginProps) {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Aquí podrías validar contra Rust más adelante
        if (usuario === 'admin' && password === '1234') {
        onLogin(usuario);  // Notifica al componente padre
        navigate('/home'); // Redirige a la página de inicio
        } else {
        alert('Credenciales incorrectas (Prueba admin/1234)');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 relative overflow-hidden">
        {/* Círculos decorativos de fondo */}
        <div className="absolute w-64 h-64 bg-rose-500/20 rounded-full blur-3xl -top-10 -left-10"></div>
        <div className="absolute w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -bottom-10 -right-10"></div>

        <div className="relative w-full max-w-md bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl shadow-2xl">
            <div className="text-center mb-10">
            <h1 className="text-4xl font-black bg-gradient-to-r from-rose-400 to-purple-500 bg-clip-text text-transparent">
                Live Beauty
            </h1>
            <p className="text-slate-400 mt-2 font-medium">Panel de Administración</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase ml-1 mb-2">Usuario</label>
                <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white outline-none focus:border-rose-500/50 transition-all"
                placeholder="Tu usuario"
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase ml-1 mb-2">Contraseña</label>
                <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white outline-none focus:border-rose-500/50 transition-all"
                placeholder="••••••••"
                />
            </div>

            <Button
                type="submit"
                variant="into"
                size="full"
                className="transform hover:scale-[1.02]"
            >
                Entrar al Sistema
            </Button>
            </form>

            <p className="text-center text-slate-500 text-xs mt-8 italic">
            Software de Control Nativo · v1.0
            </p>
        </div>
        </div>
    );
}