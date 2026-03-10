import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface MenuItem {
  text: string;
  icon: string;
  path: string;
  roles?: string[]; // If undefined, visible to all authenticated users
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: '📊', path: '/dashboard' },
  { text: 'Place Order', icon: '🛒', path: '/place-order', roles: ['user'] },
  { text: 'My Orders', icon: '📦', path: '/my-orders', roles: ['user'] },
  { text: 'Medicines', icon: '💊', path: '/medicines', roles: ['admin', 'staff'] },
  { text: 'Inventory', icon: '📦', path: '/inventory', roles: ['admin', 'staff'] },
  { text: 'Point of Sale', icon: '🛒', path: '/pos', roles: ['admin', 'staff'] },
  { text: 'Prescriptions', icon: '📋', path: '/prescriptions', roles: ['admin', 'staff'] },
  { text: 'Drug Checker (AI)', icon: '🔬', path: '/drug-checker' },
  { text: 'AI Assistant', icon: '💬', path: '/chatbot' },
  { text: 'Demand Prediction', icon: '📈', path: '/demand-prediction', roles: ['admin', 'staff'] },
  { text: 'Customers', icon: '👥', path: '/customers', roles: ['admin', 'staff'] },
  { text: 'Reports', icon: '📊', path: '/reports', roles: ['admin', 'staff'] },
  { text: 'Settings', icon: '⚙️', path: '/settings' },
];

export const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleMenuClick = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 bg-dark-deeper">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-dark" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-white">PharmaCare</span>
        </div>

        {/* Menu Items */}
        <nav className="px-3 py-4 space-y-1">
          {menuItems
            .filter((item) => !item.roles || (user?.role && item.roles.includes(user.role)))
            .map((item) => (
            <button
              key={item.path}
              onClick={() => handleMenuClick(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActivePath(item.path)
                  ? 'bg-primary text-dark font-semibold'
                  : 'text-gray-300 hover:bg-dark-deeper hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm">{item.text}</span>
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-dark font-bold">
              {user?.firstName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user ? `${user.firstName} ${user.lastName}` : 'User'}</p>
              <p className="text-xs text-gray-400 truncate capitalize">{user?.role || 'Role'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <h1 className="text-xl font-semibold text-gray-800">Pharmacy Management System</h1>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-dark font-bold text-sm">
                  {user?.firstName?.charAt(0) || 'U'}
                </div>
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user ? `${user.firstName} ${user.lastName}` : ''}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <span>👤</span>
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <span>🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
