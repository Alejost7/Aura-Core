use rusqlite::Connection;
use std::{fs, path::PathBuf};
use tauri::Manager;

pub fn init_db(app: &tauri::App) -> Result<PathBuf, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;

    let db_path = app_dir.join("aura_core.db");
    let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;

    create_tables(&conn)?;

    println!("✅ Base de datos inicializada en: {:?}", db_path);
    Ok(db_path)
}

fn create_tables(conn: &Connection) -> Result<(), String> {
    conn.execute_batch(
        r#"
        
        PRAGMA foreign_keys = ON;
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;

        CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        rol TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        last_login DATETIME
        );

        CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT UNIQUE NOT NULL,
        descripcion TEXT
        );

        CREATE TABLE IF NOT EXISTS marcas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT UNIQUE NOT NULL
        );
        
        
        CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo_barras TEXT UNIQUE NOT NULL,
            nombre TEXT NOT NULL,
            id_marca INTEGER,
            id_categoria INTEGER,
            precio_costo REAL NOT NULL,
            precio_venta REAL NOT NULL,
            stock INTEGER NOT NULL DEFAULT 0,
            activo INTEGER NOT NULL DEFAULT 1,
            FOREIGN KEY (id_marca) REFERENCES marcas(id) ON DELETE RESTRICT,
            FOREIGN KEY (id_categoria) REFERENCES categorias(id) ON DELETE RESTRICT
        );
        

        CREATE TABLE IF NOT EXISTS ventas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
            total REAL NOT NULL,
            metodo_pago TEXT NOT NULL CHECK(metodo_pago IN ('efectivo', 'tarjeta', 'transferencia')),
            notas TEXT
        );

        CREATE TABLE IF NOT EXISTS venta_detalles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            venta_id INTEGER NOT NULL,
            producto_id INTEGER NOT NULL,
            cantidad INTEGER NOT NULL,
            precio_unitario_momento REAL NOT NULL,
            FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE RESTRICT,
            FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT
        );
        
        CREATE TABLE IF NOT EXISTS movimientos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            producto_id INTEGER NOT NULL,
            costo_unitario REAL NOT NULL,
            tipo TEXT NOT NULL CHECK(tipo IN ('entrada', 'salida', 'ajuste')),
            cantidad INTEGER NOT NULL,
            motivo TEXT,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT
        );

        CREATE INDEX IF NOT EXISTS idx_productos_codigo_barras ON productos(codigo_barras);
        CREATE INDEX IF NOT EXISTS idx_venta_detalles_venta ON venta_detalles(venta_id);
        CREATE INDEX IF NOT EXISTS idx_movimientos_producto ON movimientos(producto_id);

        "#,
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}