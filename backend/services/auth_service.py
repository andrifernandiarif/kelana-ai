from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from models.user import User

from dotenv import load_dotenv
import os

load_dotenv()


# Password hashing
# bcrypt truncates at 72 bytes — we truncate explicitly to avoid passlib warnings.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

_BCRYPT_MAX_BYTES = 72


def _truncate(password: str) -> str:
    """Truncate password to 72 bytes (bcrypt hard limit) before hashing."""
    encoded = password.encode("utf-8")
    if len(encoded) <= _BCRYPT_MAX_BYTES:
        return password
    return encoded[:_BCRYPT_MAX_BYTES].decode("utf-8", errors="ignore")


def hash_password(plain_password: str) -> str:
    """Return bcrypt hash of plain_password (truncated to 72 bytes)."""
    return pwd_context.hash(_truncate(plain_password))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return True if plain_password matches the stored hash."""
    return pwd_context.verify(_truncate(plain_password), hashed_password)


# JWT token
SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "KelanaAISecretKey")
ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a signed JWT access token.

    Args:
        data: Payload to embed (typically {"sub": str(user_id)}).
        expires_delta: Custom expiry duration; defaults to ACCESS_TOKEN_EXPIRE_MINUTES.

    Returns:
        Encoded JWT string.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT access token.

    Returns:
        Decoded payload dict, or None if the token is invalid / expired.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


# User helpers
def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Fetch a User by email, or None if not found."""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Fetch a User by primary-key id, or None if not found."""
    return db.query(User).filter(User.id == user_id).first()


def register_user(db: Session, name: str, email: str, password: str) -> User:
    """Create and persist a new User.

    Raises:
        ValueError: If the email is already registered.
    """
    if get_user_by_email(db, email):
        raise ValueError("Email already registered")

    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Verify credentials and return the User, or None on failure.

    Args:
        db: Active SQLAlchemy session.
        email: Candidate email address.
        password: Plain-text password to verify.

    Returns:
        Authenticated User instance, or None if credentials are invalid.
    """
    user = get_user_by_email(db, email)
    if user is None:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user
