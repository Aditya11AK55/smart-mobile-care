// === 🔥 FIREBASE SETUP 🔥 ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, serverTimestamp, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// === 🌟 REPAIR TRACKING MANAGEMENT (SOFT DELETE) 🌟 ===
const repairCustName = document.getElementById('repairCustName');
const repairCustPhone = document.getElementById('repairCustPhone');
const repairDevice = document.getElementById('repairDevice');
const btnAddRepair = document.getElementById('btnAddRepair');
const repairTableBody = document.getElementById('repairTableBody');

async function loadRepairs() {
    repairTableBody.innerHTML = "<tr><td colspan='5'>Loading... ⏳</td></tr>";
    try {
        const q = query(collection(db, "repairs"), where("adminPhone", "==", loggedInUser));
        const querySnapshot = await getDocs(q);
        repairTableBody.innerHTML = ""; 
        let count = 0;

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const repId = docSnap.id;
            
            // 🛡️ SOFT DELETE LOGIC: अगर डेटा डिलीटेड नहीं है, तभी टेबल में दिखाएं
            if (data.isDeleted !== true) {
                count++;
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
            }
        });

        if(count === 0) {
            repairTableBody.innerHTML = "<tr><td colspan='5'>No active repairs found.</td></tr>";
        }

        // Status Update Logic
        document.querySelectorAll('.status-dropdown').forEach(dropdown => {
            dropdown.addEventListener('change', async (e) => {
                const id = e.target.getAttribute('data-id');
                const newStatus = e.target.value;
                try {
                    await updateDoc(doc(db, "repairs", id), { status: newStatus });
                } catch(err) { alert("❌ Error updating status!"); }
            });
        });

        // 🗑️ Soft Delete Repair Logic
        document.querySelectorAll('.repair-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if(confirm("⚠️ Are you sure you want to delete this repair job?")) {
                    const id = e.target.getAttribute('data-id');
                    e.target.innerText = "Deleting...";
                    try {
                        // असली deleteDoc की जगह updateDoc का इस्तेमाल कर रहे हैं
                        await updateDoc(doc(db, "repairs", id), { isDeleted: true });
                        loadRepairs(); // टेबल रीफ्रेश करें
                    } catch(err) {
                        alert("❌ Could not delete.");
                        e.target.innerText = "Delete";
                    }
                }
            });
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
            adminPhone: loggedInUser,
            createdAt: serverTimestamp()
        });
        alert("✅ Added!");
        loadRepairs();
    } catch(e) { alert("Error!"); }
});

// === 🛒 PRODUCTS MANAGEMENT (SOFT DELETE) ===
const btnAddProduct = document.getElementById('btnAddProduct');
const adminProductTableBody = document.getElementById('adminProductTableBody');
const statProducts = document.getElementById('statProducts');

btnAddProduct.addEventListener('click', async () => {
    try {
        await addDoc(collection(db, "products"), {
            category: document.getElementById('productCategory').value,
            name: document.getElementById('productName').value,
            price: document.getElementById('productPrice').value,
            adminPhone: loggedInUser,
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
        
        if (adminProductTableBody) adminProductTableBody.innerHTML = ""; 
        let count = 0;

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            
            // 🛡️ SOFT DELETE LOGIC: अगर डिलीटेड नहीं है, तभी दिखाएं
            if (data.isDeleted !== true) {
                count++;
                if (adminProductTableBody) {
                    const newRow = document.createElement('tr');
                    newRow.innerHTML = `
                        <td>${data.category || ''}</td>
                        <td>${data.name}</td>
                        <td>${data.price}</td>
                        <td><button class="btn-delete product-delete" data-id="${docSnap.id}">Delete</button></td>
                    `;
                    adminProductTableBody.appendChild(newRow);
                }
            }
        });
        
        if (statProducts) statProducts.innerText = count; // टोटल नंबर अपडेट करें
        if(count === 0 && adminProductTableBody) {
            adminProductTableBody.innerHTML = "<tr><td colspan='4'>No products found. Add one above!</td></tr>";
        }
    } catch(e) { console.error(e); }
}
loadProducts();

// 🗑️ Soft Delete Product Logic
if (adminProductTableBody) {
    adminProductTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('product-delete') || e.target.classList.contains('btn-delete')) {
            if (confirm("⚠️ क्या आप वाकई इस प्रोडक्ट को हटाना चाहते हैं?")) {
                const btn = e.target;
                const productId = btn.getAttribute("data-id");
                btn.innerText = "Deleting...";
                btn.disabled = true;
                try {
                    // असली deleteDoc की जगह updateDoc
                    await updateDoc(doc(db, "products", productId), { isDeleted: true });
                    alert("✅ प्रोडक्ट हटा दिया गया!");
                    loadProducts(); // टेबल रीफ्रेश
                } catch (error) {
                    alert("❌ एरर: प्रोडक्ट नहीं हट सका।");
                    btn.innerText = "Delete";
                    btn.disabled = false;
                }
            }
        }
    });
}

// === SHOP SETTINGS & OTHER LOGICS (SAME AS BEFORE) ===
// (आपकी पुरानी शॉप क्लोजर और ऑफर वाली लॉजिक जो पहले थी, वो आप यहाँ नीचे जोड़ सकते हैं)
