from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="ShopPilot AI API")

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "ShopPilot AI Backend is running"}

# Add endpoints for products
from database import SessionLocal
import models
from fastapi import Depends
from sqlalchemy.orm import Session

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/products")
def get_products(db: Session = Depends(get_db)):
    return db.query(models.Product).all()

@app.get("/api/products/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# Chat endpoints
from pydantic import BaseModel
import agent

class ChatRequest(BaseModel):
    session_id: str
    message: str

# In-memory store for active chat sessions (MVP)
chat_sessions = {}

@app.post("/api/chat")
def chat_with_agent(req: ChatRequest):
    if req.session_id not in chat_sessions:
        chat_sessions[req.session_id] = agent.get_chat_session(req.session_id)
    
    chat = chat_sessions[req.session_id]
    
    try:
        response = chat.send_message(req.message)
        return {"response": response.text}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/cart/{session_id}")
def get_cart(session_id: str):
    if session_id not in agent.carts:
        return {"items": [], "total": 0}
    
    items = agent.carts[session_id]
    total = sum(item["price"] * item["quantity"] for item in items)
    return {"items": items, "total": total}

import razorpay

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "mock_id")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "mock_secret")

@app.post("/api/payments/create-order")
def create_order(req: ChatRequest, db: Session = Depends(get_db)):
    # Reusing ChatRequest for session_id, message could be email
    session_id = req.session_id
    if session_id not in agent.carts or not agent.carts[session_id]:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Cart is empty")
        
    items = agent.carts[session_id]
    total_amount = sum(item["price"] * item["quantity"] for item in items)
    
    # 1. AI safety check (already passed if cart has items added via user confirmation)
    agent.audit_logs.append({"session_id": session_id, "action": "checkout_started", "details": f"Attempting checkout for amount {total_amount}"})
    
    # 2. Razorpay Order Creation
    if RAZORPAY_KEY_ID == "mock_id" or RAZORPAY_KEY_ID == "mock_rp_id":
        # Mock mode
        rzp_order_id = "order_mock_" + os.urandom(4).hex()
    else:
        client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
        data = { "amount": int(total_amount * 100), "currency": "INR", "receipt": session_id }
        payment = client.order.create(data=data)
        rzp_order_id = payment['id']
        
    # 3. Save to DB
    new_order = models.Order(razorpay_order_id=rzp_order_id, amount=total_amount, customer_email="demo@example.com")
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    return {"order_id": rzp_order_id, "amount": total_amount * 100, "currency": "INR", "key": RAZORPAY_KEY_ID}
