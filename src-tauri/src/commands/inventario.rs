use crate::authz::{require_admin, AuthState};
use crate::db::open_conn;
use crate::models::inventario::{AjusteInventario, EntradaInventario, SalidaInventario};
use crate::state::DbState;
use tauri::State;

fn obtener_stock_actual(conn: &rusqlite::Connection, producto_id: i64) -> Result<i64, String> {
    conn.query_row(
        "SELECT stock FROM productos WHERE id = ? AND activo = 1",
        [producto_id],
        |r| r.get(0),
    )
    .map_err(|_| "Producto no encontrado".to_string())
}

fn obtener_stock_y_costo(
    conn: &rusqlite::Connection,
    producto_id: i64,
) -> Result<(i64, f64), String> {
    conn.query_row(
        "SELECT stock, precio_costo FROM productos WHERE id = ? AND activo = 1",
        [producto_id],
        |r| Ok((r.get(0)?, r.get(1)?)),
    )
    .map_err(|_| "Producto no encontrado".to_string())
}

#[tauri::command]
pub fn registrar_entrada(
    db: State<DbState>,
    auth: State<AuthState>,
    data: EntradaInventario,
) -> Result<(), String> {
    let _ = require_admin(&auth)?;
    if data.cantidad <= 0 {
        return Err("cantidad debe ser mayor que 0".to_string());
    }
    if data.costo_unitario < 0.0 {
        return Err("costo_unitario no puede ser negativo".to_string());
    }

    let mut conn = open_conn(&db.path)?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    let (stock_actual, costo_actual) = obtener_stock_y_costo(&tx, data.producto_id)?;
    let nuevo_stock = stock_actual + data.cantidad;
    let nuevo_costo_promedio = if stock_actual <= 0 {
        data.costo_unitario
    } else {
        ((stock_actual as f64 * costo_actual) + (data.cantidad as f64 * data.costo_unitario))
            / (nuevo_stock as f64)
    };

    tx.execute(
        "INSERT INTO movimientos (
            producto_id,
            costo_unitario,
            tipo,
            cantidad,
            motivo
        ) VALUES (?, ?, 'entrada', ?, ?)",
        (
            data.producto_id,
            data.costo_unitario,
            data.cantidad,
            data.motivo
                .unwrap_or_else(|| "Entrada de inventario".to_string()),
        ),
    )
    .map_err(|e| e.to_string())?;

    tx.execute(
        "UPDATE productos
         SET stock = ?, precio_costo = ?
         WHERE id = ? AND activo = 1",
        (nuevo_stock, nuevo_costo_promedio, data.producto_id),
    )
    .map_err(|e| e.to_string())?;

    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn registrar_salida(
    db: State<DbState>,
    auth: State<AuthState>,
    data: SalidaInventario,
) -> Result<(), String> {
    let _ = require_admin(&auth)?;
    if data.cantidad <= 0 {
        return Err("cantidad debe ser mayor que 0".to_string());
    }

    let mut conn = open_conn(&db.path)?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    let stock_actual = obtener_stock_actual(&tx, data.producto_id)?;
    if stock_actual < data.cantidad {
        return Err("stock insuficiente".to_string());
    }
    let nuevo_stock = stock_actual - data.cantidad;

    tx.execute(
        "INSERT INTO movimientos (
            producto_id,
            costo_unitario,
            tipo,
            cantidad,
            motivo
        ) VALUES (?, 0, 'salida', ?, ?)",
        (
            data.producto_id,
            data.cantidad,
            data.motivo.unwrap_or_else(|| "Salida de inventario".to_string()),
        ),
    )
    .map_err(|e| e.to_string())?;

    tx.execute(
        "UPDATE productos SET stock = ? WHERE id = ? AND activo = 1",
        (nuevo_stock, data.producto_id),
    )
    .map_err(|e| e.to_string())?;

    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn ajustar_stock(
    db: State<DbState>,
    auth: State<AuthState>,
    data: AjusteInventario,
) -> Result<(), String> {
    let _ = require_admin(&auth)?;
    if data.nueva_cantidad < 0 {
        return Err("nueva_cantidad no puede ser negativa".to_string());
    }

    let mut conn = open_conn(&db.path)?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    let stock_actual = obtener_stock_actual(&tx, data.producto_id)?;
    let delta = data.nueva_cantidad - stock_actual;

    tx.execute(
        "INSERT INTO movimientos (
            producto_id,
            costo_unitario,
            tipo,
            cantidad,
            motivo
        ) VALUES (?, 0, 'ajuste', ?, ?)",
        (
            data.producto_id,
            delta,
            data.motivo.unwrap_or_else(|| "Ajuste de inventario".to_string()),
        ),
    )
    .map_err(|e| e.to_string())?;

    tx.execute(
        "UPDATE productos SET stock = ? WHERE id = ? AND activo = 1",
        (data.nueva_cantidad, data.producto_id),
    )
    .map_err(|e| e.to_string())?;

    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}
