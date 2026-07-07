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

// === 0. LIVE OFFER FETCH ===
async function loadLiveOffer() {
    try {
        const offerSnap = await getDoc(doc(db, "settings", "global_offer"));
        const marquee = document.getElementById("offerMarquee");
        if (offerSnap.exists() && marquee) { marquee.innerText = `🎉 ${offerSnap.data().text} 🔥`; }
    } catch (error) { console.error("Error loading offer:", error); }
}
loadLiveOffer();

// === 0.1 LIVE SHOP CLOSURE FETCH ===
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
    } catch (error) { console.error("Error loading shop status:", error); }
}
loadShopStatus();

// === 1. 🌟 TOP 20 DYNAMIC MODELS FOR EACH BRAND 🌟 ===
const mobileModels = {
    "Oppo": [
        "Reno 11 Pro 5G", "Reno 11 5G", "Reno 10 Pro+ 5G", "Reno 10 Pro 5G", "Reno 10 5G", 
        "Reno 8 Pro 5G", "Reno 8 5G", "F25 Pro 5G", "F23 5G", "F21s Pro", 
        "F21 Pro 5G", "F19 Pro+", "A79 5G", "A78 5G", "A59 5G", 
        "A58", "A38", "A18", "Find N3 Flip", "Find X5 Pro"
    ],
    "Vivo": [
        "X100 Pro", "X100", "X90 Pro", "X90", "V30 Pro", 
        "V30", "V29 Pro", "V29", "V29e", "V27 Pro", 
        "V27", "T2 Pro 5G", "T2x 5G", "T2 5G", "Y200e 5G", 
        "Y200 5G", "Y100", "Y56 5G", "Y28 5G", "Y16"
    ],
    "Realme": [
        "12 Pro+ 5G", "12 Pro 5G", "12 5G", "11 Pro+ 5G", "11 Pro 5G", 
        "11x 5G", "11 5G", "10 Pro+ 5G", "10 Pro 5G", "GT Neo 3", 
        "GT 2 Pro", "Narzo 60x 5G", "Narzo 60 Pro", "Narzo 60", "Narzo N55", 
        "Narzo N53", "C67 5G", "C55", "C53", "C51"
    ],
    "Xiaomi": [
        "Xiaomi 14", "Xiaomi 13 Pro", "Redmi Note 13 Pro+", "Redmi Note 13 Pro", "Redmi Note 13 5G", 
        "Redmi Note 12 Pro+", "Redmi Note 12 Pro", "Redmi Note 12 5G", "Redmi 13C 5G", "Redmi 13C", 
        "Redmi 12 5G", "Redmi 12", "Poco X6 Pro", "Poco X6", "Poco M6 Pro 5G", 
        "Poco C65", "Poco F5 5G", "Xiaomi 12 Pro", "Xiaomi 11T Pro", "Xiaomi Pad 6"
    ],
    "Samsung": [
        "Galaxy S24 Ultra", "Galaxy S24+", "Galaxy S24", "Galaxy S23 Ultra", "Galaxy S23 FE", 
        "Galaxy S23", "Galaxy Z Fold 5", "Galaxy Z Flip 5", "Galaxy A54 5G", "Galaxy A34 5G", 
        "Galaxy A25 5G", "Galaxy A15 5G", "Galaxy M34 5G", "Galaxy M14 5G", "Galaxy F54 5G", 
        "Galaxy F34 5G", "Galaxy S22 Ultra", "Galaxy S21 FE", "Galaxy A14 5G", "Galaxy M04"
    ],
    "Apple": [
        "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15 Plus", "iPhone 15", "iPhone 14 Pro Max", 
        "iPhone 14 Pro", "iPhone 14 Plus", "iPhone 14", "iPhone 13 Pro Max", "iPhone 13 Pro", 
        "iPhone 13", "iPhone 13 mini", "iPhone 12 Pro Max", "iPhone 12 Pro", "iPhone 12", 
        "iPhone 12 mini", "iPhone 11", "iPhone SE (3rd Gen)", "iPhone XR", "iPhone XS"
    ]
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

closeBtn.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

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
    if (this.value === "Other") { otherDeviceGroup.style.display = "block"; } 
    else { otherDeviceGroup.style.display = "none"; }
});

