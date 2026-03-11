interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "into" | "danger" | "ghost" | "success";
    size?: "sm" | "md" | "lg" | "full";
    isLoading?: boolean;
}

export default function Button({
    variant = "primary",
    size = "md",
    isLoading,
    children,
    className,
    ...props
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

    const variants = {
        primary: "bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-900/30 hover:brightness-105",
        into: "bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-400 text-white shadow-lg shadow-rose-900/35 hover:brightness-105",
        danger: "border border-rose-300/35 bg-rose-100/10 text-rose-100 hover:bg-rose-500 hover:text-white",
        ghost: "border border-white/15 bg-white/5 text-rose-50 hover:bg-white/10",
        success: "bg-green-400 text-white shadow-md shadow-green-900/20 hover:bg-emerald-400"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-6 py-3 text-sm",
        lg: "px-8 py-4 text-base",
        full: "w-full px-8 py-4 text-base"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ""}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? "Cargando..." : children}
        </button>
    );
}
