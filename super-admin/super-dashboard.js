// === 1. Reusable Logic for Block & Delete (Admin & Customer) ===
function handleTableActions(e, userType) {
    const target = e.target;
    
    // DELETE Logic
    if (target.classList.contains('btn-delete-super')) {
        const confirmDelete = confirm(`WARNING: Are you sure you want to permanently DELETE this ${userType}? This action cannot be undone.`);
        if (confirmDelete) {
            // Remove the whole row <tr>
            target.closest('tr').remove();
            alert(`✅ ${userType} deleted successfully.`);
        }
    }

    // BLOCK / UNBLOCK Logic
    if (target.classList.contains('btn-block')) {
        const btn = target;
        // Find the status <span> in the same row
        const statusCell = btn.closest('tr').querySelector('span[class^="status-"]');

        if (btn.innerText === "Block") {
            const confirmBlock = confirm(`Are you sure you want to BLOCK this ${userType}?`);
            if (confirmBlock) {
                btn.innerText = "Unblock";
                btn.style.backgroundColor = "#10b981"; // Green color
                statusCell.innerText = "Blocked";
                statusCell.className = "status-blocked";
                alert(`🚫 ${userType} has been blocked.`);
            }
        } else {
            btn.innerText = "Block";
            btn.style.backgroundColor = "#ef4444"; // Red color
            statusCell.innerText = "Active";
            statusCell.className = "status-active";
            alert(`✅ ${userType} access restored.`);
        }
    }
}

// Attach Event Listeners to both tables
const masterAdminTableBody = document.getElementById('masterAdminTableBody');
if (masterAdminTableBody) {
    masterAdminTableBody.addEventListener('click', (e) => handleTableActions(e, 'Shop Admin'));
}

const masterCustomerTableBody = document.getElementById('masterCustomerTableBody');
if (masterCustomerTableBody) {
    masterCustomerTableBody.addEventListener('click', (e) => handleTableActions(e, 'Customer'));
}

// === 2. Global Maintenance Mode Logic ===
const maintenanceToggle = document.getElementById('maintenanceToggle');
if (maintenanceToggle) {
    maintenanceToggle.addEventListener('change', function() {
        if (this.checked) {
            alert("⚠️ WARNING: Maintenance Mode is now ON. The customer website is currently offline for updates.");
            console.log("System Status: MAINTENANCE MODE");
        } else {
            alert("✅ Maintenance Mode is now OFF. The customer website is live and accessible to everyone.");
            console.log("System Status: ONLINE");
        }
    });
}

// === 3. Generate Security Key Logic ===
const btnGenerateKey = document.getElementById('btnGenerateKey');
const generatedKeyInput = document.getElementById('generatedKey');

if (btnGenerateKey) {
    btnGenerateKey.addEventListener('click', () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let newKey = '';
        for (let i = 0; i < 8; i++) {
            newKey += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        const formattedKey = newKey.slice(0, 4) + '-' + newKey.slice(4, 8);
        generatedKeyInput.value = formattedKey;
        
        alert(`New Security Key Generated: ${formattedKey}\n\nYou can share this secret code with the new shop owner for their registration.`);
    });
}
