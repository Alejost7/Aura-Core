import { useEffect, useState } from "react";
import Button from "./ui/Button";
import type { Categoria, Marca, NuevoProducto, Producto } from "../hooks/useProducts";

interface FormularioAgregarProps {
    mode: "add" | "edit";
    initial?: Producto;
    marcas: Marca[];
    categorias: Categoria[];
    onSubmit: (data: NuevoProducto) => Promise<void>;
    onCreateMarca: (nombre: string) => Promise<void>;
    onCreateCategoria: (nombre: string) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function FormularioAgregar({
    mode,
    initial,
    marcas,
    categorias,
    onSubmit,
    onCreateMarca,
    onCreateCategoria,
    onCancel,
    isLoading
}: FormularioAgregarProps) {
    const [codigo_barras, setCodigoBarras] = useState("");
    const [nombre, setNombre] = useState("");
    const [precio_costo, setPrecioCosto] = useState(0);
    const [precio_venta, setPrecioVenta] = useState(0);
    const [stock_inicial, setStockInicial] = useState(0);
    const [id_marca, setIdMarca] = useState<number | "">("");
    const [id_categoria, setIdCategoria] = useState<number | "">("");
    const [nuevaMarca, setNuevaMarca] = useState("");
    const [nuevaCategoria, setNuevaCategoria] = useState("");

    useEffect(() => {
        if (mode === "edit" && initial) {
            setCodigoBarras(initial.codigo_barras ?? "");
            setNombre(initial.nombre ?? "");
            setPrecioCosto(initial.precio_costo ?? 0);
            setPrecioVenta(initial.precio_venta ?? 0);
            setStockInicial(0);
            setIdMarca(initial.id_marca ?? "");
            setIdCategoria(initial.id_categoria ?? "");
            return;
        }

        setCodigoBarras("");
        setNombre("");
        setPrecioCosto(0);
        setPrecioVenta(0);
        setStockInicial(0);
        setIdMarca("");
        setIdCategoria("");
    }, [mode, initial]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        await onSubmit({
            codigo_barras,
            nombre,
            id_marca: id_marca === "" ? null : id_marca,
            id_categoria: id_categoria === "" ? null : id_categoria,
            precio_costo,
            precio_venta,
            stock_inicial
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="mb-2 block text-xs font-bold uppercase text-rose-100/70">Codigo de barras</label>
                <input
                    value={codigo_barras}
                    onChange={(e) => setCodigoBarras(e.target.value)}
                    className="beauty-input w-full rounded-xl p-3"
                    placeholder="7891234567890"
                />
            </div>
            <div>
                <label className="mb-2 block text-xs font-bold uppercase text-rose-100/70">Nombre</label>
                <input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="beauty-input w-full rounded-xl p-3"
                    placeholder="Labial mate"
                />
            </div>

            <div>
                <label className="mb-2 block text-xs font-bold uppercase text-rose-100/70">Marca</label>
                <div className="flex gap-2">
                    <select
                        value={id_marca}
                        onChange={(e) => setIdMarca(e.target.value === "" ? "" : Number(e.target.value))}
                        className="beauty-input w-full rounded-xl p-3"
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
                        className="beauty-input w-full rounded-xl p-3"
                        placeholder="Nueva marca (opcional)"
                    />
                    <button
                        type="button"
                        className="rounded-xl border border-rose-100/20 px-3 text-xs text-rose-50 hover:bg-white/10"
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

            <div>
                <label className="mb-2 block text-xs font-bold uppercase text-rose-100/70">Categoria</label>
                <div className="flex gap-2">
                    <select
                        value={id_categoria}
                        onChange={(e) => setIdCategoria(e.target.value === "" ? "" : Number(e.target.value))}
                        className="beauty-input w-full rounded-xl p-3"
                    >
                        <option value="">Sin categoria</option>
                        {categorias.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.nombre}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mt-2 flex gap-2">
                    <input
                        value={nuevaCategoria}
                        onChange={(e) => setNuevaCategoria(e.target.value)}
                        className="beauty-input w-full rounded-xl p-3"
                        placeholder="Nueva categoria (opcional)"
                    />
                    <button
                        type="button"
                        className="rounded-xl border border-rose-100/20 px-3 text-xs text-rose-50 hover:bg-white/10"
                        onClick={async () => {
                            if (!nuevaCategoria.trim()) return;
                            await onCreateCategoria(nuevaCategoria.trim());
                            setNuevaCategoria("");
                        }}
                    >
                        Agregar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-xs font-bold uppercase text-rose-100/70">Precio costo</label>
                    <input
                        type="number"
                        value={precio_costo}
                        onChange={(e) => setPrecioCosto(Number(e.target.value))}
                        className="beauty-input w-full rounded-xl p-3"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-xs font-bold uppercase text-rose-100/70">Precio venta</label>
                    <input
                        type="number"
                        value={precio_venta}
                        onChange={(e) => setPrecioVenta(Number(e.target.value))}
                        className="beauty-input w-full rounded-xl p-3"
                    />
                </div>
            </div>

            {mode === "add" && (
                <div>
                    <label className="mb-2 block text-xs font-bold uppercase text-rose-100/70">Stock inicial</label>
                    <input
                        type="number"
                        value={stock_inicial}
                        onChange={(e) => setStockInicial(Number(e.target.value))}
                        className="beauty-input w-full rounded-xl p-3"
                    />
                </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="ghost" type="button" onClick={onCancel}>Cancelar</Button>
                <Button type="submit" isLoading={isLoading} variant="success">
                    {mode === "add" ? "Guardar producto" : "Actualizar producto"}
                </Button>
            </div>
        </form>
    );
}
