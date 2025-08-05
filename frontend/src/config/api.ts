export const API_CONFIG = {
  // Base URL for the API
  baseUrl: process.env.BACKEND_API_URL || (process.env.NODE_ENV === "development" 
    ? "http://localhost:8900" 
    : ""),
  
  // API endpoints
  endpoints: {
    chat: "/api/chat",
    health: "/api/health",
  },
  
  // Get full URL for an endpoint
  getUrl: (endpoint: string) => `${API_CONFIG.baseUrl}${endpoint}`,
  
  // Get chat URL
  getChatUrl: () => API_CONFIG.getUrl(API_CONFIG.endpoints.chat),
  
  // Get health URL
  getHealthUrl: () => API_CONFIG.getUrl(API_CONFIG.endpoints.health),
}; 