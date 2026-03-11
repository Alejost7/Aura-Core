import Button from "../ui/Button";
import type { ResumenAdmin, ResumenAdminRango, VentaHistorialItem } from "../../hooks/useProducts";

type ReportPreset = "hoy" | "semana" | "mes" | "custom";

interface ReportsViewProps {
    isAdmin: boolean;
    isLoading: boolean;
    resumenAdmin: ResumenAdmin | null;
    resumenAdminRango: ResumenAdminRango | null;
    reportPreset: ReportPreset;
    reportDesde: string;
    reportHasta: string;
    ventasHistorial: VentaHistorialItem[];
    onApplyPreset: (preset: "hoy" | "semana" | "mes") => Promise<void>;
    onDesdeChange: (value: string) => void;
    onHastaChange: (value: string) => void;
    onApplyCustomRange: () => Promise<void>;
    onVerDetalleVenta: (ventaId: number) => Promise<void>;
}

export default function ReportsView({
    isAdmin,
    isLoading,
    resumenAdmin,
    resumenAdminRango,
    reportPreset,
    reportDesde,
    reportHasta,
    ventasHistorial,
    onApplyPreset,
    onDesdeChange,
    onHastaChange,
    onApplyCustomRange,
    onVerDetalleVenta
}: ReportsViewProps) {
    return (
        <section className="beauty-glass rounded-2xl p-6">
            {!isAdmin ? (
                <p className="text-sm text-rose-100/70">No tienes permisos para ver reportes.</p>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <MetricCard title="Ventas hoy" value={`${resumenAdmin?.ventas_hoy_cantidad ?? 0}`} />
                        <MetricCard title="Ingreso hoy" value={`$${(resumenAdmin?.ventas_hoy_total ?? 0).toFixed(2)}`} accent="text-emerald-200" />
                        <MetricCard title="Valor inventario" value={`$${(resumenAdmin?.valor_inventario ?? 0).toFixed(2)}`} accent="text-amber-200" />
                        <MetricCard title="Stock bajo (< 10)" value={`${resumenAdmin?.productos_stock_bajo ?? 0}`} accent="text-rose-200" />
                    </div>

                    <div className="rounded-xl border border-rose-100/15 bg-rose-950/20 p-4">
                        <p className="mb-3 text-xs uppercase text-rose-100/65">Rango de analisis</p>
                        <div className="mb-3 flex flex-wrap gap-2">
                            <Button size="sm" variant={reportPreset === "hoy" ? "primary" : "ghost"} onClick={() => onApplyPreset("hoy")}>Hoy</Button>
                            <Button size="sm" variant={reportPreset === "semana" ? "primary" : "ghost"} onClick={() => onApplyPreset("semana")}>Semana</Button>
                            <Button size="sm" variant={reportPreset === "mes" ? "primary" : "ghost"} onClick={() => onApplyPreset("mes")}>Mes</Button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                            <input
                                type="date"
                                value={reportDesde}
                                onChange={(e) => onDesdeChange(e.target.value)}
                                className="beauty-input rounded-xl px-3 py-2 text-sm"
                            />
                            <input
                                type="date"
                                value={reportHasta}
                                onChange={(e) => onHastaChange(e.target.value)}
                                className="beauty-input rounded-xl px-3 py-2 text-sm"
                            />
                            <Button variant="success" onClick={onApplyCustomRange} isLoading={isLoading}>Aplicar rango</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <MetricCard title="Ventas en rango" value={`${resumenAdminRango?.ventas_cantidad ?? 0}`} />
                        <MetricCard title="Ingreso en rango" value={`$${(resumenAdminRango?.ventas_total ?? 0).toFixed(2)}`} accent="text-emerald-200" />
                    </div>

                    <div className="rounded-xl border border-rose-100/15 bg-rose-950/20 p-4">
                        <p className="mb-3 text-xs uppercase text-rose-100/65">Productos mas vendidos</p>
                        <div className="overflow-auto rounded-xl border border-rose-100/15">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-rose-950/30 text-xs uppercase text-rose-100/70">
                                    <tr>
                                        <th className="px-4 py-3">Producto</th>
                                        <th className="px-4 py-3">Unidades</th>
                                        <th className="px-4 py-3">Total vendido</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-rose-100/10">
                                    {(resumenAdminRango?.productos_mas_vendidos ?? []).map((item) => (
                                        <tr key={item.producto_id} className="hover:bg-rose-950/20">
                                            <td className="px-4 py-3 text-rose-50">{item.nombre}</td>
                                            <td className="px-4 py-3">{item.unidades}</td>
                                            <td className="px-4 py-3 text-amber-200">${item.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {(resumenAdminRango?.productos_mas_vendidos ?? []).length === 0 && (
                                        <tr>
                                            <td className="px-4 py-3 text-rose-100/65" colSpan={3}>
                                                Sin ventas en el rango seleccionado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-xl border border-rose-100/15 bg-rose-950/20 p-4">
                        <p className="mb-3 text-xs uppercase text-rose-100/65">Historial de ventas</p>
                        <div className="overflow-auto rounded-xl border border-rose-100/15">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-rose-950/30 text-xs uppercase text-rose-100/70">
                                    <tr>
                                        <th className="px-4 py-3">ID</th>
                                        <th className="px-4 py-3">Fecha</th>
                                        <th className="px-4 py-3">Vendedor</th>
                                        <th className="px-4 py-3">Metodo</th>
                                        <th className="px-4 py-3">Total</th>
                                        <th className="px-4 py-3">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-rose-100/10">
                                    {ventasHistorial.map((venta) => (
                                        <tr key={venta.id} className="hover:bg-rose-950/20">
                                            <td className="px-4 py-3 text-rose-50">#{venta.id}</td>
                                            <td className="px-4 py-3">{venta.fecha}</td>
                                            <td className="px-4 py-3">{venta.vendedor ?? "-"}</td>
                                            <td className="px-4 py-3 capitalize">{venta.metodo_pago}</td>
                                            <td className="px-4 py-3 text-amber-200">${venta.total.toFixed(2)}</td>
                                            <td className="px-4 py-3">
                                                <Button size="sm" variant="ghost" onClick={async () => onVerDetalleVenta(venta.id)}>
                                                    Ver detalle
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {ventasHistorial.length === 0 && (
                                        <tr>
                                            <td className="px-4 py-3 text-rose-100/65" colSpan={6}>
                                                No hay ventas en el rango seleccionado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

function MetricCard({ title, value, accent = "text-rose-50" }: { title: string; value: string; accent?: string }) {
    return (
        <div className="rounded-xl border border-rose-100/15 bg-rose-950/20 p-4">
            <p className="text-xs uppercase text-rose-100/65">{title}</p>
            <p className={`mt-2 text-3xl font-bold ${accent}`}>{value}</p>
        </div>
    );
}
