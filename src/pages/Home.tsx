import { useEffect, useMemo, useRef, useState } from "react";
import FormularioAgregar from "../components/FormularioAgregar";
import HomeSidebar from "../components/home/HomeSidebar";
import InventoryView from "../components/home/InventoryView";
import MovimientoForm from "../components/home/MovimientoForm";
import PosView from "../components/home/PosView";
import ReportsView from "../components/home/ReportsView";
import UsersView from "../components/home/UsersView";
import Modal from "../components/ui/Modal";
import { useCart } from "../hooks/home/useCart";
import { useReportRange } from "../hooks/home/useReportRange";
import { useUserAdminForm } from "../hooks/home/useUserAdminForm";
import {
    useProducts,
    type Producto,
    type VentaDetalleResponse,
} from "../hooks/useProducts";
import type { UserPublic } from "../types/auth";

type ViewMode = "pos" | "inventario" | "usuarios" | "reportes";
type ModalMode = "none" | "add" | "edit" | "entrada" | "salida" | "ajuste";

export default function Home({ user, onLogOut }: { user: UserPublic; onLogOut: () => void }) {
    const {
        productos,
        isLoading,
        cargarStock,
        cargarMarcas,
        cargarCategorias,
        agregarProducto,
        actualizarProducto,
        eliminarProducto,
        registrarEntrada,
        registrarSalida,
        ajustarStock,
        registrarVenta,
        marcas,
        categorias,
        registrarMarca,
        registrarCategoria,
        usuarios,
        resumenAdmin,
        resumenAdminRango,
        ventasHistorial,
        cargarUsuarios,
        cargarResumenAdmin,
        cargarResumenAdminRango,
        cargarHistorialVentas,
        obtenerDetalleVenta,
        registrarUsuario,
        desactivarUsuario,
        activarUsuario,
        resetPasswordUsuario
    } = useProducts();

    const isAdmin = user.rol === "admin";

    const [view, setView] = useState<ViewMode>("pos");
    const [modal, setModal] = useState<ModalMode>("none");
    const [selected, setSelected] = useState<Producto | null>(null);
    const [pendingDelete, setPendingDelete] = useState<Producto | null>(null);
    const [query, setQuery] = useState("");
    const [categoriaFiltro, setCategoriaFiltro] = useState<number | "all">("all");
    const [scanCode, setScanCode] = useState("");
    const [scanFeedback, setScanFeedback] = useState("");
    const [toastMessage, setToastMessage] = useState("");
    const [ventaDetalleSeleccionada, setVentaDetalleSeleccionada] = useState<VentaDetalleResponse | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const {
        cart,
        subtotal,
        metodoPago,
        notas,
        setMetodoPago,
        setNotas,
        addToCart,
        updateQty,
        removeItem,
        clearCart,
        buildVentaInput
    } = useCart();

    const {
        reportPreset,
        reportDesde,
        reportHasta,
        setReportDesde,
        setReportHasta,
        getTodayRange,
        applyReportPreset,
        applyCustomRange
    } = useReportRange();

    const {
        newUser,
        setNewUser,
        resetPasswordUser,
        resetPasswordValue,
        setResetPasswordValue,
        resetNewUserForm,
        openResetPassword,
        closeResetPassword
    } = useUserAdminForm();

    useEffect(() => {
        const { desde, hasta } = getTodayRange();
        setReportDesde(desde);
        setReportHasta(hasta);

        cargarStock();
        cargarMarcas();
        cargarCategorias();
        if (isAdmin) {
            cargarUsuarios();
            cargarResumenAdmin();
            cargarResumenAdminRango(desde, hasta);
            cargarHistorialVentas(desde, hasta);
        }
    }, []);

    useEffect(() => {
        if (!scanFeedback) return;
        if (feedbackTimeoutRef.current) {
            clearTimeout(feedbackTimeoutRef.current);
        }
        feedbackTimeoutRef.current = setTimeout(() => {
            setScanFeedback("");
        }, 2500);

        return () => {
            if (feedbackTimeoutRef.current) {
                clearTimeout(feedbackTimeoutRef.current);
            }
        };
    }, [scanFeedback]);

    useEffect(() => {
        if (!toastMessage) return;
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }
        toastTimeoutRef.current = setTimeout(() => {
            setToastMessage("");
        }, 2200);

        return () => {
            if (toastTimeoutRef.current) {
                clearTimeout(toastTimeoutRef.current);
            }
        };
    }, [toastMessage]);

    const productosFiltrados = useMemo(() => {
        const q = query.trim().toLowerCase();
        return productos.filter((p) => {
            const matchQuery = !q
                || p.nombre.toLowerCase().includes(q)
                || p.codigo_barras.toLowerCase().includes(q);
            const matchCategoria = categoriaFiltro === "all" || p.id_categoria === categoriaFiltro;
            return matchQuery && matchCategoria;
        });
    }, [productos, query, categoriaFiltro]);

    async function loadAdminRangeData(desde: string, hasta: string) {
        await cargarResumenAdminRango(desde, hasta);
        await cargarHistorialVentas(desde, hasta);
    }

    async function refreshAdminReports() {
        if (!isAdmin) return;
        await cargarResumenAdmin();
        if (reportDesde && reportHasta) {
            await loadAdminRangeData(reportDesde, reportHasta);
        }
    }

    function playScanSuccessBeep() {
        try {
            const audioCtx = audioCtxRef.current ?? new AudioContext();
            audioCtxRef.current = audioCtx;

            if (audioCtx.state === "suspended") {
                void audioCtx.resume();
            }

            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            const now = audioCtx.currentTime;

            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(900, now);
            gainNode.gain.setValueAtTime(0.0001, now);
            gainNode.gain.exponentialRampToValueAtTime(0.8, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.10);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.start(now);
            oscillator.stop(now + 0.1);
        } catch {
            // Si el audio no esta disponible, no interrumpimos el flujo de caja.
        }
    }

    function showToast(message: string) {
        setToastMessage(message);
    }

    function handleAddToCart(producto: Producto) {
        if (producto.stock <= 0) {
            showToast(`"${producto.nombre}" no tiene stock disponible.`);
            return;
        }
        addToCart(producto);
    }

    async function handleCheckout() {
        if (cart.length === 0) {
            showToast("No se puede cobrar: el carrito esta vacio.");
            return;
        }
        const data = buildVentaInput();

        try {
            await registrarVenta(data);
            clearCart();
            await refreshAdminReports();
        } catch {
            // El hook setea el error global.
        }
    }

    function handleScanSubmit() {
        const code = scanCode.trim();
        if (!code) return;

        const producto = productos.find((p) => p.codigo_barras.trim() === code);
        if (!producto) {
            setScanFeedback(`No se encontro el codigo: ${code}`);
            return;
        }

        if (producto.stock <= 0) {
            showToast(`"${producto.nombre}" no tiene stock disponible.`);
            setScanFeedback(`Sin stock: ${producto.nombre}`);
            return;
        }

        handleAddToCart(producto);
        playScanSuccessBeep();
        setScanFeedback(`${producto.nombre} agregado al carrito`);
        setScanCode("");
    }

    async function handleCreateUser(e: React.FormEvent) {
        e.preventDefault();
        try {
            await registrarUsuario(newUser);
            resetNewUserForm();
        } catch {
            // El hook setea el error global.
        }
    }

    async function handleDeactivateUser(userId: number) {
        try {
            await desactivarUsuario(userId);
        } catch {
            // El hook setea el error global.
        }
    }

    async function handleActivateUser(userId: number) {
        try {
            await activarUsuario(userId);
        } catch {
            // El hook setea el error global.
        }
    }

    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault();
        if (!resetPasswordUser) return;
        try {
            await resetPasswordUsuario(resetPasswordUser.id, resetPasswordValue);
            closeResetPassword();
        } catch {
            // El hook setea el error global.
        }
    }

    async function handleApplyCustomRange() {
        try {
            await applyCustomRange(loadAdminRangeData);
        } catch {
            // El hook setea el error global.
        }
    }

    async function handleApplyReportPreset(preset: "hoy" | "semana" | "mes") {
        try {
            await applyReportPreset(preset, loadAdminRangeData);
        } catch {
            // El hook setea el error global.
        }
    }

    async function handleVerDetalleVenta(ventaId: number) {
        try {
            const detalle = await obtenerDetalleVenta(ventaId);
            setVentaDetalleSeleccionada(detalle);
        } catch {
            // El hook setea el error global.
        }
    }

    const title = view === "pos" ? "Punto de venta" : view === "inventario" ? "Inventario" : view === "usuarios" ? "Usuarios" : "Reportes";
    const subtitle = view === "pos"
        ? "Busca productos y genera ventas en segundos."
        : view === "inventario"
            ? "Administra tu catalogo y movimientos de stock."
            : view === "usuarios"
                ? "Gestiona vendedores y credenciales del sistema."
                : "Resumen diario del negocio para control de caja e inventario.";

    return (
        <div className="min-h-screen bg-rose-500/10 text-rose-50 font-sans">
            <div className="flex h-screen">
                <HomeSidebar
                    view={view}
                    isAdmin={isAdmin}
                    onSetView={setView}
                    onOpenNewProduct={() => {
                        setSelected(null);
                        setModal("add");
                    }}
                    onRefreshStock={cargarStock}
                    onRefreshUsers={cargarUsuarios}
                    onRefreshReports={refreshAdminReports}
                    onLogOut={onLogOut}
                />

                <main className="flex-1 overflow-auto p-6">
                    <div className="beauty-glass mb-6 flex items-center justify-between rounded-2xl p-5">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-rose-50">{title}</h2>
                            <p className="text-sm text-rose-100/90">{subtitle}</p>
                        </div>

                        {(view === "pos" || view === "inventario") && (
                            <div className="flex items-center gap-3">
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="beauty-input w-72 rounded-xl px-4 py-2 text-sm"
                                    placeholder="Buscar por nombre o codigo..."
                                />
                                <select
                                    value={categoriaFiltro}
                                    onChange={(e) => setCategoriaFiltro(e.target.value === "all" ? "all" : Number(e.target.value))}
                                    className="beauty-input w-52 rounded-xl px-3 py-2 text-sm"
                                >
                                    <option value="all">Todas las categorias</option>
                                    {categorias.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {view === "pos" && (
                        <PosView
                            productosFiltrados={productosFiltrados}
                            scanCode={scanCode}
                            scanFeedback={scanFeedback}
                            cart={cart}
                            subtotal={subtotal}
                            metodoPago={metodoPago}
                            notas={notas}
                            isLoading={isLoading}
                            onAddToCart={handleAddToCart}
                            onRemoveItem={removeItem}
                            onUpdateQty={updateQty}
                            onMetodoPagoChange={setMetodoPago}
                            onNotasChange={setNotas}
                            onCheckout={handleCheckout}
                            onScanCodeChange={(value) => {
                                setScanCode(value);
                                if (scanFeedback) setScanFeedback("");
                            }}
                            onScanSubmit={handleScanSubmit}
                        />
                    )}

                    {view === "inventario" && (
                        <InventoryView
                            isAdmin={isAdmin}
                            productosFiltrados={productosFiltrados}
                            onNewProduct={() => {
                                setSelected(null);
                                setModal("add");
                            }}
                            onEdit={(p) => {
                                setSelected(p);
                                setModal("edit");
                            }}
                            onDelete={async (p) => {
                                setPendingDelete(p);
                            }}
                            onEntrada={(p) => {
                                setSelected(p);
                                setModal("entrada");
                            }}
                            onSalida={(p) => {
                                setSelected(p);
                                setModal("salida");
                            }}
                            onAjuste={(p) => {
                                setSelected(p);
                                setModal("ajuste");
                            }}
                        />
                    )}

                    {view === "reportes" && (
                        <ReportsView
                            isAdmin={isAdmin}
                            isLoading={isLoading}
                            resumenAdmin={resumenAdmin}
                            resumenAdminRango={resumenAdminRango}
                            reportPreset={reportPreset}
                            reportDesde={reportDesde}
                            reportHasta={reportHasta}
                            ventasHistorial={ventasHistorial}
                            onApplyPreset={handleApplyReportPreset}
                            onDesdeChange={setReportDesde}
                            onHastaChange={setReportHasta}
                            onApplyCustomRange={handleApplyCustomRange}
                            onVerDetalleVenta={handleVerDetalleVenta}
                        />
                    )}

                    {view === "usuarios" && (
                        <UsersView
                            isAdmin={isAdmin}
                            isLoading={isLoading}
                            newUser={newUser}
                            usuarios={usuarios}
                            onUsernameChange={(value) => setNewUser((prev) => ({ ...prev, username: value }))}
                            onRolChange={(rol) => setNewUser((prev) => ({ ...prev, rol }))}
                            onPasswordChange={(value) => setNewUser((prev) => ({ ...prev, password: value }))}
                            onCreateUser={handleCreateUser}
                            onOpenResetPassword={openResetPassword}
                            onDeactivateUser={handleDeactivateUser}
                            onActivateUser={handleActivateUser}
                        />
                    )}
                </main>
            </div>

            <Modal
                title={modal === "edit" ? "Editar producto" : "Nuevo producto"}
                open={isAdmin && (modal === "add" || modal === "edit")}
                onClose={() => setModal("none")}
            >
                <FormularioAgregar
                    mode={modal === "edit" ? "edit" : "add"}
                    initial={selected ?? undefined}
                    marcas={marcas}
                    categorias={categorias}
                    isLoading={isLoading}
                    onCancel={() => setModal("none")}
                    onCreateMarca={registrarMarca}
                    onCreateCategoria={registrarCategoria}
                    onSubmit={async (data) => {
                        try {
                            if (modal === "edit" && selected) {
                                await actualizarProducto(selected.id, {
                                    codigo_barras: data.codigo_barras,
                                    nombre: data.nombre,
                                    id_marca: data.id_marca,
                                    id_categoria: data.id_categoria,
                                    precio_costo: data.precio_costo,
                                    precio_venta: data.precio_venta
                                });
                            } else {
                                await agregarProducto(data);
                            }
                            await refreshAdminReports();
                            setModal("none");
                        } catch {
                            // El hook setea el error global.
                        }
                    }}
                />
            </Modal>

            <Modal
                title={modal === "entrada" ? "Registrar entrada" : modal === "salida" ? "Registrar salida" : "Ajustar stock"}
                open={isAdmin && (modal === "entrada" || modal === "salida" || modal === "ajuste")}
                onClose={() => setModal("none")}
            >
                {selected && (
                    <MovimientoForm
                        mode={modal as "entrada" | "salida" | "ajuste"}
                        producto={selected}
                        isLoading={isLoading}
                        onCancel={() => setModal("none")}
                        onEntrada={async (data) => {
                            await registrarEntrada(data);
                            await refreshAdminReports();
                        }}
                        onSalida={async (data) => {
                            await registrarSalida(data);
                            await refreshAdminReports();
                        }}
                        onAjuste={async (data) => {
                            await ajustarStock(data);
                            await refreshAdminReports();
                        }}
                    />
                )}
            </Modal>

            <Modal
                title={resetPasswordUser ? `Reset password: ${resetPasswordUser.username}` : "Reset password"}
                open={Boolean(resetPasswordUser)}
                onClose={closeResetPassword}
            >
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                        <label className="mb-2 block text-xs font-bold uppercase text-rose-100/70">Nueva password</label>
                        <input
                            type="password"
                            value={resetPasswordValue}
                            onChange={(e) => setResetPasswordValue(e.target.value)}
                            className="beauty-input w-full rounded-xl p-3"
                            placeholder="Minimo 6 caracteres"
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-400 disabled:opacity-50"
                        >
                            Guardar password
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                title={ventaDetalleSeleccionada ? `Detalle venta #${ventaDetalleSeleccionada.venta_id}` : "Detalle venta"}
                open={Boolean(ventaDetalleSeleccionada)}
                onClose={() => setVentaDetalleSeleccionada(null)}
            >
                {ventaDetalleSeleccionada && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <p><span className="text-rose-100/70">Fecha:</span> {ventaDetalleSeleccionada.fecha}</p>
                            <p><span className="text-rose-100/70">Vendedor:</span> {ventaDetalleSeleccionada.vendedor ?? "-"}</p>
                            <p><span className="text-rose-100/70">Metodo:</span> {ventaDetalleSeleccionada.metodo_pago}</p>
                            <p><span className="text-rose-100/70">Total:</span> <span className="font-semibold text-amber-200">${ventaDetalleSeleccionada.total.toFixed(2)}</span></p>
                        </div>

                        <div className="overflow-auto rounded-xl border border-rose-100/20">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-rose-950/30 text-xs uppercase text-rose-100/70">
                                    <tr>
                                        <th className="px-3 py-2">Producto</th>
                                        <th className="px-3 py-2">Cant.</th>
                                        <th className="px-3 py-2">P. Unitario</th>
                                        <th className="px-3 py-2">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-rose-100/10">
                                    {ventaDetalleSeleccionada.items.map((item) => (
                                        <tr key={`${ventaDetalleSeleccionada.venta_id}-${item.producto_id}`} className="hover:bg-rose-950/20">
                                            <td className="px-3 py-2">{item.nombre}</td>
                                            <td className="px-3 py-2">{item.cantidad}</td>
                                            <td className="px-3 py-2">${item.precio_unitario.toFixed(2)}</td>
                                            <td className="px-3 py-2 text-amber-200">${item.subtotal.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {ventaDetalleSeleccionada.notas && (
                            <p className="text-sm text-rose-100/80">
                                <span className="text-rose-100/70">Notas:</span> {ventaDetalleSeleccionada.notas}
                            </p>
                        )}
                    </div>
                )}
            </Modal>

            <Modal
                title="Confirmar baja de producto"
                open={Boolean(pendingDelete)}
                onClose={() => setPendingDelete(null)}
            >
                {pendingDelete && (
                    <div className="space-y-4">
                        <p className="text-sm text-rose-100/80">
                            Vas a dar de baja el producto <span className="font-semibold text-rose-50">{pendingDelete.nombre}</span>.
                            Esta accion no se puede deshacer.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setPendingDelete(null)}
                                className="rounded-xl border border-rose-100/25 px-4 py-2 text-sm text-rose-100 hover:bg-white/10"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={async () => {
                                    try {
                                        await eliminarProducto(pendingDelete.id);
                                        await refreshAdminReports();
                                        setPendingDelete(null);
                                    } catch {
                                        // El hook setea el error global.
                                    }
                                }}
                                className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-bold text-white hover:bg-rose-400 disabled:opacity-50"
                            >
                                Confirmar baja
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {toastMessage && (
                <div className="pointer-events-none fixed bottom-5 right-5 z-50 rounded-lg border border-rose-200/40 bg-rose-950/90 px-3 py-2 text-xs font-medium text-rose-50 shadow-lg">
                    {toastMessage}
                </div>
            )}
        </div>
    );
}
