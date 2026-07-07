// === 🔥 FIREBASE SETUP 🔥 ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
// Added query and where here for security check
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

// === 🔐 NEW: SECURITY CHECK (SESSION VALIDATION) 🔐 ===
// यह गार्ड चेक करेगा कि दुकानदार ब्लॉक या डिलीट तो नहीं हो गया
async function verifyAdminSession() {
    try {
        const q = query(collection(db, "shop_admins"), where("mobile", "==", loggedInUser));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // अगर डेटाबेस में अकाउंट ही नहीं मिला (यानी सुपर एडमिन ने डिलीट कर दिया है)
            localStorage.removeItem("loggedInAdminMobile");
            alert("⚠️ Your account has been deleted by the Super Admin.");
            window.location.href = "index.html";
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const adminData = docSnap.data();
            if (adminData.status === "Blocked") {
                // अगर डेटाबेस में स्टेटस 'Blocked' हो गया है
                localStorage.removeItem("loggedInAdminMobile");
                alert("🚫 Your account is blocked by the Super Admin.");
                window.location.href = "index.html";
            }
        });
    } catch (error) {
        console.error("Session verification failed:", error);
    }
}
verifyAdminSession(); // पेज खुलते ही सबसे पहले यह गार्ड चेकिंग करेगा


// === 🌟 NEW: REPAIR TRACKING MANAGEMENT 🌟 ===
const repairCustName = document.getElementById('repairCustName');
const repairCustPhone = document.getElementById('repairCustPhone');
const repairDevice = document.getElementById('repairDevice');
const btnAddRepair = document.getElementById('btnAddRepair');
const repairTableBody = document.getElementById('repairTableBody');

async function loadRepairs() {
    repairTableBody.innerHTML = "<tr><td colspan='5'>Loading repairs from cloud... ⏳</td></tr>";
    try {
        const querySnapshot = await getDocs(collection(db, "repairs"));
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
                    <td style="font-weight: bold; color: #2563eb; font-size:16px;">${data.trackingId}</td>
                    <td><b>${data.name}</b><br><small style="color:#666;">${data.phone}</small></td>
                    <td>${data.device}</td>
                    <td>
                        <select class="admin-input status-dropdown" data-id="${repId}" style="padding: 6px; width: 140px; margin:0; font-size:13px;">
                            <option value="Received" ${data.status === 'Received' ? 'selected' : ''}>📥 Received</option>
                            <option value="Repairing" ${data.status === 'Repairing' ? 'selected' : ''}>⏳ Repairing</option>
                            <option value="Waiting for Parts" ${data.status === 'Waiting for Parts' ? 'selected' : ''}>📦 Waiting for Parts</option>
                            <option value="Ready for Pickup" ${data.status === 'Ready for Pickup' ? 'selected' : ''}>✅ Ready for Pickup</option>
                            <option value="Delivered" ${data.status === 'Delivered' ? 'selected' : ''}>🚀 Delivered</option>
                        </select>
                    </td>
                    <td><button class="btn-delete repair-delete" data-id="${repId}">Delete</button></td>
                </tr>
            `;
        });

        document.querySelectorAll('.status-dropdown').forEach(dropdown => {
            dropdown.addEventListener('change', async (e) => {
                const id = e.target.getAttribute('data-id');
                const newStatus = e.target.value;
                try {
                    await updateDoc(doc(db, "repairs", id), { status: newStatus });
                } catch(err) {
                    alert("❌ Error updating status on cloud!");
                }
            });
        });

        document.querySelectorAll('.repair-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if(confirm("⚠️ Are you sure you want to delete this repair job?")) {
                    const id = e.target.getAttribute('data-id');
                    try {
                        await deleteDoc(doc(db, "repairs", id));
                        loadRepairs(); 
                    } catch(err) {
                        alert("❌ Could not delete.");
                    }
                }
            });
        });

    } catch (error) {
        repairTableBody.innerHTML = "<tr><td colspan='5' style='color:red;'>Error loading data!</td></tr>";
    }
}
loadRepairs(); 

btnAddRepair.addEventListener('click', async () => {
    const name = repairCustName.value.trim();
    const phone = repairCustPhone.value.trim();
    const device = repairDevice.value.trim();

    if (!name || !phone || !device) {
        alert("Please fill Customer Name, Phone, and Device details!");
        return;
    }

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const trackingId = "REP-" + randomCode;

    const originalText = btnAddRepair.innerText;
    btnAddRepair.innerText = "Generating...";
    btnAddRepair.disabled = true;

    try {
        await addDoc(collection(db, "repairs"), {
            trackingId: trackingId,
            name: name,
            phone: phone,
            device: device,
            status: "Received", 
            addedBy: loggedInUser,
            createdAt: serverTimestamp()
        });

        repairCustName.value = ""; repairCustPhone.value = ""; repairDevice.value = "";
        alert(`✅ Repair Job Added Successfully!\n\nGive this Tracking ID to Customer: ${trackingId}`);
        loadRepairs(); 
        
    } catch (error) {
        alert("❌ Error adding repair job to database.");
    } finally {
        btnAddRepair.innerText = originalText;
        btnAddRepair.disabled = false;
    }
});



// === 0. SHOP CLOSURE LOGIC ===
const btnSetClosed = document.getElementById('btnSetClosed');
const btnSetOpen = document.getElementById('btnSetOpen');
const closeStartDate = document.getElementById('closeStartDate');
const closeEndDate = document.getElementById('closeEndDate');
const closeReason = document.getElementById('closeReason');
const closureStatusMsg = document.getElementById('closureStatusMsg');

async function loadShopStatus() {
    try {
        const snap = await getDoc(doc(db, "settings", "shop_status"));
        if (snap.exists() && snap.data().isClosed) {
            const data = snap.data();
            closureStatusMsg.innerText = `🔴 Currently marked CLOSED from ${data.startDate} to ${data.endDate} (${data.reason})`;
            closureStatusMsg.style.color = "red";
        } else {
            closureStatusMsg.innerText = "🟢 Shop is currently OPEN.";
            closureStatusMsg.style.color = "green";
        }
    } catch(e) { console.error(e); }
}
loadShopStatus();

btnSetClosed.addEventListener('click', async () => {
    if(!closeStartDate.value || !closeEndDate.value) {
        alert("Please select both Start and End dates.");
        return;
    }
    btnSetClosed.innerText = "Saving...";
    try {
        await setDoc(doc(db, "settings", "shop_status"), {
            isClosed: true,
            startDate: closeStartDate.value,
            endDate: closeEndDate.value,
            reason: closeReason.value || "Shop Closed"
        });
        alert("✅ Shop closed notice is now LIVE on customer website!");
        loadShopStatus();
    } catch(e) { console.error(e); }
    btnSetClosed.innerText = "Set Shop Closed";
});

btnSetOpen.addEventListener('click', async () => {
    btnSetOpen.innerText = "Opening...";
    try {
        await setDoc(doc(db, "settings", "shop_status"), { isClosed: false });
        alert("✅ Shop is now OPEN. Notice removed from website.");
        closeStartDate.value = ""; closeEndDate.value = ""; closeReason.value = "";
        loadShopStatus();
    } catch(e) { console.error(e); }
    btnSetOpen.innerText = "Remove Notice (Set Open)";
});


// === 1. Update Offer Logic ===
const btnUpdateOffer = document.getElementById('btnUpdateOffer');
const offerInput = document.getElementById('offerInput');
const offerSuccessMsg = document.getElementById('offerSuccessMsg');

btnUpdateOffer.addEventListener('click', async () => {
    const offerText = offerInput.value.trim();
    if (offerText === "") {
        alert("Please enter some offer text!");
        return;
    }
    const originalText = btnUpdateOffer.innerText;
    btnUpdateOffer.innerText = "Updating Cloud...";
    btnUpdateOffer.disabled = true;

    try {
        await setDoc(doc(db, "settings", "global_offer"), { text: offerText, updatedAt: serverTimestamp() });
        offerSuccessMsg.style.display = "block";
        setTimeout(() => { offerSuccessMsg.style.display = "none"; }, 3000);
    } catch (error) {
        alert("❌ Database Error! Could not update offer.");
    } finally {
        btnUpdateOffer.innerText = originalText;
        btnUpdateOffer.disabled = false;
    }
});


// === 2. LOAD PRODUCTS & UPDATE TOTAL COUNT ===
const adminProductTableBody = document.getElementById('adminProductTableBody');
const statProducts = document.getElementById('statProducts');

async function loadProducts() {
    adminProductTableBody.innerHTML = "<tr><td colspan='4'>Loading products from cloud... ⏳</td></tr>";
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        adminProductTableBody.innerHTML = ""; 
        if(querySnapshot.empty) {
            adminProductTableBody.innerHTML = "<tr><td colspan='4'>No products found. Add one above!</td></tr>";
            statProducts.innerText = "0";
            return;
        }
        statProducts.innerText = querySnapshot.size;
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${data.category}</td>
                <td>${data.name}</td>
                <td>${data.price}</td>
                <td><button class="btn-delete" data-id="${docSnap.id}">Delete</button></td>
            `;
            adminProductTableBody.appendChild(newRow);
        });
    } catch (error) {
        adminProductTableBody.innerHTML = "<tr><td colspan='4' style='color:red;'>Error loading data!</td></tr>";
    }
}
loadProducts();


