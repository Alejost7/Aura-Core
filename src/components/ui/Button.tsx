interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' |  'into' | 'danger' | 'ghost' | 'success';
    size?: 'sm' | 'md' | 'lg' | 'full';
    isLoading?: boolean;    
}

export default function Button({
    variant = 'primary',
    size = 'md',
    isLoading,
    children,
    className,
    ...props
}: ButtonProps) {
    // Defnimos los estilos base
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer";
    // Variantes de color
    const variants = {
        // para botones principales
        primary: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:from-purple-500 hover:to-indigo-200",
        // Para boton de entrar al sistema
        into: "bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 cursor-pointer text-white font-bold rounded-2xl shadow-lg shadow-rose-500/20 transition-all active:scale-95",
        // Para botones de acciones peligrosas
        danger: "bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white",
        // Para botones secundarios
        ghost: "bg-transparent text-slate-400 hover:bg-slate-800",
        // Para acciones de éxito
        success: "bg-emerald-500 text-white hover:bg-emerald-400"
    }
    // Variantes de size
    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-6 py-3 text-sm",
        lg: "px-8 py-4 text-base",
        full: "w-full px-8 py-4 text-base"
    };

    return (
        <button 
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ''}`}
            disabled={isLoading}
            {...props}
            >
                {isLoading ? 'Cargando...' : children}
            </button>
    );
}