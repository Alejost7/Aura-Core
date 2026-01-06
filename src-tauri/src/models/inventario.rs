use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
    pub struct EntradaInventario {
        pub producto_id: i64,
        pub cantidad: i64,
        pub costo_unitario: f64,
        pub motivo: Option<String>,
    }

#[derive(Serialize, Deserialize)]
    pub struct SalidaInventario {
        pub producto_id: i64,
        pub nueva_cantidad: i64,
        pub motivo: Option<String>,
    }