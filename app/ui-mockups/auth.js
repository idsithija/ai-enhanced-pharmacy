// Authentication and Role-Based Access Control

// Page access requirements
const pageAccess = {
    '02-dashboard.html': ['admin', 'pharmacist', 'cashier', 'inventory_manager'],
    '03-medicines.html': ['admin', 'pharmacist', 'inventory_manager'],
    '04-inventory.html': ['admin', 'pharmacist', 'inventory_manager'],
    '05-pos.html': ['admin', 'pharmacist', 'cashier'],
    '06-prescriptions.html': ['admin', 'pharmacist'],
    '07-customers.html': ['admin', 'pharmacist', 'cashier'],
    '08-suppliers.html': ['admin', 'inventory_manager'],
    '09-purchase-orders.html': ['admin', 'inventory_manager'],
    '10-reports.html': ['admin', 'inventory_manager'],
    '11-users.html': ['admin'],
    '12-notifications.html': ['admin', 'pharmacist', 'cashier', 'inventory_manager'],
    '13-ai-scanner.html': ['admin', 'pharmacist'],
    '14-ai-chatbot.html': ['admin', 'pharmacist'],
    '15-settings.html': ['admin']
};

// Check authentication and authorization
function checkAuth() {
    const currentUser = sessionStorage.getItem('currentUser');
    const currentPage = window.location.pathname.split('/').pop();
    
    // Redirect to login if not authenticated
    if (!currentUser) {
        window.location.href = '01-login.html';
        return null;
    }
    
    const user = JSON.parse(currentUser);
    
    // Check if user has access to current page
    if (pageAccess[currentPage]) {
        if (!pageAccess[currentPage].includes(user.role)) {
            alert(`Access Denied: Your role (${user.role}) does not have permission to access this page.`);
            window.location.href = '02-dashboard.html';
            return null;
        }
    }
    
    return user;
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('currentUser');
        window.location.href = '01-login.html';
    }
}

// Update UI based on user role
function updateUIForRole(user) {
    // Update user name display
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(el => {
        el.textContent = user.name;
    });
    
    // Update user avatar
    const userAvatarElements = document.querySelectorAll('.user-avatar');
    userAvatarElements.forEach(el => {
        el.textContent = user.name.charAt(0).toUpperCase();
    });
    
    // Hide/show sidebar items based on role access
    document.querySelectorAll('.sidebar-item').forEach(item => {
        const href = item.getAttribute('href');
        if (href && pageAccess[href]) {
            if (!pageAccess[href].includes(user.role)) {
                item.style.display = 'none';
            }
        }
    });
    
    // Add role badge to navbar
    const navRight = document.querySelector('.nav-right');
    if (navRight && !document.querySelector('.role-badge')) {
        const roleBadge = document.createElement('span');
        roleBadge.className = 'role-badge';
        roleBadge.textContent = user.role.replace('_', ' ').toUpperCase();
        roleBadge.style.cssText = `
            padding: 6px 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 20px;
            font-size: 0.75em;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        `;
        navRight.insertBefore(roleBadge, navRight.firstChild);
    }
}

// Check if user has specific permission
function hasAccess(page) {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) return false;
    
    const user = JSON.parse(currentUser);
    if (!pageAccess[page]) return true; // Page doesn't require specific access
    
    return pageAccess[page].includes(user.role);
}

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    // Skip auth check for login page and index
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === '01-login.html' || currentPage === 'index.html' || currentPage === '') {
        return;
    }
    
    const user = checkAuth();
    if (user) {
        updateUIForRole(user);
        
        // Add click handler to user avatar for logout
        document.querySelectorAll('.user-avatar').forEach(avatar => {
            avatar.style.cursor = 'pointer';
            avatar.onclick = function() {
                if (confirm('Would you like to logout?')) {
                    logout();
                }
            };
        });
        
        // Update logout link in sidebar
        document.querySelectorAll('.sidebar-item').forEach(item => {
            if (item.getAttribute('href') === '01-login.html') {
                item.onclick = function(e) {
                    e.preventDefault();
                    logout();
                };
            }
        });
    }
});

// Add role-based styling
const style = document.createElement('style');
style.textContent = `
    .access-denied-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    }
    
    .access-denied-message {
        background: white;
        padding: 40px;
        border-radius: 16px;
        text-align: center;
        max-width: 400px;
    }
    
    .access-denied-message h2 {
        color: #f44336;
        margin-bottom: 15px;
    }
    
    .access-denied-message p {
        color: #666;
        margin-bottom: 20px;
    }
`;
document.head.appendChild(style);
