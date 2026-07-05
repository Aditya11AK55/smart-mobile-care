// === 🔥 FIREBASE SETUP (आपका जादुई क्लाउड कनेक्शन) 🔥 ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// === 1. FETCH & DISPLAY SHOP ADMINS (असली डेटाबेस से लाना) ===
const masterAdminTableBody = document.getElementById('masterAdminTableBody');

async function loadShopAdmins() {
    masterAdminTableBody.innerHTML = "<tr><td colspan='4'>Loading from Database... ⏳</td></tr>";
    try {
        const snapshot = await getDocs(collection(db, "shop_admins"));
        masterAdminTableBody.innerHTML = ""; // पुराने डमी डेटा को साफ़ कर देगा

        if(snapshot.empty) {
            masterAdminTableBody.innerHTML = "<tr><td colspan='4' style='text-align:center; color:#888;'>No Shop Admins Registered Yet.</td></tr>";
            return;
        }

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const adminId = docSnap.id;
            
            // ब्लॉक/एक्टिव का लॉजिक
            const statusText = data.status || "Active";
            const statusClass = statusText === "Blocked" ? "status-blocked" : "status-active";
            const btnText = statusText === "Blocked" ? "Unblock" : "Block";
            const btnColor = statusText === "Blocked" ? "#10b981" : "#ef4444"; // हरा या लाल

            masterAdminTableBody.innerHTML += `
                <tr>
                    <td>Shop Owner</td>
                    <td>${data.mobile}</td>
                    <td><span class="${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn-block" data-id="${adminId}" data-type="shop_admins" style="background-color: ${btnColor}">${btnText}</button>
                        <button class="btn-delete-super" data-id="${adminId}" data-type="shop_admins">Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error loading admins:", error);
        masterAdminTableBody.innerHTML = "<tr><td colspan='4' style='color:red;'>Error loading data!</td></tr>";
    }
}


// === 2. FETCH & DISPLAY CUSTOMERS (असली डेटाबेस से लाना) ===
const masterCustomerTableBody = document.getElementById('masterCustomerTableBody');

async function loadCustomers() {
    masterCustomerTableBody.innerHTML = "<tr><td colspan='4'>Loading from Database... ⏳</td></tr>";
    try {
        // (भविष्य में जब कस्टमर्स का डेटाबेस बनेगा, तो यह वहाँ से लाएगा)
        const snapshot = await getDocs(collection(db, "customers"));
        masterCustomerTableBody.innerHTML = ""; 

        if(snapshot.empty) {
            masterCustomerTableBody.innerHTML = "<tr><td colspan='4' style='text-align:center; color:#888;'>No Customers Registered Yet.</td></tr>";
            return;
        }

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const customerId = docSnap.id;
            
            const statusText = data.status || "Active";
            const statusClass = statusText === "Blocked" ? "status-blocked" : "status-active";
            const btnText = statusText === "Blocked" ? "Unblock" : "Block";
            const btnColor = statusText === "Blocked" ? "#10b981" : "#ef4444";

            masterCustomerTableBody.innerHTML += `
                <tr>
                    <td>${data.name || "Customer"}</td>
                    <td>${data.phone}</td>
                    <td><span class="${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn-block" data-id="${customerId}" data-type="customers" style="background-color: ${btnColor}">${btnText}</button>
                        <button class="btn-delete-super" data-id="${customerId}" data-type="customers">Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error loading customers:", error);
        masterCustomerTableBody.innerHTML = "<tr><td colspan='4' style='color:red;'>Error loading data!</td></tr>";
    }
}

// पेज लोड होते ही दोनों फंक्शन चलाएं
loadShopAdmins();
loadCustomers();


// === 3. BLOCK & DELETE LOGIC (सीधा डेटाबेस में बदलाव) ===
async function handleActionClick(e) {
    const target = e.target;
    
    // चेक करें कि बटन के अंदर ID है या नहीं
    if (!target.dataset.id) return; 

    const docId = target.dataset.id;
    const collectionName = target.dataset.type; // 'shop_admins' या 'customers'

    // --- DELETE LOGIC ---
    if (target.classList.contains('btn-delete-super')) {
        if(confirm("⚠️ WARNING: Are you sure you want to permanently DELETE this user from the Database? This cannot be undone.")) {
            target.innerText = "Deleting...";
            target.disabled = true;
            try {
                await deleteDoc(doc(db, collectionName, docId)); // Firebase से उड़ा दिया
                target.closest('tr').remove(); // स्क्रीन से भी हटा दिया
                alert("✅ User deleted permanently from database.");
            } catch(err) {
                console.error(err);
                alert("❌ Error deleting user.");
                target.innerText = "Delete";
                target.disabled = false;
            }
        }
    }

    // --- BLOCK / UNBLOCK LOGIC ---
    if (target.classList.contains('btn-block')) {
        const isBlocking = target.innerText === "Block";
        const newStatus = isBlocking ? "Blocked" : "Active";
        
        if(confirm(`Are you sure you want to ${isBlocking ? "BLOCK" : "UNBLOCK"} this user?`)) {
            target.innerText = "Updating...";
            target.disabled = true;
            try {
                // Firebase में स्टेटस अपडेट कर दिया
                await updateDoc(doc(db, collectionName, docId), { status: newStatus });
                
                // UI में बदलाव (रंग और टेक्स्ट)
                const statusSpan = target.closest('tr').querySelector('span[class^="status-"]');
                statusSpan.innerText = newStatus;
                statusSpan.className = newStatus === "Blocked" ? "status-blocked" : "status-active";
                target.innerText = isBlocking ? "Unblock" : "Block";
                target.style.backgroundColor = isBlocking ? "#10b981" : "#ef4444";
            } catch(err) {
                console.error(err);
                alert("❌ Error updating status.");
            } finally {
                target.disabled = false;
            }
        }
    }
}

// दोनों टेबल पर क्लिक लिसनर लगाना
masterAdminTableBody.addEventListener('click', handleActionClick);
masterCustomerTableBody.addEventListener('click', handleActionClick);


// === 4. SECURITY KEY GENERATOR (पुराना काम करने वाला लॉजिक) ===
const btnGenerateKey = document.getElementById('btnGenerateKey');
const generatedKeyInput = document.getElementById('generatedKey');

if (btnGenerateKey) {
    btnGenerateKey.addEventListener('click', async () => {
        const originalText = btnGenerateKey.innerText;
        btnGenerateKey.innerText = "Saving...";
        btnGenerateKey.disabled = true;

        try {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let newKey = '';
            for (let i = 0; i < 8; i++) {
                newKey += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            const formattedKey = newKey.slice(0, 4) + '-' + newKey.slice(4, 8);
            
            await addDoc(collection(db, "security_keys"), {
                secretCode: formattedKey,
                isUsed: false,
                createdAt: serverTimestamp()
            });

            generatedKeyInput.value = formattedKey;
            alert(`✅ Key Saved to Database!\n\nGive this to Shop Owner: ${formattedKey}`);
        } catch (error) {
            console.error(error);
            alert("❌ Database Error!");
        } finally {
            btnGenerateKey.innerText = originalText;
            btnGenerateKey.disabled = false;
        }
    });
                                }
