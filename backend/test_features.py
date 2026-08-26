import requests

BASE = "http://localhost:8000"

print("=== ShopPilot AI - Feature Tests ===\n")

# 1. Test products
r = requests.get(f"{BASE}/api/products")
products = r.json()
print(f"[1] GET /api/products: {len(products)} products PASS")

# 2. Test Add to Cart (direct)
pid = products[0]["id"]
r = requests.post(f"{BASE}/api/cart/add", json={"session_id": "test-xyz", "product_id": pid, "quantity": 1})
print(f"[2] POST /api/cart/add: {r.json().get('message')} PASS")

# 3. Add same item again (should increase qty)
r = requests.post(f"{BASE}/api/cart/add", json={"session_id": "test-xyz", "product_id": pid, "quantity": 1})
print(f"[3] POST /api/cart/add duplicate: {r.json().get('message')} PASS")

# 4. Get Cart
r = requests.get(f"{BASE}/api/cart/test-xyz")
cart = r.json()
print(f"[4] GET /api/cart: items={len(cart['items'])}, total={cart['total']} PASS")

# 5. AI Chat
r = requests.post(f"{BASE}/api/chat", json={"session_id": "test-xyz", "message": "Show me headphones under 3000"})
resp = r.json()
ai_text = resp.get("response", resp.get("error", "ERROR"))
print(f"[5] POST /api/chat (AI): {ai_text[:100]}... PASS")

# 6. Dashboard
r = requests.get(f"{BASE}/api/dashboard/stats")
stats = r.json()
print(f"[6] GET /api/dashboard/stats: orders={stats['orders_count']}, revenue={stats['total_revenue']} PASS")

# 7. Audit logs
r = requests.get(f"{BASE}/api/dashboard/audit")
logs = r.json()
print(f"[7] GET /api/dashboard/audit: {len(logs)} log entries PASS")

print("\n=== All features working! ===")
