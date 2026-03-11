import Button from "../ui/Button";
import type { Producto, VentaInput } from "../../hooks/useProducts";

interface CartItem {
    id: number;
    nombre: string;
    precio_venta: number;
    qty: number;
}

interface PosViewProps {
    productosFiltrados: Producto[];
    scanCode: string;
    scanFeedback: string;
    cart: CartItem[];
    subtotal: number;
    metodoPago: VentaInput["metodo_pago"];
    notas: string;
    isLoading: boolean;
    onAddToCart: (producto: Producto) => void;
    onRemoveItem: (id: number) => void;
    onUpdateQty: (id: number, delta: number) => void;
    onMetodoPagoChange: (metodo: VentaInput["metodo_pago"]) => void;
    onNotasChange: (value: string) => void;
    onCheckout: () => void;
    onScanCodeChange: (value: string) => void;
    onScanSubmit: () => void;
}

export default function PosView({
    productosFiltrados,
    scanCode,
    scanFeedback,
    cart,
    subtotal,
    metodoPago,
    notas,
    isLoading,
    onAddToCart,
    onRemoveItem,
    onUpdateQty,
    onMetodoPagoChange,
    onNotasChange,
    onCheckout,
    onScanCodeChange,
    onScanSubmit
}: PosViewProps) {
    return (
        <div className="grid grid-cols-12 gap-6">
            <section className="beauty-glass col-span-8 rounded-2xl p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-rose-50">Catalogo</h3>
                    <span className="text-xs text-rose-100/70">{productosFiltrados.length} productos</span>
                </div>

                <div className="mb-4">
                    <label className="mb-2 block text-xs font-bold uppercase text-rose-100/70">
                        Escanear codigo de barras
                    </label>
                    <div className="flex gap-2">
                        <input
                            value={scanCode}
                            onChange={(e) => onScanCodeChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    onScanSubmit();
                                }
                            }}
                            className="beauty-input w-full rounded-xl px-3 py-2 text-sm"
                            placeholder="Escanea o escribe codigo y Enter"
                            autoFocus
                        />
                        <Button size="sm" variant="primary" onClick={onScanSubmit}>
                            Agregar
                        </Button>
                    </div>
                    <p className="mt-1 text-[11px] text-rose-100/65">
                        Con lector USB no necesitas click: escanear + Enter lo agrega automaticamente.
                    </p>
                    {scanFeedback && <p className="mt-2 text-xs text-amber-200">{scanFeedback}</p>}
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {productosFiltrados.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => onAddToCart(p)}
                            disabled={p.stock <= 0}
                            className="rounded-xl border border-rose-100/20 bg-rose-950/20 p-4 text-left transition hover:border-rose-300/60 hover:bg-rose-950/30 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                            <p className="text-sm text-rose-100/70">{p.marca || "Sin marca"}</p>
                            <p className="font-semibold text-rose-50">{p.nombre}</p>
                            <div className="mt-3 flex items-center justify-between">
                                <span className="font-bold text-amber-200">${p.precio_venta.toFixed(2)}</span>
                                <span className="text-xs text-rose-100/65">Stock {p.stock}</span>
                            </div>
                            {p.stock <= 0 && <p className="mt-2 text-[11px] text-rose-200">Sin stock</p>}
                        </button>
                    ))}
                </div>
            </section>

            <section className="beauty-glass col-span-4 rounded-2xl p-6">
                <h3 className="mb-4 text-lg font-bold text-rose-50">Carrito</h3>

                <div className="space-y-3">
                    {cart.length === 0 && <p className="text-sm text-rose-100/65">Agrega productos para empezar.</p>}
                    {cart.map((item) => (
                        <div key={item.id} className="rounded-xl border border-rose-100/20 bg-rose-950/20 p-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-rose-50">{item.nombre}</p>
                                <button className="text-xs text-rose-300" onClick={() => onRemoveItem(item.id)}>
                                    Quitar
                                </button>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs text-rose-100/70">${item.precio_venta.toFixed(2)}</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        className="h-6 w-6 rounded-lg border border-rose-100/30 text-xs"
                                        onClick={() => onUpdateQty(item.id, -1)}
                                    >
                                        -
                                    </button>
                                    <span className="text-xs text-rose-50">{item.qty}</span>
                                    <button
                                        className="h-6 w-6 rounded-lg border border-rose-100/30 text-xs"
                                        onClick={() => onUpdateQty(item.id, 1)}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 border-t border-rose-100/15 pt-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-rose-100/70">Subtotal</span>
                        <span className="font-bold text-amber-200">${subtotal.toFixed(2)}</span>
                    </div>

                    <div className="mt-4">
                        <label className="mb-2 block text-xs font-bold uppercase text-rose-100/70">Metodo de pago</label>
                        <select
                            value={metodoPago}
                            onChange={(e) => onMetodoPagoChange(e.target.value as VentaInput["metodo_pago"])}
                            className="beauty-input w-full rounded-xl px-3 py-2 text-sm"
                        >
                            <option value="efectivo">Efectivo</option>
                            <option value="tarjeta">Tarjeta</option>
                            <option value="transferencia">Transferencia</option>
                        </select>
                    </div>

                    <div className="mt-4">
                        <label className="mb-2 block text-xs font-bold uppercase text-rose-100/70">Notas</label>
                        <input
                            value={notas}
                            onChange={(e) => onNotasChange(e.target.value)}
                            className="beauty-input w-full rounded-xl px-3 py-2 text-sm"
                            placeholder="Ej: Cliente frecuente"
                        />
                    </div>

                    <Button variant="success" size="full" className="mt-4" isLoading={isLoading} onClick={onCheckout}>
                        Cobrar
                    </Button>
                </div>
            </section>
        </div>
    );
}
