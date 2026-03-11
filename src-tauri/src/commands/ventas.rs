use crate::db::open_conn;
use crate::authz::{require_admin, require_auth, AuthState};
use crate::state::DbState;
use crate::models::venta::{
    VentaDetalleInput, VentaDetalleItem, VentaDetalleResponse, VentaHistorialItem, VentaInput,
};
use rusqlite::OptionalExtension;
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
    let session = require_auth(&auth)?;
    validar_venta(&data)?;

    let mut conn = open_conn(&db.path)?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    tx.execute(
        "INSERT INTO ventas (total, metodo_pago, notas, usuario_id) VALUES (?, ?, ?, ?)",
        (data.total, data.metodo_pago, data.notas, session.user_id),
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

#[tauri::command]
pub fn listar_ventas(
    db: State<DbState>,
    auth: State<AuthState>,
    desde: Option<String>,
    hasta: Option<String>,
    limit: Option<i64>,
) -> Result<Vec<VentaHistorialItem>, String> {
    let _ = require_admin(&auth)?;
    let conn = open_conn(&db.path)?;

    let limit = limit.unwrap_or(100).clamp(1, 500);
    let desde = desde.unwrap_or_else(|| "1900-01-01".to_string());
    let hasta = hasta.unwrap_or_else(|| "2999-12-31".to_string());

    let mut stmt = conn
        .prepare(
            "
            SELECT
                v.id,
                v.fecha,
                v.total,
                v.metodo_pago,
                v.notas,
                u.username
            FROM ventas v
            LEFT JOIN usuarios u ON u.id = v.usuario_id
            WHERE date(v.fecha) BETWEEN date(?) AND date(?)
            ORDER BY v.id DESC
            LIMIT ?
            ",
        )
        .map_err(|e| e.to_string())?;

    let ventas = stmt
        .query_map((desde, hasta, limit), |row| {
            Ok(VentaHistorialItem {
                id: row.get(0)?,
                fecha: row.get(1)?,
                total: row.get(2)?,
                metodo_pago: row.get(3)?,
                notas: row.get(4)?,
                vendedor: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(ventas)
}

#[tauri::command]
pub fn obtener_detalle_venta(
    db: State<DbState>,
    auth: State<AuthState>,
    venta_id: i64,
) -> Result<VentaDetalleResponse, String> {
    let _ = require_admin(&auth)?;
    let conn = open_conn(&db.path)?;

    let cabecera = conn
        .query_row(
            "
            SELECT
                v.id,
                v.fecha,
                v.total,
                v.metodo_pago,
                v.notas,
                u.username
            FROM ventas v
            LEFT JOIN usuarios u ON u.id = v.usuario_id
            WHERE v.id = ?
            ",
            [venta_id],
            |row| {
                Ok((
                    row.get::<_, i64>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, f64>(2)?,
                    row.get::<_, String>(3)?,
                    row.get::<_, Option<String>>(4)?,
                    row.get::<_, Option<String>>(5)?,
                ))
            },
        )
        .optional()
        .map_err(|e| e.to_string())?;

    let Some((id, fecha, total, metodo_pago, notas, vendedor)) = cabecera else {
        return Err("Venta no encontrada".to_string());
    };

    let mut stmt = conn
        .prepare(
            "
            SELECT
                vd.producto_id,
                p.nombre,
                vd.cantidad,
                vd.precio_unitario_momento
            FROM venta_detalles vd
            JOIN productos p ON p.id = vd.producto_id
            WHERE vd.venta_id = ?
            ORDER BY vd.id ASC
            ",
        )
        .map_err(|e| e.to_string())?;

    let items = stmt
        .query_map([venta_id], |row| {
            let cantidad: i64 = row.get(2)?;
            let precio_unitario: f64 = row.get(3)?;
            Ok(VentaDetalleItem {
                producto_id: row.get(0)?,
                nombre: row.get(1)?,
                cantidad,
                precio_unitario,
                subtotal: precio_unitario * (cantidad as f64),
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(VentaDetalleResponse {
        venta_id: id,
        fecha,
        total,
        metodo_pago,
        notas,
        vendedor,
        items,
    })
}
