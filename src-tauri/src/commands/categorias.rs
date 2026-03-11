use crate::authz::{require_admin, require_auth, AuthState};
use crate::db::open_conn;
use crate::models::categoria::Categoria;
use crate::state::DbState;
use tauri::State;

#[tauri::command]
pub fn obtener_categorias(db: State<DbState>, auth: State<AuthState>) -> Result<Vec<Categoria>, String> {
    let _ = require_auth(&auth)?;
    let conn = open_conn(&db.path)?;
    let mut stmt = conn
        .prepare("SELECT id, nombre FROM categorias ORDER BY nombre ASC")
        .map_err(|e| e.to_string())?;

    let categorias = stmt
        .query_map([], |row| {
            Ok(Categoria {
                id: row.get(0)?,
                nombre: row.get(1)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(categorias)
}

#[tauri::command]
pub fn registrar_categoria(
    db: State<DbState>,
    auth: State<AuthState>,
    nombre: String,
) -> Result<i64, String> {
    let _ = require_admin(&auth)?;
    if nombre.trim().is_empty() {
        return Err("nombre es requerido".to_string());
    }
    let conn = open_conn(&db.path)?;
    conn.execute("INSERT INTO categorias (nombre) VALUES (?)", [nombre])
        .map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}