// === 3. ADD NEW PRODUCT ===
const btnAddProduct = document.getElementById('btnAddProduct');
const productCategory = document.getElementById('productCategory');
const productName = document.getElementById('productName');
const productPrice = document.getElementById('productPrice');
const productFeatures = document.getElementById('productFeatures');

btnAddProduct.addEventListener('click', async () => {
    const category = productCategory.value;
    const name = productName.value.trim();
    const price = productPrice.value.trim();
    const features = productFeatures.value.trim();

    if (name === "" || price === "") {
        alert("Please enter both Product Name and Price!");
        return;
    }
    const originalText = btnAddProduct.innerText;
    btnAddProduct.innerText = "Adding...";
    btnAddProduct.disabled = true;

    try {
        await addDoc(collection(db, "products"), {
            category: category,
            name: name,
            price: price,
            features: features,
            addedBy: loggedInUser,
            createdAt: serverTimestamp()
        });
        productName.value = ""; productPrice.value = ""; productFeatures.value = "";
        alert("✅ Product Added Successfully to Cloud!");
        loadProducts(); 
    } catch (error) {
        alert("❌ Error adding product to database.");
    } finally {
        btnAddProduct.innerText = originalText;
        btnAddProduct.disabled = false;
    }
});

// === 4. DELETE PRODUCT ===
adminProductTableBody.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-delete')) {
        if (confirm("⚠️ Are you sure you want to permanently delete this product?")) {
            const btn = e.target;
            const productId = btn.getAttribute("data-id");
            btn.innerText = "Deleting...";
            btn.disabled = true;
            try {
                await deleteDoc(doc(db, "products", productId));
                alert("✅ Product deleted from cloud.");
                loadProducts();
            } catch (error) {
                alert("❌ Could not delete product.");
                btn.innerText = "Delete";
                btn.disabled = false;
            }
        }
    }
});
  
