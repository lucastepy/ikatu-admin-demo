from sqlalchemy import text
from datetime import datetime, timedelta
from typing import Optional, Any
from jose import jwt, JWTError
import bcrypt
from fastapi import HTTPException, status, Depends, Header
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from context import tenant_id
import models

# Configuration
SECRET_KEY = 'supersecretkey_change_me_in_production'
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(pwd_bytes, hashed_bytes)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({'exp': expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

DEFAULT_PASSWORD = '1234'

# Common scheme for both clients and superadmin
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_tenant_id(x_tenant_id: Optional[str] = Header(None)) -> Any:
    if x_tenant_id:
        try:
            return int(x_tenant_id)
        except:
            return x_tenant_id
    return tenant_id.get()

def get_current_user_obj(token: str = Depends(oauth2_scheme)) -> models.Usuario:
    """
    Dependency to get the current user object. 
    Handles session creation and schema context manually to avoid circular imports with get_db.
    """
    from database import SessionLocal, tenant_schema
    import crud
    
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    email: str = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token payload")
        
    db = SessionLocal()
    try:
        # Forzar el esquema del tenant de forma robusta
        target = tenant_schema.get() or "public"
        db.execute(text(f'SET search_path TO "{target}", public'))
        
        # Cargamos el perfil de forma inmediata (joinedload) para evitar DetachedInstanceError
        # ya que la sesión se cierra en el bloque 'finally'.
        from sqlalchemy.orm import joinedload
        user = db.query(models.Usuario).options(
            joinedload(models.Usuario.perfil)
        ).filter(models.Usuario.usuario_email == email).first()

        if not user:
            raise HTTPException(
                status_code=401, 
                detail=f"Usuario [{email}] no encontrado en el contexto del tenant [{target}]."
            )
        return user
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
