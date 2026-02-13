use std::sync::Mutex;
use tauri::State;

#[derive(Clone)]
pub struct UserSession {
    pub user_id: i32,
    pub username: String,
    pub rol: String,
}

#[derive(Default)]
pub struct AuthState {
    pub current_user: Mutex<Option<UserSession>>,
}

pub fn require_auth(auth: &State<AuthState>) -> Result<UserSession, String> {
    let guard = auth
        .current_user
        .lock()
        .map_err(|_| "No se pudo acceder al estado de sesion".to_string())?;

    guard.clone().ok_or_else(|| "Sesion no iniciada".to_string())
}

pub fn require_admin(auth: &State<AuthState>) -> Result<UserSession, String> {
    let session = require_auth(auth)?;
    if session.rol != "admin" {
        return Err("Acceso denegado: se requiere rol admin".to_string());
    }
    Ok(session)
}
