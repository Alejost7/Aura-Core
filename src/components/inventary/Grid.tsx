import Card from "../ui/Card";

interface GridProps {
    cargarStock: () => void;
    setMostrar: (val: boolean) => void;
    onAdd: () => void;
    onEntrada: () => void;
    onSalida: () => void;
    onAjuste: () => void;
}

export default function Grid({
    cargarStock,
    setMostrar,
    onAdd,
    onEntrada,
    onSalida,
    onAjuste
}: GridProps) {
    return (
        <main className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <Card 
                onClick={() => { cargarStock(); setMostrar(true); }}
                className="cursor-pointer group hover:border-cyan-500/50"
            >
            <h2 className="text-xl font-semibold mb-2 group-hover:text-cyan-400 transition-colors">Ver Stock</h2>
            <p className="text-slate-400">Consulta los productos disponibles en tiempo real.</p>
            </Card>

            <Card 
                onClick={onAdd}
                className="cursor-pointer group hover:border-cyan-500/50">
            <h2 className="text-xl font-semibold mb-2 group-hover:text-cyan-400 transition-colors">Agregar Item</h2>
            <p className="text-slate-400">Registra nueva mercancia en la base de datos local.</p>
            </Card>

            <Card 
                onClick={onEntrada}
                className="cursor-pointer group hover:border-cyan-500/50">
            <h2 className="text-xl font-semibold mb-2 group-hover:text-cyan-400 transition-colors">Entrada</h2>
            <p className="text-slate-400">Aumenta stock por compra o recepción.</p>
            </Card>

            <Card 
                onClick={onSalida}
                className="cursor-pointer group hover:border-cyan-500/50">
            <h2 className="text-xl font-semibold mb-2 group-hover:text-cyan-400 transition-colors">Salida</h2>
            <p className="text-slate-400">Descuenta stock por venta o ajuste.</p>
            </Card>

            <Card 
                onClick={onAjuste}
                className="cursor-pointer group hover:border-cyan-500/50">
            <h2 className="text-xl font-semibold mb-2 group-hover:text-cyan-400 transition-colors">Ajuste</h2>
            <p className="text-slate-400">Corrige stock físico vs. sistema.</p>
            </Card>
        </main>
    )
}
