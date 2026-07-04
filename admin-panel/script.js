// === 🔥 FIREBASE SETUP (आपका जादुई क्लाउड कनेक्शन) 🔥 ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC0P1T-OxFHBYSWq9m5xHdL-tiDdQXsgsY",
  authDomain: "smart-mobile-care-19839.firebaseapp.com",
  projectId: "smart-mobile-care-19839",
  storageBucket: "smart-mobile-care-19839.firebasestorage.app",
  messagingSenderId: "660542073783",
  appId: "1:660542073783:web:f9e6bc7a733b1701105632"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// === 1. Getting all required HTML elements ===
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotForm = document.getElementById('forgotForm');

const formTitle = document.getElementById('formTitle');
const formSubtitle = document.getElementById('formSubtitle');

const linkCreate = document.getElementById('linkCreate');
const linkForgot = document.getElementById('linkForgot');
const linkBackToLogin1 = document.getElementById('linkBackToLogin1');
const linkBackToLogin2 = document.getElementById('linkBackToLogin2');

const btnLogin = document.getElementById('btnLogin');
const btnRegister = document.getElementById('btnRegister');
const btnResetPass = document.getElementById('btnResetPass');

// === 2. Logic to Switch Between Forms ===
linkCreate.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.replace('active-form', 'hidden-form');
    registerForm.classList.replace('hidden-form', 'active-form');
    formTitle.innerText = "Create Account";
    formSubtitle.innerText = "Register with your secret admin code";
});

linkForgot.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.replace('active-form', 'hidden-form');
    forgotForm.classList.replace('hidden-form', 'active-form');
    formTitle.innerText = "Reset Password";
    formSubtitle.innerText = "Verify your secret code to reset password";
});

linkBackToLogin1.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.replace('active-form', 'hidden-form');
    loginForm.classList.replace('hidden-form', 'active-form');
    formTitle.innerText = "Owner Login";
    formSubtitle.innerText = "Enter your credentials to access the dashboard";
});

linkBackToLogin2.addEventListener('click', (e) => {
    e.preventDefault();
    forgotForm.classList.replace('active-form', 'hidden-form');
    loginForm.classList.replace('hidden-form', 'active-form');
    formTitle.innerText = "Owner Login";
    formSubtitle.innerText = "Enter your credentials to access the dashboard";
}); 

// === 3. Action Buttons Logic (🔥 CONNECTED TO FIREBASE 🔥) ===

// --- SECURE LOGIN LOGIC ---
btnLogin.addEventListener('click', async () => {
    const mobile = document.getElementById('loginMobile').value.trim();
    const pass = document.getElementById('loginPassword').value.trim();
    
    if(mobile === "" || pass === "") {
        alert("Please enter both Mobile Number and Password!");
        return;
    }
    
    const originalText = btnLogin.innerText;
    btnLogin.innerText = "Verifying...";
    btnLogin.disabled = true;

    try {
        // डेटाबेस में चेक करें कि क्या यह मोबाइल और पासवर्ड मौजूद है?
        const q = query(collection(db, "shop_admins"), where("mobile", "==", mobile), where("password", "==", pass));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert("❌ Invalid Mobile Number or Password!");
        } else {
            // लॉगिन सफल होने पर मोबाइल नंबर ब्राउज़र में सेव कर लें ताकि डैशबोर्ड पर काम आए
            localStorage.setItem("loggedInAdminMobile", mobile);
            window.location.href = "dashboard.html";
        }
    } catch (error) {
        console.error("Login Error: ", error);
        alert("❌ Database Error! Please try again.");
    } finally {
        btnLogin.innerText = originalText;
        btnLogin.disabled = false;
    }
});

// --- CREATE ACCOUNT LOGIC ---
btnRegister.addEventListener('click', async () => {
    const mobile = document.getElementById('regMobile').value.trim();
    const pass = document.getElementById('regPassword').value.trim();
    const code = document.getElementById('regCode').value.trim();

    if(mobile === "" || pass === "" || code === "") {
        alert("Please fill all the fields!");
        return;
    }
    
    const originalText = btnRegister.innerText;
    btnRegister.innerText = "Checking Code...";
    btnRegister.disabled = true;

    try {
        // 1. चेक करें कि क्या यह कोड असली है और इस्तेमाल तो नहीं हुआ?
        const keyQuery = query(collection(db, "security_keys"), where("secretCode", "==", code), where("isUsed", "==", false));
        const keySnapshot = await getDocs(keyQuery);

        if (keySnapshot.empty) {
            alert("❌ Invalid or already used Secret Code! Please contact Super Admin.");
        } else {
            // 2. कोड सही है! अब दुकानदार का अकाउंट 'shop_admins' में सेव करें
            await addDoc(collection(db, "shop_admins"), {
                mobile: mobile,
                password: pass,
                secretCode: code,
                status: "Active"
            });

            // 3. कोड को 'isUsed: true' कर दें ताकि कोई और इसे दोबारा इस्तेमाल ना कर सके
            const keyDoc = keySnapshot.docs[0];
            await updateDoc(doc(db, "security_keys", keyDoc.id), {
                isUsed: true,
                usedByMobile: mobile
            });

            alert("✅ Account Created Successfully! Your Secret Code is now securely locked to this Mobile Number.");
            document.getElementById('regForm').reset(); // फॉर्म क्लियर करें
            linkBackToLogin1.click(); // वापस लॉगिन पेज पर भेजें
        }
    } catch (error) {
        console.error("Registration Error: ", error);
        alert("❌ Error connecting to database.");
    } finally {
        btnRegister.innerText = originalText;
        btnRegister.disabled = false;
    }
});

// --- RESET PASSWORD LOGIC ---
btnResetPass.addEventListener('click', async () => {
    const mobile = document.getElementById('forgotMobile').value.trim();
    const code = document.getElementById('forgotCode').value.trim();
    const newPass = document.getElementById('forgotNewPassword').value.trim();

    if(mobile === "" || code === "" || newPass === "") {
        alert("Please fill all the details to reset password!");
        return;
    }
    
    const originalText = btnResetPass.innerText;
    btnResetPass.innerText = "Updating...";
    btnResetPass.disabled = true;

    try {
        // चेक करें कि क्या यह मोबाइल और सीक्रेट कोड सही है?
        const q = query(collection(db, "shop_admins"), where("mobile", "==", mobile), where("secretCode", "==", code));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert("❌ Invalid Mobile Number or Secret Code!");
        } else {
            // पासवर्ड अपडेट करें
            const adminDoc = querySnapshot.docs[0];
            await updateDoc(doc(db, "shop_admins", adminDoc.id), {
                password: newPass
            });

            alert("✅ Password Reset Successful! You can now login with your new password.");
            linkBackToLogin2.click();
        }
    } catch (error) {
        console.error("Reset Password Error: ", error);
        alert("❌ Error updating password.");
    } finally {
        btnResetPass.innerText = originalText;
        btnResetPass.disabled = false;
    }
});
    
