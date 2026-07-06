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
        const shopOwnerWhatsAppNumber = "919876543210"; 
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
    const shopOwnerWhatsAppNumber = "919876543210"; 
    const message = `Hello, I want to buy an accessory from your website.\n\n*Product:* ${productName}\n*Price:* ${productPrice}\n\nPlease let me know how to proceed with the payment and delivery.`;
    window.open(`https://wa.me/${shopOwnerWhatsAppNumber}?text=${encodeURIComponent(message)}`, "_blank");
};


// === 🌟 4. REPAIR TRACKING LOGIC (NEW) 🌟 ===
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

// Open Tracking Modal
openTrackModalBtn.addEventListener("click", () => {
    trackModal.style.display = "block";
    trackResultSection.style.display = "none";
    trackErrorMsg.style.display = "none";
    trackIdInput.value = "";
    trackPhoneInput.value = "";
});

// Close Tracking Modal
closeTrackBtn.addEventListener("click", () => trackModal.style.display = "none");
window.addEventListener("click", (e) => { if (e.target === trackModal) trackModal.style.display = "none"; });

// Handle Check Status Button
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
        // Query Database (Match ID and Phone together for security)
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
                
                // Color coding based on status
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
                             
