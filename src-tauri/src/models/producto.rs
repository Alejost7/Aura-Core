use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct Producto {
    pub id: i32,
    pub codigo_barras: String,
    pub nombre: String,
    pub marca: String,
    pub precio_costo: f64,
    pub precio_venta: f64,
    pub stock: i32,
}
