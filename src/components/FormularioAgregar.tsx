import { useState } from "react";
import Button from "./ui/Button";
import type { Marca, NuevoProducto, Producto } from "../hooks/useProducts";

interface FormularioAgregarProps {
    mode: "add" | "edit";
    initial?: Producto;
    marcas: Marca[];
    onSubmit: (data: NuevoProducto) => Promise<void>;
    onCreateMarca: (nombre: string) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function FormularioAgregar({
    mode,
    initial,
    marcas,
    onSubmit,
    onCreateMarca,
    onCancel,
    isLoading
}: FormularioAgregarProps) {
    const [codigo_barras, setCodigoBarras] = useState(initial?.codigo_barras ?? "");
    const [nombre, setNombre] = useState(initial?.nombre ?? "");
    const [precio_costo, setPrecioCosto] = useState(initial?.precio_costo ?? 0);
    const [precio_venta, setPrecioVenta] = useState(initial?.precio_venta ?? 0);
    const [stock_inicial, setStockInicial] = useState(0);
    const [id_marca, setIdMarca] = useState<number | "">(initial?.id_marca ?? "");
    const [nuevaMarca, setNuevaMarca] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // Tauri recibe un objeto plano que mapea directo al struct en Rust.
        await onSubmit({
            codigo_barras,
            nombre,
            id_marca: id_marca === "" ? null : id_marca,
            precio_costo,
            precio_venta,
            stock_inicial
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Código de barras</label>
                <input
                    value={codigo_barras}
                    onChange={(e) => setCodigoBarras(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-white"
                    placeholder="7891234567890"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nombre</label>
                <input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-white"
                    placeholder="Labial mate"
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Marca</label>
                <div className="flex gap-2">
                    <select
                        value={id_marca}
                        onChange={(e) => setIdMarca(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-white"
                    >
                        <option value="">Sin marca</option>
                        {marcas.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.nombre}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mt-2 flex gap-2">
                    <input
                        value={nuevaMarca}
                        onChange={(e) => setNuevaMarca(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-white"
                        placeholder="Nueva marca (opcional)"
                    />
                    <button
                        type="button"
                        className="rounded-xl border border-slate-700 px-3 text-xs text-slate-300 hover:bg-slate-800"
                        onClick={async () => {
                            if (!nuevaMarca.trim()) return;
                            await onCreateMarca(nuevaMarca.trim());
                            setNuevaMarca("");
                        }}
                    >
                        Agregar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Precio costo</label>
                    <input
                        type="number"
                        value={precio_costo}
                        onChange={(e) => setPrecioCosto(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-white"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Precio venta</label>
                    <input
                        type="number"
                        value={precio_venta}
                        onChange={(e) => setPrecioVenta(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-white"
                    />
                </div>
            </div>

            {mode === "add" && (
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Stock inicial</label>
                    <input
                        type="number"
                        value={stock_inicial}
                        onChange={(e) => setStockInicial(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-white"
                    />
                </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="ghost" type="button" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit" isLoading={isLoading} variant="success">
                    {mode === "add" ? "Guardar producto" : "Actualizar producto"}
                </Button>
            </div>
        </form>
    );
}
