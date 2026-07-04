// === 🔥 FIREBASE SETUP (आपका जादुई क्लाउड कनेक्शन) 🔥 ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// === 0. Security Check (Optional but good) ===
// चेक करें कि क्या दुकानदार लॉगिन करके ही आया है
const loggedInUser = localStorage.getItem("loggedInAdminMobile");
if (!loggedInUser) {
    // अगर बिना लॉगिन के डैशबोर्ड खोलने की कोशिश की, तो वापस लॉगिन पेज पर फेंक दें
    window.location.href = "index.html";
}


// === 1. Update Offer Logic (🔥 SAVING TO FIREBASE 🔥) ===
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
        // 'settings' नाम का फोल्डर और 'global_offer' नाम की फाइल में सेव करें
        await setDoc(doc(db, "settings", "global_offer"), {
            text: offerText,
            updatedAt: serverTimestamp()
        });

        // Show success message
        offerSuccessMsg.style.display = "block";
        setTimeout(() => { offerSuccessMsg.style.display = "none"; }, 3000);
    } catch (error) {
        console.error("Offer Update Error: ", error);
        alert("❌ Database Error! Could not update offer.");
    } finally {
        btnUpdateOffer.innerText = originalText;
        btnUpdateOffer.disabled = false;
    }
});


// === 2. LOAD PRODUCTS FROM FIREBASE (पेज खुलते ही प्रोडक्ट्स लाना) ===
const adminProductTableBody = document.getElementById('adminProductTableBody');

async function loadProducts() {
    adminProductTableBody.innerHTML = "<tr><td colspan='4'>Loading products from cloud... ⏳</td></tr>";
    
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        adminProductTableBody.innerHTML = ""; // टेबल खाली करें
        
        if(querySnapshot.empty) {
            adminProductTableBody.innerHTML = "<tr><td colspan='4'>No products found. Add one above!</td></tr>";
            return;
        }

        // हर प्रोडक्ट को डेटाबेस से निकाल कर टेबल में दिखाएं
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
        console.error("Error loading products:", error);
        adminProductTableBody.innerHTML = "<tr><td colspan='4' style='color:red;'>Error loading data!</td></tr>";
    }
}
// पेज लोड होते ही यह फंक्शन खुद-ब-खुद चल जाएगा
loadProducts();


// === 3. ADD NEW PRODUCT TO INVENTORY (🔥 SAVING TO FIREBASE 🔥) ===
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
        // डेटाबेस में 'products' नाम के फोल्डर में सेव करें
        await addDoc(collection(db, "products"), {
            category: category,
            name: name,
            price: price,
            features: features,
            addedBy: loggedInUser, // किसने ऐड किया
            createdAt: serverTimestamp()
        });

        // Clear input fields
        productName.value = "";
        productPrice.value = "";
        productFeatures.value = "";

        alert("✅ Product Added Successfully to Cloud!");
        loadProducts(); // प्रोडक्ट ऐड होने के बाद टेबल को तुरंत रिफ्रेश करें
        
    } catch (error) {
        console.error("Error adding product: ", error);
        alert("❌ Error adding product to database.");
    } finally {
        btnAddProduct.innerText = originalText;
        btnAddProduct.disabled = false;
    }
});


// === 4. DELETE PRODUCT FROM INVENTORY (🔥 DELETING FROM FIREBASE 🔥) ===
adminProductTableBody.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-delete')) {
        const confirmDelete = confirm("⚠️ Are you sure you want to permanently delete this product?");
        if (confirmDelete) {
            
            const btn = e.target;
            const productId = btn.getAttribute("data-id"); // डेटाबेस वाली असली ID
            btn.innerText = "Deleting...";
            btn.disabled = true;

            try {
                // डेटाबेस से उस प्रोडक्ट को हमेशा के लिए उड़ा दें
                await deleteDoc(doc(db, "products", productId));
                alert("✅ Product deleted from cloud.");
                loadProducts(); // टेबल रिफ्रेश करें
            } catch (error) {
                console.error("Error deleting product: ", error);
                alert("❌ Could not delete product.");
                btn.innerText = "Delete";
                btn.disabled = false;
            }
        }
    }
});


// === 5. Stock Control Toggle Logic (अभी के लिए सिर्फ Console में) ===
const toggleSwitches = document.querySelectorAll('.switch input');
toggleSwitches.forEach(toggle => {
    toggle.addEventListener('change', function() {
        const partName = this.parentElement.previousElementSibling.innerText;
        if (this.checked) {
            console.log(partName + " is now IN STOCK.");
        } else {
            console.log(partName + " is now OUT OF STOCK.");
            alert(`Warning: ${partName} is marked out of stock. Customers will see 'Notify Me' on the website.`);
        }
    });
});
