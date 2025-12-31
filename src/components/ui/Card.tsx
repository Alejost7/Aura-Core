interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'primary' |  'info' | 'danger' | 'success' | 'glass';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card( {
    variant = "primary",
    padding = "md",
    children,
    className,
    ...props
}: CardProps) {
    // Estilos base del Card
    const baseStyles = "rounded-2xl border transition-all duration-300";

    // Variantes de color
    const variants = {
        // Para el inventario normal
        primary: "bg-slate-800/50 border-slate-800 hover:border-slate-700 shadow-xl transform hover:scale-[1.02]",
        // Para alertas de stock bajo
        danger: "bg-rose-500/5 border-rose-500/20 shadow-rose-500/5",
        // Para métricas de éxito (ganancias)
        success: "bg-emerald-500/5 border-emerald-500/20 shadow-emerald-500/5",
        // Para destacar info azul
        info: "bg-blue-500/5 border-blue-500/20 shadow-blue-500/5",
        // Efecto cristal muy moderno
        glass: "bg-white/5 backdrop-blur-xl border-white/10"
    };
    // variantes de padding
    const paddings = {
        none: "p-0",
        sm: "p-3",
        md: "p-5",
        lg: "p-8"
    };

    return (
        <div
            className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`} {...props}
            >
                {children}
            </div>
    )
}