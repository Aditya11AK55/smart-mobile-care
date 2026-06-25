// === 1. Getting all required HTML elements ===
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotForm = document.getElementById('forgotForm');

const formTitle = document.getElementById('formTitle');
const formSubtitle = document.getElementById('formSubtitle');

// Links
const linkCreate = document.getElementById('linkCreate');
const linkForgot = document.getElementById('linkForgot');
const linkBackToLogin1 = document.getElementById('linkBackToLogin1');
const linkBackToLogin2 = document.getElementById('linkBackToLogin2');

// Buttons
const btnLogin = document.getElementById('btnLogin');
const btnRegister = document.getElementById('btnRegister');
const btnResetPass = document.getElementById('btnResetPass');

// === 2. Logic to Switch Between Forms ===

// Show Create Account Form
linkCreate.addEventListener('click', (e) => {
    e.preventDefault(); // Prevents page reload
    loginForm.classList.replace('active-form', 'hidden-form');
    registerForm.classList.replace('hidden-form', 'active-form');
    formTitle.innerText = "Create Account";
    formSubtitle.innerText = "Register with your secret admin code";
});

// Show Forgot Password Form
linkForgot.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.replace('active-form', 'hidden-form');
    forgotForm.classList.replace('hidden-form', 'active-form');
    formTitle.innerText = "Reset Password";
    formSubtitle.innerText = "Verify your secret code to reset password";
});

// Go Back to Login Form (from Register)
linkBackToLogin1.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.replace('active-form', 'hidden-form');
    loginForm.classList.replace('hidden-form', 'active-form');
    formTitle.innerText = "Owner Login";
    formSubtitle.innerText = "Enter your credentials to access the dashboard";
});

// Go Back to Login Form (from Forgot Password)
linkBackToLogin2.addEventListener('click', (e) => {
    e.preventDefault();
    forgotForm.classList.replace('active-form', 'hidden-form');
    loginForm.classList.replace('hidden-form', 'active-form');
    formTitle.innerText = "Owner Login";
    formSubtitle.innerText = "Enter your credentials to access the dashboard";
});

// === 3. Action Buttons Logic (Frontend Simulation) ===

// Secure Login Button Logic
btnLogin.addEventListener('click', () => {
    const mobile = document.getElementById('loginMobile').value;
    const pass = document.getElementById('loginPassword').value;
    
    if(mobile === "" || pass === "") {
        alert("Please enter both Mobile Number and Password!");
        return;
    }
    
    // Redirecting to Dashboard Page (यह लाइन हमने नई जोड़ी है)
    window.location.href = "dashboard.html";
});

// Create Account Button Logic
btnRegister.addEventListener('click', () => {
    const mobile = document.getElementById('regMobile').value;
    const pass = document.getElementById('regPassword').value;
    const code = document.getElementById('regCode').value;

    if(mobile === "" || pass === "" || code === "") {
        alert("Please fill all the fields!");
        return;
    }
    
    alert("Account Created Successfully! Your Secret Code is now securely locked to this Mobile Number.");
    // Redirecting back to login form after successful registration
    linkBackToLogin1.click();
});

// Reset Password Button Logic
btnResetPass.addEventListener('click', () => {
    const mobile = document.getElementById('forgotMobile').value;
    const code = document.getElementById('forgotCode').value;
    const newPass = document.getElementById('forgotNewPassword').value;

    if(mobile === "" || code === "" || newPass === "") {
        alert("Please fill all the details to reset password!");
        return;
    }
    
    alert("Password Reset Successful! You can now login with your new password.");
    linkBackToLogin2.click();
});
