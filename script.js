// --- 1. Dynamic Data for Mobile Brands & Models ---
const mobileModels = {
    "Oppo": ["Reno 10 Pro", "Reno 8", "F23 5G", "F21s Pro", "A78 5G"],
    "Vivo": ["V29 Pro", "V27", "T2x 5G", "Y100", "X90 Pro"],
    "Realme": ["11 Pro+", "10 Pro", "C55", "Narzo N53", "GT Neo 3"],
    "Xiaomi": ["Redmi Note 12 Pro", "Redmi 12 5G", "Poco X5", "Xiaomi 13 Pro"],
    "Samsung": ["Galaxy S23 Ultra", "Galaxy A54", "Galaxy M34", "Galaxy Z Fold 5"],
    "Apple": ["iPhone 15 Pro", "iPhone 14", "iPhone 13", "iPhone 12"]
};

// --- 2. Getting all required HTML elements ---
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

// Variables to store current selection
let currentService = "";
let isPartAvailable = false;

// --- 3. Open Modal when a Service Box is clicked ---
serviceCards.forEach(card => {
    card.addEventListener("click", function() {
        currentService = this.querySelector("h3").innerText; // Get the service name
        document.getElementById("modalTitle").innerText = "Book: " + currentService;
        
        // Reset form completely
        resultSection.style.display = "none";
        checkAvailabilityBtn.style.display = "block";
        brandSelect.value = "";
        modelSelect.innerHTML = '<option value="">-- Choose Model --</option><option value="Other">Other</option>';
        otherDeviceGroup.style.display = "none";
        
        modal.style.display = "block"; // Show Modal
    });
});

// --- 4. Close Modal ---
closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
});
window.addEventListener("click", (event) => {
    if (event.target === modal) modal.style.display = "none"; // Close if clicked outside
});

// --- 5. Populate Models when a Brand is selected ---
brandSelect.addEventListener("change", function() {
    const selectedBrand = this.value;
    
    // Clear previous models
    modelSelect.innerHTML = '<option value="">-- Choose Model --</option>';

    if (selectedBrand === "Other") {
        otherDeviceGroup.style.display = "block";
    } else {
        otherDeviceGroup.style.display = "none";
        
        if (mobileModels[selectedBrand]) {
            // Add models dynamically
            mobileModels[selectedBrand].forEach(model => {
                const option = document.createElement("option");
                option.value = model;
                option.innerText = model;
                modelSelect.appendChild(option);
            });
        }
    }
    // Always keep 'Other' option at the bottom
    modelSelect.innerHTML += '<option value="Other">Other</option>';
});

// --- 6. Show Text Box if 'Other' Model is selected ---
modelSelect.addEventListener("change", function() {
    if (this.value === "Other") {
        otherDeviceGroup.style.display = "block";
    } else if (brandSelect.value !== "Other") {
        otherDeviceGroup.style.display = "none";
    }
});

// --- 7. Check Availability Button Logic ---
checkAvailabilityBtn.addEventListener("click", function() {
    // Basic validation
    if (brandSelect.value === "") {
        alert("Please select a brand first!");
        return;
    }

    // Hide Check button, Show Result section
    checkAvailabilityBtn.style.display = "none";
    resultSection.style.display = "block";

    // Randomize availability just for DEMO (50% chance available/out of stock)
    // Later, this will be connected to the Shop Owner Database
    isPartAvailable = Math.random() > 0.5; 

    if (isPartAvailable) {
        resultMessage.innerHTML = "✅ Great News! Part is Available.";
        resultMessage.style.color = "#2f855a"; // Dark Green
        resultMessage.style.backgroundColor = "#c6f6d5"; // Light Green
        
        actionBtn.innerText = "Send Details on WhatsApp";
        actionBtn.style.backgroundColor = "#25d366"; // WhatsApp Green
    } else {
        resultMessage.innerHTML = "⚠️ Sorry, Currently Out of Stock.";
        resultMessage.style.color = "#c05621"; // Dark Orange
        resultMessage.style.backgroundColor = "#feebc8"; // Light Orange
        
        actionBtn.innerText = "Notify Me When Available";
        actionBtn.style.backgroundColor = "#dd6b20"; // Orange color for Notify
    }
});

