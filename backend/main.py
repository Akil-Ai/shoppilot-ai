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
        chat_sessions[req.session_id] = agent.get_chat_session()
    
    chat = chat_sessions[req.session_id]
    
    try:
        response = chat.send_message(req.message)
        return {"response": response.text}
    except Exception as e:
        return {"error": str(e)}
