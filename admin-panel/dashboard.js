// === 🔥 FIREBASE SETUP 🔥 ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, setDoc, getDoc, updateDoc, serverTimestamp, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

const loggedInUser = localStorage.getItem("loggedInAdminMobile");
if (!loggedInUser) {
    window.location.href = "index.html";
}

// === 🔐 SECURITY GUARD (SESSION VALIDATION) ===
async function verifyAdminSession() {
    try {
        const q = query(collection(db, "shop_admins"), where("mobile", "==", loggedInUser));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            localStorage.removeItem("loggedInAdminMobile");
            alert("⚠️ Your account has been deleted.");
            window.location.href = "index.html";
            return;
        }
        querySnapshot.forEach((docSnap) => {
            if (docSnap.data().status === "Blocked") {
                localStorage.removeItem("loggedInAdminMobile");
                alert("🚫 Your account is blocked.");
                window.location.href = "index.html";
            }
        });
    } catch (error) { console.error(error); }
}
verifyAdminSession();

// === 🌟 REPAIR TRACKING MANAGEMENT (OWNERSHIP LOGIC) 🌟 ===
const repairCustName = document.getElementById('repairCustName');
const repairCustPhone = document.getElementById('repairCustPhone');
const repairDevice = document.getElementById('repairDevice');
const btnAddRepair = document.getElementById('btnAddRepair');
const repairTableBody = document.getElementById('repairTableBody');

async function loadRepairs() {
    repairTableBody.innerHTML = "<tr><td colspan='5'>Loading... ⏳</td></tr>";
    try {
        // सिर्फ इस दुकानदार का डेटा लोड करें
        const q = query(collection(db, "repairs"), where("adminPhone", "==", loggedInUser));
        const querySnapshot = await getDocs(q);
        repairTableBody.innerHTML = ""; 
        
        if(querySnapshot.empty) {
            repairTableBody.innerHTML = "<tr><td colspan='5'>No active repairs found.</td></tr>";
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const repId = docSnap.id;
            repairTableBody.innerHTML += `
                <tr>
                    <td style="font-weight: bold; color: #2563eb;">${data.trackingId}</td>
                    <td><b>${data.name}</b><br><small>${data.phone}</small></td>
                    <td>${data.device}</td>
                    <td>
                        <select class="admin-input status-dropdown" data-id="${repId}">
                            <option value="Received" ${data.status === 'Received' ? 'selected' : ''}>📥 Received</option>
                            <option value="Repairing" ${data.status === 'Repairing' ? 'selected' : ''}>⏳ Repairing</option>
                            <option value="Ready for Pickup" ${data.status === 'Ready for Pickup' ? 'selected' : ''}>✅ Ready</option>
                            <option value="Delivered" ${data.status === 'Delivered' ? 'selected' : ''}>🚀 Delivered</option>
                        </select>
                    </td>
                    <td><button class="btn-delete repair-delete" data-id="${repId}">Delete</button></td>
                </tr>
            `;
        });
    } catch (e) { repairTableBody.innerHTML = "<tr><td colspan='5' style='color:red;'>Error!</td></tr>"; }
}
loadRepairs();

btnAddRepair.addEventListener('click', async () => {
    try {
        await addDoc(collection(db, "repairs"), {
            trackingId: "REP-" + Math.floor(1000 + Math.random() * 9000),
            name: repairCustName.value,
            phone: repairCustPhone.value,
            device: repairDevice.value,
            status: "Received",
            adminPhone: loggedInUser, // 🔥 Ownership Tag Added
            createdAt: serverTimestamp()
        });
        alert("✅ Added!");
        loadRepairs();
    } catch(e) { alert("Error!"); }
});

// === 🛒 PRODUCTS MANAGEMENT (OWNERSHIP LOGIC) ===
const btnAddProduct = document.getElementById('btnAddProduct');
btnAddProduct.addEventListener('click', async () => {
    try {
        await addDoc(collection(db, "products"), {
            category: document.getElementById('productCategory').value,
            name: document.getElementById('productName').value,
            price: document.getElementById('productPrice').value,
            adminPhone: loggedInUser, // 🔥 Ownership Tag Added
            createdAt: serverTimestamp()
        });
        alert("✅ Product Added!");
        loadProducts();
    } catch(e) { alert("Error!"); }
});

async function loadProducts() {
    try {
        const q = query(collection(db, "products"), where("adminPhone", "==", loggedInUser));
        const querySnapshot = await getDocs(q);
        // (बाकी टेबल रेंडरिंग लॉजिक आपका वही रहेगा)
        // ध्यान दें: डिलीट करने के लिए भी आप deleteDoc का उपयोग इसी तरह करेंगे
    } catch(e) { console.error(e); }
}

// === SHOP SETTINGS & OTHER LOGICS (SAME AS BEFORE) ===
// (आपकी पुरानी शॉप क्लोजर और ऑफर वाली लॉजिक यहाँ नीचे जोड़ दें)