// --- 8. Final Action Button (WhatsApp / Notify Me) ---
actionBtn.addEventListener("click", function() {
    const customerName = document.getElementById("customerName").value;
    const customerPhone = document.getElementById("customerPhone").value;
    const condition = document.getElementById("deviceCondition").value;
    
    let deviceName = brandSelect.value;
    if (brandSelect.value !== "Other" && modelSelect.value !== "Other") {
        deviceName += " " + modelSelect.value;
    } else {
        deviceName = document.getElementById("otherDeviceInput").value;
    }

    // Validation for Name and Phone
    if (customerName === "" || customerPhone === "") {
        alert("Please enter both your Name and WhatsApp Number!");
        return;
    }

    if (isPartAvailable) {
        // Prepare WhatsApp Message
        const shopOwnerWhatsAppNumber = "919876543210"; // REPLACE WITH YOUR NUMBER (with country code, no +)
        const message = `Hello, I need a repair service.\n\n*Service:* ${currentService}\n*Device:* ${deviceName}\n*Condition:* ${condition}\n*My Name:* ${customerName}\n*My Number:* ${customerPhone}\n\nPlease let me know the cost.`;
        
        const whatsappURL = `https://wa.me/${shopOwnerWhatsAppNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappURL, "_blank"); // Opens WhatsApp in new tab
    } else {
        // Notify Me Logic (For now just an alert, later saves to DB)
        alert(`Thank you ${customerName}! We have saved your number (${customerPhone}). We will notify you as soon as the part for ${deviceName} is in stock.`);
        modal.style.display = "none"; // Close modal
    }
});
// --- 9. Shopping Section Logic (E-commerce) ---

const shoppingModal = document.getElementById("shoppingModal");
const closeShopBtn = document.querySelector(".close-shop-btn");
const shopCards = document.querySelectorAll(".shop-card");
const productList = document.getElementById("productList");
const shoppingModalTitle = document.getElementById("shoppingModalTitle");

// Demo Database for Products (Later, this will come dynamically from the Shop Owner Panel)
const productsDatabase = {
    "Wireless Earbuds": [
        { name: "boAt Airdopes 141", features: "42H Playtime, 8mm Drivers", price: "₹1,299", icon: "🎧" },
        { name: "Realme Buds T100", features: "28H Playtime, AI ENC for Calls", price: "₹1,499", icon: "🎧" }
    ],
    "Neckbands": [
        { name: "OnePlus Bullets Z2", features: "Fast Charge, 30H Battery Life", price: "₹1,999", icon: "🔌" },
        { name: "boAt Rockerz 255 Pro+", features: "40H Playtime, ASAP Charge", price: "₹1,399", icon: "🔌" }
    ],
    "Wired Earphones": [
        { name: "JBL C100SI", features: "Extra Deep Bass, In-line Mic", price: "₹599", icon: "🎧" },
        { name: "Realme Buds 2", features: "11.2mm Driver, Tangle Free Cable", price: "₹599", icon: "🎧" }
    ],
    "Bluetooth Speakers": [
        { name: "JBL Go 2", features: "Waterproof, 5H Playtime", price: "₹1,799", icon: "🔊" },
        { name: "boAt Stone 190", features: "52mm Driver, IPX7 Water Resistance", price: "₹999", icon: "🔊" }
    ]
};

// Open Shopping Modal and show products when a category is clicked
shopCards.forEach(card => {
    card.addEventListener("click", function() {
        const categoryName = this.querySelector("h3").innerText;
        shoppingModalTitle.innerText = categoryName + " (Available Stock)";
        
        // Clear previous list
        productList.innerHTML = "";

        // Get products from our database for the clicked category
        const items = productsDatabase[categoryName];
        
        if (items && items.length > 0) {
            items.forEach(item => {
                // Create product HTML dynamically
                const productItem = document.createElement("div");
                productItem.className = "product-item";
                
                productItem.innerHTML = `
                    <div class="product-image-placeholder">${item.icon}</div>
                    <div class="product-details">
                        <h4>${item.name}</h4>
                        <p>${item.features}</p>
                        <div class="product-price">${item.price}</div>
                        <button class="btn-buy-whatsapp" onclick="buyProduct('${item.name}', '${item.price}')">Buy on WhatsApp</button>
                    </div>
                `;
                productList.appendChild(productItem);
            });
        } else {
            productList.innerHTML = "<p style='text-align:center; padding:20px;'>Sorry, no products available in this category right now.</p>";
        }
        
        shoppingModal.style.display = "block"; // Show the popup
    });
});

// Close Shopping Modal
closeShopBtn.addEventListener("click", () => {
    shoppingModal.style.display = "none";
});
window.addEventListener("click", (event) => {
    if (event.target === shoppingModal) shoppingModal.style.display = "none";
});

// Function to handle 'Buy on WhatsApp' Button Click
function buyProduct(productName, productPrice) {
    const shopOwnerWhatsAppNumber = "919876543210"; // REPLACE WITH YOUR SHOP NUMBER
    
    // Prepare a beautiful message for the shop owner
    const message = `Hello, I want to buy an accessory from your website.\n\n*Product:* ${productName}\n*Price:* ${productPrice}\n\nPlease let me know how to proceed with the payment and delivery.`;
    
    // Open WhatsApp in a new tab
    const whatsappURL = `https://wa.me/${shopOwnerWhatsAppNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, "_blank");
}
