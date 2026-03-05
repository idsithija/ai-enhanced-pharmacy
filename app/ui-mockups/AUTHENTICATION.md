# Authentication & Role-Based Access Control

## Overview
The UI mockups now include a complete authentication system with role-based access control (RBAC). Users must login before accessing any protected pages.

## User Roles & Credentials

### 1. **Admin** 👨‍💼
- **Email:** admin@pharmacy.com
- **Password:** admin123
- **Access:** Full system access (all 15 screens)

### 2. **Pharmacist** 👨‍⚕️
- **Email:** pharmacist@pharmacy.com
- **Password:** pharma123
- **Access:** Dashboard, Medicines, Inventory, POS, Prescriptions, Customers, Notifications, AI Scanner, AI Chatbot

### 3. **Cashier** 💰
- **Email:** cashier@pharmacy.com
- **Password:** cash123
- **Access:** Dashboard, POS, Customers, Notifications

### 4. **Inventory Manager** 📦
- **Email:** inventory@pharmacy.com
- **Password:** inv123
- **Access:** Dashboard, Medicines, Inventory, Suppliers, Purchase Orders, Reports, Notifications

## Features

### Authentication Flow
1. **Login Required:** All pages redirect to login if user is not authenticated
2. **Role Selection:** Users select their role before logging in
3. **Credential Validation:** Email and password are verified against user database
4. **Role Matching:** System verifies the selected role matches the account
5. **Session Management:** User data stored in sessionStorage
6. **Auto-redirect:** Successful login redirects to dashboard

### Security Features
- ✅ Password visibility toggle
- ✅ Remember me checkbox
- ✅ Session-based authentication
- ✅ Role-based page restrictions
- ✅ Automatic logout functionality
- ✅ Access denied alerts

### UI Features
- 🎨 Beautiful gradient design with animations
- 📱 Fully responsive layout
- 🔔 Alert notifications for errors/success
- 👁️ Password show/hide toggle
- 🎯 One-click demo credential filling
- 💫 Smooth transitions and loading states

## Page Access Matrix

| Page | Admin | Pharmacist | Cashier | Inventory Mgr |
|------|-------|------------|---------|---------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Medicines | ✅ | ✅ | ❌ | ✅ |
| Inventory | ✅ | ✅ | ❌ | ✅ |
| POS | ✅ | ✅ | ✅ | ❌ |
| Prescriptions | ✅ | ✅ | ❌ | ❌ |
| Customers | ✅ | ✅ | ✅ | ❌ |
| Suppliers | ✅ | ❌ | ❌ | ✅ |
| Purchase Orders | ✅ | ❌ | ❌ | ✅ |
| Reports | ✅ | ❌ | ❌ | ✅ |
| Users | ✅ | ❌ | ❌ | ❌ |
| Notifications | ✅ | ✅ | ✅ | ✅ |
| AI Scanner | ✅ | ✅ | ❌ | ❌ |
| AI Chatbot | ✅ | ✅ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ |

## How to Use

### Testing the Login Flow
1. Open `01-login.html` (this is now the entry point)
2. Click on any demo credential to auto-fill
3. Click "Sign In"
4. You'll be redirected to the dashboard
5. Navigation is filtered based on your role

### Testing Role Restrictions
1. Login as **Cashier** (cashier@pharmacy.com / cash123)
2. Try to access "Medicines" page directly
3. System will show "Access Denied" and redirect to dashboard
4. Sidebar only shows accessible pages (Dashboard, POS, Customers)

### Logout
- Click on the user avatar in the navbar
- Or click "Logout" in the sidebar
- Confirm logout when prompted
- You'll be redirected to login page

## Technical Implementation

### Files
- **01-login.html** - Login page with authentication logic
- **auth.js** - Authentication & authorization script (included in all protected pages)
- **Session Storage** - Stores current user data

### Authentication Check
```javascript
// Each protected page includes auth.js which:
1. Checks if user is logged in (sessionStorage)
2. Validates user has access to current page
3. Updates UI based on user role
4. Hides restricted sidebar items
5. Adds role badge to navbar
```

### Adding Auth to New Pages
Simply add this line to the `<head>` section:
```html
<script src="auth.js"></script>
```

## Flow Diagram

```
Start
  ↓
01-login.html (Entry Point)
  ↓
[User enters credentials]
  ↓
[Validate email/password/role]
  ↓
[Success] → Store session → Redirect to Dashboard
  ↓
[Protected Page Load]
  ↓
auth.js checks session
  ↓
[Has Access] → Show page with filtered navigation
[No Access] → Redirect to Dashboard or Login
  ↓
[User clicks Logout]
  ↓
Clear session → Redirect to Login
```

## Best Practices

1. **Always start at login:** Users should access `01-login.html` first
2. **Use demo credentials:** Click on demo users for quick testing
3. **Test different roles:** Login as different users to see access restrictions
4. **Verify navigation:** Check that sidebar hides restricted pages
5. **Test logout:** Ensure session is cleared properly

## Future Enhancements (Backend Integration)

When connecting to the actual backend:
- Replace sessionStorage with JWT tokens
- Implement refresh token mechanism
- Add password encryption (bcrypt)
- Add rate limiting for login attempts
- Implement "forgot password" functionality
- Add two-factor authentication (2FA)
- Log all authentication attempts
- Add session timeout
- Implement "remember me" with secure cookies

## Notes

- This is a **frontend mockup** with simulated authentication
- Passwords are stored in plain text in JavaScript (for demo only)
- In production, use proper backend authentication
- Session data is cleared when browser closes
- No actual API calls are made (simulated delays for UX)
