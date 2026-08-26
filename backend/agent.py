import os
import google.generativeai as genai
from sqlalchemy.orm import Session
import models
from database import SessionLocal

api_key = os.getenv("GEMINI_API_KEY")
if api_key and api_key != "mock_key_for_now":
    genai.configure(api_key=api_key)

carts = {} # session_id -> list of product dicts
audit_logs = [] # Temporary memory for audit trail MVP

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

def suggest_upsell(product_id: int):
    """Suggests an upsell or cross-sell product related to the given product_id."""
    db = SessionLocal()
    try:
        base_p = db.query(models.Product).filter(models.Product.id == product_id).first()
        if not base_p: return {"error": "Base product not found"}
        
        # Simple logic: suggest an accessory
        if base_p.category in ["Headphones", "Electronics"]:
            upsell = db.query(models.Product).filter(models.Product.category == "Laptop accessories").first()
        else:
            upsell = db.query(models.Product).filter(models.Product.category == "Headphones").first()
            
        if upsell:
            return {"suggested_product": {"id": upsell.id, "name": upsell.name, "price": upsell.price, "reason": "Pairs well with your selection."}}
        return {"message": "No upsell available"}
    finally:
        db.close()

def get_chat_session(session_id: str):
    """Returns a new Gemini chat session with tools configured for the specific session."""
    
    if session_id not in carts:
        carts[session_id] = []
        
    def add_to_cart(product_id: int, quantity: int = 1):
        """Adds a product to the user's cart. Always confirm with the user before calling this!"""
        db = SessionLocal()
        try:
            p = db.query(models.Product).filter(models.Product.id == product_id).first()
            if p:
                carts[session_id].append({"id": p.id, "name": p.name, "price": p.price, "quantity": quantity})
                audit_logs.append({"session_id": session_id, "action": "cart_change", "details": f"Added {quantity}x {p.name} to cart"})
                return {"message": f"Added {p.name} to cart. Total items: {len(carts[session_id])}"}
            return {"error": "Product not found"}
        finally:
            db.close()
            
    def remove_from_cart(product_id: int):
        """Removes a product from the user's cart."""
        original_len = len(carts[session_id])
        carts[session_id] = [item for item in carts[session_id] if item["id"] != product_id]
        if len(carts[session_id]) < original_len:
            audit_logs.append({"session_id": session_id, "action": "cart_change", "details": f"Removed product {product_id} from cart"})
            return {"message": "Item removed"}
        return {"error": "Item not in cart"}
        
    def calculate_cart():
        """Returns the current cart items and total cost."""
        total = sum(item["price"] * item["quantity"] for item in carts[session_id])
        return {"items": carts[session_id], "total": total}

    def request_checkout_confirmation():
        """Use this to ask the user to confirm they are ready to checkout. Do NOT execute payments directly."""
        audit_logs.append({"session_id": session_id, "action": "checkout_request", "details": "Agent requested checkout confirmation"})
        return {"message": "Please confirm you want to proceed to checkout. A checkout link will be generated.", "cart_total": calculate_cart()["total"]}

    tools = [search_products, get_product, suggest_upsell, add_to_cart, remove_from_cart, calculate_cart, request_checkout_confirmation]

    model = genai.GenerativeModel(
        model_name='gemini-2.5-flash',
        tools=tools,
        system_instruction=(
            "You are ShopPilot, a helpful and premium AI shopping assistant. "
            "Help users find products, recommend fits, and suggest relevant upsells. "
            "NEVER automatically add items to the cart without user confirmation. "
            "When the user is ready to buy, use request_checkout_confirmation(). "
            "NEVER directly execute payment APIs. "
            "Keep your responses concise and do not expose internal tool names."
        )
    )
    return model.start_chat(enable_automatic_function_calling=True)
