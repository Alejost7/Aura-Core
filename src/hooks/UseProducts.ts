import { invoke } from "@tauri-apps/api/core"; // En v2 se usa /api/core
import { useState } from 'react';

export interface Producto {
    id: number;
    codigo_barras: string;
    nombre: string;
    marca: string;
    categoria: string;
    id_marca?: number | null;
    id_categoria?: number | null;
    precio_costo: number;
    precio_venta: number;
    stock: number;
}

export interface NuevoProducto {
    codigo_barras: string;
    nombre: string;
    id_marca?: number | null;
    id_categoria?: number | null;
    precio_costo: number;
    precio_venta: number;
    stock_inicial: number;
}

export interface ProductoEditable {
    codigo_barras: string;
    nombre: string;
    id_marca?: number | null;
    id_categoria?: number | null;
    precio_costo: number;
    precio_venta: number;
}

export interface EntradaInventario {
    producto_id: number;
    cantidad: number;
    costo_unitario: number;
    motivo?: string | null;
}

export interface SalidaInventario {
    producto_id: number;
    cantidad: number;
    motivo?: string | null;
}

export interface AjusteInventario {
    producto_id: number;
    nueva_cantidad: number;
    motivo?: string | null;
}

export interface Marca {
    id: number;
    nombre: string;
}

export interface Categoria {
    id: number;
    nombre: string;
}

export interface Usuario {
    id: number;
    username: string;
    rol: "admin" | "vendedor";
    activo: number;
    last_login?: string | null;
}

export interface NuevoUsuarioInput {
    username: string;
    rol: "admin" | "vendedor";
    password: string;
}

export interface ResumenAdmin {
    ventas_hoy_cantidad: number;
    ventas_hoy_total: number;
    valor_inventario: number;
    productos_stock_bajo: number;
}

export interface ProductoVendido {
    producto_id: number;
    nombre: string;
    unidades: number;
    total: number;
}

export interface ResumenAdminRango {
    desde: string;
    hasta: string;
    ventas_cantidad: number;
    ventas_total: number;
    productos_mas_vendidos: ProductoVendido[];
}

export interface VentaDetalleInput {
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
}

export interface VentaInput {
    total: number;
    metodo_pago: "efectivo" | "tarjeta" | "transferencia";
    notas?: string | null;
    detalles: VentaDetalleInput[];
}

export interface VentaHistorialItem {
    id: number;
    fecha: string;
    total: number;
    metodo_pago: "efectivo" | "tarjeta" | "transferencia";
    notas?: string | null;
    vendedor?: string | null;
}

export interface VentaDetalleItem {
    producto_id: number;
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}

export interface VentaDetalleResponse {
    venta_id: number;
    fecha: string;
    total: number;
    metodo_pago: "efectivo" | "tarjeta" | "transferencia";
    notas?: string | null;
    vendedor?: string | null;
    items: VentaDetalleItem[];
}


