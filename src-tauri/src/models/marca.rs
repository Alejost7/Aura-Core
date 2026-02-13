use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct Marca {
    pub id: i64,
    pub nombre: String,
}
