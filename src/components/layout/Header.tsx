import LogOutButton from "./LogOutButton";

interface HeaderProps {
    onLogOut: () => void;
}

export default function Header({ onLogOut }: HeaderProps) {
    return (
        <header className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            {/* Header compacto para el sidebar */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase text-slate-500">Estado</p>
                    <p className="text-sm font-bold text-emerald-400">OK CONECTADO</p>
                </div>
                <LogOutButton onLogOut={onLogOut} />
            </div>
        </header>
    )
}
