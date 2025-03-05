// Check if customer is logged in
function checkCustomerAuth() {
    const customer = JSON.parse(localStorage.getItem('currentCustomer'));
    if (!customer) {
        window.location.href = 'auth.html';
        return;
    }
    return customer;
}

// Initialize dashboard
function initDashboard() {
    const customer = checkCustomerAuth();
    if (!customer) return;

    // Update customer info in UI
    document.getElementById('customerName').textContent = customer.name;
    document.getElementById('customerEmail').textContent = customer.email;

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
                case 'orders':
                    loadOrders();
                    break;
                case 'wishlist':
                    loadWishlist();
                    break;
                case 'addresses':
                    loadAddresses();
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

// Load dashboard overview
function loadDashboardOverview() {
    try {
        const customer = checkCustomerAuth();
        if (!customer) return;

        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const timeRange = document.getElementById('timeRange').value;
        
        // Filter orders for current customer
        const customerOrders = orders.filter(order => order.userId === customer.id);
        
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
        const filteredOrders = customerOrders.filter(order => 
            new Date(order.date) >= startDate
        );

        // Update statistics
        updateStatistics(filteredOrders);
        
        // Update recent orders
        updateRecentOrders(customerOrders);
        
        // Update wishlist preview
        updateWishlistPreview(wishlist, products);
        
        // Update recommended products
        updateRecommendedProducts(products, customerOrders);
        
        // Update delivery tracking
        updateDeliveryTracking(filteredOrders);
    } catch (error) {
        console.error('Error loading dashboard overview:', error);
    }
}

// Update statistics
function updateStatistics(orders) {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'Pending').length;
    const deliveredOrders = orders.filter(order => order.status === 'Delivered').length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

    document.getElementById('totalOrdersCount').textContent = totalOrders;
    document.getElementById('pendingOrdersCount').textContent = pendingOrders;
    document.getElementById('deliveredOrdersCount').textContent = deliveredOrders;
    document.getElementById('totalSpent').textContent = `₹${totalSpent.toFixed(2)}`;
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

// Update wishlist preview
function updateWishlistPreview(wishlist, products) {
    const wishlistPreview = document.getElementById('wishlistPreview');
    const wishlistItems = wishlist
        .map(item => ({
            ...item,
            product: products.find(p => p.id === item.productId)
        }))
        .filter(item => item.product)
        .slice(0, 5);

    wishlistPreview.innerHTML = wishlistItems.map(item => `
        <div class="wishlist-item">
            <img src="${item.product.image}" alt="${item.product.name}">
            <div class="wishlist-item-info">
                <h4>${item.product.name}</h4>
                <p>₹${item.product.price}</p>
            </div>
        </div>
    `).join('');
}

// Update recommended products
function updateRecommendedProducts(products, orders) {
    const recommendedProducts = document.getElementById('recommendedProducts');
    
    // Get categories from recent orders
    const recentCategories = orders
        .slice(0, 5)
        .flatMap(order => order.items.map(item => item.category))
        .filter((category, index, self) => self.indexOf(category) === index);

    // Filter products by recent categories
    const recommended = products
        .filter(product => recentCategories.includes(product.category))
        .slice(0, 5);

    recommendedProducts.innerHTML = recommended.map(product => `
        <div class="recommended-product">
            <img src="${product.image}" alt="${product.name}">
            <div class="recommended-product-info">
                <h4>${product.name}</h4>
                <p>₹${product.price}</p>
            </div>
        </div>
    `).join('');
}

// Update delivery tracking
function updateDeliveryTracking(orders) {
    const deliveryTracking = document.getElementById('deliveryTracking');
    
    const pendingDeliveries = orders
        .filter(order => order.status === 'Confirmed')
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);

    deliveryTracking.innerHTML = pendingDeliveries.map(order => `
        <div class="tracking-item">
            <div class="tracking-status">
                <i class="fas fa-truck"></i>
                <span>Order #${order.id}</span>
            </div>
            <div class="tracking-info">
                <p>Ordered on: ${new Date(order.date).toLocaleDateString()}</p>
                <p>Expected delivery: ${new Date(new Date(order.date).setDate(new Date(order.date).getDate() + 3)).toLocaleDateString()}</p>
            </div>
        </div>
    `).join('');
}

// Load orders
function loadOrders() {
    try {
        const customer = checkCustomerAuth();
        if (!customer) return;

        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const customerOrders = orders.filter(order => order.userId === customer.id);
        const ordersList = document.getElementById('ordersList');

        if (customerOrders.length === 0) {
            ordersList.innerHTML = '<p class="no-orders">No orders yet</p>';
            return;
        }

        ordersList.innerHTML = customerOrders
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(order => createOrderCard(order))
            .join('');
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('ordersList').innerHTML = 
            '<p class="error-message">Error loading orders. Please try again.</p>';
    }
}

