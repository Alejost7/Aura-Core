use crate::db::open_conn;
use crate::state::DbState;
use crate::models::producto::Producto;
use crate::models::producto::NuevoProducto;
use tauri::State;

#[tauri::command]
pub fn contar_productos(db: State<DbState>) -> Result<i64, String> {
    let conn = open_conn(&db.path)?;

    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM productos", [], |r| r.get(0))
        .map_err(|e| e.to_string())?;

    Ok(count)
}

#[tauri::command]
pub fn obtener_productos(db: State<DbState>) -> Result<Vec<Producto>, String> {
    let conn = open_conn(&db.path)?;

    let mut stmt = conn
        .prepare(
            "SELECT id, codigo_barras, nombre, 
                    COALESCE((SELECT nombre FROM marcas WHERE marcas.id = productos.id_marca), ''),
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
                precio_costo: row.get(4)?,
                precio_venta: row.get(5)?,
                stock: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(productos)
}

#[tauri::command]
pub fn registrar_producto(db: State<DbState>, data: NuevoProducto) -> Result<(), String> {
    let mut conn = open_conn(&db.path)?;

    let tx = conn.transaction().map_err(|e| e.to_string())?;
    if data.stock_inicial < 0 {
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
    }
    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}