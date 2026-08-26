from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="ShopPilot AI API")

# Allow all origins so Vercel frontend can call the Render backend
FRONTEND_URL = os.getenv("FRONTEND_URL", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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

@app.on_event("startup")
async def startup_event():
    # Create tables
    from database import Base, engine
    Base.metadata.create_all(bind=engine)
    # Auto-seed if DB is empty
    db = SessionLocal()
    try:
        if db.query(models.Product).count() == 0:
            import seed
            seed.seed_db(db)
            print("Database seeded with products.")
        else:
            print(f"DB has {db.query(models.Product).count()} products.")
    finally:
        db.close()
    # Clear all cached sessions so they're recreated with the current model
    chat_sessions.clear()
    print("Chat sessions cleared on startup.")

@app.delete("/api/session/{session_id}")
def reset_session(session_id: str):
    """Clears a specific chat session so it gets recreated fresh."""
    if session_id in chat_sessions:
        del chat_sessions[session_id]
    return {"status": "cleared"}

@app.post("/api/chat")
def chat_with_agent(req: ChatRequest):
    if req.session_id not in chat_sessions:
        chat_sessions[req.session_id] = agent.get_chat_session(req.session_id)
    
    chat = chat_sessions[req.session_id]
    
    try:
        response = chat.send_message(req.message)
        # New google-genai SDK: response.text works the same
        return {"response": response.text}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e), "response": "Sorry, I encountered an error. Please try again."}

@app.get("/api/cart/{session_id}")
def get_cart(session_id: str):
    if session_id not in agent.carts:
        return {"items": [], "total": 0}
    
    items = agent.carts[session_id]
    total = sum(item["price"] * item["quantity"] for item in items)
    return {"items": items, "total": total}

class AddToCartRequest(BaseModel):
    session_id: str
    product_id: int
    quantity: int = 1

@app.post("/api/cart/add")
def add_to_cart_direct(req: AddToCartRequest, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == req.product_id).first()
    if not product:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Product not found")
    
    if req.session_id not in agent.carts:
        agent.carts[req.session_id] = []
    
    # Check if already in cart → increase quantity
    for item in agent.carts[req.session_id]:
        if item["id"] == product.id:
            item["quantity"] += req.quantity
            agent.audit_logs.append({"session_id": req.session_id, "action": "cart_change", "details": f"Increased qty of {product.name}"})
            return {"message": f"Updated cart", "items": agent.carts[req.session_id]}
    
    agent.carts[req.session_id].append({"id": product.id, "name": product.name, "price": product.price, "quantity": req.quantity})
    agent.audit_logs.append({"session_id": req.session_id, "action": "cart_change", "details": f"Added {product.name} to cart via product page"})
    return {"message": f"Added {product.name} to cart", "items": agent.carts[req.session_id]}

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

class VerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

@app.post("/api/payments/verify")
def verify_payment(req: VerifyRequest, db: Session = Depends(get_db)):
    # 1. Signature Verification
    if RAZORPAY_KEY_ID == "mock_id" or RAZORPAY_KEY_ID == "mock_rp_id":
        is_valid = True
    else:
        try:
            client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
            client.utility.verify_payment_signature({
                'razorpay_order_id': req.razorpay_order_id,
                'razorpay_payment_id': req.razorpay_payment_id,
                'razorpay_signature': req.razorpay_signature
            })
            is_valid = True
        except Exception as e:
            is_valid = False

    if is_valid:
        order = db.query(models.Order).filter(models.Order.razorpay_order_id == req.razorpay_order_id).first()
        if order:
            order.status = "paid"
            order.razorpay_payment_id = req.razorpay_payment_id
            db.commit()
            agent.audit_logs.append({"session_id": "verified", "action": "payment_success", "details": f"Order {order.id} paid successfully"})
            
            if "demo-session-123" in agent.carts:
                agent.carts["demo-session-123"] = []

        return {"status": "success"}
    else:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Signature verification failed")

from fastapi import Request
@app.post("/api/payments/webhook")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.json()
    return {"status": "received"}

@app.get("/api/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    orders = db.query(models.Order).filter(models.Order.status == "paid").all()
    total_revenue = sum(o.amount for o in orders)
    
    # Mocking some AI metrics based on total_revenue for demo
    ai_assisted_revenue = total_revenue * 0.8
    upsell_revenue = total_revenue * 0.15
    
    return {
        "total_revenue": total_revenue,
        "ai_assisted_revenue": ai_assisted_revenue,
        "orders_count": len(orders),
        "average_order_value": total_revenue / len(orders) if orders else 0,
        "conversion_rate": "12.5%", # Mock conversion rate
        "upsell_revenue": upsell_revenue,
        "recommendation_conversion": "18.2%",
        "recent_transactions": [
            {"id": o.id, "amount": o.amount, "status": o.status, "email": o.customer_email} 
            for o in reversed(orders[-5:])
        ]
    }

@app.get("/api/dashboard/audit")
def get_audit_logs():
    return agent.audit_logs[::-1] # Reverse to show newest first
