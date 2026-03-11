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
    <div className="beauty-glass mt-6 overflow-hidden rounded-xl">
        <table className="w-full text-left">
            <thead className="bg-rose-950/30 text-xs uppercase text-rose-100/75">
            <tr>
                <th className="px-6 py-3">Producto</th>
                <th className="px-6 py-3">Precio venta</th>
                <th className="px-6 py-3">Stock</th>
                {canManage && <th className="px-6 py-3">Acciones</th>}
            </tr>
            </thead>
            <tbody className="divide-y divide-rose-100/10">
            {productos.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-rose-950/25">
                <td className="px-6 py-4 font-medium text-rose-50">{p.nombre}</td>
                <td className="px-6 py-4 text-amber-200">${p.precio_venta.toFixed(2)}</td>
                <td className="px-6 py-4">
                    <span className={`rounded px-2 py-1 text-xs ${p.stock < 10 ? 'bg-red-500/20 text-red-200' : 'bg-emerald-500/20 text-emerald-200'}`}>
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
