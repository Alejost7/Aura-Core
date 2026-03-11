use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Categoria {
    pub id: i64,
    pub nombre: String,
}
