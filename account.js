// Check if user is logged in
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || JSON.parse(sessionStorage.getItem('currentUser'));

if (!currentUser) {
    window.location.href = 'auth.html';
}

// DOM Elements
const menuItems = document.querySelectorAll('.menu-item');
const contentSections = document.querySelectorAll('.content-section');
const userMenuBtn = document.getElementById('userMenuBtn');
const userDropdown = document.querySelector('.user-dropdown');

// Initialize page
function initializePage() {
    // Set user information
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileEmail').textContent = currentUser.email;
    
    // Set overview information
    document.getElementById('totalOrders').textContent = currentUser.orders.length;
    document.getElementById('totalSpent').textContent = '₹' + calculateTotalSpent();
    document.getElementById('deliveryAddress').textContent = currentUser.address;
    document.getElementById('contactNumber').textContent = currentUser.phone;

    // Load orders
    loadOrders();

    // Set form values
    document.getElementById('editName').value = currentUser.name;
    document.getElementById('editEmail').value = currentUser.email;
    document.getElementById('editPhone').value = currentUser.phone;
    document.getElementById('editAddress').value = currentUser.address;
}

// Calculate total spent
function calculateTotalSpent() {
    return currentUser.orders.reduce((total, order) => total + order.total, 0);
}

// Load orders
function loadOrders() {
    const ordersList = document.getElementById('ordersList');
    
    if (currentUser.orders.length === 0) {
        ordersList.innerHTML = '<p class="no-orders">No orders yet</p>';
        return;
    }

    ordersList.innerHTML = currentUser.orders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <div>
                    <h3>Order #${order.id}</h3>
                    <p>Date: ${new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div>
                    <p class="order-status">${order.status}</p>
                    <p class="order-total">₹${order.total}</p>
                </div>
            </div>
            <div class="order-products">
                ${order.items.map(item => `
                    <div class="order-product">
                        <img src="${item.image}" alt="${item.name}">
                        <div>
                            <h4>${item.name}</h4>
                            <p>Quantity: ${item.quantity}</p>
                            <p>₹${item.price} each</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="order-footer">
                <div class="delivery-info">
                    <div class="delivery-status">
                        <i class="fas ${order.deliveryStatus === 'Delivered' ? 'fa-check-circle' : 'fa-truck'}"></i>
                        <span class="status-${order.deliveryStatus.toLowerCase()}">${order.deliveryStatus}</span>
                    </div>
                    <div class="delivery-details">
                        ${order.deliveryDate ? `
                            <p><i class="fas fa-calendar-check"></i> Delivered on: ${new Date(order.deliveryDate).toLocaleDateString()}</p>
                        ` : `
                            <p><i class="fas fa-clock"></i> Expected delivery: Within 2 hours</p>
                        `}
                        <p><i class="fas fa-map-marker-alt"></i> Delivery Address: ${currentUser.address}</p>
                    </div>
                </div>
                <div class="order-actions">
                    ${order.deliveryStatus === 'Processing' ? `
                        <button class="confirm-delivery-btn" onclick="confirmDelivery('${order.id}')">
                            <i class="fas fa-check"></i> Confirm Delivery
                        </button>
                    ` : ''}
                    <button class="download-bill-btn" onclick="generateBill('${order.id}')">
                        <i class="fas fa-download"></i> Download Bill
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Update profile
function updateProfile(event) {
    event.preventDefault();
    
    const name = document.getElementById('editName').value;
    const email = document.getElementById('editEmail').value;
    const phone = document.getElementById('editPhone').value;
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    // Update user object
    currentUser.name = name;
    currentUser.email = email;
    currentUser.phone = phone;

    // Update password if provided
    if (currentPassword && newPassword) {
        if (currentPassword === currentUser.password) {
            currentUser.password = newPassword;
        } else {
            alert('Current password is incorrect');
            return;
        }
    }

    // Update storage
    updateUserStorage();
    alert('Profile updated successfully');
}

// Update address
function updateAddress(event) {
    event.preventDefault();
    
    const address = document.getElementById('editAddress').value;
    const city = document.getElementById('editCity').value;
    const state = document.getElementById('editState').value;
    const pincode = document.getElementById('editPincode').value;

    // Update user object
    currentUser.address = `${address}, ${city}, ${state} - ${pincode}`;

    // Update storage
    updateUserStorage();
    
    // Update display
    document.getElementById('deliveryAddress').textContent = currentUser.address;
    alert('Address updated successfully');
}

// Update user storage
function updateUserStorage() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
    }

    if (localStorage.getItem('currentUser')) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Event Listeners
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        const sectionName = item.dataset.section;
        
        // Update active menu item
        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // Show corresponding section
        contentSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === sectionName) {
                section.classList.add('active');
            }
        });
    });
});

// Toggle user dropdown
userMenuBtn.addEventListener('click', () => {
    userDropdown.classList.toggle('active');
});

// Close dropdown when clicking outside
document.addEventListener('click', (event) => {
    if (!event.target.closest('.user-menu')) {
        userDropdown.classList.remove('active');
    }
});

// Initialize page on load
initializePage(); 