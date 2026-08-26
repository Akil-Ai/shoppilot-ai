// Centralized API base URL - reads from environment variable
// Set NEXT_PUBLIC_API_URL in Vercel dashboard for production
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default API_URL;
