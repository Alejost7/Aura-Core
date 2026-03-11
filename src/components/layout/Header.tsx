import LogOutButton from "./LogOutButton";

interface HeaderProps {
    onLogOut: () => void;
}

export default function Header({ onLogOut }: HeaderProps) {
    return (
        <header className="beauty-glass rounded-xl p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase text-rose-100/60">Estado</p>
                    <p className="text-sm font-bold text-white-300">OK CONECTADO</p>
                </div>
                <LogOutButton onLogOut={onLogOut} />
            </div>
        </header>
    )
}
