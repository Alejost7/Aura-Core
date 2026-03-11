import { useMemo, useState } from "react";
import type { Producto, VentaInput } from "../useProducts";

export interface CartItem {
    id: number;
    nombre: string;
    precio_venta: number;
    qty: number;
}

export function useCart() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [metodoPago, setMetodoPago] = useState<VentaInput["metodo_pago"]>("efectivo");
    const [notas, setNotas] = useState("");

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

    function clearCart() {
        setCart([]);
        setNotas("");
    }

    function buildVentaInput(): VentaInput {
        return {
            total: subtotal,
            metodo_pago: metodoPago,
            notas: notas || null,
            detalles: cart.map((i) => ({
                producto_id: i.id,
                cantidad: i.qty,
                precio_unitario: i.precio_venta
            }))
        };
    }

    return {
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
    };
}
