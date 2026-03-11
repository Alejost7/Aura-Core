import TablaProductos from "../inventary/TablaProductos";
import Button from "../ui/Button";
import type { Producto } from "../../hooks/useProducts";

interface InventoryViewProps {
    isAdmin: boolean;
    productosFiltrados: Producto[];
    onNewProduct: () => void;
    onEdit: (producto: Producto) => void;
    onDelete: (producto: Producto) => void;
    onEntrada: (producto: Producto) => void;
    onSalida: (producto: Producto) => void;
    onAjuste: (producto: Producto) => void;
}

export default function InventoryView({
    isAdmin,
    productosFiltrados,
    onNewProduct,
    onEdit,
    onDelete,
    onEntrada,
    onSalida,
    onAjuste
}: InventoryViewProps) {
    return (
        <div>
            {isAdmin && (
                <div className="mb-4 flex items-center gap-3 rounded-xl border border-rose-100/20 bg-rose-950/20 p-3">
                    <Button variant="success" onClick={onNewProduct}>
                        Nuevo producto
                    </Button>
                </div>
            )}

            <TablaProductos
                productos={productosFiltrados}
                canManage={isAdmin}
                onEdit={onEdit}
                onDelete={onDelete}
                onEntrada={onEntrada}
                onSalida={onSalida}
                onAjuste={onAjuste}
            />
        </div>
    );
}
