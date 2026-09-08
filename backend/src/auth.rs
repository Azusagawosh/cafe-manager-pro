use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey};
use serde::{Serialize, Deserialize};
use chrono::{Utc, Duration};
use regex::Regex;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: i32,
    pub username: String,
    pub role: String,
    pub exp: usize,
}

pub fn create_token(user_id: i32, username: &str, role: &str) -> String {
    let expiration = Utc::now()
        .checked_add_signed(Duration::hours(24))
        .unwrap()
        .timestamp() as usize;

    let claims = Claims {
        sub: user_id,
        username: username.to_string(),
        role: role.to_string(),
        exp: expiration,
    };

    let secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "my_secret_key".to_string());
    encode(&Header::default(), &claims, &EncodingKey::from_secret(secret.as_ref())).unwrap()
}

pub fn verify_token(token: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
    let secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "my_secret_key".to_string());
    let decoding_key = DecodingKey::from_secret(secret.as_ref());
    let validation = Validation::default();
    decode::<Claims>(token, &decoding_key, &validation).map(|data| data.claims)
}

/// Проверяет валидность email
pub fn is_valid_email(email: &str) -> bool {
    let email_regex = Regex::new(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$").unwrap();
    email_regex.is_match(email)
}

/// Проверяет валидность username (3-20 символов, буквы/цифры/подчёркивание)
pub fn is_valid_username(username: &str) -> bool {
    let username_regex = Regex::new(r"^[a-zA-Z0-9_]{3,20}$").unwrap();
    username_regex.is_match(username)
}

/// Проверяет валидность пароля (минимум 6 символов)
pub fn is_valid_password(password: &str) -> bool {
    password.len() >= 6
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_and_verify_token() {
        let token = create_token(1, "testuser", "admin");
        assert!(!token.is_empty());

        let claims = verify_token(&token);
        assert!(claims.is_ok());
        let claims = claims.unwrap();
        assert_eq!(claims.sub, 1);
        assert_eq!(claims.username, "testuser");
        assert_eq!(claims.role, "admin");
    }

    #[test]
    fn test_invalid_token() {
        let result = verify_token("invalid_token");
        assert!(result.is_err());
    }

    #[test]
    fn test_valid_email() {
        assert!(is_valid_email("test@example.com"));
        assert!(is_valid_email("user.name@domain.org"));
        assert!(!is_valid_email("invalid"));
        assert!(!is_valid_email("missing@domain"));
    }

    #[test]
    fn test_valid_username() {
        assert!(is_valid_username("john123"));
        assert!(is_valid_username("admin_user"));
        assert!(!is_valid_username("ab")); // слишком короткий
        assert!(!is_valid_username("user with spaces"));
        assert!(!is_valid_username("user@invalid"));
    }

    #[test]
    fn test_valid_password() {
        assert!(is_valid_password("123456"));
        assert!(is_valid_password("securePassword123"));
        assert!(!is_valid_password("12345")); // слишком короткий
    }
}