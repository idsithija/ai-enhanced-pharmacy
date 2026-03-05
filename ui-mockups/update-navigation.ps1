# Script to add improved navigation to all HTML files
$files = @(
    @{File="03-medicines.html"; Active="Medicines"; Breadcrumb="Inventory › Medicines"},
    @{File="04-inventory.html"; Active="Inventory"; Breadcrumb="Inventory › Stock Management"},
    @{File="05-pos.html"; Active="Point of Sale"; Breadcrumb="Operations › Point of Sale"},
    @{File="06-prescriptions.html"; Active="Prescriptions"; Breadcrumb="Operations › Prescriptions"},
    @{File="07-customers.html"; Active="Customers"; Breadcrumb="Management › Customers"},
    @{File="08-suppliers.html"; Active="Suppliers"; Breadcrumb="Inventory › Suppliers"},
    @{File="09-purchase-orders.html"; Active="Purchase Orders"; Breadcrumb="Inventory › Purchase Orders"},
    @{File="10-reports.html"; Active="Reports"; Breadcrumb="Analytics › Reports"},
    @{File="11-users.html"; Active="Users"; Breadcrumb="Management › Users"},
    @{File="12-notifications.html"; Active="Notifications"; Breadcrumb="Analytics › Notifications"},
    @{File="13-ai-scanner.html"; Active="AI Scanner"; Breadcrumb="AI Features › Scanner"},
    @{File="14-ai-chatbot.html"; Active="AI Chatbot"; Breadcrumb="AI Features › Chatbot"},
    @{File="15-settings.html"; Active="Settings"; Breadcrumb="System › Settings"}
)

$sidebarHTML = @"
            <div class="sidebar-section">Main</div>
            <a href="02-dashboard.html" class="sidebar-item{DASHBOARD_ACTIVE}">
                <span class="icon">📊</span>
                <span>Dashboard</span>
            </a>

            <div class="sidebar-section">Operations</div>
            <a href="05-pos.html" class="sidebar-item{POS_ACTIVE}">
                <span class="icon">🛒</span>
                <span>Point of Sale</span>
            </a>
            <a href="06-prescriptions.html" class="sidebar-item{PRESCRIPTIONS_ACTIVE}">
                <span class="icon">📋</span>
                <span>Prescriptions</span>
            </a>

            <div class="sidebar-section">Inventory</div>
            <a href="03-medicines.html" class="sidebar-item{MEDICINES_ACTIVE}">
                <span class="icon">💊</span>
                <span>Medicines</span>
            </a>
            <a href="04-inventory.html" class="sidebar-item{INVENTORY_ACTIVE}">
                <span class="icon">📦</span>
                <span>Inventory</span>
            </a>
            <a href="08-suppliers.html" class="sidebar-item{SUPPLIERS_ACTIVE}">
                <span class="icon">🏢</span>
                <span>Suppliers</span>
            </a>
            <a href="09-purchase-orders.html" class="sidebar-item{PURCHASE_ORDERS_ACTIVE}">
                <span class="icon">📝</span>
                <span>Purchase Orders</span>
            </a>

            <div class="sidebar-section">Management</div>
            <a href="07-customers.html" class="sidebar-item{CUSTOMERS_ACTIVE}">
                <span class="icon">👥</span>
                <span>Customers</span>
            </a>
            <a href="11-users.html" class="sidebar-item{USERS_ACTIVE}">
                <span class="icon">👤</span>
                <span>Users</span>
            </a>

            <div class="sidebar-section">Analytics</div>
            <a href="10-reports.html" class="sidebar-item{REPORTS_ACTIVE}">
                <span class="icon">📈</span>
                <span>Reports</span>
            </a>
            <a href="12-notifications.html" class="sidebar-item{NOTIFICATIONS_ACTIVE}">
                <span class="icon">🔔</span>
                <span>Notifications</span>
            </a>

            <div class="sidebar-section">AI Features</div>
            <a href="13-ai-scanner.html" class="sidebar-item{AI_SCANNER_ACTIVE}">
                <span class="icon">📷</span>
                <span>AI Scanner</span>
            </a>
            <a href="14-ai-chatbot.html" class="sidebar-item{AI_CHATBOT_ACTIVE}">
                <span class="icon">🤖</span>
                <span>AI Chatbot</span>
            </a>

            <div class="sidebar-section">System</div>
            <a href="15-settings.html" class="sidebar-item{SETTINGS_ACTIVE}">
                <span class="icon">⚙️</span>
                <span>Settings</span>
            </a>
            <a href="index.html" class="sidebar-item">
                <span class="icon">🏠</span>
                <span>Home Menu</span>
            </a>
            <a href="01-login.html" class="sidebar-item">
                <span class="icon">🔓</span>
                <span>Logout</span>
            </a>
"@

Write-Host "Navigation template created!" -ForegroundColor Green
Write-Host "Sidebar navigation is ready to be applied to all pages." -ForegroundColor Cyan
