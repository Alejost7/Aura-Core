import Header from "../layout/Header";
import Button from "../ui/Button";

type ViewMode = "pos" | "inventario" | "usuarios" | "reportes";

interface HomeSidebarProps {
    view: ViewMode;
    isAdmin: boolean;
    onSetView: (view: ViewMode) => void;
    onOpenNewProduct: () => void;
    onRefreshStock: () => void;
    onRefreshUsers: () => void;
    onRefreshReports: () => Promise<void>;
    onLogOut: () => void;
}

export default function HomeSidebar({
    view,
    isAdmin,
    onSetView,
    onOpenNewProduct,
    onRefreshStock,
    onRefreshUsers,
    onRefreshReports,
    onLogOut
}: HomeSidebarProps) {
    return (
        <aside className="beauty-glass w-72 border-r p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-black tracking-tight text-rose-100">Live Beauty</h1>
                <p className="text-xs text-rose-100/70">POS + Inventario</p>
            </div>

            <div className="space-y-2">
                <Button variant={view === "pos" ? "primary" : "ghost"} size="full" onClick={() => onSetView("pos")}>
                    Punto de venta
                </Button>
                <Button
                    variant={view === "inventario" ? "primary" : "ghost"}
                    size="full"
                    onClick={() => onSetView("inventario")}
                >
                    Inventario
                </Button>
                {isAdmin && (
                    <Button variant={view === "usuarios" ? "primary" : "ghost"} size="full" onClick={() => onSetView("usuarios")}>
                        Usuarios
                    </Button>
                )}
                {isAdmin && (
                    <Button variant={view === "reportes" ? "primary" : "ghost"} size="full" onClick={() => onSetView("reportes")}>
                        Reportes
                    </Button>
                )}
            </div>

            <div className="mt-8">
                <p className="mb-3 text-xs font-bold uppercase text-rose-100/65">Acciones rapidas</p>
                <div className="space-y-2">
                    {isAdmin && (
                        <Button variant="success" size="full" onClick={onOpenNewProduct}>
                            Nuevo producto
                        </Button>
                    )}
                    <Button variant="ghost" size="full" onClick={onRefreshStock}>
                        Refrescar stock
                    </Button>
                    {isAdmin && (
                        <Button variant="ghost" size="full" onClick={onRefreshUsers}>
                            Refrescar usuarios
                        </Button>
                    )}
                    {isAdmin && (
                        <Button
                            variant="ghost"
                            size="full"
                            onClick={async () => {
                                try {
                                    await onRefreshReports();
                                } catch {
                                    // El hook setea error global en Home.
                                }
                            }}
                        >
                            Refrescar reportes
                        </Button>
                    )}
                </div>
            </div>

            <div className="mt-8">
                <Header onLogOut={onLogOut} />
            </div>
        </aside>
    );
}
