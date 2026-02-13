import Button from "../ui/Button";
import type { Producto } from "../../hooks/useProducts";

interface TablaProductosProps {
    productos: Producto[];
    canManage?: boolean;
    onEdit: (producto: Producto) => void;
    onDelete: (producto: Producto) => void;
    onEntrada: (producto: Producto) => void;
    onSalida: (producto: Producto) => void;
    onAjuste: (producto: Producto) => void;
}

export default function TablaProductos({
    productos,
    canManage = true,
    onEdit,
    onDelete,
    onEntrada,
    onSalida,
    onAjuste
}: TablaProductosProps) {
    return (
    <div className="mt-10 bg-slate-800/30 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-slate-700/50 text-slate-400 text-xs uppercase">
            <tr>
                <th className="px-6 py-3">Producto</th>
                <th className="px-6 py-3">Precio venta</th>
                <th className="px-6 py-3">Stock</th>
                {canManage && <th className="px-6 py-3">Acciones</th>}
            </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
            {productos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4 font-medium">{p.nombre}</td>
                <td className="px-6 py-4 text-cyan-400">${p.precio_venta.toFixed(2)}</td>
                <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${p.stock < 10 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {p.stock} unidades
                    </span>
                </td>
                {canManage && (
                    <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="ghost" onClick={() => onEdit(p)}>Editar</Button>
                            <Button size="sm" variant="danger" onClick={() => onDelete(p)}>Baja</Button>
                            <Button size="sm" variant="success" onClick={() => onEntrada(p)}>Entrada</Button>
                            <Button size="sm" variant="ghost" onClick={() => onSalida(p)}>Salida</Button>
                            <Button size="sm" variant="ghost" onClick={() => onAjuste(p)}>Ajuste</Button>
                        </div>
                    </td>
                )}
                </tr>
            ))}
            </tbody>
        </table>
    </div> 
    )
}
