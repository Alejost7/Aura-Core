// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // Esto llama a la función run() que está en lib.rs
    mi_primera_app_lib::run();
}