// Create order card
function createOrderCard(order) {
    const orderDate = new Date(order.date).toLocaleDateString();
    const deliveryDate = order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'Not delivered';
    const trackingStatus = getTrackingStatus(order.status);

    return `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <span class="order-id">Order #${order.id}</span>
                    <span class="order-date">${orderDate}</span>
                </div>
                <div class="order-status ${order.status.toLowerCase()}">
                    <i class="fas ${getStatusIcon(order.status)}"></i>
                    ${order.status}
                </div>
            </div>
            
            <!-- Order Items Section -->
            <div class="order-items">
                <h4 class="section-title">Ordered Products</h4>
                ${order.items.map(item => `
                    <div class="order-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="item-details">
                            <h4>${item.name}</h4>
                            <div class="item-info">
                                <p><i class="fas fa-box"></i> Category: ${item.category}</p>
                                <p><i class="fas fa-hashtag"></i> Quantity: ${item.quantity}</p>
                                <p><i class="fas fa-tag"></i> Price per item: ₹${item.price}</p>
                                <p><i class="fas fa-calculator"></i> Subtotal: ₹${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Tracking Status Section -->
            <div class="tracking-section">
                <h4 class="section-title">Order Tracking</h4>
                <div class="tracking-timeline">
                    <div class="tracking-step ${order.status === 'Pending' ? 'active' : 'completed'}">
                        <i class="fas fa-shopping-cart"></i>
                        <span>Order Placed</span>
                        <span class="step-date">${orderDate}</span>
                    </div>
                    <div class="tracking-step ${order.status === 'Confirmed' ? 'active' : order.status === 'Delivered' ? 'completed' : ''}">
                        <i class="fas fa-check-circle"></i>
                        <span>Order Confirmed</span>
                        <span class="step-date">${order.confirmedDate ? new Date(order.confirmedDate).toLocaleDateString() : 'Pending'}</span>
                    </div>
                    <div class="tracking-step ${order.status === 'Delivered' ? 'active' : ''}">
                        <i class="fas fa-truck"></i>
                        <span>Out for Delivery</span>
                        <span class="step-date">${order.outForDeliveryDate ? new Date(order.outForDeliveryDate).toLocaleDateString() : 'Pending'}</span>
                    </div>
                    <div class="tracking-step ${order.status === 'Delivered' ? 'completed' : ''}">
                        <i class="fas fa-home"></i>
                        <span>Delivered</span>
                        <span class="step-date">${deliveryDate}</span>
                    </div>
                </div>
            </div>

            <!-- Order Summary Section -->
            <div class="order-footer">
                <div class="order-summary">
                    <div class="order-total">
                        <span>Total Amount:</span>
                        <span>₹${order.total.toFixed(2)}</span>
                    </div>
                    <div class="delivery-info">
                        <p><i class="fas fa-map-marker-alt"></i> Delivery Address: ${order.deliveryAddress}</p>
                        <p><i class="fas fa-calendar"></i> Expected Delivery: ${deliveryDate}</p>
                        <p><i class="fas fa-phone"></i> Contact Number: ${order.contactNumber}</p>
                    </div>
                </div>
                <div class="order-actions">
                    <button class="action-btn download-bill-btn" onclick="downloadBill('${order.id}')">
                        <i class="fas fa-download"></i> Download Bill
                    </button>
                </div>
            </div>
        </div>
    `;
}

function getTrackingStatus(status) {
    switch (status) {
        case 'Pending':
            return {
                icon: 'fa-clock',
                text: 'Order Placed',
                description: 'Your order has been placed and is waiting for confirmation.'
            };
        case 'Confirmed':
            return {
                icon: 'fa-check-circle',
                text: 'Order Confirmed',
                description: 'Your order has been confirmed and is being prepared.'
            };
        case 'Delivered':
            return {
                icon: 'fa-truck',
                text: 'Delivered',
                description: 'Your order has been successfully delivered.'
            };
        default:
            return {
                icon: 'fa-shopping-bag',
                text: 'Order Placed',
                description: 'Your order has been placed.'
            };
    }
}

// Get status icon
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

// Load wishlist
function loadWishlist() {
    try {
        const customer = checkCustomerAuth();
        if (!customer) return;

        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const wishlistGrid = document.getElementById('wishlistGrid');

        const wishlistItems = wishlist
            .map(item => ({
                ...item,
                product: products.find(p => p.id === item.productId)
            }))
            .filter(item => item.product);

        if (wishlistItems.length === 0) {
            wishlistGrid.innerHTML = '<p class="no-items">Your wishlist is empty</p>';
            return;
        }

        wishlistGrid.innerHTML = wishlistItems.map(item => `
            <div class="wishlist-product-card">
                <img src="${item.product.image}" alt="${item.product.name}">
                <h4>${item.product.name}</h4>
                <p>₹${item.product.price}</p>
                <button class="action-btn add-to-cart-btn" onclick="addToCart('${item.product.id}')">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading wishlist:', error);
        document.getElementById('wishlistGrid').innerHTML = 
            '<p class="error-message">Error loading wishlist. Please try again.</p>';
    }
}

