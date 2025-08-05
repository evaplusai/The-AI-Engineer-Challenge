# Environment Variables

This project uses the following environment variables:

## Required Environment Variables

### `BACKEND_API_URL`
The URL of your backend API server.

- **Development**: `http://localhost:8900`
- **Production**: Your production backend URL (e.g., `https://your-backend.vercel.app`)

## Setup Instructions

### For Development
Create a `.env.local` file in the frontend directory with:
```
BACKEND_API_URL=http://localhost:8900
```

### For Production (Vercel)
1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add `BACKEND_API_URL` with your production backend URL
4. Deploy your application

## Notes
- The `.env.local` file is automatically ignored by git for security
- Environment variables are loaded at build time in Next.js
- Make sure to restart your development server after adding environment variables 