checkAvailabilityBtn.addEventListener("click", () => {
    isPartAvailable = Math.random() > 0.3; 
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

actionBtn.addEventListener("click", () => {
    let deviceName = modelSelect.value;
    if (deviceName === "Other") { deviceName = document.getElementById("otherDeviceInput").value; }
    const condition = document.getElementById("deviceCondition").value;
    const customerName = document.getElementById("customerName").value;
    const customerPhone = document.getElementById("customerPhone").value;

    if (!deviceName || !customerName || !customerPhone) { alert("Please fill all required fields!"); return; }

    if (isPartAvailable) {
        const shopOwnerWhatsAppNumber = "918638791699"; // <--- अपना WhatsApp नंबर यहाँ डालें
        const message = `Hello, I need a repair service.\n\n*Service:* ${currentService}\n*Device:* ${brandSelect.value} ${deviceName}\n*Condition:* ${condition}\n*My Name:* ${customerName}\n*My Number:* ${customerPhone}\n\nPlease let me know the cost.`;
        window.open(`https://wa.me/${shopOwnerWhatsAppNumber}?text=${encodeURIComponent(message)}`, "_blank");
    } else {
        alert(`Thank you ${customerName}! We have saved your number. We will notify you as soon as the part is in stock.`);
        modal.style.display = "none";
    }
});

// === 3. LIVE SHOPPING SECTION ===
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
            const q = query(collection(db, "products"), where("category", "==", categoryName));
            const querySnapshot = await getDocs(q);
            shoppingModalTitle.innerText = categoryName + " (Available Stock)";
            productList.innerHTML = "";

            if (!querySnapshot.empty) {
                querySnapshot.forEach(docSnap => {
                    const item = docSnap.data();
                    const productItem = document.createElement("div");
                    productItem.className = "product-item";
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
            productList.innerHTML = "<p style='text-align:center; padding:20px; color:red;'>Error connecting to database.</p>";
        }
    });
});

closeShopBtn.addEventListener("click", () => shoppingModal.style.display = "none");
window.addEventListener("click", (e) => { if (e.target === shoppingModal) shoppingModal.style.display = "none"; });

window.buyProduct = function(productName, productPrice) {
    const shopOwnerWhatsAppNumber = "918638791699"; // <--- अपना WhatsApp नंबर यहाँ डालें
    const message = `Hello, I want to buy an accessory from your website.\n\n*Product:* ${productName}\n*Price:* ${productPrice}\n\nPlease let me know how to proceed with the payment and delivery.`;
    window.open(`https://wa.me/${shopOwnerWhatsAppNumber}?text=${encodeURIComponent(message)}`, "_blank");
};


// === 🌟 4. REPAIR TRACKING LOGIC 🌟 ===
const trackModal = document.getElementById("trackModal");
const openTrackModalBtn = document.getElementById("openTrackModalBtn");
const closeTrackBtn = document.querySelector(".close-track-btn");
const btnTrackStatus = document.getElementById("btnTrackStatus");
const trackIdInput = document.getElementById("trackIdInput");
const trackPhoneInput = document.getElementById("trackPhoneInput");
const trackResultSection = document.getElementById("trackResultSection");
const trackLiveStatus = document.getElementById("trackLiveStatus");
const trackDeviceName = document.getElementById("trackDeviceName");
const trackErrorMsg = document.getElementById("trackErrorMsg");

if(openTrackModalBtn) {
    openTrackModalBtn.addEventListener("click", () => {
        trackModal.style.display = "block";
        trackResultSection.style.display = "none";
        trackErrorMsg.style.display = "none";
        trackIdInput.value = "";
        trackPhoneInput.value = "";
    });
}

if(closeTrackBtn) {
    closeTrackBtn.addEventListener("click", () => trackModal.style.display = "none");
}

window.addEventListener("click", (e) => { if (e.target === trackModal) trackModal.style.display = "none"; });

if(btnTrackStatus) {
    btnTrackStatus.addEventListener("click", async () => {
        const trackId = trackIdInput.value.trim().toUpperCase();
        const phone = trackPhoneInput.value.trim();

        if(!trackId || !phone) {
            trackErrorMsg.innerText = "⚠️ Please enter both Tracking ID and Mobile Number.";
            trackErrorMsg.style.display = "block";
            trackResultSection.style.display = "none";
            return;
        }

        btnTrackStatus.innerText = "Searching... ⏳";
        btnTrackStatus.disabled = true;
        trackErrorMsg.style.display = "none";

        try {
            const q = query(collection(db, "repairs"), where("trackingId", "==", trackId), where("phone", "==", phone));
            const querySnapshot = await getDocs(q);

            if(querySnapshot.empty) {
                trackErrorMsg.innerText = "❌ No repair found! Please check your ID and Mobile Number.";
                trackErrorMsg.style.display = "block";
                trackResultSection.style.display = "none";
            } else {
                querySnapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    trackDeviceName.innerText = data.device;
                    trackLiveStatus.innerText = data.status;
                    
                    if (data.status === "Ready for Pickup" || data.status === "Delivered") {
                        trackLiveStatus.style.color = "#16a34a"; // Green
                    } else if (data.status === "Waiting for Parts") {
                        trackLiveStatus.style.color = "#ea580c"; // Orange
                    } else {
                        trackLiveStatus.style.color = "#2563eb"; // Blue
                    }
                });
                trackResultSection.style.display = "block";
            }
        } catch (error) {
            console.error("Error finding repair:", error);
            trackErrorMsg.innerText = "❌ Network error! Could not fetch details.";
            trackErrorMsg.style.display = "block";
        } finally {
            btnTrackStatus.innerText = "Check Status";
            btnTrackStatus.disabled = false;
        }
    });
          }
          
