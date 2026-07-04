// === 🔥 FIREBASE SETUP (आपका जादुई क्लाउड कनेक्शन) 🔥 ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0P1T-OxFHBYSWq9m5xHdL-tiDdQXsgsY",
  authDomain: "smart-mobile-care-19839.firebaseapp.com",
  projectId: "smart-mobile-care-19839",
  storageBucket: "smart-mobile-care-19839.firebasestorage.app",
  messagingSenderId: "660542073783",
  appId: "1:660542073783:web:f9e6bc7a733b1701105632"
};

// Initialize Firebase & Firestore Database
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// === 1. Reusable Logic for Block & Delete (Admin & Customer) ===
function handleTableActions(e, userType) {
    const target = e.target;
    
    // DELETE Logic
    if (target.classList.contains('btn-delete-super')) {
        const confirmDelete = confirm(`WARNING: Are you sure you want to permanently DELETE this ${userType}? This action cannot be undone.`);
        if (confirmDelete) {
            // Remove the whole row <tr>
            target.closest('tr').remove();
            alert(`✅ ${userType} deleted successfully.`);
        }
    }

    // BLOCK / UNBLOCK Logic
    if (target.classList.contains('btn-block')) {
        const btn = target;
        // Find the status <span> in the same row
        const statusCell = btn.closest('tr').querySelector('span[class^="status-"]');

        if (btn.innerText === "Block") {
            const confirmBlock = confirm(`Are you sure you want to BLOCK this ${userType}?`);
            if (confirmBlock) {
                btn.innerText = "Unblock";
                btn.style.backgroundColor = "#10b981"; // Green color
                statusCell.innerText = "Blocked";
                statusCell.className = "status-blocked";
                alert(`🚫 ${userType} has been blocked.`);
            }
        } else {
            btn.innerText = "Block";
            btn.style.backgroundColor = "#ef4444"; // Red color
            statusCell.innerText = "Active";
            statusCell.className = "status-active";
            alert(`✅ ${userType} access restored.`);
        }
    }
}

// Attach Event Listeners to both tables
const masterAdminTableBody = document.getElementById('masterAdminTableBody');
if (masterAdminTableBody) {
    masterAdminTableBody.addEventListener('click', (e) => handleTableActions(e, 'Shop Admin'));
}

const masterCustomerTableBody = document.getElementById('masterCustomerTableBody');
if (masterCustomerTableBody) {
    masterCustomerTableBody.addEventListener('click', (e) => handleTableActions(e, 'Customer'));
}


// === 2. Global Maintenance Mode Logic ===
const maintenanceToggle = document.getElementById('maintenanceToggle');
if (maintenanceToggle) {
    maintenanceToggle.addEventListener('change', function() {
        if (this.checked) {
            alert("⚠️ WARNING: Maintenance Mode is now ON. The customer website is currently offline for updates.");
            console.log("System Status: MAINTENANCE MODE");
        } else {
            alert("✅ Maintenance Mode is now OFF. The customer website is live and accessible to everyone.");
            console.log("System Status: ONLINE");
        }
    });
}


// === 3. Generate Security Key Logic (🔥 FIREBASE DATABASE ADDED 🔥) ===
const btnGenerateKey = document.getElementById('btnGenerateKey');
const generatedKeyInput = document.getElementById('generatedKey');

if (btnGenerateKey) {
    // Note: 'async' लगाया गया है ताकि डेटाबेस में सेव होने का इंतज़ार किया जा सके
    btnGenerateKey.addEventListener('click', async () => {
        
        // बटन का टेक्स्ट बदलें ताकि पता चले कि प्रोसेसिंग हो रही है
        const originalText = btnGenerateKey.innerText;
        btnGenerateKey.innerText = "Saving to Cloud...";
        btnGenerateKey.disabled = true;

        try {
            // Key Generate करने का लॉजिक (आपका पुराना लॉजिक)
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let newKey = '';
            for (let i = 0; i < 8; i++) {
                newKey += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            const formattedKey = newKey.slice(0, 4) + '-' + newKey.slice(4, 8);
            
            // 🔥 Firebase Database में सेव करना 🔥
            // यह 'security_keys' नाम का फोल्डर बनाएगा और उसमें यह कोड सेव कर देगा
            await addDoc(collection(db, "security_keys"), {
                secretCode: formattedKey,
                isUsed: false, // यह चेक करने के लिए कि कोड इस्तेमाल हुआ या नहीं
                createdAt: serverTimestamp() // यह सेव करेगा कि कोड कितने बजे बना
            });

            // UI पर कोड दिखाना और Success मैसेज
            generatedKeyInput.value = formattedKey;
            alert(`✅ Database Success!\n\nNew Security Key Saved to Cloud: ${formattedKey}\n\nआप यह सीक्रेट कोड नए दुकानदार को रजिस्ट्रेशन के लिए दे सकते हैं।`);
            
        } catch (error) {
            // अगर डेटाबेस में सेव होने में कोई दिक्कत आए
            console.error("Firebase Error: ", error);
            alert("❌ Database Error! Could not save the key. Please check your internet or console.");
        } finally {
            // बटन को वापस नॉर्मल कर देना
            btnGenerateKey.innerText = originalText;
            btnGenerateKey.disabled = false;
        }
    });
                }
                                    
