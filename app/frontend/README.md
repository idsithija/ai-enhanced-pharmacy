# Pharmacy Management System — Frontend

React 19 + TypeScript + Vite single-page application with Tailwind CSS.

## Tech Stack

- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Routing:** React Router 7
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Icons:** Lucide React
- **Forms:** Formik + Yup

## Project Structure

```
frontend/src/
├── App.tsx               # Root component with routes
├── main.tsx              # Entry point
├── pages/                # Page components
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Medicines.tsx
│   ├── Inventory.tsx
│   ├── POS.tsx
│   ├── Prescriptions.tsx
│   ├── Customers.tsx
│   ├── Reports.tsx
│   ├── Settings.tsx
│   ├── Chatbot.tsx
│   ├── DrugInteractionChecker.tsx
│   ├── DemandPrediction.tsx
│   ├── PlaceOrder.tsx
│   └── MyOrders.tsx
├── components/           # Shared components
├── services/             # API client services
├── store/                # Zustand stores
├── layouts/              # Page layouts
├── hooks/                # Custom hooks
├── types/                # TypeScript types
├── theme/                # Theme configuration
└── utils/                # Utilities
```

## Scripts

```bash
npm run dev        # Start dev server (http://localhost:5173)
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Login | User authentication |
| `/register` | Register | New user registration |
| `/dashboard` | Dashboard | Overview with stats and charts |
| `/medicines` | Medicines | Medicine catalog management |
| `/inventory` | Inventory | Stock management |
| `/pos` | POS | Point of sale interface |
| `/prescriptions` | Prescriptions | Prescription management |
| `/customers` | Customers | Customer profiles and loyalty |
| `/reports` | Reports | Sales and inventory reports |
| `/settings` | Settings | User settings |
| `/drug-checker` | Drug Checker | Drug interaction checker |
| `/chatbot` | Chatbot | AI pharmacy assistant |
| `/demand-prediction` | Demand Prediction | Inventory forecasting |
| `/place-order` | Place Order | Create purchase orders |
| `/my-orders` | My Orders | Order history |

## License

MIT © @idsithija
