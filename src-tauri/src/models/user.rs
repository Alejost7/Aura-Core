use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct User {
    pub id: i32,
    pub username: String,
    pub rol: String,
    pub password_hash: String,
    pub activo: i32,
    pub last_login: Option<String>
}

#[derive(Serialize, Deserialize)]
pub struct UserPublic {
    pub id: i32,
    pub username: String,
    pub rol: String,
    pub activo: i32,
    pub last_login: Option<String>
}
