use sqlx::SqlitePool;

pub async fn create_pool() -> SqlitePool {
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "sqlite:cafe.db".to_string());
    
    SqlitePool::connect(&database_url)
        .await
        .expect("❌ Ошибка подключения к базе данных")
}