# Backend API Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** (v14 or higher)
3. **npm** or **yarn**

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Setup

#### Create PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE pharmacy_db;

# Exit psql
\q
```

#### Configure Environment Variables

The `.env` file is already created with default values. Update if needed:

```env
DB_NAME=pharmacy_db
DB_USER=postgres
DB_PASSWORD=123456789
DB_HOST=localhost
DB_PORT=5432
```

### 3. Seed Initial Data

```bash
npm run seed
```

This will create:
- ✅ 3 users (admin, pharmacist, cashier)
- ✅ 5 sample medicines
- ✅ 2 sample customers
- ✅ 2 sample suppliers
- ✅ Sample inventory records

**Login Credentials:**
```
Admin:      admin@pharmacy.com / admin123
Pharmacist: pharmacist@pharmacy.com / pharmacist123
Cashier:    cashier@pharmacy.com / cashier123
```

### 4. Start Development Server

```bash
npm run dev
```

Server will start on: `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)
- `PUT /api/auth/change-password` - Change password (protected)

### Medicines
- `GET /api/medicines` - Get all medicines (with pagination & search)
- `GET /api/medicines/:id` - Get single medicine
- `POST /api/medicines` - Create medicine (protected)
- `PUT /api/medicines/:id` - Update medicine (protected)
- `DELETE /api/medicines/:id` - Delete medicine (protected)

### Inventory
- `GET /api/inventory` - Get inventory items
- `GET /api/inventory/:id` - Get inventory item
- `POST /api/inventory` - Add stock (protected)
- `PUT /api/inventory/:id` - Update stock (protected)
- `DELETE /api/inventory/:id` - Remove stock (protected)
- `GET /api/inventory/low-stock` - Get low stock items
- `GET /api/inventory/expiring` - Get expiring items

### Sales (POS)
- `GET /api/sales` - Get all sales
- `GET /api/sales/:id` - Get single sale
- `POST /api/sales` - Create sale (protected)
- `GET /api/sales/summary` - Get sales summary

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get single customer
- `GET /api/customers/phone/:phone` - Find by phone
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `POST /api/customers/:id/loyalty/add` - Add loyalty points
- `GET /api/customers/stats` - Get customer statistics

### Prescriptions
- `GET /api/prescriptions` - Get all prescriptions
- `GET /api/prescriptions/:id` - Get single prescription
- `POST /api/prescriptions` - Create prescription (protected)
- `PUT /api/prescriptions/:id` - Update prescription (protected)
- `POST /api/prescriptions/:id/verify` - Verify prescription (pharmacist)
- `POST /api/prescriptions/:id/dispense` - Dispense prescription (pharmacist)
- `POST /api/prescriptions/upload` - Upload prescription image

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/:id` - Get single supplier
- `POST /api/suppliers` - Create supplier (protected)
- `PUT /api/suppliers/:id` - Update supplier (protected)
- `DELETE /api/suppliers/:id` - Delete supplier (protected)

### Purchase Orders
- `GET /api/purchase-orders` - Get all purchase orders
- `GET /api/purchase-orders/:id` - Get single purchase order
- `POST /api/purchase-orders` - Create purchase order (protected)
- `PUT /api/purchase-orders/:id` - Update purchase order (protected)
- `POST /api/purchase-orders/:id/approve` - Approve order (protected)

### Reports
- `GET /api/reports/sales` - Sales report
- `GET /api/reports/inventory` - Inventory report
- `GET /api/reports/customers` - Customer report
- `GET /api/reports/financial` - Financial report
- `GET /api/reports/export` - Export report as CSV

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-sales` - Get recent sales
- `GET /api/dashboard/low-stock` - Get low stock alerts

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

## Testing the API

### Using curl

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pharmacy.com","password":"admin123"}'

# Get medicines (with token)
curl http://localhost:5000/api/medicines \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman or Thunder Client

1. Import the endpoints
2. Set base URL: `http://localhost:5000`
3. Add Authorization header with Bearer token after login

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database and app configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware (auth, error handling)
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions, seed script
│   ├── scripts/         # Database scripts
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── uploads/             # File uploads directory
├── .env                 # Environment variables
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript configuration
```

## Development Tips

1. **Auto-reload**: The dev server uses `tsx watch` for automatic recompilation
2. **Database Reset**: If you need to reset the database, drop it and recreate:
   ```bash
   psql -U postgres -c "DROP DATABASE pharmacy_db;"
   psql -U postgres -c "CREATE DATABASE pharmacy_db;"
   npm run seed
   ```
3. **Logs**: All requests are logged in development mode with Morgan
4. **Errors**: Check console for detailed error messages

## Production Deployment

1. Build the TypeScript code:
   ```bash
   npm run build
   ```

2. Set environment variables:
   ```bash
   export NODE_ENV=production
   export DB_PASSWORD=your_secure_password
   export JWT_SECRET=your_secure_jwt_secret
   ```

3. Start the server:
   ```bash
   npm start
   ```

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running: `sudo service postgresql status`
- Check credentials in `.env` file
- Verify database exists: `psql -U postgres -l`

### Port Already in Use
- Change PORT in `.env` file
- Or kill the process using port 5000:
  ```bash
  lsof -ti:5000 | xargs kill -9  # macOS/Linux
  ```

### Module Not Found Errors
- Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

## Need Help?

Check the logs in the console - they provide detailed information about errors and requests.
