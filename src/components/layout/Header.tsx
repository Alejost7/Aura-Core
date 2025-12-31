import LogOutButton from "./LogOutButton";

interface HeaderProps {
    onLogOut: () => void;
}

export default function Header({ onLogOut }: HeaderProps) {
    return (
        <header className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6 ">
            <div>
                <h1 className="text-6xl font-bold bg-gradient-to-r from-rose-500 to-purple-500 bg-clip-text text-transparent">Inventario Live Beauty</h1>
                <p className="text-slate-500 text-sm">Control Total · Alejandro Santander Toro </p>
            </div>
            <div className="flex flex-col items-end gap-6">
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                    <span className="text-xs block text-slate-500 uppercase font-bold">Estado del Sistema</span>
                    <span className="text-emerald-400 font-mono text-sm font-bold">● CONECTADO</span>
                </div>
                <LogOutButton onLogOut={onLogOut} />
            </div>
        </header>
    )
}