// === 🔥 FIREBASE SETUP (आपका जादुई क्लाउड कनेक्शन) 🔥 ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// === 0. LIVE OFFER FETCH (डेटाबेस से लाइव ऑफर लाना) ===
async function loadLiveOffer() {
    try {
        const offerSnap = await getDoc(doc(db, "settings", "global_offer"));
        const marquee = document.getElementById("offerMarquee");
        if (offerSnap.exists() && marquee) {
            marquee.innerText = `🎉 ${offerSnap.data().text} 🔥`;
        }
    } catch (error) {
        console.error("Error loading offer:", error);
    }
}
loadLiveOffer(); // पेज खुलते ही ऑफर लोड करें


// === 0.1 LIVE SHOP CLOSURE FETCH (दुकान बंद है या नहीं, चेक करना) ===
async function loadShopStatus() {
    try {
        const snap = await getDoc(doc(db, "settings", "shop_status"));
        const banner = document.getElementById("shopClosureBanner");
        if (snap.exists() && snap.data().isClosed && banner) {
            const data = snap.data();
            banner.style.display = "block";
            document.getElementById("closureMessage").innerText = `We are closed from ${data.startDate} to ${data.endDate}. ${data.reason ? '(' + data.reason + ')' : ''}`;
        } else if (banner) {
            banner.style.display = "none";
        }
    } catch (error) {
        console.error("Error loading shop status:", error);
    }
}
loadShopStatus(); // पेज खुलते ही चेक करेगा


// === 1. Dynamic Data for Mobile Brands & Models ===
const mobileModels = {
    "Oppo": ["Reno 10 Pro", "Reno 8", "F23 5G", "F21s Pro", "A78 5G"],
    "Vivo": ["V29 Pro", "V27", "T2x 5G", "Y100", "X90 Pro"],
    "Realme": ["11 Pro+", "10 Pro", "C55", "Narzo N53", "GT Neo 3"],
    "Xiaomi": ["Redmi Note 12 Pro", "Redmi 12 5G", "Poco X5", "Xiaomi 13 Pro"],
    "Samsung": ["Galaxy S23 Ultra", "Galaxy A54", "Galaxy M34", "Galaxy Z Fold 5"],
    "Apple": ["iPhone 15 Pro", "iPhone 14", "iPhone 13", "iPhone 12"]
};

// === 2. Repair Booking Logic ===
const modal = document.getElementById("bookingModal");
const closeBtn = document.querySelector(".close-btn");
const serviceCards = document.querySelectorAll(".service-card");
const brandSelect = document.getElementById("brandSelect");
const modelSelect = document.getElementById("modelSelect");
const otherDeviceGroup = document.getElementById("otherDeviceGroup");
const checkAvailabilityBtn = document.getElementById("checkAvailabilityBtn");
const resultSection = document.getElementById("resultSection");
const resultMessage = document.getElementById("resultMessage");
const actionBtn = document.getElementById("actionBtn");

let currentService = "";
let isPartAvailable = false;

// Open Modal
serviceCards.forEach(card => {
    card.addEventListener("click", function() {
        currentService = this.querySelector("h3").innerText;
        document.getElementById("modalTitle").innerText = "Book: " + currentService;
        
        resultSection.style.display = "none";
        checkAvailabilityBtn.style.display = "block";
        brandSelect.value = "";
        modelSelect.innerHTML = '<option value="">-- Choose Model --</option><option value="Other">Other</option>';
        otherDeviceGroup.style.display = "none";
        
        modal.style.display = "block";
    });
});

// Close Modal
closeBtn.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

// Populate Models
brandSelect.addEventListener("change", function() {
    const selectedBrand = this.value;
    modelSelect.innerHTML = '<option value="">-- Choose Model --</option>';

    if (selectedBrand === "Other") {
        otherDeviceGroup.style.display = "block";
        modelSelect.innerHTML += '<option value="Other">Other</option>';
        modelSelect.value = "Other";
    } else {
        otherDeviceGroup.style.display = "none";
        if (mobileModels[selectedBrand]) {
            mobileModels[selectedBrand].forEach(model => {
                const option = document.createElement("option");
                option.value = model;
                option.innerText = model;
                modelSelect.appendChild(option);
            });
            modelSelect.innerHTML += '<option value="Other">Other</option>';
        }
    }
});

modelSelect.addEventListener("change", function() {
    if (this.value === "Other") {
        otherDeviceGroup.style.display = "block";
    } else {
        otherDeviceGroup.style.display = "none";
    }
});

// Check Availability (Dummy Logic fixed)
checkAvailabilityBtn.addEventListener("click", () => {
    isPartAvailable = Math.random() > 0.3; // 70% chance available
    checkAvailabilityBtn.style.display = "none";
    resultSection.style.display = "block";
    
    if (isPartAvailable) {
        resultMessage.innerHTML = "✅ Part is <b>Available</b> in stock!";
        resultMessage.style.color = "green";
        actionBtn.innerText = "Send Details on WhatsApp";
        actionBtn.style.backgroundColor = "#25D366";
    } else {
        resultMessage.innerHTML = "❌ Part is currently <b>Out of Stock</b>.";
        resultMessage.style.color = "red";
        actionBtn.innerText = "Notify Me When Available";
        actionBtn.style.backgroundColor = "#f59e0b";
    }
});

