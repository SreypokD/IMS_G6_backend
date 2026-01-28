# IMS-G6 Backend

Node.js backend for Inventory Management System (Group 6) using Express, Sequelize, and MySQL.

## Prerequisites
- Node.js (v18+ recommended)
- MySQL Server

## Setup

1. **Clone the repository**
   ```sh
   git clone <repo-url>
   cd IMS_G6_backend
   ```
2. **Copy environment file**
   ```sh
   cp .env.example .env
   # Edit .env with your DB credentials and JWT secrets
   ```
3. **Install dependencies**
   ```sh
   npm install
   ```
4. **Initialize the database**
   - Ensure MySQL is running and the database in `.env` exists (or will be created).
   - To seed with sample data (users, roles, permissions, etc.):
     ```sh
     node scripts/seed.js
     ```
5. **Start the development server**
   ```sh
   npm run dev
   ```
   The server runs on the port specified in `.env` (default: 5001).

## Environment Variables
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`: MySQL connection
- `JWT_SECRET`, `REFRESH_SECRET`: JWT authentication
- See `.env.example` for all options

## Project Structure
- `config/` - Database and environment configuration
- `scripts/` - Utility scripts (e.g., database seeding)
- `src/`
  - `models/` - Sequelize models and associations
  - `routes/` - Express route definitions
  - `controllers/` - Route logic and business logic
  - `middleware/` - Authentication, RBAC, error handling
  - `public/uploads/` - User-uploaded files (ignored by git)
  - `index.js` - App entry point
- `utils/` - Utility/helper functions

## Features
- User authentication (JWT, refresh tokens)
- Role-based access control (RBAC) via Permission (role) model
- CRUD for products, categories, suppliers, users, permissions
- File upload support (profile images, etc.)
- Pagination and filtering for list endpoints
- Secure password hashing (bcrypt)

## Role & Permission Model
- Each user is assigned a single Permission (role) via `permissionId`.
- The Permission model contains a `permissions` array (e.g., `['view_dashboard', 'create_user']`).
- All access control is enforced via middleware using this array.
- To add new roles/permissions, update the Permission table and assign users accordingly.

## File Uploads
- Uploaded files are stored in `public/uploads/` (ignored by git).
- Ensure this directory exists and is writable by the server.

## Seeding Data
- Run `node scripts/seed.js` to populate the database with demo users, roles, permissions, categories, suppliers, and products.
- You can modify `scripts/seed.js` to customize initial data.

## API Usage
- All endpoints are prefixed with `/api` (see `src/routes/`).
- Use JWT tokens for authenticated requests (see login/register endpoints).
- Example: `Authorization: Bearer <token>`

## User Login Example

To log in and receive a JWT access token:

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```
{
  "success": true,
  "data": {
    "access_token": "<JWT token>",
    "refresh_token": "<refresh token>"
  }
}
```

Use the `access_token` in the `Authorization` header for authenticated requests:
```
Authorization: Bearer <access_token>
```

## Frontend
See [IMS-G6-frontend](../IMS_G6_frontend/README.md) for frontend setup and usage.

## Notes
- Do not commit sensitive data or uploaded files.
- For production, use a persistent store for refresh tokens and configure CORS as needed.
