import json
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models

# Create tables
Base.metadata.create_all(bind=engine)

products_data = [
    {
        "name": "SoundMax Pro",
        "description": "Premium wireless headphones with Active Noise Cancellation (ANC), 40-hour battery life, and crystal-clear sound.",
        "price": 2799.0,
        "category": "Headphones",
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        "stock": 50,
        "features": json.dumps(["ANC", "40h battery", "Bluetooth 5.3", "Over-ear"])
    },
    {
        "name": "SoundMax Lite",
        "description": "Lightweight wireless earbuds with punchy bass and water resistance for workouts.",
        "price": 1499.0,
        "category": "Headphones",
        "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80",
        "stock": 100,
        "features": json.dumps(["Water resistant", "20h battery", "In-ear"])
    },
    {
        "name": "AeroTech Backpack",
        "description": "Ergonomic laptop backpack with anti-theft compartments and USB charging port.",
        "price": 1999.0,
        "category": "Backpacks",
        "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
        "stock": 30,
        "features": json.dumps(["Anti-theft", "USB charging", "Water resistant", "15.6 inch laptop compartment"])
    },
    {
        "name": "TravelMate Daypack",
        "description": "Compact and stylish daypack for daily commute and light travel.",
        "price": 1299.0,
        "category": "Backpacks",
        "image_url": "https://images.unsplash.com/photo-1491897554428-130a60dd4757?w=800&q=80",
        "stock": 40,
        "features": json.dumps(["Lightweight", "Stylish", "Multiple pockets"])
    },
    {
        "name": "ProType Mechanical Keyboard",
        "description": "Tactile mechanical keyboard with RGB backlighting and durable switches.",
        "price": 3499.0,
        "category": "Laptop accessories",
        "image_url": "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80",
        "stock": 25,
        "features": json.dumps(["Mechanical switches", "RGB lighting", "Ergonomic"])
    },
    {
        "name": "ErgoGrip Mouse",
        "description": "Ergonomic wireless mouse designed to reduce wrist strain during long coding sessions.",
        "price": 1199.0,
        "category": "Laptop accessories",
        "image_url": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80",
        "stock": 60,
        "features": json.dumps(["Ergonomic", "Wireless", "Adjustable DPI"])
    },
    {
        "name": "VisionX Smartwatch",
        "description": "Fitness tracking smartwatch with heart rate monitor, sleep tracking, and OLED display.",
        "price": 4999.0,
        "category": "Smartwatches",
        "image_url": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80",
        "stock": 20,
        "features": json.dumps(["Heart rate monitor", "OLED display", "Waterproof"])
    },
    {
        "name": "FitTrack Band",
        "description": "Slim fitness tracker to monitor daily steps and calories burned.",
        "price": 1499.0,
        "category": "Smartwatches",
        "image_url": "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b0?w=800&q=80",
        "stock": 80,
        "features": json.dumps(["Step tracking", "Slim design", "Long battery"])
    },
    {
        "name": "PowerBoost Power Bank 10000mAh",
        "description": "Fast charging 10000mAh power bank with dual USB outputs.",
        "price": 999.0,
        "category": "Mobile accessories",
        "image_url": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80",
        "stock": 100,
        "features": json.dumps(["10000mAh", "Fast charging", "Dual output"])
    },
    {
        "name": "CrystalClear Phone Case",
        "description": "Shock-absorbent transparent phone case for maximum protection.",
        "price": 499.0,
        "category": "Mobile accessories",
        "image_url": "https://images.unsplash.com/photo-1601593346740-925612772716?w=800&q=80",
        "stock": 150,
        "features": json.dumps(["Transparent", "Shock-absorbent", "Anti-yellowing"])
    },
    {
        "name": "Titanium Gaming Headset",
        "description": "Immersive 7.1 surround sound gaming headset with noise-canceling microphone.",
        "price": 3299.0,
        "category": "Gaming accessories",
        "image_url": "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80",
        "stock": 35,
        "features": json.dumps(["7.1 Surround", "Noise-canceling mic", "RGB lighting"])
    },
    {
        "name": "UltraGlide Gaming Mousepad",
        "description": "Extended gaming mousepad with smooth surface and anti-slip rubber base.",
        "price": 699.0,
        "category": "Gaming accessories",
        "image_url": "https://images.unsplash.com/photo-1527814050087-379381547330?w=800&q=80",
        "stock": 75,
        "features": json.dumps(["Extended size", "Smooth surface", "Anti-slip"])
    },
    {
        "name": "Aura Smart Desk Lamp",
        "description": "Adjustable LED desk lamp with multiple color temperatures and wireless charging base.",
        "price": 2499.0,
        "category": "Electronics",
        "image_url": "https://images.unsplash.com/photo-1517705008128-361805f42e86?w=800&q=80",
        "stock": 45,
        "features": json.dumps(["Adjustable brightness", "Wireless charging", "Eye-care LED"])
    },
    {
        "name": "Nova 4K Webcam",
        "description": "High-definition 4K webcam with built-in dual microphones for professional video calls.",
        "price": 4199.0,
        "category": "Electronics",
        "image_url": "https://images.unsplash.com/photo-1621259182978-fbf93132e53d?w=800&q=80",
        "stock": 25,
        "features": json.dumps(["4K resolution", "Dual mics", "Auto-focus"])
    },
    # Generating rest of the 30 products...
    {
        "name": "Zenith Noise Cancelling Earbuds",
        "description": "Premium in-ear wireless earbuds featuring adaptive ANC and 360 audio.",
        "price": 3999.0,
        "category": "Headphones",
        "image_url": "https://images.unsplash.com/photo-1606220588913-b3aecb492021?w=800&q=80",
        "stock": 30,
        "features": json.dumps(["Adaptive ANC", "360 Audio", "Compact case"])
    },
    {
        "name": "Commuter Messenger Bag",
        "description": "Water-resistant messenger bag ideal for daily office commute.",
        "price": 1799.0,
        "category": "Backpacks",
        "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80", # Using placeholder for now
        "stock": 45,
        "features": json.dumps(["Water-resistant", "14 inch laptop sleeve", "Adjustable strap"])
    },
    {
        "name": "UltraStand Laptop Riser",
        "description": "Aluminium foldable laptop stand to improve posture and laptop cooling.",
        "price": 899.0,
        "category": "Laptop accessories",
        "image_url": "https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?w=800&q=80",
        "stock": 120,
        "features": json.dumps(["Aluminium", "Foldable", "Improves cooling"])
    },
    {
        "name": "Velocity Smart Ring",
        "description": "Sleek smart ring for advanced health and sleep tracking.",
        "price": 6999.0,
        "category": "Smartwatches",
        "image_url": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80", # Placeholder
        "stock": 15,
        "features": json.dumps(["Health tracking", "Titanium build", "Waterproof"])
    },
    {
        "name": "TurboCharge 65W GaN Charger",
        "description": "Compact 65W GaN charger capable of charging laptops and phones simultaneously.",
        "price": 1899.0,
        "category": "Mobile accessories",
        "image_url": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80",
        "stock": 80,
        "features": json.dumps(["65W", "GaN Technology", "Multiple ports"])
    },
    {
        "name": "HyperSwitch Gaming Controller",
        "description": "Wireless gaming controller with customizable paddles and low latency.",
        "price": 2999.0,
        "category": "Gaming accessories",
        "image_url": "https://images.unsplash.com/photo-1605901309584-818e25960b8f?w=800&q=80",
        "stock": 40,
        "features": json.dumps(["Wireless", "Customizable paddles", "Low latency"])
    },
    {
        "name": "Echo Pod Smart Speaker",
        "description": "Voice-controlled smart speaker with rich sound and smart home hub capabilities.",
        "price": 2499.0,
        "category": "Electronics",
        "image_url": "https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&q=80",
        "stock": 60,
        "features": json.dumps(["Voice control", "Smart home hub", "Rich sound"])
    },
    {
        "name": "PureSound Studio Monitors",
        "description": "Professional-grade studio monitor speakers for accurate audio mixing.",
        "price": 8999.0,
        "category": "Headphones",
        "image_url": "https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&q=80",
        "stock": 10,
        "features": json.dumps(["Studio grade", "Flat response", "Active monitor"])
    },
    {
        "name": "Trekker Hiking Backpack",
        "description": "50L hiking backpack with hydration bladder compartment and rain cover.",
        "price": 3499.0,
        "category": "Backpacks",
        "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
        "stock": 25,
        "features": json.dumps(["50L capacity", "Rain cover", "Hydration compatible"])
    },
    {
        "name": "FlexiHub USB-C Adapter",
        "description": "7-in-1 USB-C hub with HDMI, SD card reader, and USB 3.0 ports.",
        "price": 1499.0,
        "category": "Laptop accessories",
        "image_url": "https://images.unsplash.com/photo-1616422285623-14bf73f7c46b?w=800&q=80",
        "stock": 90,
        "features": json.dumps(["7-in-1", "HDMI output", "USB 3.0"])
    },
    {
        "name": "Vitality Classic Watch",
        "description": "Hybrid smartwatch combining analog looks with hidden smart features.",
        "price": 5499.0,
        "category": "Smartwatches",
        "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
        "stock": 20,
        "features": json.dumps(["Hybrid design", "Notification alerts", "Activity tracking"])
    },
    {
        "name": "Magneto Wireless Car Mount",
        "description": "Magnetic wireless car charger for secure and fast charging on the go.",
        "price": 1299.0,
        "category": "Mobile accessories",
        "image_url": "https://images.unsplash.com/photo-1601593346740-925612772716?w=800&q=80", # Placeholder
        "stock": 70,
        "features": json.dumps(["Magnetic mount", "Fast wireless charging", "Air vent clip"])
    },
    {
        "name": "Sniper Precision Mouse",
        "description": "Ultra-lightweight gaming mouse with high-precision optical sensor.",
        "price": 2199.0,
        "category": "Gaming accessories",
        "image_url": "https://images.unsplash.com/photo-1527814050087-379381547330?w=800&q=80", # Placeholder
        "stock": 45,
        "features": json.dumps(["Ultra-lightweight", "High DPI sensor", "RGB"])
    },
    {
        "name": "Lumina Ring Light",
        "description": "10-inch LED ring light with tripod stand for streaming and video creation.",
        "price": 1199.0,
        "category": "Electronics",
        "image_url": "https://images.unsplash.com/photo-1616422285623-14bf73f7c46b?w=800&q=80", # Placeholder
        "stock": 55,
        "features": json.dumps(["10-inch", "Tripod included", "Multiple color modes"])
    },
    {
        "name": "AudioForge Bone Conduction",
        "description": "Open-ear bone conduction headphones for safe outdoor running.",
        "price": 3199.0,
        "category": "Headphones",
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", # Placeholder
        "stock": 35,
        "features": json.dumps(["Bone conduction", "Open-ear", "Sweatproof"])
    },
    {
        "name": "Urbanite Sling Bag",
        "description": "Compact cross-body sling bag for carrying essentials securely.",
        "price": 799.0,
        "category": "Backpacks",
        "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80", # Placeholder
        "stock": 65,
        "features": json.dumps(["Cross-body", "Compact", "Security pocket"])
    }
]

def seed_data():
    db = SessionLocal()
    # Check if we already have products
    existing = db.query(models.Product).first()
    if not existing:
        for p_data in products_data:
            product = models.Product(**p_data)
            db.add(product)
        db.commit()
        print("Database seeded successfully with 30 products.")
    else:
        print("Database already seeded.")
    db.close()

if __name__ == "__main__":
    seed_data()
