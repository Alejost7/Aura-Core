import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";

interface LogOutProps {
    onLogOut: () => void;
}

export default function LogOutButton({onLogOut}: LogOutProps) {
    const navigate = useNavigate();

    const handleLogOut = () => {
        onLogOut(); // Cambiamos el estado de autenticación en el componente padre
        navigate('/');
    };

    return (
        <div>
            <Button variant="danger" size="sm" onClick={handleLogOut} 
                className="transform hover:scale-[1.05] transition-transform flex items-center gap-1 group"
                >
                    {/* Icono de salida simple */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                    </svg>
                    <span className="text-xs font-bold uppercase tracking-wider">Salir</span>
            </Button>
        </div>
    );
}