// Send WhatsApp Message for Booking
actionBtn.addEventListener("click", () => {
    let deviceName = modelSelect.value;
    if (deviceName === "Other") {
        deviceName = document.getElementById("otherDeviceInput").value;
    }
    const condition = document.getElementById("deviceCondition").value;
    const customerName = document.getElementById("customerName").value;
    const customerPhone = document.getElementById("customerPhone").value;

    if (!deviceName || !customerName || !customerPhone) {
        alert("Please fill all required fields!");
        return;
    }

    if (isPartAvailable) {
        const shopOwnerWhatsAppNumber = "919876543210"; // <--- यहाँ अपना असली नंबर डालें
        const message = `Hello, I need a repair service.\n\n*Service:* ${currentService}\n*Device:* ${brandSelect.value} ${deviceName}\n*Condition:* ${condition}\n*My Name:* ${customerName}\n*My Number:* ${customerPhone}\n\nPlease let me know the cost.`;
        window.open(`https://wa.me/${shopOwnerWhatsAppNumber}?text=${encodeURIComponent(message)}`, "_blank");
    } else {
        alert(`Thank you ${customerName}! We have saved your number. We will notify you as soon as the part is in stock.`);
        modal.style.display = "none";
    }
});


// === 3. LIVE SHOPPING SECTION (डेटाबेस से प्रोडक्ट्स लाना) ===
const shoppingModal = document.getElementById("shoppingModal");
const closeShopBtn = document.querySelector(".close-shop-btn");
const shopCards = document.querySelectorAll(".shop-card");
const productList = document.getElementById("productList");
const shoppingModalTitle = document.getElementById("shoppingModalTitle");

shopCards.forEach(card => {
    card.addEventListener("click", async function() {
        const categoryName = this.querySelector("h3").innerText;
        shoppingModalTitle.innerText = categoryName + " (Loading...)";
        productList.innerHTML = "<p style='text-align:center; padding:20px;'>Loading products from cloud... ⏳</p>";
        shoppingModal.style.display = "block";

        try {
            // Firebase से सिर्फ उसी केटेगरी के प्रोडक्ट मंगाएं जिस पर क्लिक किया है
            const q = query(collection(db, "products"), where("category", "==", categoryName));
            const querySnapshot = await getDocs(q);
            
            shoppingModalTitle.innerText = categoryName + " (Available Stock)";
            productList.innerHTML = "";

            if (!querySnapshot.empty) {
                querySnapshot.forEach(docSnap => {
                    const item = docSnap.data();
                    const productItem = document.createElement("div");
                    productItem.className = "product-item";
                    
                    // Icon logic based on category
                    let icon = "📦";
                    if (categoryName.includes("Earbuds") || categoryName.includes("Earphones")) icon = "🎧";
                    else if (categoryName.includes("Neckband")) icon = "🔌";
                    else if (categoryName.includes("Speaker")) icon = "🔊";

                    productItem.innerHTML = `
                        <div class="product-image-placeholder">${icon}</div>
                        <div class="product-details">
                            <h4>${item.name}</h4>
                            <p>${item.features || 'Premium Quality'}</p>
                            <div class="product-price">${item.price}</div>
                            <button class="btn-buy-whatsapp" data-name="${item.name}" data-price="${item.price}">Buy on WhatsApp</button>
                        </div>
                    `;
                    productList.appendChild(productItem);
                });

                // Attach WhatsApp click logic dynamically for module scope
                document.querySelectorAll(".btn-buy-whatsapp").forEach(btn => {
                    btn.addEventListener("click", (e) => {
                        const pName = e.target.getAttribute("data-name");
                        const pPrice = e.target.getAttribute("data-price");
                        window.buyProduct(pName, pPrice);
                    });
                });

            } else {
                productList.innerHTML = "<p style='text-align:center; padding:20px;'>Sorry, no products available in this category right now.</p>";
            }
        } catch (error) {
            console.error("Error loading products:", error);
            productList.innerHTML = "<p style='text-align:center; padding:20px; color:red;'>Error connecting to database.</p>";
        }
    });
});

closeShopBtn.addEventListener("click", () => shoppingModal.style.display = "none");
window.addEventListener("click", (e) => { if (e.target === shoppingModal) shoppingModal.style.display = "none"; });

// Global function made accessible for Module
window.buyProduct = function(productName, productPrice) {
    const shopOwnerWhatsAppNumber = "919876543210"; // <--- यहाँ अपना असली नंबर डालें
    const message = `Hello, I want to buy an accessory from your website.\n\n*Product:* ${productName}\n*Price:* ${productPrice}\n\nPlease let me know how to proceed with the payment and delivery.`;
    window.open(`https://wa.me/${shopOwnerWhatsAppNumber}?text=${encodeURIComponent(message)}`, "_blank");
};
                              
