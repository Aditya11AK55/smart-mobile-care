// === 🔥 FIREBASE SETUP 🔥 ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, serverTimestamp, getDoc, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// === 1. FETCH & DISPLAY SHOP ADMINS ===
const masterAdminTableBody = document.getElementById('masterAdminTableBody');
async function loadShopAdmins() {
    masterAdminTableBody.innerHTML = "<tr><td colspan='4'>Loading from Database... ⏳</td></tr>";
    try {
        const snapshot = await getDocs(collection(db, "shop_admins"));
        masterAdminTableBody.innerHTML = ""; 
        if(snapshot.empty) {
            masterAdminTableBody.innerHTML = "<tr><td colspan='4' style='text-align:center; color:#888;'>No Shop Admins Registered Yet.</td></tr>";
            return;
        }
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const statusText = data.status || "Active";
            const statusClass = statusText === "Blocked" ? "status-blocked" : "status-active";
            const btnText = statusText === "Blocked" ? "Unblock" : "Block";
            const btnColor = statusText === "Blocked" ? "#10b981" : "#ef4444";
            masterAdminTableBody.innerHTML += `
                <tr>
                    <td>Shop Owner</td>
                    <td>${data.mobile}</td>
                    <td><span class="${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn-block" data-id="${docSnap.id}" data-type="shop_admins" style="background-color: ${btnColor}">${btnText}</button>
                        <button class="btn-delete-super" data-id="${docSnap.id}" data-type="shop_admins">Delete</button>
                    </td>
                </tr>`;
        });
    } catch (error) { masterAdminTableBody.innerHTML = "<tr><td colspan='4' style='color:red;'>Error loading data!</td></tr>"; }
}