export const useProducts = () => {
    const [log, setLog] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [resumenAdmin, setResumenAdmin] = useState<ResumenAdmin | null>(null);
    const [resumenAdminRango, setResumenAdminRango] = useState<ResumenAdminRango | null>(null);
    const [ventasHistorial, setVentasHistorial] = useState<VentaHistorialItem[]>([]);

    async function cargarStock() {
        setIsLoading(true);
        setError(null);
        try {
            const data = await invoke<Producto[]>("obtener_productos");
            setProductos(data);
            setLog(`Se cargaron ${data.length} productos.`);
        } catch (e) {
            setError("Error al cargar productos");
        } finally {
            setIsLoading(false);
        }
    };

    async function cargarMarcas() {
        setIsLoading(true);
        setError(null);
        try {
            const data = await invoke<Marca[]>("obtener_marcas");
            setMarcas(data);
        } catch (e) {
            setError("Error al cargar marcas");
        } finally {
            setIsLoading(false);
        }
    }

    async function cargarCategorias() {
        setIsLoading(true);
        setError(null);
        try {
            const data = await invoke<Categoria[]>("obtener_categorias");
            setCategorias(data);
        } catch (e) {
            setError("Error al cargar categorias");
            throw e;
        } finally {
            setIsLoading(false);
        }
    }

    async function agregarProducto(data : NuevoProducto) {
        setIsLoading(true);
        setError(null);
        try {
            await invoke("registrar_producto", { data });
            setLog("Producto registrado exitosamente");
            await cargarStock();
            await cargarMarcas();
            await cargarCategorias();
        } catch (error) {
            console.error("Error al registrar el producto:", error);
            setLog("Error al registrar el producto");
            setError("Error al registrar el producto");
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    async function actualizarProducto(id: number, data: ProductoEditable) {
        setIsLoading(true);
        setError(null);
        try {
            await invoke("actualizar_producto", { id, data });
            setLog("Producto actualizado exitosamente");
            await cargarStock();
        } catch (error) {
            console.error("Error al actualizar el producto:", error);
            setLog("Error al actualizar el producto");
            setError("Error al actualizar el producto");
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    async function eliminarProducto(id: number) {
        setIsLoading(true);
        setError(null);
        try {
            await invoke("eliminar_producto", { id });
            setLog("Producto eliminado (baja lógica)");
            await cargarStock();
        } catch (error) {
            console.error("Error al eliminar el producto:", error);
            setLog("Error al eliminar el producto");
            setError("Error al eliminar el producto");
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    async function registrarEntrada(data: EntradaInventario) {
        setIsLoading(true);
        setError(null);
        try {
            await invoke("registrar_entrada", { data });
            setLog("Entrada registrada");
            await cargarStock();
        } catch (error) {
            console.error("Error al registrar entrada:", error);
            setLog("Error al registrar entrada");
            setError("Error al registrar entrada");
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    async function registrarSalida(data: SalidaInventario) {
        setIsLoading(true);
        setError(null);
        try {
            await invoke("registrar_salida", { data });
            setLog("Salida registrada");
            await cargarStock();
        } catch (error) {
            console.error("Error al registrar salida:", error);
            setLog("Error al registrar salida");
            setError("Error al registrar salida");
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    async function ajustarStock(data: AjusteInventario) {
        setIsLoading(true);
        setError(null);
        try {
            await invoke("ajustar_stock", { data });
            setLog("Stock ajustado");
            await cargarStock();
        } catch (error) {
            console.error("Error al ajustar stock:", error);
            setLog("Error al ajustar stock");
            setError("Error al ajustar stock");
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    async function registrarVenta(data: VentaInput) {
        setIsLoading(true);
        setError(null);
        try {
            await invoke("registrar_venta", { data });
            setLog("Venta registrada");
            await cargarStock();
        } catch (error) {
            console.error("Error al registrar venta:", error);
            setLog("Error al registrar venta");
            setError("Error al registrar venta");
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    async function registrarMarca(nombre: string) {
        setIsLoading(true);
        setError(null);
        try {
            await invoke("registrar_marca", { nombre });
            setLog("Marca registrada");
            await cargarMarcas();
        } catch (error) {
            console.error("Error al registrar marca:", error);
            setLog("Error al registrar marca");
            setError("Error al registrar marca");
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    async function registrarCategoria(nombre: string) {
        setIsLoading(true);
        setError(null);
        try {
            await invoke("registrar_categoria", { nombre });
            setLog("Categoria registrada");
            await cargarCategorias();
        } catch (error) {
            console.error("Error al registrar categoria:", error);
            setLog("Error al registrar categoria");
            setError("Error al registrar categoria");
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    async function cargarUsuarios() {
        setIsLoading(true);
        setError(null);
        try {
            const data = await invoke<Usuario[]>("obtener_usuarios");
            setUsuarios(data);
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
            setLog("Error al cargar usuarios");
            setError("Error al cargar usuarios");
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    async function registrarUsuario(data: NuevoUsuarioInput) {
        setIsLoading(true);
        setError(null);
        try {
            await invoke("registrar_usuario", {
                username: data.username,
                rol: data.rol,
                password: data.password,
            });
            setLog("Usuario registrado");
            await cargarUsuarios();
        } catch (error) {
            console.error("Error al registrar usuario:", error);
            setLog("Error al registrar usuario");
            setError("Error al registrar usuario");
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    async function desactivarUsuario(user_id: number) {
        setIsLoading(true);
        setError(null);
        try {
            await invoke("desactivar_usuario", { userId: user_id });
            setLog("Usuario desactivado");
            await cargarUsuarios();
        } catch (error) {
            console.error("Error al desactivar usuario:", error);
            setLog("Error al desactivar usuario");
            setError("Error al desactivar usuario");
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    async function activarUsuario(user_id: number) {
        setIsLoading(true);
        setError(null);
        try {
            await invoke("activar_usuario", { userId: user_id });
            setLog("Usuario activado");
            await cargarUsuarios();
        } catch (error) {
            console.error("Error al activar usuario:", error);
            setLog("Error al activar usuario");
            setError("Error al activar usuario");
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    async function resetPasswordUsuario(user_id: number, new_password: string) {
        setIsLoading(true);
        setError(null);
        try {
            await invoke("reset_password_usuario", { userId: user_id, newPassword: new_password });
            setLog("Password actualizada");
        } catch (error) {
            console.error("Error al resetear password:", error);
            setLog("Error al resetear password");
            setError("Error al resetear password");
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    async function cargarResumenAdmin() {
        setIsLoading(true);
        setError(null);
        try {
            const data = await invoke<ResumenAdmin>("obtener_resumen_admin");
            setResumenAdmin(data);
        } catch (error) {
            console.error("Error al cargar resumen:", error);
            setLog("Error al cargar resumen");
            setError("Error al cargar resumen");
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    async function cargarResumenAdminRango(desde: string, hasta: string) {
        setIsLoading(true);
        setError(null);
        try {
            const data = await invoke<ResumenAdminRango>("obtener_resumen_admin_rango", { desde, hasta });
            setResumenAdminRango(data);
        } catch (error) {
            console.error("Error al cargar resumen por rango:", error);
            setLog("Error al cargar resumen por rango");
            setError("Error al cargar resumen por rango");
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    async function cargarHistorialVentas(desde?: string, hasta?: string, limit = 100) {
        setIsLoading(true);
        setError(null);
        try {
            const data = await invoke<VentaHistorialItem[]>("listar_ventas", { desde, hasta, limit });
            setVentasHistorial(data);
        } catch (error) {
            console.error("Error al cargar historial de ventas:", error);
            setLog("Error al cargar historial de ventas");
            setError("Error al cargar historial de ventas");
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    async function obtenerDetalleVenta(venta_id: number) {
        setIsLoading(true);
        setError(null);
        try {
            return await invoke<VentaDetalleResponse>("obtener_detalle_venta", { ventaId: venta_id });
        } catch (error) {
            console.error("Error al obtener detalle de venta:", error);
            setLog("Error al obtener detalle de venta");
            setError("Error al obtener detalle de venta");
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    return {
        productos,
        marcas,
        categorias,
        usuarios,
        resumenAdmin,
        resumenAdminRango,
        ventasHistorial,
        log,
        error,
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
        registrarMarca,
        registrarCategoria,
        cargarUsuarios,
        cargarResumenAdmin,
        cargarResumenAdminRango,
        cargarHistorialVentas,
        obtenerDetalleVenta,
        registrarUsuario,
        desactivarUsuario,
        activarUsuario,
        resetPasswordUsuario
    };
}
