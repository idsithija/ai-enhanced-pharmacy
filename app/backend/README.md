# Pharmacy Management System — Backend

Express + TypeScript + PostgreSQL API server with AI-powered services.

## Tech Stack

- **Runtime:** Node.js 18+ with TypeScript (ES Modules)
- **Framework:** Express.js
- **Database:** PostgreSQL 14+ with Sequelize ORM
- **Auth:** JWT with bcrypt password hashing
- **AI:** Tesseract.js (OCR), Natural.js (NLP), OpenFDA API
- **Security:** Helmet, CORS, rate limiting, input validation

## Project Structure

```
backend/src/
├── app.ts             # Express app configuration
├── server.ts          # Entry point
├── config/            # Database config
├── controllers/       # Request handlers (13 modules)
├── models/            # Sequelize models (10 models)
├── routes/            # API route definitions
├── middleware/        # Auth, error handling, 404
├── services/          # AI & business logic
├── scripts/           # Database seed scripts
├── types/             # TypeScript definitions
└── utils/             # Helpers
```

## Scripts

```bash
npm run dev          # Development with hot reload
npm run build        # Compile TypeScript
npm start            # Start production server
npm run typecheck    # Type-check without building
npm test             # Run tests with coverage
npm run lint         # Lint source files
npm run format       # Format with Prettier
npm run seed         # Seed database
npm run demo-seed    # Seed with demo data
npm run db:setup     # Migrate + seed
npm run db:reset     # Reset + re-seed
npm run db:demo      # Migrate + demo seed
```

## API Endpoints (75 total)

The server runs at `http://localhost:5000`.

### Health Check
- `GET /health`

### Authentication (`/api/auth`)
- `POST /register` — Register a new user
- `POST /login` — Log in
- `GET /me` — Get current user profile
- `PUT /profile` — Update profile

### Users (`/api/users`)
- `GET /` — List all users (admin)
- `POST /` — Create user (admin)
- `GET /:id` — Get user by ID
- `PUT /:id` — Update user
- `DELETE /:id` — Deactivate user (admin)
- `GET /stats` — User statistics

### Medicines (`/api/medicines`)
- `GET /` — List medicines
- `POST /` — Create medicine
- `GET /:id` — Get medicine by ID
- `PUT /:id` — Update medicine
- `DELETE /:id` — Delete medicine

### Inventory (`/api/inventory`)
- `GET /` — List inventory
- `POST /` — Add inventory item
- `GET /:id` — Get item by ID
- `PUT /:id` — Update item
- `DELETE /:id` — Delete item (admin)
- `GET /low-stock` — Low-stock alerts
- `POST /check` — Check availability

### Customers (`/api/customers`)
- `GET /` — List customers
- `POST /` — Create customer
- `GET /:id` — Get by ID
- `PUT /:id` — Update customer
- `DELETE /:id` — Delete (admin)
- `GET /stats` — Statistics
- `GET /phone/:phoneNumber` — Find by phone
- `PUT /:id/loyalty` — Update loyalty points

### Prescriptions (`/api/prescriptions`)
- `GET /` — List prescriptions
- `POST /` — Create prescription
- `GET /:id` — Get by ID
- `PUT /:id` — Update
- `DELETE /:id` — Delete (admin)
- `PUT /:id/verify` — Verify (pharmacist)
- `PUT /:id/reject` — Reject (pharmacist)

### Sales (`/api/sales`)
- `GET /` — List sales
- `POST /` — Create sale
- `GET /:id` — Get by ID
- `GET /summary` — Sales summary

### Suppliers (`/api/suppliers`)
- `GET /` — List suppliers
- `POST /` — Create supplier
- `GET /:id` — Get by ID
- `PUT /:id` — Update
- `DELETE /:id` — Delete (admin)
- `GET /stats` — Statistics

### Purchase Orders (`/api/purchase-orders`)
- `GET /` — List orders
- `POST /` — Create order
- `GET /:id` — Get by ID
- `PUT /:id` — Update
- `DELETE /:id` — Delete (admin)
- `PUT /:id/approve` — Approve
- `PUT /:id/receive` — Mark received
- `PUT /:id/cancel` — Cancel

### Reports (`/api/reports`)
- `GET /sales` — Sales report
- `GET /inventory` — Inventory report
- `GET /profit-loss` — Profit & loss (admin)
- `GET /prescriptions` — Prescription statistics
- `GET /top-medicines` — Best-selling medicines
- `GET /customer-history/:customerId` — Customer purchase history

### Notifications (`/api/notifications`)
- `GET /` — List notifications
- `PUT /:id/read` — Mark as read
- `PUT /read-all` — Mark all as read
- `DELETE /:id` — Delete
- `POST /` — Create (admin)
- `POST /generate` — Auto-generate

### Dashboard (`/api/dashboard`)
- `GET /stats` — Dashboard statistics
- `GET /recent-sales` — Recent sales
- `GET /sales-chart` — Chart data

### AI Services (`/api/ai`)
- `POST /ocr/prescription` — Scan prescription image (OCR)
- `POST /analyze-prescription` — Analyze prescription text (NLP)
- `POST /drug-interactions` — Check drug interactions
- `GET /medication-info/:name` — Medication info lookup
- `POST /predict-demand` — Demand prediction
- `POST /chatbot` — Chatbot query

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `pharmacy_db` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | — |
| `JWT_SECRET` | JWT signing secret | — |
| `OCR_API_URL` | Python OCR service URL | `http://127.0.0.1:8000` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

## License

MIT © @idsithija
