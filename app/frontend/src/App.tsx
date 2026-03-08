import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Medicines } from './pages/Medicines';
import { Inventory } from './pages/Inventory';
import { POS } from './pages/POS';
import { Prescriptions } from './pages/Prescriptions';
import { Customers } from './pages/Customers';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { DrugInteractionChecker } from './pages/DrugInteractionChecker';
import { Chatbot } from './pages/Chatbot';
import { DemandPrediction } from './pages/DemandPrediction';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/prescriptions" element={<Prescriptions />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/drug-checker" element={<DrugInteractionChecker />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/demand-prediction" element={<DemandPrediction />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
