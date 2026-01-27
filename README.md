
# IMS-G6 Backend

Node.js backend for Inventory Management System (Group 6) using Express, Sequelize, and MySQL.

## Setup

1. Copy `.env.example` to `.env` and fill in your database credentials.
2. Install dependencies:
   ```sh
   npm install
   ```
3. (Optional) Initialize the database with sample data:
   ```sh
   node scripts/seed.js
   ```
4. Start the server:
   ```sh
   npm run dev
   ```

## Project Structure

- `config/` - Database and environment configuration
- `scripts/` - Utility scripts (e.g., database seeding)
- `src/`
  - `models/` - Sequelize models and associations
  - `routes/` - Express route definitions
  - `controllers/` - Route logic and business logic
  - `middleware/` - Authentication, error handling, etc.
  - `index.js` - App entry point
- `utils/` - Utility/helper functions (future use)

## Features
- User authentication (JWT)
- Role-based access (admin, staff, supplier)
- Product, category, supplier, order request, and reporting endpoints

## Frontend
See [IMS-G6-frontend](../IMS-G6-frontend/README.md) for frontend setup and usage.

## User
- Email: admin@example.com
- Password: admin123
