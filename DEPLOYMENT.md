# Deployment Guide for KGN Mobile Accessories

This project uses a monorepo structure with a Next.js frontend and a Node.js Express backend. Follow these steps to deploy your application to production.

## 1. Database (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Set up a Database User with a username and password.
3. Whitelist all IP addresses (`0.0.0.0/0`) in Network Access so your backend can connect.
4. Copy the connection string (URI). It will look like `mongodb+srv://<username>:<password>@cluster.mongodb.net/kgn_ecommerce?retryWrites=true&w=majority`.

## 2. Backend Deployment (Render or Railway)
We recommend deploying the backend to [Render.com](https://render.com) for easy CI/CD.

1. Push your code to a GitHub repository.
2. Go to Render Dashboard -> **New Web Service**.
3. Connect your GitHub repository.
4. Settings:
   - **Root Directory**: `backend` (Important: since it's a monorepo, you must specify the backend folder).
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (Make sure `package.json` in backend has `"start": "node server.js"`).
5. Environment Variables (Add these in Render):
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (or whatever Render assigns)
   - `MONGO_URI`: *Your MongoDB Atlas connection string*
   - `JWT_SECRET`: *Generate a strong random string*
6. Deploy the backend and copy the live URL (e.g., `https://kgn-backend.onrender.com`).

## 3. Frontend Deployment (Vercel)
Vercel is the creator of Next.js and provides the absolute best hosting for it.

1. Go to [Vercel](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. Settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend` (Crucial step!).
   - **Build Command**: Leave as default (`npm run build`).
4. Environment Variables:
   - If you plan to make API requests to your live backend, you will need to setup an environment variable for the API URL in the frontend, for example `NEXT_PUBLIC_API_URL=https://kgn-backend.onrender.com`. 
   - *Note: In `frontend/src/components/home/FeaturedProducts.tsx`, you currently have `http://localhost:5000` hardcoded. Change this to use `process.env.NEXT_PUBLIC_API_URL` before deploying!*
5. Click **Deploy**.

## Final Polish
- Ensure your Stripe API keys are added to the backend when you are ready to process real payments.
- Configure a custom domain in Vercel for the frontend (e.g., `kgn-accessories.com`).
