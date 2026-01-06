# Aura-Core | Desktop Management System
Aura-Core es el sistema de escritorio para la tienda Live Beauty. Su foco es la gestion de inventario local con alta velocidad, baja latencia y datos persistentes en el equipo.

## Estado actual (MVP)
- Inicio de sesion local con credenciales fijas (admin / 1234) para pruebas.
- Vista de inventario con tabla y estado del sistema.
- Base de datos SQLite creada automaticamente en el primer inicio.
- Backend en Rust con comandos Tauri para consultar y registrar productos.
- UI preparada para agregar, editar y eliminar, pero aun sin flujo conectado.

## Tech Stack
- Frontend: React + TypeScript + Tailwind CSS.
- Desktop runtime: Tauri 2.
- Backend: Rust.
- Database: SQLite (modo WAL).

## Arquitectura
- React renderiza la interfaz y usa `@tauri-apps/api` para invocar comandos Rust.
- Rust inicializa la base de datos y expone operaciones de inventario via Tauri commands.
- SQLite guarda inventario y movimientos en almacenamiento local del sistema.

## Estructura del proyecto
- `src/`: UI (paginas, componentes, hooks).
- `src/pages/`: vistas principales (Login, Home).
- `src/components/`: layout, UI y modulos de inventario.
- `src/hooks/UseProducts.ts`: puente con comandos Tauri.
- `src-tauri/`: backend Rust, base de datos y comandos.

## Comandos Tauri disponibles
- `obtener_info_sistema`: retorna un mensaje de conexion con el nucleo.
- `contar_productos`: devuelve el total de productos activos.
- `obtener_productos`: lista productos activos con su marca.
- `registrar_producto`: registra un producto nuevo.

### Payload de `registrar_producto`
Campos requeridos en `NuevoProducto`:
- `codigo_barras`, `nombre`
- `precio_costo`, `precio_venta`, `stock_inicial`
- `id_marca`, `id_categoria` (opcionales)

## Modelo de datos (SQLite)
- `usuarios`: usuarios del sistema y roles.
- `categorias`: categorias de productos.
- `marcas`: marcas disponibles.
- `productos`: catalogo e inventario.
- `ventas` y `venta_detalles`: registro de ventas.
- `movimientos`: entradas, salidas y ajustes de stock.

## Desarrollo local
Requisitos:
- Node.js 18+
- Rust toolchain
- Tauri CLI (v2)

Pasos:
```bash
npm install
npm run dev
```

Para ejecutar como app de escritorio:
```bash
npm run tauri dev
```

Build:
```bash
npm run build
npm run tauri build
```

## Notas operativas
- La base de datos se crea en el directorio de datos de la app con el nombre `aura_core.db`.
- La ventana usa una title bar personalizada controlada desde Tauri.

## Pendientes cercanos
- Conectar UI de alta/baja/edicion de productos.
- Reemplazar login local por autenticacion real.
- Completar modulos de ventas y movimientos.
