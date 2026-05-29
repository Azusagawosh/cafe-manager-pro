use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct User {
    pub id: i32,
    pub username: String,
    pub password_hash: String,
    pub role: String,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Product {
    pub id: i32,
    pub name: String,
    pub price: f64,
    pub category: String,
    pub is_available: bool,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Order {
    pub id: i32,
    pub table_id: i32,
    pub total_amount: f64,
    pub status: String,
    pub order_type: String,
    pub people_count: i32,
    pub comment: Option<String>,
    pub courier_name: Option<String>,
    pub customer_name: Option<String>,
    pub customer_phone: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterRequest {
    pub username: String,
    pub password: String,
    pub role: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthResponse {
    pub success: bool,
    pub token: String,
    pub username: String,
    pub role: String,
    pub user_id: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateOrderRequest {
    pub table_id: i32,
    pub total_amount: f64,
    pub order_type: String,
    pub people_count: i32,
    pub comment: Option<String>,
    pub courier_name: Option<String>,
    pub customer_name: Option<String>,
    pub customer_phone: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateStatusRequest {
    pub status: String,
}