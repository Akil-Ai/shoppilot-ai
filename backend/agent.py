import os
import google.generativeai as genai
from sqlalchemy.orm import Session
import models
from database import SessionLocal

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key and api_key != "mock_key_for_now":
    genai.configure(api_key=api_key)

def search_products(query: str, max_price: float = None, category: str = None):
    """Searches the product catalog based on a text query, optional max price, and optional category."""
    db = SessionLocal()
    try:
        q = db.query(models.Product).filter(
            (models.Product.name.ilike(f"%{query}%")) | 
            (models.Product.description.ilike(f"%{query}%")) |
            (models.Product.features.ilike(f"%{query}%"))
        )
        if max_price:
            q = q.filter(models.Product.price <= max_price)
        if category:
            q = q.filter(models.Product.category.ilike(f"%{category}%"))
        
        products = q.limit(5).all()
        return [{"id": p.id, "name": p.name, "price": p.price, "category": p.category, "description": p.description} for p in products]
    finally:
        db.close()

def get_product(product_id: int):
    """Gets detailed information about a specific product by its ID."""
    db = SessionLocal()
    try:
        p = db.query(models.Product).filter(models.Product.id == product_id).first()
        if p:
            return {"id": p.id, "name": p.name, "price": p.price, "category": p.category, "description": p.description, "features": p.features}
        return {"error": "Product not found"}
    finally:
        db.close()

def recommend_products(preferences: str):
    """Recommends products based on user preferences or use cases (e.g. 'coding and travel')."""
    # For MVP, we use search_products under the hood but AI knows this is for recommendations.
    return search_products(preferences)

# We will add more tools in Phase 4 (upsell, cart, etc.)
tools = [search_products, get_product, recommend_products]

def get_chat_session():
    """Returns a new Gemini chat session with tools configured."""
    model = genai.GenerativeModel(
        model_name='gemini-2.5-flash',
        tools=tools,
        system_instruction=(
            "You are ShopPilot, a helpful and premium AI shopping assistant for an ecommerce store. "
            "Your goal is to help users find products, recommend the best fits, and explain your recommendations concisely. "
            "Use the provided tools to search the catalog and get product details. "
            "Always be polite, concise, and do not expose internal tool names to the user. "
            "Format product recommendations nicely with the price."
        )
    )
    return model.start_chat(enable_automatic_function_calling=True)
