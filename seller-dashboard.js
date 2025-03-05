// Check if seller is logged in
function checkSellerAuth() {
    const seller = JSON.parse(localStorage.getItem('currentSeller'));
    if (!seller) {
        window.location.href = 'seller-auth.html';
        return;
    }
    return seller;
}

// Initialize dashboard
function initDashboard() {
    const seller = checkSellerAuth();
    if (!seller) return;

    // Update seller info in UI
    document.getElementById('sellerName').textContent = seller.storeName;
    document.getElementById('storeName').textContent = seller.storeName;
    document.getElementById('sellerEmail').textContent = seller.email;

    // Load initial data
    loadDashboardOverview();
    setupTimeRangeFilter();
    setupMenuListeners();
    setupUserMenu();
}

// Setup menu navigation
function setupMenuListeners() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update active state
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Show corresponding section
            const sectionId = item.getAttribute('data-section');
            const sections = document.querySelectorAll('.content-section');
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');

            // Load section data
            switch (sectionId) {
                case 'all-orders':
                    loadOrders();
                    break;
                case 'pending-orders':
                    loadPendingOrders();
                    break;
                case 'confirmed-orders':
                    loadConfirmedOrders();
                    break;
                case 'delivered-orders':
                    loadDeliveredOrders();
                    break;
                case 'profile':
                    loadProfileData();
                    break;
            }
        });
    });
}

// Setup user menu dropdown
function setupUserMenu() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.querySelector('.user-dropdown');

    userMenuBtn.addEventListener('click', () => {
        userDropdown.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove('active');
        }
    });
}

// Load all orders
function loadOrders() {
    try {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const ordersList = document.getElementById('allOrdersList');
        ordersList.innerHTML = '';

        if (orders.length === 0) {
            ordersList.innerHTML = '<p class="no-orders">No orders yet</p>';
            return;
        }

        orders.forEach(order => {
            ordersList.appendChild(createOrderCard(order));
        });
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('allOrdersList').innerHTML = 
            '<p class="error-message">Error loading orders. Please try again.</p>';
    }
}

// Load pending orders
function loadPendingOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const pendingOrders = orders.filter(order => order.status === 'Pending');
    const ordersList = document.getElementById('pendingOrdersList');
    ordersList.innerHTML = '';

    if (pendingOrders.length === 0) {
        ordersList.innerHTML = '<p class="no-orders">No pending orders</p>';
        return;
    }

    pendingOrders.forEach(order => {
        ordersList.appendChild(createOrderCard(order));
    });
}

// Load confirmed orders
function loadConfirmedOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const confirmedOrders = orders.filter(order => order.status === 'Confirmed');
    const ordersList = document.getElementById('confirmedOrdersList');
    ordersList.innerHTML = '';

    if (confirmedOrders.length === 0) {
        ordersList.innerHTML = '<p class="no-orders">No confirmed orders</p>';
        return;
    }

    confirmedOrders.forEach(order => {
        ordersList.appendChild(createOrderCard(order));
    });
}

// Load delivered orders
function loadDeliveredOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const deliveredOrders = orders.filter(order => order.status === 'Delivered');
    const ordersList = document.getElementById('deliveredOrdersList');
    ordersList.innerHTML = '';

    if (deliveredOrders.length === 0) {
        ordersList.innerHTML = '<p class="no-orders">No delivered orders</p>';
        return;
    }

    deliveredOrders.forEach(order => {
        ordersList.appendChild(createOrderCard(order));
    });
}

