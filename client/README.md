# LifeNet client

The React and Vite interface for the LifeNet coordination app. Follow the repository-level [README](../README.md) for managed MongoDB setup, local development, demo accounts, and deployment.

For local development, install this folder’s locked dependencies and run `npm run dev`. The development server proxies `/api` and `/socket.io` to `http://localhost:5000`. The database connection string belongs only in `server/.env`; never expose it through a `VITE_` variable. Use `client/.env.example` only when pointing the client directly at a separate API origin.
