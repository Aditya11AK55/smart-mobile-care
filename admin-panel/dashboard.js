// === 1. Update Offer Logic ===
const btnUpdateOffer = document.getElementById('btnUpdateOffer');
const offerInput = document.getElementById('offerInput');
const offerSuccessMsg = document.getElementById('offerSuccessMsg');

btnUpdateOffer.addEventListener('click', () => {
    if (offerInput.value.trim() === "") {
        alert("Please enter some offer text!");
        return;
    }
    
    // Show success message
    offerSuccessMsg.style.display = "block";
    
    // Hide message automatically after 3 seconds
    setTimeout(() => {
        offerSuccessMsg.style.display = "none";
    }, 3000);
    
    // Note: In a real backend, this will send data to the server to update the Customer Website
});

// === 2. Add New Product to Inventory ===
const btnAddProduct = document.getElementById('btnAddProduct');
const productCategory = document.getElementById('productCategory');
const productName = document.getElementById('productName');
const productPrice = document.getElementById('productPrice');
const productFeatures = document.getElementById('productFeatures');
const adminProductTableBody = document.getElementById('adminProductTableBody');

btnAddProduct.addEventListener('click', () => {
    // Get values from input boxes
    const category = productCategory.value;
    const name = productName.value.trim();
    const price = productPrice.value.trim();
    const features = productFeatures.value.trim();

    // Validation: Check if Name and Price are empty
    if (name === "" || price === "") {
        alert("Please enter both Product Name and Price!");
        return;
    }

    // Create a new table row (<tr>)
    const newRow = document.createElement('tr');
    
    // Add data to the row
    newRow.innerHTML = `
        <td>${category}</td>
        <td>${name}</td>
        <td>${price}</td>
        <td><button class="btn-delete">Delete</button></td>
    `;

    // Add the new row to the table
    adminProductTableBody.appendChild(newRow);

    // Clear input fields for the next product
    productName.value = "";
    productPrice.value = "";
    productFeatures.value = "";

    alert("Product Added Successfully!");
});

// === 3. Delete Product from Inventory ===
// We use Event Delegation because rows are added dynamically
adminProductTableBody.addEventListener('click', (e) => {
    // Check if the clicked element has the class 'btn-delete'
    if (e.target.classList.contains('btn-delete')) {
        // Ask for confirmation before deleting
        const confirmDelete = confirm("Are you sure you want to delete this product?");
        if (confirmDelete) {
            // Remove the specific row (tr) from the table
            e.target.parentElement.parentElement.remove();
        }
    }
});

// === 4. Stock Control Toggle Logic ===
const toggleSwitches = document.querySelectorAll('.switch input');

toggleSwitches.forEach(toggle => {
    toggle.addEventListener('change', function() {
        // Get the name of the part (e.g., Display & Combo)
        const partName = this.parentElement.previousElementSibling.innerText;
        
        if (this.checked) {
            console.log(partName + " is now IN STOCK.");
        } else {
            console.log(partName + " is now OUT OF STOCK.");
            alert(`Warning: ${partName} is marked out of stock. Customers will see 'Notify Me' on the website.`);
        }
        // In a real app, this instantly updates the database
    });
});
