import { useEffect, useMemo, useState } from "react";
import Header from "../components/layout/Header";
import TablaProductos from "../components/inventary/TablaProductos";
import Modal from "../components/ui/Modal";
import FormularioAgregar from "../components/FormularioAgregar";
import Button from "../components/ui/Button";
import {
    useProducts,
    type NuevoUsuarioInput,
    type Producto,
    type Usuario,
    type VentaInput
} from "../hooks/useProducts";
import type { UserPublic } from "../types/auth";

type ViewMode = "pos" | "inventario" | "usuarios" | "reportes";
type ModalMode = "none" | "add" | "edit" | "entrada" | "salida" | "ajuste";
type ReportPreset = "hoy" | "semana" | "mes" | "custom";

interface CartItem {
    id: number;
    nombre: string;
    precio_venta: number;
    qty: number;
}

export default function Home({ user, onLogOut }: { user: UserPublic; onLogOut: () => void }) {
    const {
        productos,
        log,
        error,
        isLoading,
        cargarStock,
        cargarMarcas,
        agregarProducto,
        actualizarProducto,
        eliminarProducto,
        registrarEntrada,
        registrarSalida,
        ajustarStock,
        registrarVenta,
        marcas,
        registrarMarca,
        usuarios,
        resumenAdmin,
        resumenAdminRango,
        cargarUsuarios,
        cargarResumenAdmin,
        cargarResumenAdminRango,
        registrarUsuario,
        desactivarUsuario,
        resetPasswordUsuario
    } = useProducts();

    const isAdmin = user.rol === "admin";

    const [view, setView] = useState<ViewMode>("pos");
    const [modal, setModal] = useState<ModalMode>("none");
    const [selected, setSelected] = useState<Producto | null>(null);
    const [query, setQuery] = useState("");

    const [cart, setCart] = useState<CartItem[]>([]);
    const [metodoPago, setMetodoPago] = useState<VentaInput["metodo_pago"]>("efectivo");
    const [notas, setNotas] = useState("");
    const [newUser, setNewUser] = useState<NuevoUsuarioInput>({
        username: "",
        rol: "vendedor",
        password: "",
    });
    const [resetPasswordUser, setResetPasswordUser] = useState<Usuario | null>(null);
    const [resetPasswordValue, setResetPasswordValue] = useState("");
    const [reportPreset, setReportPreset] = useState<ReportPreset>("hoy");
    const [reportDesde, setReportDesde] = useState("");
    const [reportHasta, setReportHasta] = useState("");

    // Carga inicial de productos al entrar.
    useEffect(() => {
        const today = formatDateInput(new Date());
        setReportDesde(today);
        setReportHasta(today);

        cargarStock();
        cargarMarcas();
        if (isAdmin) {
            cargarUsuarios();
            cargarResumenAdmin();
            cargarResumenAdminRango(today, today);
        }
    }, []);

    const productosFiltrados = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return productos;
        return productos.filter((p) =>
            p.nombre.toLowerCase().includes(q) || p.codigo_barras.toLowerCase().includes(q)
        );
    }, [productos, query]);

    const subtotal = useMemo(
        () => cart.reduce((acc, item) => acc + item.precio_venta * item.qty, 0),
        [cart]
    );

    function addToCart(p: Producto) {
        setCart((prev) => {
            const found = prev.find((i) => i.id === p.id);
            if (found) {
                return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
            }
            return [...prev, { id: p.id, nombre: p.nombre, precio_venta: p.precio_venta, qty: 1 }];
        });
    }

    function updateQty(id: number, delta: number) {
        setCart((prev) =>
            prev
                .map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
                .filter((i) => i.qty > 0)
        );
    }

    function removeItem(id: number) {
        setCart((prev) => prev.filter((i) => i.id !== id));
    }

    async function handleCheckout() {
        if (cart.length === 0) return;

        const data: VentaInput = {
            total: subtotal,
            metodo_pago: metodoPago,
            notas: notas || null,
            detalles: cart.map((i) => ({
                producto_id: i.id,
                cantidad: i.qty,
                precio_unitario: i.precio_venta
            }))
        };

        try {
            await registrarVenta(data);
            setCart([]);
            setNotas("");
        } catch {
            // El hook ya setea el error global; mantenemos carrito para corregir.
        }
    }

    async function handleCreateUser(e: React.FormEvent) {
        e.preventDefault();
        try {
            await registrarUsuario(newUser);
            setNewUser({ username: "", rol: "vendedor", password: "" });
        } catch {
            // El hook ya setea error global.
        }
    }

    async function handleDeactivateUser(userId: number) {
        try {
            await desactivarUsuario(userId);
        } catch {
            // El hook ya setea error global.
        }
    }

    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault();
        if (!resetPasswordUser) return;
        try {
            await resetPasswordUsuario(resetPasswordUser.id, resetPasswordValue);
            setResetPasswordUser(null);
            setResetPasswordValue("");
        } catch {
            // El hook ya setea error global.
        }
    }

    function formatDateInput(d: Date): string {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function getPresetDates(preset: Exclude<ReportPreset, "custom">): { desde: string; hasta: string } {
        const today = new Date();
        const hasta = formatDateInput(today);
        if (preset === "hoy") {
            return { desde: hasta, hasta };
        }
        if (preset === "semana") {
            const desdeDate = new Date(today);
            desdeDate.setDate(today.getDate() - 6);
            return { desde: formatDateInput(desdeDate), hasta };
        }
        const desdeDate = new Date(today.getFullYear(), today.getMonth(), 1);
        return { desde: formatDateInput(desdeDate), hasta };
    }

    async function applyReportPreset(preset: Exclude<ReportPreset, "custom">) {
        const { desde, hasta } = getPresetDates(preset);
        setReportPreset(preset);
        setReportDesde(desde);
        setReportHasta(hasta);
        try {
            await cargarResumenAdminRango(desde, hasta);
        } catch {
            // El hook ya setea error global.
        }
    }

    async function handleApplyCustomRange() {
        if (!reportDesde || !reportHasta) return;
        setReportPreset("custom");
        try {
            await cargarResumenAdminRango(reportDesde, reportHasta);
        } catch {
            // El hook ya setea error global.
        }
    }

    return (
        <div className="min-h-screen bg-[#0b0f14] text-slate-200 font-sans">
            <div className="flex h-screen">
                {/* Sidebar de acciones */}
                <aside className="w-72 border-r border-slate-800 bg-[#0f141b] p-6">
                    <div className="mb-8">
                        <h1 className="text-2xl font-black tracking-tight text-rose-300">Live Beauty</h1>
                        <p className="text-xs text-slate-500">POS + Inventario</p>
                    </div>

                    <div className="space-y-2">
                        <Button variant={view === "pos" ? "primary" : "ghost"} size="full" onClick={() => setView("pos")}>
                            Punto de venta
                        </Button>
                        <Button variant={view === "inventario" ? "primary" : "ghost"} size="full" onClick={() => setView("inventario")}>
                            Inventario
                        </Button>
                        {isAdmin && (
                            <Button variant={view === "usuarios" ? "primary" : "ghost"} size="full" onClick={() => setView("usuarios")}>
                                Usuarios
                            </Button>
                        )}
                        {isAdmin && (
                            <Button variant={view === "reportes" ? "primary" : "ghost"} size="full" onClick={() => setView("reportes")}>
                                Reportes
                            </Button>
                        )}
                    </div>

                    <div className="mt-8">
                        <p className="text-xs font-bold uppercase text-slate-500 mb-3">Acciones rapidas</p>
                        <div className="space-y-2">
                            {isAdmin && (
                                <Button variant="success" size="full" onClick={() => setModal("add")}>
                                    Nuevo producto
                                </Button>
                            )}
                            <Button variant="ghost" size="full" onClick={cargarStock}>
                                Refrescar stock
                            </Button>
                            {isAdmin && (
                                <Button variant="ghost" size="full" onClick={cargarUsuarios}>
                                    Refrescar usuarios
                                </Button>
                            )}
                            {isAdmin && (
                                <Button
                                    variant="ghost"
                                    size="full"
                                    onClick={async () => {
                                        try {
                                            await cargarResumenAdmin();
                                            if (reportDesde && reportHasta) {
                                                await cargarResumenAdminRango(reportDesde, reportHasta);
                                            }
                                        } catch {
                                            // El hook ya setea error global.
                                        }
                                    }}
                                >
                                    Refrescar reportes
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-400">
                        <p className="font-bold text-slate-300 mb-1">Estado</p>
                        <p>{isLoading ? "Sincronizando..." : "Listo"}</p>
                        {log && <p className="text-cyan-400 mt-2">{log}</p>}
                        {error && <p className="text-rose-400 mt-2">{error}</p>}
                    </div>

                    <div className="mt-8">
                        <Header onLogOut={onLogOut} />
                    </div>
                </aside>

                {/* Contenido principal */}
                <main className="flex-1 p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">
                                {view === "pos"
                                    ? "Punto de venta"
                                    : view === "inventario"
                                        ? "Inventario"
                                        : view === "usuarios"
                                            ? "Usuarios"
                                            : "Reportes"}
                            </h2>
                            <p className="text-sm text-slate-500">
                                {view === "pos"
                                    ? "Busca productos y genera ventas en segundos."
                                    : view === "inventario"
                                        ? "Administra tu catalogo y movimientos de stock."
                                        : view === "usuarios"
                                            ? "Gestiona vendedores y credenciales del sistema."
                                            : "Resumen diario del negocio para control de caja e inventario."}
                            </p>
                        </div>

                        {view === "pos" || view === "inventario" ? (
                            <div className="flex items-center gap-3">
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-72 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2 text-sm"
                                    placeholder="Buscar por nombre o codigo..."
                                />
                            </div>
                        ) : null}
                    </div>

                    {view === "pos" ? (
                        <div className="grid grid-cols-12 gap-6">
                            {/* Catalogo */}
                            <section className="col-span-8 rounded-2xl border border-slate-800 bg-[#0f141b] p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg font-bold">Catalogo</h3>
                                    <span className="text-xs text-slate-500">
                                        {productosFiltrados.length} productos
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    {productosFiltrados.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => addToCart(p)}
                                            className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-left hover:border-rose-500/60"
                                        >
                                            <p className="text-sm text-slate-400">{p.marca || "Sin marca"}</p>
                                            <p className="font-semibold text-slate-200">{p.nombre}</p>
                                            <div className="mt-3 flex items-center justify-between">
                                                <span className="text-rose-400 font-bold">${p.precio_venta.toFixed(2)}</span>
                                                <span className="text-xs text-slate-500">Stock {p.stock}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Carrito */}
                            <section className="col-span-4 rounded-2xl border border-slate-800 bg-[#0f141b] p-6">
                                <h3 className="text-lg font-bold mb-4">Carrito</h3>

                                <div className="space-y-3">
                                    {cart.length === 0 && (
                                        <p className="text-sm text-slate-500">Agrega productos para empezar.</p>
                                    )}
                                    {cart.map((item) => (
                                        <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-semibold">{item.nombre}</p>
                                                <button className="text-xs text-rose-400" onClick={() => removeItem(item.id)}>
                                                    Quitar
                                                </button>
                                            </div>
                                            <div className="mt-2 flex items-center justify-between">
                                                <span className="text-xs text-slate-500">${item.precio_venta.toFixed(2)}</span>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        className="h-6 w-6 rounded-lg border border-slate-700 text-xs"
                                                        onClick={() => updateQty(item.id, -1)}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="text-xs">{item.qty}</span>
                                                    <button
                                                        className="h-6 w-6 rounded-lg border border-slate-700 text-xs"
                                                        onClick={() => updateQty(item.id, 1)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 border-t border-slate-800 pt-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Subtotal</span>
                                        <span className="font-bold">${subtotal.toFixed(2)}</span>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Metodo de pago</label>
                                        <select
                                            value={metodoPago}
                                            onChange={(e) => setMetodoPago(e.target.value as VentaInput["metodo_pago"])}
                                            className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm"
                                        >
                                            <option value="efectivo">Efectivo</option>
                                            <option value="tarjeta">Tarjeta</option>
                                            <option value="transferencia">Transferencia</option>
                                        </select>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Notas</label>
                                        <input
                                            value={notas}
                                            onChange={(e) => setNotas(e.target.value)}
                                            className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm"
                                            placeholder="Ej: Cliente frecuente"
                                        />
                                    </div>

                                    <Button
                                        variant="success"
                                        size="full"
                                        className="mt-4"
                                        isLoading={isLoading}
                                        onClick={handleCheckout}
                                    >
                                        Cobrar
                                    </Button>
                                </div>
                            </section>
                        </div>
                    ) : view === "inventario" ? (
                        <div>
                            {/* Inventario */}
                            {isAdmin && (
                                <div className="mb-4 flex items-center gap-3">
                                    <Button variant="success" onClick={() => setModal("add")}>
                                        Nuevo producto
                                    </Button>
                                </div>
                            )}

                            <TablaProductos
                                productos={productosFiltrados}
                                canManage={isAdmin}
                                onEdit={(p) => { setSelected(p); setModal("edit"); }}
                                onDelete={async (p) => {
                                    try {
                                        await eliminarProducto(p.id);
                                    } catch {
                                        // El hook ya setea error global.
                                    }
                                }}
                                onEntrada={(p) => { setSelected(p); setModal("entrada"); }}
                                onSalida={(p) => { setSelected(p); setModal("salida"); }}
                                onAjuste={(p) => { setSelected(p); setModal("ajuste"); }}
                            />
                        </div>
                    ) : view === "reportes" ? (
                        <section className="rounded-2xl border border-slate-800 bg-[#0f141b] p-6">
                            {!isAdmin ? (
                                <p className="text-sm text-slate-400">No tienes permisos para ver reportes.</p>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                                            <p className="text-xs uppercase text-slate-500">Ventas hoy</p>
                                            <p className="mt-2 text-3xl font-bold text-slate-100">
                                                {resumenAdmin?.ventas_hoy_cantidad ?? 0}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                                            <p className="text-xs uppercase text-slate-500">Ingreso hoy</p>
                                            <p className="mt-2 text-3xl font-bold text-emerald-400">
                                                ${(resumenAdmin?.ventas_hoy_total ?? 0).toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                                            <p className="text-xs uppercase text-slate-500">Valor inventario</p>
                                            <p className="mt-2 text-3xl font-bold text-cyan-400">
                                                ${(resumenAdmin?.valor_inventario ?? 0).toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                                            <p className="text-xs uppercase text-slate-500">Stock bajo (&lt; 10)</p>
                                            <p className="mt-2 text-3xl font-bold text-rose-400">
                                                {resumenAdmin?.productos_stock_bajo ?? 0}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                                        <p className="text-xs uppercase text-slate-500 mb-3">Rango de analisis</p>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <Button
                                                size="sm"
                                                variant={reportPreset === "hoy" ? "primary" : "ghost"}
                                                onClick={() => applyReportPreset("hoy")}
                                            >
                                                Hoy
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={reportPreset === "semana" ? "primary" : "ghost"}
                                                onClick={() => applyReportPreset("semana")}
                                            >
                                                Semana
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={reportPreset === "mes" ? "primary" : "ghost"}
                                                onClick={() => applyReportPreset("mes")}
                                            >
                                                Mes
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                            <input
                                                type="date"
                                                value={reportDesde}
                                                onChange={(e) => setReportDesde(e.target.value)}
                                                className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm"
                                            />
                                            <input
                                                type="date"
                                                value={reportHasta}
                                                onChange={(e) => setReportHasta(e.target.value)}
                                                className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm"
                                            />
                                            <Button variant="success" onClick={handleApplyCustomRange} isLoading={isLoading}>
                                                Aplicar rango
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                                            <p className="text-xs uppercase text-slate-500">Ventas en rango</p>
                                            <p className="mt-2 text-3xl font-bold text-slate-100">
                                                {resumenAdminRango?.ventas_cantidad ?? 0}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                                            <p className="text-xs uppercase text-slate-500">Ingreso en rango</p>
                                            <p className="mt-2 text-3xl font-bold text-emerald-400">
                                                ${(resumenAdminRango?.ventas_total ?? 0).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                                        <p className="text-xs uppercase text-slate-500 mb-3">Productos mas vendidos</p>
                                        <div className="overflow-auto rounded-xl border border-slate-800">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-slate-900/80 text-xs uppercase text-slate-400">
                                                    <tr>
                                                        <th className="px-4 py-3">Producto</th>
                                                        <th className="px-4 py-3">Unidades</th>
                                                        <th className="px-4 py-3">Total vendido</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-800">
                                                    {(resumenAdminRango?.productos_mas_vendidos ?? []).map((item) => (
                                                        <tr key={item.producto_id}>
                                                            <td className="px-4 py-3">{item.nombre}</td>
                                                            <td className="px-4 py-3">{item.unidades}</td>
                                                            <td className="px-4 py-3">${item.total.toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                    {(resumenAdminRango?.productos_mas_vendidos ?? []).length === 0 && (
                                                        <tr>
                                                            <td className="px-4 py-3 text-slate-500" colSpan={3}>
                                                                Sin ventas en el rango seleccionado.
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
                    ) : (
                        <section className="rounded-2xl border border-slate-800 bg-[#0f141b] p-6">
                            {!isAdmin ? (
                                <p className="text-sm text-slate-400">No tienes permisos para gestionar usuarios.</p>
                            ) : (
                                <div className="space-y-6">
                                    <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <input
                                            value={newUser.username}
                                            onChange={(e) => setNewUser((prev) => ({ ...prev, username: e.target.value }))}
                                            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm"
                                            placeholder="Usuario"
                                            required
                                        />
                                        <select
                                            value={newUser.rol}
                                            onChange={(e) => setNewUser((prev) => ({ ...prev, rol: e.target.value as "admin" | "vendedor" }))}
                                            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm"
                                        >
                                            <option value="vendedor">Vendedor</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        <input
                                            type="password"
                                            value={newUser.password}
                                            onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
                                            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm"
                                            placeholder="Password inicial"
                                            required
                                        />
                                        <Button type="submit" variant="success" isLoading={isLoading}>
                                            Crear usuario
                                        </Button>
                                    </form>

                                    <div className="overflow-auto rounded-xl border border-slate-800">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-900/80 text-xs uppercase text-slate-400">
                                                <tr>
                                                    <th className="px-4 py-3">Usuario</th>
                                                    <th className="px-4 py-3">Rol</th>
                                                    <th className="px-4 py-3">Estado</th>
                                                    <th className="px-4 py-3">Ultimo login</th>
                                                    <th className="px-4 py-3">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800 text-sm">
                                                {usuarios.map((u) => (
                                                    <tr key={u.id}>
                                                        <td className="px-4 py-3">{u.username}</td>
                                                        <td className="px-4 py-3">{u.rol}</td>
                                                        <td className="px-4 py-3">{u.activo === 1 ? "Activo" : "Inactivo"}</td>
                                                        <td className="px-4 py-3">{u.last_login ?? "-"}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => {
                                                                        setResetPasswordUser(u);
                                                                        setResetPasswordValue("");
                                                                    }}
                                                                >
                                                                    Reset password
                                                                </Button>
                                                                {u.activo === 1 && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="danger"
                                                                        onClick={() => handleDeactivateUser(u.id)}
                                                                    >
                                                                        Desactivar
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}
                </main>
            </div>

            {/* Modales para CRUD y movimientos */}
            <Modal
                title={modal === "edit" ? "Editar producto" : "Nuevo producto"}
                open={isAdmin && (modal === "add" || modal === "edit")}
                onClose={() => setModal("none")}
            >
            <FormularioAgregar
                mode={modal === "edit" ? "edit" : "add"}
                initial={selected ?? undefined}
                marcas={marcas}
                isLoading={isLoading}
                onCancel={() => setModal("none")}
                onCreateMarca={registrarMarca}
                onSubmit={async (data) => {
                        try {
                        if (modal === "edit" && selected) {
                            // Edita datos base del producto.
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
                        setModal("none");
                        } catch {
                            // El hook ya setea error global; no cerramos modal.
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
                        onEntrada={registrarEntrada}
                        onSalida={registrarSalida}
                        onAjuste={ajustarStock}
                    />
                )}
            </Modal>

            <Modal
                title={resetPasswordUser ? `Reset password: ${resetPasswordUser.username}` : "Reset password"}
                open={Boolean(resetPasswordUser)}
                onClose={() => {
                    setResetPasswordUser(null);
                    setResetPasswordValue("");
                }}
            >
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nueva password</label>
                        <input
                            type="password"
                            value={resetPasswordValue}
                            onChange={(e) => setResetPasswordValue(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-white"
                            placeholder="Minimo 6 caracteres"
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" variant="success" isLoading={isLoading}>
                            Guardar password
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

function MovimientoForm({
    mode,
    producto,
    isLoading,
    onCancel,
    onEntrada,
    onSalida,
    onAjuste
}: {
    mode: "entrada" | "salida" | "ajuste";
    producto: Producto;
    isLoading: boolean;
    onCancel: () => void;
    onEntrada: (data: { producto_id: number; cantidad: number; costo_unitario: number; motivo?: string | null }) => Promise<void>;
    onSalida: (data: { producto_id: number; cantidad: number; motivo?: string | null }) => Promise<void>;
    onAjuste: (data: { producto_id: number; nueva_cantidad: number; motivo?: string | null }) => Promise<void>;
}) {
    const [cantidad, setCantidad] = useState(1);
    const [costoUnitario, setCostoUnitario] = useState(producto.precio_costo);
    const [nuevaCantidad, setNuevaCantidad] = useState(producto.stock);
    const [motivo, setMotivo] = useState("");
    const [localError, setLocalError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLocalError("");

        // Cada boton llama a un comando Tauri distinto.
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
            <p className="text-sm text-slate-400">
                Producto: <span className="text-slate-200 font-semibold">{producto.nombre}</span>
            </p>

            {mode === "entrada" && (
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Costo unitario</label>
                    <input
                        type="number"
                        value={costoUnitario}
                        onChange={(e) => setCostoUnitario(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-white"
                    />
                </div>
            )}

            {mode === "ajuste" ? (
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nueva cantidad</label>
                    <input
                        type="number"
                        value={nuevaCantidad}
                        onChange={(e) => setNuevaCantidad(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-white"
                    />
                </div>
            ) : (
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cantidad</label>
                    <input
                        type="number"
                        value={cantidad}
                        onChange={(e) => setCantidad(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-white"
                    />
                </div>
            )}

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Motivo</label>
                <input
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-white"
                    placeholder="Ej: Reposicion, ajuste por inventario fisico"
                />
            </div>
            {localError && <p className="text-sm text-rose-400">{localError}</p>}

            <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" className="text-slate-400 hover:text-slate-200" onClick={onCancel}>
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
