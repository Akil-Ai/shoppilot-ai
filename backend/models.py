from sqlalchemy import Column, Integer, String, Float, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    price = Column(Float)
    category = Column(String, index=True)
    image_url = Column(String)
    stock = Column(Integer, default=100)
    features = Column(Text) # JSON string of features

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    razorpay_order_id = Column(String, unique=True, index=True, nullable=True)
    razorpay_payment_id = Column(String, unique=True, index=True, nullable=True)
    amount = Column(Float)
    status = Column(String, default="pending") # pending, paid, failed
    customer_email = Column(String)

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    price_at_time = Column(Float)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    action_type = Column(String) # intent, recommendation, upsell, cart_change, checkout, etc.
    details = Column(Text) # JSON string
    created_at = Column(String) # ISO timestamp
