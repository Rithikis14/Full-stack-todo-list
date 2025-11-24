# Production & Scalability Strategy

## 1. Backend Scalability
* **Horizontal Scaling:** currently, the Node.js server runs on a single thread. In production, I would use the native `cluster` module or **PM2** to spawn a process for each CPU core.
* **Load Balancing:** Deploying behind **Nginx** or an AWS Application Load Balancer (ALB) to distribute traffic across multiple server instances.
* **Database Optimization:** * Add indexing to the `user` (email) and `task` (userId) fields in MongoDB to speed up queries.
    * Implement **Redis** caching for frequently accessed data (e.g., user profiles) to reduce database hits.

## 2. Frontend Optimization
* **CDN Delivery:** Host the static frontend build (Vite/React) on a CDN like CloudFront or Vercel Edge Network for low-latency global access.
* **State Management:** As the app grows, migrate from Context API to **Redux Toolkit** or **TanStack Query** for better server-state caching and deduplication of requests.
* **Code Splitting:** Implement `React.lazy()` to load dashboard components only when the user logs in, reducing the initial bundle size.

## 3. Security Hardening
* **Rate Limiting:** Implement `express-rate-limit` to prevent brute-force attacks on login endpoints.
* **Environment Hygiene:** Ensure strict separation of PROD and DEV keys using Docker secrets or AWS Parameter Store.
