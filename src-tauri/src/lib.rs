mod db;
mod state;
mod commands;
mod models;
mod auth;
mod authz;

use tauri::Manager;
use crate::state::DbState;
use crate::db::init::init_db;
use crate::authz::AuthState;
use crate::commands::sistema::obtener_info_sistema;
use crate::commands::productos::{contar_productos, obtener_productos, registrar_producto, actualizar_producto, eliminar_producto};
use crate::commands::inventario::{registrar_entrada, registrar_salida, ajustar_stock};
use crate::commands::users::{
    activar_usuario,
    contar_usuarios,
    desactivar_usuario,
    login_usuario,
    logout_usuario,
    obtener_usuarios,
    registrar_usuario,
    reset_password_usuario,
};
use crate::commands::ventas::{listar_ventas, obtener_detalle_venta, registrar_venta};
use crate::commands::marcas::{obtener_marcas, registrar_marca};
use crate::commands::categorias::{obtener_categorias, registrar_categoria};
use crate::commands::reportes::{obtener_resumen_admin, obtener_resumen_admin_rango};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let sqlite_path = init_db(app)
                .expect("Error al iniciar DB");
            app.manage(DbState { path: sqlite_path });
            app.manage(AuthState::default());

            // Mostrar la ventana solo cuando todo este listo.
            let app_handle = app.handle();
            let window = app_handle 
                .get_webview_window("main")
                .expect("No se encontro la ventana principal");

            window.show().expect("No se puedo mostrar la ventana");

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            obtener_info_sistema,
            contar_productos,
            obtener_productos,
            registrar_producto,
            actualizar_producto,
            eliminar_producto,
            registrar_entrada,
            registrar_salida,
            ajustar_stock,
            obtener_usuarios,
            contar_usuarios,
            registrar_usuario,
            login_usuario,
            logout_usuario,
            desactivar_usuario,
            activar_usuario,
            reset_password_usuario,
            registrar_venta,
            listar_ventas,
            obtener_detalle_venta,
            obtener_marcas,
            registrar_marca,
            obtener_categorias,
            registrar_categoria,
            obtener_resumen_admin,
            obtener_resumen_admin_rango
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
