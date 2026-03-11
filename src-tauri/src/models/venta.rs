use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct VentaDetalleInput {
    pub producto_id: i64,
    pub cantidad: i64,
    pub precio_unitario: f64,
}

#[derive(Serialize, Deserialize)]
pub struct VentaInput {
    pub total: f64,
    pub metodo_pago: String,
    pub notas: Option<String>,
    pub detalles: Vec<VentaDetalleInput>,
}

#[derive(Serialize, Deserialize)]
pub struct VentaHistorialItem {
    pub id: i64,
    pub fecha: String,
    pub total: f64,
    pub metodo_pago: String,
    pub notas: Option<String>,
    pub vendedor: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct VentaDetalleItem {
    pub producto_id: i64,
    pub nombre: String,
    pub cantidad: i64,
    pub precio_unitario: f64,
    pub subtotal: f64,
}

#[derive(Serialize, Deserialize)]
pub struct VentaDetalleResponse {
    pub venta_id: i64,
    pub fecha: String,
    pub total: f64,
    pub metodo_pago: String,
    pub notas: Option<String>,
    pub vendedor: Option<String>,
    pub items: Vec<VentaDetalleItem>,
}
