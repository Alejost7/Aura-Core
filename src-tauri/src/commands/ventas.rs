use crate::db::open_conn;
use crate::authz::{require_auth, AuthState};
use crate::state::DbState;
use crate::models::venta::{VentaInput, VentaDetalleInput};
use tauri::State;

fn validar_venta(data: &VentaInput) -> Result<(), String> {
    if data.total < 0.0 {
        return Err("total no puede ser negativo".to_string());
    }
    if data.detalles.is_empty() {
        return Err("la venta debe tener al menos un item".to_string());
    }
    match data.metodo_pago.as_str() {
        "efectivo" | "tarjeta" | "transferencia" => Ok(()),
        _ => Err("metodo_pago invalido".to_string()),
    }
}

fn validar_detalle(detalle: &VentaDetalleInput) -> Result<(), String> {
    if detalle.cantidad <= 0 {
        return Err("cantidad debe ser mayor que 0".to_string());
    }
    if detalle.precio_unitario < 0.0 {
        return Err("precio_unitario no puede ser negativo".to_string());
    }
    Ok(())
}

#[tauri::command]
pub fn registrar_venta(
    db: State<DbState>,
    auth: State<AuthState>,
    data: VentaInput,
) -> Result<(), String> {
    let _ = require_auth(&auth)?;
    validar_venta(&data)?;

    let mut conn = open_conn(&db.path)?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    tx.execute(
        "INSERT INTO ventas (total, metodo_pago, notas) VALUES (?, ?, ?)",
        (data.total, data.metodo_pago, data.notas),
    )
    .map_err(|e| e.to_string())?;

    let venta_id = tx.last_insert_rowid();

    for detalle in data.detalles {
        validar_detalle(&detalle)?;

        let (stock_actual, precio_costo): (i64, f64) = tx
            .query_row(
                "SELECT stock, precio_costo FROM productos WHERE id = ? AND activo = 1",
                [detalle.producto_id],
                |r| Ok((r.get(0)?, r.get(1)?)),
            )
            .map_err(|_| "Producto no encontrado".to_string())?;

        if stock_actual < detalle.cantidad {
            return Err("stock insuficiente".to_string());
        }

        tx.execute(
            "INSERT INTO venta_detalles (
                venta_id,
                producto_id,
                cantidad,
                precio_unitario_momento
            ) VALUES (?, ?, ?, ?)",
            (
                venta_id,
                detalle.producto_id,
                detalle.cantidad,
                detalle.precio_unitario
            ),
        )
        .map_err(|e| e.to_string())?;

        tx.execute(
            "UPDATE productos SET stock = stock - ? WHERE id = ? AND activo = 1",
            (detalle.cantidad, detalle.producto_id),
        )
        .map_err(|e| e.to_string())?;

        // Movimiento de salida asociado a la venta.
        tx.execute(
            "INSERT INTO movimientos (
                producto_id,
                costo_unitario,
                tipo,
                cantidad,
                motivo
            ) VALUES (?, ?, 'salida', ?, ?)",
            (
                detalle.producto_id,
                precio_costo,
                detalle.cantidad,
                "Venta"
            ),
        )
        .map_err(|e| e.to_string())?;
    }

    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}
