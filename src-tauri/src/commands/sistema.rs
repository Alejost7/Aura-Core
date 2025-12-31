#[tauri::command]
pub fn obtener_info_sistema() -> String {
    "Conexion exitosa: El núcleo de Aura-Core está respondiendo.".to_string()
}
