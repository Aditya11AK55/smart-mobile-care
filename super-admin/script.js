// Getting elements
const btnSuperLogin = document.getElementById('btnSuperLogin');
const superUser = document.getElementById('superUser');
const superPass = document.getElementById('superPass');
const superPin = document.getElementById('superPin');

// Super Admin Credentials (सिर्फ आपके लिए)
const MASTER_USERNAME = "superadmin";
const MASTER_PASSWORD = "masterpassword123";
const MASTER_PIN = "9999";

btnSuperLogin.addEventListener('click', () => {
    const user = superUser.value.trim();
    const pass = superPass.value.trim();
    const pin = superPin.value.trim();

    // 1. Check if any field is empty
    if (user === "" || pass === "" || pin === "") {
        alert("⚠️ Please fill all the security fields.");
        return;
    }

    // 2. Verify Credentials
    if (user === MASTER_USERNAME && pass === MASTER_PASSWORD && pin === MASTER_PIN) {
        alert("✅ Access Granted! Welcome, Super Admin.");
        // Redirecting to Super Admin Dashboard (हम इसे अगले स्टेप में बनाएंगे)
        window.location.href = "super-dashboard.html";
    } else {
        alert("❌ Access Denied! Incorrect Username, Password, or PIN.");
        // Security feature: Clear the PIN box on wrong attempt
        superPin.value = "";
    }
});
