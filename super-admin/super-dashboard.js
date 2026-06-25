// === 1. Admin Block/Unblock Logic ===
const masterAdminTableBody = document.getElementById('masterAdminTableBody');

masterAdminTableBody.addEventListener('click', (e) => {
    // Check if the clicked element is the block/unblock button
    if (e.target.classList.contains('btn-block')) {
        const btn = e.target;
        // Get the status cell (Active/Blocked span) which is in the previous <td>
        const statusCell = btn.parentElement.previousElementSibling.querySelector('span');

        if (btn.innerText === "Block Access") {
            // Ask for confirmation before blocking
            const confirmBlock = confirm("Are you sure you want to BLOCK this shop admin? They will not be able to login.");
            if (confirmBlock) {
                // Change button to Unblock
                btn.innerText = "Unblock";
                btn.style.backgroundColor = "#10b981"; // Green color
                
                // Change status to Blocked
                statusCell.innerText = "Blocked";
                statusCell.className = "status-blocked";
                
                alert("Shop Admin has been blocked successfully.");
            }
        } else {
            // Unblock logic
            btn.innerText = "Block Access";
            btn.style.backgroundColor = "#ef4444"; // Back to Red color
            
            // Change status to Active
            statusCell.innerText = "Active";
            statusCell.className = "status-active";
            
            alert("Shop Admin access restored successfully.");
        }
    }
});

// === 2. Global Maintenance Mode Logic ===
const maintenanceToggle = document.getElementById('maintenanceToggle');

maintenanceToggle.addEventListener('change', function() {
    if (this.checked) {
        // Turned ON
        alert("⚠️ WARNING: Maintenance Mode is now ON. The customer website is currently offline for updates.");
        console.log("System Status: MAINTENANCE MODE");
    } else {
        // Turned OFF
        alert("✅ Maintenance Mode is now OFF. The customer website is live and accessible to everyone.");
        console.log("System Status: ONLINE");
    }
});

// === 3. Generate Security Key Logic ===
const btnGenerateKey = document.getElementById('btnGenerateKey');
const generatedKeyInput = document.getElementById('generatedKey');

btnGenerateKey.addEventListener('click', () => {
    // Generate an 8-character random security code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let newKey = '';
    for (let i = 0; i < 8; i++) {
        newKey += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Format the key with a dash for readability (e.g., AB12-CD34)
    const formattedKey = newKey.slice(0, 4) + '-' + newKey.slice(4, 8);
    
    // Display the code in the input box
    generatedKeyInput.value = formattedKey;
    
    // Show success alert
    alert(`New Security Key Generated: ${formattedKey}\n\nYou can share this secret code with the new shop owner for their registration.`);
});