// Create order card element
function createOrderCard(order) {
    const orderDate = new Date(order.date).toLocaleDateString();
    const deliveryDate = order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'Not delivered';

    return `
        <div class="order-card">
            <div class="order-header">
                <div class="order-info">
                    <div class="order-id-date">
                        <span class="order-id">Order #${order.id}</span>
                        <span class="order-date">${orderDate}</span>
                    </div>
                    <div class="customer-info">
                        <i class="fas fa-user"></i>
                        <span>${order.customerName}</span>
                        <i class="fas fa-phone"></i>
                        <span>${order.customerPhone}</span>
                    </div>
                </div>
                <div class="order-status ${order.status.toLowerCase()}">
                    <i class="fas ${getStatusIcon(order.status)}"></i>
                    ${order.status}
                </div>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="item-details">
                            <h4>${item.name}</h4>
                            <div class="item-info">
                                <p><i class="fas fa-box"></i> Category: ${item.category}</p>
                                <p><i class="fas fa-hashtag"></i> Quantity: ${item.quantity}</p>
                                <p><i class="fas fa-tag"></i> Price: ₹${item.price}</p>
                                <p><i class="fas fa-calculator"></i> Subtotal: ₹${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="order-footer">
                <div class="order-summary">
                    <div class="delivery-info">
                        <h4><i class="fas fa-map-marker-alt"></i> Delivery Address</h4>
                        <p>${order.deliveryAddress}</p>
                        <p><i class="fas fa-calendar"></i> Expected Delivery: ${deliveryDate}</p>
                    </div>
                    <div class="order-total">
                        <span>Total Amount:</span>
                        <span>₹${order.total.toFixed(2)}</span>
                    </div>
                </div>
                <div class="order-actions">
                    ${order.status === 'Pending' ? `
                        <button class="action-btn confirm-order-btn" onclick="confirmOrder('${order.id}')">
                            <i class="fas fa-check"></i> Confirm Order
                        </button>
                    ` : ''}
                    ${order.status === 'Confirmed' ? `
                        <button class="action-btn confirm-delivery-btn" onclick="confirmDelivery('${order.id}')">
                            <i class="fas fa-truck"></i> Confirm Delivery
                        </button>
                    ` : ''}
                    <button class="action-btn download-bill-btn" onclick="downloadBill('${order.id}')">
                        <i class="fas fa-download"></i> Download Bill
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Get status icon based on order status
function getStatusIcon(status) {
    switch (status) {
        case 'Pending':
            return 'fa-clock';
        case 'Confirmed':
            return 'fa-check-circle';
        case 'Delivered':
            return 'fa-truck';
        default:
            return 'fa-shopping-bag';
    }
}

// Confirm order
function confirmOrder(orderId) {
    try {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const orderIndex = orders.findIndex(order => order.id === orderId);

        if (orderIndex === -1) {
            alert('Order not found');
            return;
        }

        orders[orderIndex].status = 'Confirmed';
        localStorage.setItem('orders', JSON.stringify(orders));

        // Refresh all order lists
        loadOrders();
        loadPendingOrders();
        loadConfirmedOrders();
        loadDeliveredOrders();

        alert('Order confirmed successfully');
    } catch (error) {
        console.error('Error confirming order:', error);
        alert('Error confirming order. Please try again.');
    }
}

// Confirm delivery
function confirmDelivery(orderId) {
    try {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const orderIndex = orders.findIndex(order => order.id === orderId);

        if (orderIndex === -1) {
            alert('Order not found');
            return;
        }

        orders[orderIndex].status = 'Delivered';
        orders[orderIndex].deliveryDate = new Date().toISOString();
        localStorage.setItem('orders', JSON.stringify(orders));

        // Refresh all order lists
        loadOrders();
        loadPendingOrders();
        loadConfirmedOrders();
        loadDeliveredOrders();

        alert('Delivery confirmed successfully');
    } catch (error) {
        console.error('Error confirming delivery:', error);
        alert('Error confirming delivery. Please try again.');
    }
}

// Load profile data
function loadProfileData() {
    const seller = checkSellerAuth();
    if (!seller) return;

    document.getElementById('editStoreName').value = seller.storeName;
    document.getElementById('editEmail').value = seller.email;
    document.getElementById('editPhone').value = seller.phone;
    document.getElementById('editAddress').value = seller.address;
}

// Update profile
function updateProfile(event) {
    event.preventDefault();
    try {
        const seller = checkSellerAuth();
        if (!seller) return;

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;

        // Validate current password
        if (currentPassword && currentPassword !== seller.password) {
            alert('Current password is incorrect');
            return false;
        }

        // Update seller data
        const updatedSeller = {
            ...seller,
            storeName: document.getElementById('editStoreName').value,
            email: document.getElementById('editEmail').value,
            phone: document.getElementById('editPhone').value,
            address: document.getElementById('editAddress').value,
            password: newPassword || seller.password
        };

        // Update localStorage
        const sellers = JSON.parse(localStorage.getItem('sellers')) || [];
        const sellerIndex = sellers.findIndex(s => s.email === seller.email);
        
        if (sellerIndex === -1) {
            throw new Error('Seller not found');
        }

        sellers[sellerIndex] = updatedSeller;
        localStorage.setItem('sellers', JSON.stringify(sellers));
        localStorage.setItem('currentSeller', JSON.stringify(updatedSeller));

        alert('Profile updated successfully');
        return false;
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile. Please try again.');
        return false;
    }
}

// Download bill
function downloadBill(orderId) {
    try {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const order = orders.find(order => order.id === orderId);
        
        if (!order) {
            alert('Order not found');
            return;
        }

        // Create PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add header
        doc.setFontSize(20);
        doc.text('Fresh Mart', 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text('123 Grocery Street, City, Country', 105, 30, { align: 'center' });
        doc.text('Phone: (123) 456-7890', 105, 37, { align: 'center' });
        doc.text('Email: info@freshmart.com', 105, 44, { align: 'center' });
        
        // Add order details
        doc.setFontSize(14);
        doc.text('Bill', 105, 60, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Order ID: ${order.id}`, 20, 70);
        doc.text(`Date: ${new Date(order.date).toLocaleDateString()}`, 20, 77);
        if (order.deliveryDate) {
            doc.text(`Delivery Date: ${new Date(order.deliveryDate).toLocaleDateString()}`, 20, 84);
        }
        doc.text(`Status: ${order.status}`, 20, 91);
        
        // Add items
        let y = 100;
        doc.setFontSize(12);
        doc.text('Items:', 20, y);
        y += 10;
        
        order.items.forEach(item => {
            doc.text(`${item.name} x ${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}`, 30, y);
            y += 7;
        });
        
        // Add total
        doc.setFontSize(14);
        doc.text(`Total: ₹${order.total.toFixed(2)}`, 20, y + 10);
        
        // Save PDF
        doc.save(`bill-${order.id}.pdf`);
    } catch (error) {
        console.error('Error generating bill:', error);
        alert('Error generating bill. Please try again.');
    }
}

