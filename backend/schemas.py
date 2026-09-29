from datetime import datetime
from pydantic import BaseModel

class UserCreate(BaseModel):
    email: str
    password: str

class UserRead(BaseModel):
    id: int
    email: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"