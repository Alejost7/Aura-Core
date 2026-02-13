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
