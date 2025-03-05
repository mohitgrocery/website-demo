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

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;

    // Get stored users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // Store login status if remember me is checked
        if (rememberMe) {
            localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
            sessionStorage.setItem('currentUser', JSON.stringify(user));
        }
        
        // Redirect to account page
        window.location.href = 'account.html';
    } else {
        alert('Invalid email or password');
    }
}

// Handle Registration
function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const address = document.getElementById('register-address').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    // Validate password match
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    // Get stored users
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Check if user already exists
    if (users.some(user => user.email === email)) {
        alert('Email already registered');
        return;
    }

    // Create new user
    const newUser = {
        id: Date.now(),
        name,
        email,
        phone,
        address,
        password,
        orders: [],
        createdAt: new Date().toISOString()
    };

    // Add user to storage
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Auto login after registration
    sessionStorage.setItem('currentUser', JSON.stringify(newUser));

    // Redirect to account page
    window.location.href = 'account.html';
}

// Check if user is already logged in
function checkAuthStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (currentUser) {
        window.location.href = 'account.html';
    }
}

// Run on page load
checkAuthStatus(); 