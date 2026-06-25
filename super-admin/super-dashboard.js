// === 1. Admin Block/Unblock Logic (एडमिन को ब्लॉक करने का कोड) ===
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

// === 2. Global Maintenance Mode Logic (वेबसाइट बंद/चालू करने का कोड) ===
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
