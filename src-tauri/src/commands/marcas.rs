use crate::db::open_conn;
use crate::authz::{require_admin, require_auth, AuthState};
use crate::state::DbState;
use crate::models::marca::Marca;
use tauri::State;

#[tauri::command]
pub fn obtener_marcas(db: State<DbState>, auth: State<AuthState>) -> Result<Vec<Marca>, String> {
    let _ = require_auth(&auth)?;
    let conn = open_conn(&db.path)?;
    let mut stmt = conn
        .prepare("SELECT id, nombre FROM marcas ORDER BY nombre ASC")
        .map_err(|e| e.to_string())?;

    let marcas = stmt
        .query_map([], |row| {
            Ok(Marca {
                id: row.get(0)?,
                nombre: row.get(1)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(marcas)
}

#[tauri::command]
pub fn registrar_marca(
    db: State<DbState>,
    auth: State<AuthState>,
    nombre: String,
) -> Result<i64, String> {
    let _ = require_admin(&auth)?;
    if nombre.trim().is_empty() {
        return Err("nombre es requerido".to_string());
    }
    let conn = open_conn(&db.path)?;
    conn.execute(
        "INSERT INTO marcas (nombre) VALUES (?)",
        [nombre],
    )
    .map_err(|e| e.to_string())?;

    Ok(conn.last_insert_rowid())
}
