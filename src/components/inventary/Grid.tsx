import Card from "../ui/Card";

interface GridProps {
    llamarARust: () => void;
    cargarStock: () => void;
    mostrar: boolean;
    setMostrar: (val: boolean) => void;
}

export default function Grid({llamarARust, cargarStock, mostrar, setMostrar} : GridProps) {
    return (
        <main className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <Card 
                onClick={() => { llamarARust(); cargarStock(); setMostrar(!mostrar); }}
                className="cursor-pointer group hover:border-cyan-500/50"
            >
            <h2 className="text-xl font-semibold mb-2 group-hover:text-cyan-400 transition-colors">Ver Stock</h2>
            <p className="text-slate-400">Consulta los productos disponibles en tiempo real.</p>
            </Card>

            <Card 
                className="cursor-pointer group hover:border-cyan-500/50">
            <h2 className="text-xl font-semibold mb-2 group-hover:text-cyan-400 transition-colors">Agregar Item</h2>
            <p className="text-slate-400">Registra nueva mercancia en la base de datos local.</p>
            </Card>

            <Card 
                className="cursor-pointer group hover:border-cyan-500/50">
            <h2 className="text-xl font-semibold mb-2 group-hover:text-cyan-400 transition-colors">Eliminar Item</h2>
            <p className="text-slate-400">Retira mercancia en la base de datos local.</p>
            </Card>

            <Card 
                className="cursor-pointer group hover:border-cyan-500/50">
            <h2 className="text-xl font-semibold mb-2 group-hover:text-cyan-400 transition-colors">Actualizar Item</h2>
            <p className="text-slate-400">Edita mercancia existente de la base de datos local.</p>
            </Card>
        </main>
    )
}