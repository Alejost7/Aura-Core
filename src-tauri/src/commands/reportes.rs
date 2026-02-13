use crate::authz::{require_admin, AuthState};
use crate::db::open_conn;
use crate::state::DbState;
use serde::Serialize;
use tauri::State;

#[derive(Serialize)]
pub struct ResumenAdmin {
    pub ventas_hoy_cantidad: i64,
    pub ventas_hoy_total: f64,
    pub valor_inventario: f64,
    pub productos_stock_bajo: i64,
}

#[derive(Serialize)]
pub struct ProductoVendido {
    pub producto_id: i64,
    pub nombre: String,
    pub unidades: i64,
    pub total: f64,
}

#[derive(Serialize)]
pub struct ResumenAdminRango {
    pub desde: String,
    pub hasta: String,
    pub ventas_cantidad: i64,
    pub ventas_total: f64,
    pub productos_mas_vendidos: Vec<ProductoVendido>,
}

#[tauri::command]
pub fn obtener_resumen_admin(
    db: State<DbState>,
    auth: State<AuthState>,
) -> Result<ResumenAdmin, String> {
    let _ = require_admin(&auth)?;
    let conn = open_conn(&db.path)?;

    let ventas_hoy_cantidad: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM ventas WHERE DATE(fecha, 'localtime') = DATE('now', 'localtime')",
            [],
            |r| r.get(0),
        )
        .map_err(|e| e.to_string())?;

    let ventas_hoy_total: f64 = conn
        .query_row(
            "SELECT COALESCE(SUM(total), 0) FROM ventas WHERE DATE(fecha, 'localtime') = DATE('now', 'localtime')",
            [],
            |r| r.get(0),
        )
        .map_err(|e| e.to_string())?;

    let valor_inventario: f64 = conn
        .query_row(
            "SELECT COALESCE(SUM(stock * precio_costo), 0) FROM productos WHERE activo = 1",
            [],
            |r| r.get(0),
        )
        .map_err(|e| e.to_string())?;

    let productos_stock_bajo: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM productos WHERE activo = 1 AND stock < 10",
            [],
            |r| r.get(0),
        )
        .map_err(|e| e.to_string())?;

    Ok(ResumenAdmin {
        ventas_hoy_cantidad,
        ventas_hoy_total,
        valor_inventario,
        productos_stock_bajo,
    })
}

#[tauri::command]
pub fn obtener_resumen_admin_rango(
    db: State<DbState>,
    auth: State<AuthState>,
    desde: String,
    hasta: String,
) -> Result<ResumenAdminRango, String> {
    let _ = require_admin(&auth)?;
    if desde.trim().is_empty() || hasta.trim().is_empty() {
        return Err("desde y hasta son requeridos".to_string());
    }
    if desde > hasta {
        return Err("rango invalido: desde no puede ser mayor que hasta".to_string());
    }

    let conn = open_conn(&db.path)?;

    let ventas_cantidad: i64 = conn
        .query_row(
            "SELECT COUNT(*)
             FROM ventas
             WHERE DATE(fecha, 'localtime') BETWEEN DATE(?) AND DATE(?)",
            [&desde, &hasta],
            |r| r.get(0),
        )
        .map_err(|e| e.to_string())?;

    let ventas_total: f64 = conn
        .query_row(
            "SELECT COALESCE(SUM(total), 0)
             FROM ventas
             WHERE DATE(fecha, 'localtime') BETWEEN DATE(?) AND DATE(?)",
            [&desde, &hasta],
            |r| r.get(0),
        )
        .map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT
                p.id,
                p.nombre,
                COALESCE(SUM(vd.cantidad), 0) AS unidades,
                COALESCE(SUM(vd.cantidad * vd.precio_unitario_momento), 0) AS total
             FROM venta_detalles vd
             INNER JOIN ventas v ON v.id = vd.venta_id
             INNER JOIN productos p ON p.id = vd.producto_id
             WHERE DATE(v.fecha, 'localtime') BETWEEN DATE(?) AND DATE(?)
             GROUP BY p.id, p.nombre
             ORDER BY unidades DESC, total DESC
             LIMIT 10",
        )
        .map_err(|e| e.to_string())?;

    let productos_mas_vendidos = stmt
        .query_map([&desde, &hasta], |row| {
            Ok(ProductoVendido {
                producto_id: row.get(0)?,
                nombre: row.get(1)?,
                unidades: row.get(2)?,
                total: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(ResumenAdminRango {
        desde,
        hasta,
        ventas_cantidad,
        ventas_total,
        productos_mas_vendidos,
    })
}
