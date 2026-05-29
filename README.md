# ☕ Cafe Manager Pro - Система управления кафе

## О проекте

Полноценная система управления кафе/рестораном с авторизацией, управлением заказами, корзиной и администрированием.

## Технологии

**Backend:** Rust + Actix-web + SQLx + SQLite + JWT + bcrypt
**Frontend:** React + TypeScript + Vite + Ant Design + Tailwind CSS

## Функционал

- Авторизация и регистрация (JWT токены)
- Просмотр меню с категориями (кофе, чай, десерты, завтраки, сэндвичи)
- Корзина заказов с изменением количества
- Автоматический подсчет суммы
- Типы заказов: В зале (стол + гости), С собой (клиент), Доставка (клиент + курьер)
- Комментарии к заказу
- История заказов
- Смена статуса заказа (В обработке → Оплачен/Отменён)
- Статистика на дашборде (выручка, количество заказов)

## Установка и запуск

### Требования
- Rust 1.70+
- Node.js 18+
- SQLite 3

### 1. Backend

```bash
cd backend

# Создать .env
cat > .env << 'EOF'
DATABASE_URL=sqlite:cafe.db
JWT_SECRET=my_super_secret_key_2024
RUST_LOG=info
EOF

# Создать базу данных
sqlite3 cafe.db << 'EOF'
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    is_available INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_id INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    order_type TEXT DEFAULT 'dine_in',
    people_count INTEGER DEFAULT 1,
    comment TEXT,
    courier_name TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    created_at TEXT
);

INSERT INTO users (username, password_hash, role) VALUES 
('admin', '$2b$12$YlC3TqQzNX4rYwZqZVpNQeU5N3oLcVpGjZqYqYqYqYqYqYqYqYq', 'admin');

-- Добавляем тестовые продукты
INSERT INTO products (name, price, category) VALUES
('☕ Эспрессо', 900, 'Кофе'),
('☕ Доппио', 1200, 'Кофе'),
('☕ Американо', 1200, 'Кофе'),
('☕ Капучино', 1700, 'Кофе'),
('☕ Латте', 1900, 'Кофе'),
('☕ Флэт уайт', 1900, 'Кофе'),
('☕ Раф ванильный', 2400, 'Кофе'),
('🍵 Чай с жасмином', 1600, 'Чай'),
('🍵 Эрл Грей', 1600, 'Чай'),
('🍵 Марокканский чай', 2100, 'Чай'),
('🥤 Лимонад маракуйя-мята', 2600, 'Холодные напитки'),
('🥤 Клубничный лимонад', 2500, 'Холодные напитки'),
('🍰 Тирамису', 2700, 'Десерты'),
('🍰 Медовик', 2200, 'Десерты'),
('🍰 Чизкейк Орео', 2800, 'Десерты'),
('🥞 Французский омлет', 3200, 'Завтраки'),
('🥞 Сырники со сметаной', 3400, 'Завтраки'),
('🥪 Сэндвич с курицей', 3600, 'Сэндвичи'),
('🥪 Тост с лососем', 4800, 'Сэндвичи'),
('🍟 Картофель фри', 1700, 'Снэки'),
('🍗 Наггетсы', 2400, 'Снэки');
EOF

# Запуск
cargo run

cd frontend
npm install
npm run dev

3. Данные для входа
Логин	  Пароль	    Роль
admin	  admin123	  Администратор
waiter	admin123	  Официант

API       Endpoints
Метод	    Эндпоинт	                 Описание
POST	    /api/auth/login	           Авторизация
POST	    /api/auth/register	       Регистрация
GET	      /api/products	             Список продуктов
GET	      /api/orders	               Список заказов
POST	    /api/orders	               Создать заказ
PATCH	    /api/orders/{id}/status	   бновить статус

Структура проекта
cafe-system/
├── backend/
│   ├── src/
│   │   ├── main.rs
│   │   ├── handlers.rs
│   │   ├── models.rs
│   │   ├── auth.rs
│   │   └── db.rs
│   ├── Cargo.toml
│   └── .env
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   └── main.tsx
    └── package.json


🔧 Переменные окружения (.env)
Переменная	   Значение	              Описание
DATABASE_URL	 sqlite:cafe.db	        Путь к БД
JWT_SECRET	   my_super_secret_key	  Секрет для токенов
RUST_LOG	     info	                  Уровень логирования

Ошибка подключения к БД
Проверьте файл .env:
DATABASE_URL=sqlite:cafe.db


🐛 Решение проблем
Ошибка CORS
CORS уже настроен в backend. Если проблема возникает, проверьте backend/src/main.rs.
Порт уже занят
# Linux/Mac
lsof -i :8080
kill -9 <PID>

# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F



## 📄 Лицензия

MIT License - свободное использование, копирование, модификация.

## 👤 Автор

Разработано специально для системы управления кафе.

## 🙏 Благодарности

- [Ant Design](https://ant.design/) - за UI компоненты
- [Actix Web](https://actix.rs/) - за производительный фреймворк
- [Rust](https://www.rust-lang.org/) - за надежность

## ⭐ Поддержка

Если проект вам понравился, поставьте звезду на GitHub!

---

**Разработано с ❤️ для вашего кафе**

