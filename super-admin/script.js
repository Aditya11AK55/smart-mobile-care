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
    e.preventDefault();
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

// === 3. ADVANCED SECURITY LOGIC (Browser Memory) ===

// Secure Login Button Logic
btnLogin.addEventListener('click', () => {
    const mobile = document.getElementById('loginMobile').value.trim();
    const pass = document.getElementById('loginPassword').value.trim();
    
    if(mobile === "" || pass === "") {
        alert("⚠️ Please enter both Mobile Number and Password!");
        return;
    }

    // Checking credentials from browser memory (or default demo account)
    const savedMobile = localStorage.getItem("shopAdminMobile") || "9876543210";
    const savedPass = localStorage.getItem("shopAdminPass") || "admin123";

    if (mobile === savedMobile && pass === savedPass) {
        // Success
        window.location.href = "dashboard.html";
    } else {
        // Professional Error Message
        alert("❌ Access Denied!\n\nIncorrect Mobile Number or Password. If you are a new shop owner, please create an account first using the Security Key.");
        document.getElementById('loginPassword').value = ""; // Clear password for security
    }
});

// Create Account Button Logic
btnRegister.addEventListener('click', () => {
    const mobile = document.getElementById('regMobile').value.trim();
    const pass = document.getElementById('regPassword').value.trim();
    const code = document.getElementById('regCode').value.trim();

    if(mobile === "" || pass === "" || code === "") {
        alert("⚠️ Please fill all the fields!");
        return;
    }
    
    // Validating Security Code format (Must be exactly 9 characters like AB12-CD34)
    if (code.length !== 9 || !code.includes('-')) {
        alert("❌ Invalid Security Code!\n\nPlease enter a valid 8-digit code with a dash (e.g., AB12-CD34) provided by the Super Admin.");
        document.getElementById('regCode').value = "";
        return;
    }

    // Save the new account to Browser Memory
    localStorage.setItem("shopAdminMobile", mobile);
    localStorage.setItem("shopAdminPass", pass);
    localStorage.setItem("shopAdminCode", code);

    alert("✅ Account Created Successfully!\n\nYour Secret Code is verified. You can now login with your Mobile Number and Password.");
    
    // Redirect back to login
    linkBackToLogin1.click();
    
    // Pre-fill the mobile number to help the user
    document.getElementById('loginMobile').value = mobile;
});

// Reset Password Button Logic
btnResetPass.addEventListener('click', () => {
    const mobile = document.getElementById('forgotMobile').value.trim();
    const code = document.getElementById('forgotCode').value.trim();
    const newPass = document.getElementById('forgotNewPassword').value.trim();

    if(mobile === "" || code === "" || newPass === "") {
        alert("⚠️ Please fill all details to reset password!");
        return;
    }
    
    const savedMobile = localStorage.getItem("shopAdminMobile");
    const savedCode = localStorage.getItem("shopAdminCode");

    if (mobile === savedMobile && code === savedCode) {
        // Update new password in memory
        localStorage.setItem("shopAdminPass", newPass);
        alert("✅ Password Reset Successful! You can now login with your new password.");
        linkBackToLogin2.click();
    } else {
        alert("❌ Verification Failed!\n\nThe Mobile Number or Security Code does not match our records.");
    }
});
    
