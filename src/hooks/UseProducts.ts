import { invoke } from "@tauri-apps/api/core"; // En v2 se usa /api/core
import { useState } from 'react';

export interface Producto {
    id: number;
    codigo_barras: string;
    nombre: string;
    marca: string;
    precio_costo: number;
    precio_venta: number;
    stock: number;
}


export const useProducts = () => {
    const [log, setLog] = useState("");
    const [productos, setProductos] = useState<Producto[]>([]);

    async function cargarStock() {
        const data = await invoke<Producto[]>("obtener_productos");
        setProductos(data);
        setLog(`Se cargaron ${data.length} productos.`);
    };

    async function llamarARust() {
        try {
        // LLamamos al comando que acabamos de crear en lib.rs
        const respuesta = await invoke<string>("obtener_info_sistema");
        setLog(respuesta);
        } catch (error) {
        console.error("Error al llamar a Rust:", error);
        }
    };

    return {
        productos,
        log,
        cargarStock,
        llamarARust,
    };
}