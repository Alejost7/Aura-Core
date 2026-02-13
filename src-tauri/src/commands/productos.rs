use crate::db::open_conn;
use crate::authz::{require_admin, require_auth, AuthState};
use crate::state::DbState;
use crate::models::producto::Producto;
use crate::models::producto::{NuevoProducto, ProductoEditable};
use tauri::State;

fn validar_base_producto(codigo_barras: &str, nombre: &str, precio_costo: f64, precio_venta: f64) -> Result<(), String> {
    if codigo_barras.trim().is_empty() {
        return Err("codigo_barras es requerido".to_string());
    }
    if nombre.trim().is_empty() {
        return Err("nombre es requerido".to_string());
    }
    if precio_costo < 0.0 || precio_venta < 0.0 {
        return Err("precios no pueden ser negativos".to_string());
    }
    Ok(())
}

fn validar_nuevo_producto(data: &NuevoProducto) -> Result<(), String> {
    validar_base_producto(
        &data.codigo_barras,
        &data.nombre,
        data.precio_costo,
        data.precio_venta,
    )?;
    if data.stock_inicial < 0 {
        return Err("stock_inicial no puede ser negativo".to_string());
    }
    Ok(())
}

fn validar_producto_editable(data: &ProductoEditable) -> Result<(), String> {
    validar_base_producto(
        &data.codigo_barras,
        &data.nombre,
        data.precio_costo,
        data.precio_venta,
    )
}

#[tauri::command]
pub fn contar_productos(db: State<DbState>, auth: State<AuthState>) -> Result<i64, String> {
    let _ = require_auth(&auth)?;
    let conn = open_conn(&db.path)?;

    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM productos", [], |r| r.get(0))
        .map_err(|e| e.to_string())?;

    Ok(count)
}

#[tauri::command]
pub fn obtener_productos(db: State<DbState>, auth: State<AuthState>) -> Result<Vec<Producto>, String> {
    let _ = require_auth(&auth)?;
    let conn = open_conn(&db.path)?;

    let mut stmt = conn
        .prepare(
            "SELECT id, codigo_barras, nombre, 
                    COALESCE((SELECT nombre FROM marcas WHERE marcas.id = productos.id_marca), ''),
                    id_marca,
                    precio_costo, precio_venta, stock
            FROM productos
            WHERE activo = 1"
        )
        .map_err(|e| e.to_string())?;

    let productos = stmt
        .query_map([], |row| {
            Ok(Producto {
                id: row.get(0)?,
                codigo_barras: row.get(1)?,
                nombre: row.get(2)?,
                marca: row.get(3)?,
                id_marca: row.get(4)?,
                precio_costo: row.get(5)?,
                precio_venta: row.get(6)?,
                stock: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(productos)
}

#[tauri::command]
pub fn registrar_producto(
    db: State<DbState>,
    auth: State<AuthState>,
    data: NuevoProducto,
) -> Result<(), String> {
    let _ = require_admin(&auth)?;
    let mut conn = open_conn(&db.path)?;
    validar_nuevo_producto(&data)?;

    let tx = conn.transaction().map_err(|e| e.to_string())?;
    tx.execute(
        "INSERT INTO productos (
            codigo_barras,
            nombre,
            id_marca,
            id_categoria,
            precio_costo,
            precio_venta,
            stock
        ) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (
            data.codigo_barras,
            data.nombre,
            data.id_marca,
            data.id_categoria,
            data.precio_costo,
            data.precio_venta,
            data.stock_inicial
        )
    )
    .map_err(|e| e.to_string())?;

    if data.stock_inicial > 0 {
        tx.execute(
            "INSERT INTO movimientos (
                producto_id,
                costo_unitario,
                tipo,
                cantidad,
                motivo
            ) VALUES (last_insert_rowid(), ?, 'entrada', ?, ?)",
            (data.precio_costo, data.stock_inicial, "Stock inicial")
        )
        .map_err(|e| e.to_string())?;
    }
    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn actualizar_producto(
    db: State<DbState>,
    auth: State<AuthState>,
    id: i64,
    data: ProductoEditable,
) -> Result<(), String> {
    let _ = require_admin(&auth)?;
    let mut conn = open_conn(&db.path)?;
    validar_producto_editable(&data)?;

    let tx = conn.transaction().map_err(|e| e.to_string())?;
    tx.execute(
        "UPDATE productos
         SET codigo_barras = ?,
             nombre = ?,
             id_marca = ?,
             id_categoria = ?,
             precio_costo = ?,
             precio_venta = ?
         WHERE id = ? AND activo = 1",
        (
            data.codigo_barras,
            data.nombre,
            data.id_marca,
            data.id_categoria,
            data.precio_costo,
            data.precio_venta,
            id
        )
    )
    .map_err(|e| e.to_string())?;

    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn eliminar_producto(db: State<DbState>, auth: State<AuthState>, id: i64) -> Result<(), String> {
    let _ = require_admin(&auth)?;
    let conn = open_conn(&db.path)?;
    conn.execute(
        "UPDATE productos SET activo = 0 WHERE id = ?",
        [id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}
