mod auth;
mod db;
mod models;
mod handlers;

use actix_web::{web, App, HttpServer, HttpResponse};
use actix_cors::Cors;
use dotenv::dotenv;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init();
    
    let pool = db::create_pool().await;
    
    println!("✅ Сервер запущен на http://localhost:8080");
    println!("📋 Доступные эндпоинты:");
    println!("   POST /api/auth/login - авторизация");
    println!("   POST /api/auth/register - регистрация");
    println!("   GET  /api/products - список продуктов");
    println!("   GET  /api/orders - список заказов");
    println!("   POST /api/orders - создание заказа");
    println!("   PATCH /api/orders/{{id}}/status - обновление статуса");
    
    HttpServer::new(move || {
        App::new()
            .wrap(Cors::permissive())
            .app_data(web::Data::new(pool.clone()))
            .route("/", web::get().to(|| async { HttpResponse::Ok().body("🚀 Cafe API is running!") }))
            .route("/api/auth/login", web::post().to(handlers::login))
            .route("/api/auth/register", web::post().to(handlers::register))
            .route("/api/products", web::get().to(handlers::get_products))
            .route("/api/orders", web::get().to(handlers::get_orders))
            .route("/api/orders", web::post().to(handlers::create_order))
            .route("/api/orders/{id}/status", web::patch().to(handlers::update_order_status))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}