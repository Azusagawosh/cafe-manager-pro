use actix_web::{web, HttpResponse, Responder};
use sqlx::SqlitePool;
use chrono::Local;
use crate::models::*;
use crate::auth::create_token;

pub async fn login(
    pool: web::Data<SqlitePool>,
    req: web::Json<LoginRequest>,
) -> impl Responder {
    println!("Попытка входа: username={}", req.username);
    
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE username = ?")
        .bind(&req.username)
        .fetch_optional(pool.get_ref())
        .await;

    match user {
        Ok(Some(user)) => {
            println!("Пользователь найден: {}", user.username);
            let token = create_token(user.id, &user.username, &user.role);
            HttpResponse::Ok().json(AuthResponse {
                success: true,
                token,
                username: user.username,
                role: user.role,
                user_id: user.id,
            })
        }
        Ok(None) => {
            println!("Пользователь НЕ найден: {}", req.username);
            HttpResponse::Unauthorized().json(serde_json::json!({
                "success": false,
                "error": "Пользователь не найден"
            }))
        }
        Err(e) => {
            println!("Ошибка БД: {:?}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "success": false,
                "error": "Ошибка сервера"
            }))
        }
    }
}

pub async fn register(
    pool: web::Data<SqlitePool>,
    req: web::Json<RegisterRequest>,
) -> impl Responder {
    use bcrypt::{hash, DEFAULT_COST};
    let hashed = hash(&req.password, DEFAULT_COST).unwrap();
    
    let result = sqlx::query("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)")
        .bind(&req.username)
        .bind(&hashed)
        .bind(&req.role)
        .execute(pool.get_ref())
        .await;

    match result {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({
            "success": true,
            "message": "Регистрация успешна"
        })),
        Err(_) => HttpResponse::BadRequest().json(serde_json::json!({
            "success": false,
            "error": "Пользователь уже существует"
        })),
    }
}

pub async fn get_products(pool: web::Data<SqlitePool>) -> impl Responder {
    match sqlx::query_as::<_, Product>("SELECT * FROM products WHERE is_available = 1")
        .fetch_all(pool.get_ref())
        .await
    {
        Ok(products) => HttpResponse::Ok().json(products),
        Err(_) => HttpResponse::InternalServerError().json(serde_json::json!({"error": "Ошибка загрузки продуктов"})),
    }
}

pub async fn get_orders(pool: web::Data<SqlitePool>) -> impl Responder {
    match sqlx::query_as::<_, Order>("SELECT * FROM orders ORDER BY id DESC")
        .fetch_all(pool.get_ref())
        .await
    {
        Ok(orders) => HttpResponse::Ok().json(orders),
        Err(e) => {
            eprintln!("Ошибка загрузки заказов: {:?}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({"error": "Ошибка загрузки заказов"}))
        }
    }
}

pub async fn create_order(
    pool: web::Data<SqlitePool>,
    req: web::Json<CreateOrderRequest>,
) -> impl Responder {
    let now = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    
    let result = sqlx::query(
        r#"INSERT INTO orders 
           (table_id, total_amount, status, order_type, people_count, comment, courier_name, customer_name, customer_phone, created_at) 
           VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)"#
    )
    .bind(req.table_id)
    .bind(req.total_amount)
    .bind(&req.order_type)
    .bind(req.people_count)
    .bind(&req.comment)
    .bind(&req.courier_name)
    .bind(&req.customer_name)
    .bind(&req.customer_phone)
    .bind(&now)
    .execute(pool.get_ref())
    .await;
    
    match result {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({"success": true, "message": "Заказ создан"})),
        Err(e) => {
            eprintln!("Ошибка создания заказа: {:?}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({"error": "Ошибка создания заказа"}))
        }
    }
}

pub async fn update_order_status(
    pool: web::Data<SqlitePool>,
    path: web::Path<i32>,
    req: web::Json<UpdateStatusRequest>,
) -> impl Responder {
    let order_id = path.into_inner();
    
    let result = sqlx::query("UPDATE orders SET status = ? WHERE id = ?")
        .bind(&req.status)
        .bind(order_id)
        .execute(pool.get_ref())
        .await;
    
    match result {
        Ok(_) => {
            println!("✅ Статус заказа {} обновлен на {}", order_id, req.status);
            HttpResponse::Ok().json(serde_json::json!({"success": true}))
        },
        Err(e) => {
            eprintln!("❌ Ошибка обновления статуса: {:?}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({"error": "Ошибка обновления статуса"}))
        }
    }
}