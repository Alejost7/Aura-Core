// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde::{Serialize, Deserialize};  // Necesario para enviar datos a React

#[derive(Serialize, Deserialize)] // Esto convierte el objeto Rust a Json automáticamente
struct Producto {
    id: i32,
    nombre: String,
    precio: f64,
    stock: i32,
}

#[tauri::command]
fn obtener_productos() -> Vec<Producto> {
    // Por ahora son productos simulados
    // Luego los vamos a traer de un archivo o base de datos.
    vec![
        Producto {id: 1, nombre: "Teclado Mecánico".into(), precio: 85.50, stock: 10},
        Producto {id: 2, nombre: "Ratón Inalambrico".into(), precio: 70.50, stock: 8},
        Producto {id: 3, nombre: "Pantalla Asus Rog".into(), precio: 300.50, stock: 25},
        Producto {id: 4, nombre: "Casos Razer BlackShark V2".into(), precio: 150.50, stock: 4},
        
    ]
}

#[tauri::command]
fn agregar_producto(nuevo_producto: Producto) -> String {
    println!("Recibido: {} - ${}", nuevo_producto.nombre, nuevo_producto.precio);
    // En el futuro, aquí escribiremos en un archivo JSON o SQLite
    format!("Producto '{}' agregado correctamente", nuevo_producto.nombre)
}

// Recuerda agregarlo al handler abajo:
// .invoke_handler(tauri::generate_handler![greet, obtener_info_sistema, obtener_productos, agregar_producto])

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn obtener_info_sistema() -> String {
    "Conexion exitosa: El núcleo de Rust está respondiendo.".to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, obtener_info_sistema, obtener_productos, agregar_producto])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
