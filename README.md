# ShopPilot AI

**"Your AI-powered sales agent."**

ShopPilot AI is a polished MVP built for the **Razorpay AI Builder Internship 2026 — Track 1: AI Growth & Agentic Commerce**. It functions as an intelligent commerce agent that understands customer requirements, recommends products with explanations, suggests relevant upsells, manages the cart, and seamlessly processes payments via Razorpay (Test Mode).

## Features

- **AI Intent Detection**: Understands complex user queries (e.g., "wireless headphones under ₹3000 for coding").
- **Product Recommendation**: Uses function calling to search the catalog and recommend the best fit.
- **Smart Upsells**: Recommends accessories based on the primary product category.
- **Cart Management**: AI adds items to the cart only after user confirmation.
- **Safety Guardrails**: Strict AI policies prevent direct payment execution. The AI requests checkout confirmation, handing off to secure backend flows.
- **Razorpay Integration**: End-to-end test mode checkout flow with server-side signature verification.
- **Merchant Dashboard**: Analytics showing total revenue, AI-assisted revenue, conversion rates, and recent transactions.
- **AI Audit Trail**: Transparent logging of every AI decision (intent, upsell, cart change, checkout request).

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI (Python), SQLAlchemy (SQLite for local MVP)
- **AI**: Gemini API (`google-generativeai` with function calling)
- **Payments**: Razorpay SDK (Test Mode)

## Architecture

```text
Customer
   ↓
ShopPilot AI Agent (Next.js Chat UI)
   ↓
FastAPI Backend (/api/chat)
   ↓
Gemini 2.5 Flash (Function Calling: search_products, add_to_cart, etc.)
   ↓
User confirms Checkout
   ↓
POST /api/payments/create-order
   ↓
Razorpay Test Checkout UI
   ↓
POST /api/payments/verify
   ↓
Merchant Dashboard & AI Audit Log Updated
```

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- Python (3.10+)
- Razorpay Test Account
- Google Gemini API Key

### 1. Environment Variables

In the `backend/` directory, create or update `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```
*(If you leave Razorpay keys as `mock_id`, the app will simulate payments for demo purposes).*

### 2. Backend Setup

```bash
cd backend
python -m venv venv
# Activate venv (Windows: venv\Scripts\activate, Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt # (or install fastapi uvicorn sqlalchemy pydantic google-generativeai razorpay python-dotenv httpx)

# Seed the database with 30 products
python seed.py

# Run the server
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Demo Flow

Navigate to `/demo` in the application for a complete 5-minute presentation script.

1. **Shop & Chat**: Go to `/shop`, ask the AI for specific products.
2. **Upsell & Cart**: Ask the AI to add the product to your cart.
3. **Checkout**: Tell the AI you are ready to checkout. Navigate to `/cart`, click proceed.
4. **Payment**: Use Razorpay test credentials to complete the payment.
5. **Dashboard**: Navigate to `/dashboard` to view analytics and the AI Audit Trail.

## Failure Handling Demo

- Try closing the Razorpay popup or using a failing test card (e.g. Card ending in `0002`).
- The UI will gracefully display: *Payment unsuccessful. Your order has NOT been charged.*
- The dashboard will not record the failed payment.
