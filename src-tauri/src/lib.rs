mod db;
mod state;
mod commands;
mod models;

use tauri::Manager;
use crate::state::DbState;
use crate::db::init::init_db;
use crate::commands::sistema::obtener_info_sistema;
use crate::commands::productos::{contar_productos, obtener_productos};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let sqlite_path = init_db(app)
                .expect("Error al iniciar DB");
            app.manage(DbState { path: sqlite_path });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            obtener_info_sistema,
            contar_productos,
            obtener_productos
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
