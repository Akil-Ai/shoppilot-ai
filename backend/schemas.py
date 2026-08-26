from pydantic import BaseModel
from typing import List, Optional

class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image_url: str
    stock: int
    features: str

class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    amount: float
    customer_email: str

class OrderCreate(OrderBase):
    product_ids: List[int]
    quantities: List[int]

class Order(OrderBase):
    id: int
    razorpay_order_id: Optional[str]
    razorpay_payment_id: Optional[str]
    status: str

    class Config:
        from_attributes = True

class AuditLogCreate(BaseModel):
    session_id: str
    action_type: str
    details: str
    created_at: str

class AuditLog(AuditLogCreate):
    id: int

    class Config:
        from_attributes = True