// === 2. FETCH & DISPLAY CUSTOMERS ===
const masterCustomerTableBody = document.getElementById('masterCustomerTableBody');
async function loadCustomers() {
    masterCustomerTableBody.innerHTML = "<tr><td colspan='4'>Loading from Database... ⏳</td></tr>";
    try {
        const snapshot = await getDocs(collection(db, "customers"));
        masterCustomerTableBody.innerHTML = ""; 
        if(snapshot.empty) {
            masterCustomerTableBody.innerHTML = "<tr><td colspan='4' style='text-align:center; color:#888;'>No Customers Registered Yet.</td></tr>";
            return;
        }
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
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
                        <button class="btn-block" data-id="${docSnap.id}" data-type="customers" style="background-color: ${btnColor}">${btnText}</button>
                        <button class="btn-delete-super" data-id="${docSnap.id}" data-type="customers">Delete</button>
                    </td>
                </tr>`;
        });
    } catch (error) { masterCustomerTableBody.innerHTML = "<tr><td colspan='4' style='color:red;'>Error loading data!</td></tr>"; }
}

loadShopAdmins();
loadCustomers();

// === 3. BLOCK & DELETE LOGIC (Admins & Customers) ===
async function handleActionClick(e) {
    const target = e.target;
    if (!target.dataset.id) return; 
    const docId = target.dataset.id;
    const collectionName = target.dataset.type;

    if (target.classList.contains('btn-delete-super') && !target.classList.contains('btn-delete-key')) {
        if(confirm("⚠️ WARNING: Are you sure you want to permanently DELETE this user and their associated Security Key?")) {
            target.innerText = "Deleting..."; target.disabled = true;
            try {
                // 🔥 FIXED LOGIC: forEach की जगह for...of लूप 🔥
                if (collectionName === "shop_admins") {
                    const adminDoc = await getDoc(doc(db, collectionName, docId));
                    if (adminDoc.exists()) {
                        const adminData = adminDoc.data();
                        
                        // आपके डेटाबेस में Key जिस भी नाम से सेव हो रही हो, वह यहाँ कैच हो जाएगी
                        const usedKey = adminData.secretCode || adminData.securityKey || adminData.key || adminData.adminKey; 
                        
                        if (usedKey) {
                            const keyQ = query(collection(db, "security_keys"), where("secretCode", "==", usedKey));
                            const keySnap = await getDocs(keyQ);
                            
                            // यह पूरा इंतज़ार करेगा डेटाबेस से 'Key' के उड़ने का
                            for (const kDoc of keySnap.docs) {
                                await deleteDoc(doc(db, "security_keys", kDoc.id));
                            }
                        } else {
                            console.log("⚠️ No linked key found for this admin in database.");
                        }
                    }
                }

                // अब एडमिन अकाउंट को उड़ा दें
                await deleteDoc(doc(db, collectionName, docId));
                target.closest('tr').remove();

                // की (Key) वाली टेबल को रीफ्रेश कर दें
                if(typeof loadSecurityKeys === 'function') loadSecurityKeys();

                alert("✅ User and their associated Security Key deleted permanently!");
            } catch(err) {
                console.error(err);
                alert("❌ Error deleting."); target.innerText = "Delete"; target.disabled = false;
            }
        }
    }

    if (target.classList.contains('btn-block')) {
        const isBlocking = target.innerText === "Block";
        const newStatus = isBlocking ? "Blocked" : "Active";
        if(confirm(`Are you sure you want to ${isBlocking ? "BLOCK" : "UNBLOCK"} this user?`)) {
            target.innerText = "Updating..."; target.disabled = true;
            try {
                await updateDoc(doc(db, collectionName, docId), { status: newStatus });
                const statusSpan = target.closest('tr').querySelector('span[class^="status-"]');
                statusSpan.innerText = newStatus;
                statusSpan.className = newStatus === "Blocked" ? "status-blocked" : "status-active";
                target.innerText = isBlocking ? "Unblock" : "Block";
                target.style.backgroundColor = isBlocking ? "#10b981" : "#ef4444";
            } catch(err) { alert("❌ Error updating."); } 
            finally { target.disabled = false; }
        }
    }
}
masterAdminTableBody.addEventListener('click', handleActionClick);
masterCustomerTableBody.addEventListener('click', handleActionClick);


// === 🌟 4. SECURITY KEY MANAGER 🌟 ===
const btnGenerateKey = document.getElementById('btnGenerateKey');
const generatedKeyInput = document.getElementById('generatedKey');
const keyTableBody = document.getElementById('keyTableBody');

async function loadSecurityKeys() {
    if(!keyTableBody) return;
    keyTableBody.innerHTML = "<tr><td colspan='3'>Loading keys... ⏳</td></tr>";
    
    try {
        const snapshot = await getDocs(collection(db, "security_keys"));
        keyTableBody.innerHTML = "";
        
        if(snapshot.empty) {
            keyTableBody.innerHTML = "<tr><td colspan='3' style='text-align:center; color:#888;'>No keys generated yet.</td></tr>";
            return;
        }

        let keysArray = [];
        snapshot.forEach(docSnap => { keysArray.push({ id: docSnap.id, ...docSnap.data() }); });
        keysArray.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        keysArray.forEach(data => {
            const isUsed = data.isUsed || false;
                
            const statusSpan = isUsed 
                ? `<span style="color: #ef4444; font-weight: bold;">🔴 Used</span>` 
                : `<span style="color: #10b981; font-weight: bold;">🟢 Unused</span>`;
                
            const actionBtn = isUsed 
                ? `<span style="color: #666; font-size: 13px;">Cannot Delete (In Use)</span>`
                : `<button class="btn-delete-super btn-delete-key" data-id="${data.id}" style="padding: 6px 12px; font-size:13px;">Delete 🗑️</button>`;

            keyTableBody.innerHTML += `
                <tr>
                    <td style="font-family: monospace; font-size: 16px; color: #d4af37;">${data.secretCode}</td>
                    <td>${statusSpan}</td>
                    <td>${actionBtn}</td>
                </tr>
            `;
        });

        document.querySelectorAll('.btn-delete-key').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if(confirm("⚠️ Are you sure you want to delete this unused key? It will be permanently removed.")) {
                    const id = e.target.getAttribute('data-id');
                    e.target.innerText = "Deleting..."; e.target.disabled = true;
                    try {
                        await deleteDoc(doc(db, "security_keys", id));
                        loadSecurityKeys(); 
                    } catch(err) {
                        alert("❌ Error deleting key.");
                        e.target.innerText = "Delete 🗑️"; e.target.disabled = false;
                    }
                }
            });
        });

    } catch(err) {
        keyTableBody.innerHTML = "<tr><td colspan='3' style='color:red;'>Error loading keys!</td></tr>";
    }
}
loadSecurityKeys();

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
            
            loadSecurityKeys();
        } catch (error) {
            alert("❌ Database Error!");
        } finally {
            btnGenerateKey.innerText = originalText;
            btnGenerateKey.disabled = false;
        }
    });
}