// Logout
function logout() {
    localStorage.removeItem('currentSeller');
    window.location.href = 'seller-auth.html';
}

// Load dashboard overview
function loadDashboardOverview() {
    try {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const timeRange = document.getElementById('timeRange').value;
        
        // Calculate date range
        const now = new Date();
        let startDate;
        switch(timeRange) {
            case 'today':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'month':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case 'year':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
        }

        // Filter orders by date range
        const filteredOrders = orders.filter(order => 
            new Date(order.date) >= startDate
        );

        // Update statistics
        updateStatistics(filteredOrders);
        
        // Update recent orders
        updateRecentOrders(orders);
        
        // Update top products
        updateTopProducts(products, orders);
        
        // Update activity feed
        updateActivityFeed(filteredOrders);
        
        // Update delivery status
        updateDeliveryStatus(filteredOrders);
    } catch (error) {
        console.error('Error loading dashboard overview:', error);
    }
}

// Update statistics
function updateStatistics(orders) {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'Pending').length;
    const confirmedOrders = orders.filter(order => order.status === 'Confirmed').length;
    const deliveredOrders = orders.filter(order => order.status === 'Delivered').length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const uniqueCustomers = new Set(orders.map(order => order.userId)).size;

    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('confirmedOrders').textContent = confirmedOrders;
    document.getElementById('deliveredOrders').textContent = deliveredOrders;
    document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toFixed(2)}`;
    document.getElementById('totalCustomers').textContent = uniqueCustomers;
}

// Update recent orders
function updateRecentOrders(orders) {
    const recentOrdersList = document.getElementById('recentOrdersList');
    const recentOrders = orders
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    recentOrdersList.innerHTML = recentOrders.map(order => `
        <div class="recent-order-item">
            <div>
                <span class="order-id">Order #${order.id}</span>
                <span class="order-date">${new Date(order.date).toLocaleDateString()}</span>
            </div>
            <div class="order-status ${order.status.toLowerCase()}">
                ${order.status}
            </div>
        </div>
    `).join('');
}

// Update top products
function updateTopProducts(products, orders) {
    const topProductsList = document.getElementById('topProductsList');
    
    // Calculate product sales
    const productSales = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            if (!productSales[item.id]) {
                productSales[item.id] = {
                    quantity: 0,
                    revenue: 0
                };
            }
            productSales[item.id].quantity += item.quantity;
            productSales[item.id].revenue += item.price * item.quantity;
        });
    });

    // Sort products by revenue
    const topProducts = Object.entries(productSales)
        .map(([id, data]) => ({
            id,
            ...data,
            product: products.find(p => p.id === id)
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    topProductsList.innerHTML = topProducts.map(item => `
        <div class="top-product-item">
            <img src="${item.product.image}" alt="${item.product.name}">
            <div class="product-info">
                <h4>${item.product.name}</h4>
                <p>Sold: ${item.quantity} units</p>
                <p>Revenue: ₹${item.revenue.toFixed(2)}</p>
            </div>
        </div>
    `).join('');
}

// Update activity feed
function updateActivityFeed(orders) {
    const activityList = document.getElementById('activityList');
    
    const activities = orders.map(order => ({
        type: 'order',
        date: order.date,
        message: `New order #${order.id} received`,
        icon: 'fa-shopping-cart'
    }));

    // Add status changes to activities
    orders.forEach(order => {
        if (order.status === 'Confirmed') {
            activities.push({
                type: 'confirm',
                date: order.date,
                message: `Order #${order.id} confirmed`,
                icon: 'fa-check-circle'
            });
        }
        if (order.status === 'Delivered') {
            activities.push({
                type: 'delivery',
                date: order.deliveryDate,
                message: `Order #${order.id} delivered`,
                icon: 'fa-truck'
            });
        }
    });

    // Sort activities by date
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    activityList.innerHTML = activities.slice(0, 5).map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <p>${activity.message}</p>
                <span class="activity-time">${new Date(activity.date).toLocaleString()}</span>
            </div>
        </div>
    `).join('');
}

// Update delivery status
function updateDeliveryStatus(orders) {
    const deliveryStatusList = document.getElementById('deliveryStatusList');
    
    const pendingDeliveries = orders
        .filter(order => order.status === 'Confirmed')
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);

    deliveryStatusList.innerHTML = pendingDeliveries.map(order => `
        <div class="delivery-status-item">
            <div>
                <span class="order-id">Order #${order.id}</span>
                <span class="order-date">${new Date(order.date).toLocaleDateString()}</span>
            </div>
            <button class="action-btn confirm-delivery-btn" onclick="confirmDelivery('${order.id}')">
                <i class="fas fa-truck"></i> Confirm Delivery
            </button>
        </div>
    `).join('');
}

// Setup time range filter
function setupTimeRangeFilter() {
    const timeRange = document.getElementById('timeRange');
    timeRange.addEventListener('change', loadDashboardOverview);
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', initDashboard); 