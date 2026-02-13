use crate::auth::{hash_password, verify_password};
use crate::authz::{require_admin, AuthState, UserSession};
use crate::db::open_conn;
use crate::models::user::{User, UserPublic};
use crate::state::DbState;
use rusqlite::OptionalExtension;
use tauri::State;

#[tauri::command]
pub fn obtener_usuarios(db: State<DbState>, auth: State<AuthState>) -> Result<Vec<UserPublic>, String> {
    let _ = require_admin(&auth)?;
    let conn = open_conn(&db.path)?;

    let mut stmt = conn
        .prepare("SELECT id, username, rol, activo, last_login FROM usuarios ORDER BY username ASC")
        .map_err(|e| e.to_string())?;

    let usuarios = stmt
        .query_map([], |row| {
            Ok(UserPublic {
                id: row.get(0)?,
                username: row.get(1)?,
                rol: row.get(2)?,
                activo: row.get(3)?,
                last_login: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(usuarios)
}

#[tauri::command]
pub fn contar_usuarios(db: State<DbState>, auth: State<AuthState>) -> Result<i64, String> {
    let _ = require_admin(&auth)?;
    let conn = open_conn(&db.path)?;
    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM usuarios", [], |r| r.get(0))
        .map_err(|e| e.to_string())?;
    Ok(count)
}

#[tauri::command]
pub fn registrar_usuario(
    db: State<DbState>,
    auth: State<AuthState>,
    username: String,
    rol: String,
    password: String,
) -> Result<(), String> {
    let _ = require_admin(&auth)?;
    if username.trim().is_empty() || rol.trim().is_empty() || password.trim().is_empty() {
        return Err("username, rol y password son requeridos".to_string());
    }
    if rol != "admin" && rol != "vendedor" {
        return Err("rol invalido: use admin o vendedor".to_string());
    }

    let conn = open_conn(&db.path)?;
    let hash = hash_password(&password)?;
    conn.execute(
        "INSERT INTO usuarios (username, rol, password_hash) VALUES (?, ?, ?)",
        (username.trim(), rol, hash),
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn login_usuario(
    db: State<DbState>,
    auth: State<AuthState>,
    username: String,
    password: String,
) -> Result<UserPublic, String> {
    let username = username.trim().to_string();
    if username.is_empty() || password.trim().is_empty() {
        return Err("Credenciales invalidas".to_string());
    }

    let conn = open_conn(&db.path)?;

    let user: User = conn
        .query_row(
            "SELECT id, username, rol, password_hash, activo, last_login
             FROM usuarios
             WHERE username = ?",
            [username.clone()],
            |row| {
                Ok(User {
                    id: row.get(0)?,
                    username: row.get(1)?,
                    rol: row.get(2)?,
                    password_hash: row.get(3)?,
                    activo: row.get(4)?,
                    last_login: row.get(5)?,
                })
            },
        )
        .map_err(|_| "Credenciales invalidas".to_string())?;

    if user.activo != 1 {
        return Err("Usuario inactivo".to_string());
    }

    let ok = verify_password(&password, &user.password_hash)?;
    if !ok {
        return Err("Credenciales invalidas".to_string());
    }

    conn.execute(
        "UPDATE usuarios SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
        [user.id],
    )
    .map_err(|e| e.to_string())?;

    let mut guard = auth
        .current_user
        .lock()
        .map_err(|_| "No se pudo actualizar la sesion".to_string())?;
    *guard = Some(UserSession {
        user_id: user.id,
        username: user.username.clone(),
        rol: user.rol.clone(),
    });

    Ok(UserPublic {
        id: user.id,
        username: user.username,
        rol: user.rol,
        activo: user.activo,
        last_login: user.last_login,
    })
}

#[tauri::command]
pub fn logout_usuario(auth: State<AuthState>) -> Result<(), String> {
    let mut guard = auth
        .current_user
        .lock()
        .map_err(|_| "No se pudo cerrar la sesion".to_string())?;
    *guard = None;
    Ok(())
}

#[tauri::command]
pub fn desactivar_usuario(
    db: State<DbState>,
    auth: State<AuthState>,
    user_id: i64,
) -> Result<(), String> {
    let session = require_admin(&auth)?;
    if i64::from(session.user_id) == user_id {
        return Err("No puedes desactivar tu propio usuario".to_string());
    }

    let conn = open_conn(&db.path)?;
    let target: Option<(String, i32)> = conn
        .query_row(
            "SELECT rol, activo FROM usuarios WHERE id = ?",
            [user_id],
            |r| Ok((r.get(0)?, r.get(1)?)),
        )
        .optional()
        .map_err(|e| e.to_string())?;

    let Some((rol, activo)) = target else {
        return Err("Usuario no encontrado".to_string());
    };
    if activo != 1 {
        return Ok(());
    }
    if rol == "admin" {
        let admins_activos: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM usuarios WHERE rol = 'admin' AND activo = 1",
                [],
                |r| r.get(0),
            )
            .map_err(|e| e.to_string())?;
        if admins_activos <= 1 {
            return Err("No puedes desactivar el ultimo admin activo".to_string());
        }
    }

    conn.execute("UPDATE usuarios SET activo = 0 WHERE id = ?", [user_id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn reset_password_usuario(
    db: State<DbState>,
    auth: State<AuthState>,
    user_id: i64,
    new_password: String,
) -> Result<(), String> {
    let _ = require_admin(&auth)?;
    if new_password.trim().len() < 6 {
        return Err("La nueva password debe tener al menos 6 caracteres".to_string());
    }

    let conn = open_conn(&db.path)?;
    let exists: Option<i64> = conn
        .query_row("SELECT id FROM usuarios WHERE id = ?", [user_id], |r| r.get(0))
        .optional()
        .map_err(|e| e.to_string())?;
    if exists.is_none() {
        return Err("Usuario no encontrado".to_string());
    }

    let hash = hash_password(new_password.trim())?;
    conn.execute(
        "UPDATE usuarios SET password_hash = ? WHERE id = ?",
        (hash, user_id),
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}
