// Tab switching functionality
const tabBtns = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        // Update active tab button
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Show corresponding form
        authForms.forEach(form => {
            form.classList.remove('active');
            if (form.id === `${tabName}-form`) {
                form.classList.add('active');
            }
        });
    });
});

// Handle Seller Login
function handleSellerLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;

    // Get stored sellers
    const sellers = JSON.parse(localStorage.getItem('sellers')) || [];
    const seller = sellers.find(s => s.email === email && s.password === password);

    if (seller) {
        // Store login status if remember me is checked
        if (rememberMe) {
            localStorage.setItem('currentSeller', JSON.stringify(seller));
        } else {
            sessionStorage.setItem('currentSeller', JSON.stringify(seller));
        }
        
        // Redirect to seller dashboard
        window.location.href = 'seller-dashboard.html';
    } else {
        alert('Invalid email or password');
    }
}

// Handle Seller Registration
function handleSellerRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const storeName = document.getElementById('register-store').value;
    const address = document.getElementById('register-address').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    // Validate password match
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    // Get stored sellers
    const sellers = JSON.parse(localStorage.getItem('sellers')) || [];

    // Check if seller already exists
    if (sellers.some(seller => seller.email === email)) {
        alert('Email already registered');
        return;
    }

    // Create new seller
    const newSeller = {
        id: Date.now(),
        name,
        email,
        phone,
        storeName,
        address,
        password,
        createdAt: new Date().toISOString(),
        isApproved: false // Admin approval required
    };

    // Add seller to storage
    sellers.push(newSeller);
    localStorage.setItem('sellers', JSON.stringify(sellers));

    alert('Registration successful! Please wait for admin approval.');
    window.location.href = 'seller-auth.html';
}

// Check if seller is already logged in
function checkAuthStatus() {
    const currentSeller = JSON.parse(localStorage.getItem('currentSeller')) || JSON.parse(sessionStorage.getItem('currentSeller'));
    
    if (currentSeller) {
        window.location.href = 'seller-dashboard.html';
    }
}

// Run on page load
checkAuthStatus(); 