// Load addresses
function loadAddresses() {
    try {
        const customer = checkCustomerAuth();
        if (!customer) return;

        const addresses = customer.addresses || [];
        const addressesList = document.getElementById('addressesList');

        if (addresses.length === 0) {
            addressesList.innerHTML = '<p class="no-addresses">No addresses saved</p>';
            return;
        }

        addressesList.innerHTML = addresses.map((address, index) => `
            <div class="address-card">
                <h4>${address.type}</h4>
                <p>${address.name}</p>
                <p>${address.address}</p>
                <p>${address.city}, ${address.state} ${address.pincode}</p>
                <p>Phone: ${address.phone}</p>
                <div class="address-actions">
                    <button class="action-btn edit-address-btn" onclick="editAddress(${index})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete-address-btn" onclick="deleteAddress(${index})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading addresses:', error);
        document.getElementById('addressesList').innerHTML = 
            '<p class="error-message">Error loading addresses. Please try again.</p>';
    }
}

// Show add address form
function showAddAddressForm() {
    // Implementation for adding new address
    alert('Add address functionality will be implemented here');
}

// Edit address
function editAddress(index) {
    // Implementation for editing address
    alert('Edit address functionality will be implemented here');
}

// Delete address
function deleteAddress(index) {
    if (confirm('Are you sure you want to delete this address?')) {
        try {
            const customer = checkCustomerAuth();
            if (!customer) return;

            customer.addresses.splice(index, 1);
            localStorage.setItem('currentCustomer', JSON.stringify(customer));
            loadAddresses();
        } catch (error) {
            console.error('Error deleting address:', error);
            alert('Error deleting address. Please try again.');
        }
    }
}

// Add to cart
function addToCart(productId) {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const product = products.find(p => p.id === productId);

        if (!product) {
            alert('Product not found');
            return;
        }

        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        alert('Product added to cart successfully');
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Error adding to cart. Please try again.');
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

// Load profile data
function loadProfileData() {
    const customer = checkCustomerAuth();
    if (!customer) return;

    document.getElementById('editName').value = customer.name;
    document.getElementById('editEmail').value = customer.email;
    document.getElementById('editPhone').value = customer.phone;
}

// Update profile
function updateProfile(event) {
    event.preventDefault();
    try {
        const customer = checkCustomerAuth();
        if (!customer) return;

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;

        // Validate current password
        if (currentPassword && currentPassword !== customer.password) {
            alert('Current password is incorrect');
            return false;
        }

        // Update customer data
        const updatedCustomer = {
            ...customer,
            name: document.getElementById('editName').value,
            email: document.getElementById('editEmail').value,
            phone: document.getElementById('editPhone').value,
            password: newPassword || customer.password
        };

        // Update localStorage
        const customers = JSON.parse(localStorage.getItem('customers')) || [];
        const customerIndex = customers.findIndex(c => c.email === customer.email);
        
        if (customerIndex === -1) {
            throw new Error('Customer not found');
        }

        customers[customerIndex] = updatedCustomer;
        localStorage.setItem('customers', JSON.stringify(customers));
        localStorage.setItem('currentCustomer', JSON.stringify(updatedCustomer));

        alert('Profile updated successfully');
        return false;
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile. Please try again.');
        return false;
    }
}

// Setup time range filter
function setupTimeRangeFilter() {
    const timeRange = document.getElementById('timeRange');
    timeRange.addEventListener('change', loadDashboardOverview);
}

// Logout
function logout() {
    localStorage.removeItem('currentCustomer');
    window.location.href = 'auth.html';
}

// Payment Modal Functions
let currentOrderAmount = 0;

function showPaymentModal(amount) {
    currentOrderAmount = amount;
    document.getElementById('upiAmount').textContent = `₹${amount.toFixed(2)}`;
    document.getElementById('cardAmount').textContent = `₹${amount.toFixed(2)}`;
    document.getElementById('paymentModal').classList.add('active');
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('active');
    resetPaymentForms();
}

function switchPaymentTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update forms
    document.querySelectorAll('.payment-form').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById(`${tab}Form`).classList.add('active');
}

function resetPaymentForms() {
    // Reset card form
    document.getElementById('cardNumber').value = '';
    document.getElementById('cardExpiry').value = '';
    document.getElementById('cardCvv').value = '';
    document.getElementById('cardHolder').value = '';

    // Reset to UPI tab
    switchPaymentTab('upi');
}

// UPI Payment Functions
function confirmUPIPayment() {
    // Simulate UPI payment processing
    showLoadingState();
    
    setTimeout(() => {
        // In a real application, you would verify the payment with your backend
        const paymentSuccess = true; // This would come from your payment gateway

        if (paymentSuccess) {
            processSuccessfulPayment('UPI');
        } else {
            showPaymentError('UPI payment failed. Please try again.');
        }
    }, 2000);
}

// Card Payment Functions
function processCardPayment() {
    const cardNumber = document.getElementById('cardNumber').value;
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCvv = document.getElementById('cardCvv').value;
    const cardHolder = document.getElementById('cardHolder').value;

    // Basic validation
    if (!validateCardDetails(cardNumber, cardExpiry, cardCvv, cardHolder)) {
        return;
    }

    // Simulate card payment processing
    showLoadingState();
    
    setTimeout(() => {
        // In a real application, you would integrate with a payment gateway
        const paymentSuccess = true; // This would come from your payment gateway

        if (paymentSuccess) {
            processSuccessfulPayment('Card');
        } else {
            showPaymentError('Card payment failed. Please try again.');
        }
    }, 2000);
}

function validateCardDetails(cardNumber, cardExpiry, cardCvv, cardHolder) {
    // Remove spaces from card number
    cardNumber = cardNumber.replace(/\s/g, '');

    // Basic validation
    if (!/^\d{16}$/.test(cardNumber)) {
        showPaymentError('Please enter a valid 16-digit card number');
        return false;
    }

    if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(cardExpiry)) {
        showPaymentError('Please enter a valid expiry date (MM/YY)');
        return false;
    }

    if (!/^\d{3,4}$/.test(cardCvv)) {
        showPaymentError('Please enter a valid CVV');
        return false;
    }

    if (!cardHolder.trim()) {
        showPaymentError('Please enter the card holder name');
        return false;
    }

    return true;
}

// Payment Processing Functions
function showLoadingState() {
    const paymentBtn = document.querySelector('.payment-btn');
    paymentBtn.disabled = true;
    paymentBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
}

function processSuccessfulPayment(method) {
    // Update order status
    const orderId = localStorage.getItem('currentOrderId');
    if (orderId) {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const orderIndex = orders.findIndex(order => order.id === orderId);
        
        if (orderIndex !== -1) {
            orders[orderIndex].paymentStatus = 'Paid';
            orders[orderIndex].paymentMethod = method;
            orders[orderIndex].paymentDate = new Date().toISOString();
            localStorage.setItem('orders', JSON.stringify(orders));
        }
    }

    // Show success message
    showPaymentSuccess();
}

function showPaymentSuccess() {
    const modalContent = document.querySelector('.modal-content');
    modalContent.innerHTML = `
        <div class="modal-header">
            <h3>Payment Successful</h3>
            <button class="close-btn" onclick="closePaymentModal()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="modal-body">
            <div class="payment-success">
                <i class="fas fa-check-circle"></i>
                <h4>Thank you for your payment!</h4>
                <p>Your order has been confirmed.</p>
                <button class="payment-btn" onclick="closePaymentModal()">
                    <i class="fas fa-check"></i> Continue Shopping
                </button>
            </div>
        </div>
    `;
}

function showPaymentError(message) {
    const paymentBtn = document.querySelector('.payment-btn');
    paymentBtn.disabled = false;
    paymentBtn.innerHTML = '<i class="fas fa-lock"></i> Pay Securely';
    
    alert(message);
}

// Add event listeners for card input formatting
document.addEventListener('DOMContentLoaded', function() {
    const cardNumber = document.getElementById('cardNumber');
    const cardExpiry = document.getElementById('cardExpiry');

    if (cardNumber) {
        cardNumber.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            value = value.replace(/\D/g, '');
            value = value.replace(/(\d{4})/g, '$1 ').trim();
            e.target.value = value;
        });
    }

    if (cardExpiry) {
        cardExpiry.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2);
            }
            e.target.value = value;
        });
    }
});

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', initDashboard); 