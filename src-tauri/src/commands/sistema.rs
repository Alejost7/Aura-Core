#[tauri::command]
pub fn obtener_info_sistema() -> String {
    "Conexion exitosa: El nucleo de Aura-Core esta respondiendo.".to_string()
}
