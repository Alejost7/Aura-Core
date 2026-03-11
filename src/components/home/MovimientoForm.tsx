import { useState } from "react";
import type { Producto } from "../../hooks/useProducts";

interface MovimientoFormProps {
    mode: "entrada" | "salida" | "ajuste";
    producto: Producto;
    isLoading: boolean;
    onCancel: () => void;
    onEntrada: (data: { producto_id: number; cantidad: number; costo_unitario: number; motivo?: string | null }) => Promise<void>;
    onSalida: (data: { producto_id: number; cantidad: number; motivo?: string | null }) => Promise<void>;
    onAjuste: (data: { producto_id: number; nueva_cantidad: number; motivo?: string | null }) => Promise<void>;
}

export default function MovimientoForm({
    mode,
    producto,
    isLoading,
    onCancel,
    onEntrada,
    onSalida,
    onAjuste
}: MovimientoFormProps) {
    const [cantidad, setCantidad] = useState(1);
    const [costoUnitario, setCostoUnitario] = useState(producto.precio_costo);
    const [nuevaCantidad, setNuevaCantidad] = useState(producto.stock);
    const [motivo, setMotivo] = useState("");
    const [localError, setLocalError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLocalError("");

        try {
            if (mode === "entrada") {
                await onEntrada({
                    producto_id: producto.id,
                    cantidad,
                    costo_unitario: costoUnitario,
                    motivo
                });
            }
            if (mode === "salida") {
                await onSalida({
                    producto_id: producto.id,
                    cantidad,
                    motivo
                });
            }
            if (mode === "ajuste") {
                await onAjuste({
                    producto_id: producto.id,
                    nueva_cantidad: nuevaCantidad,
                    motivo
                });
            }
            onCancel();
        } catch {
            setLocalError("No se pudo guardar el movimiento. Revisa los datos.");
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-rose-100/70">
                Producto: <span className="font-semibold text-rose-50">{producto.nombre}</span>
            </p>

            {mode === "entrada" && (
                <div>
                    <label className="mb-2 block text-xs font-bold uppercase text-rose-100/70">Costo unitario</label>
                    <input
                        type="number"
                        value={costoUnitario}
                        onChange={(e) => setCostoUnitario(Number(e.target.value))}
                        className="beauty-input w-full rounded-xl p-3"
                    />
                </div>
            )}

            {mode === "ajuste" ? (
                <div>
                    <label className="mb-2 block text-xs font-bold uppercase text-rose-100/70">Nueva cantidad</label>
                    <input
                        type="number"
                        value={nuevaCantidad}
                        onChange={(e) => setNuevaCantidad(Number(e.target.value))}
                        className="beauty-input w-full rounded-xl p-3"
                    />
                </div>
            ) : (
                <div>
                    <label className="mb-2 block text-xs font-bold uppercase text-rose-100/70">Cantidad</label>
                    <input
                        type="number"
                        value={cantidad}
                        onChange={(e) => setCantidad(Number(e.target.value))}
                        className="beauty-input w-full rounded-xl p-3"
                    />
                </div>
            )}

            <div>
                <label className="mb-2 block text-xs font-bold uppercase text-rose-100/70">Motivo</label>
                <input
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    className="beauty-input w-full rounded-xl p-3"
                    placeholder="Ej: reposicion, ajuste por inventario fisico"
                />
            </div>
            {localError && <p className="text-sm text-rose-300">{localError}</p>}

            <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" className="text-rose-100/70 hover:text-rose-50" onClick={onCancel}>
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-400 disabled:opacity-50"
                >
                    Guardar movimiento
                </button>
            </div>
        </form>
    );
}
