// === SUPER ADMIN SECURE LOGIN LOGIC ===
const btnSuperLogin = document.getElementById('btnSuperLogin');

if (btnSuperLogin) {
    btnSuperLogin.addEventListener('click', () => {
        // इनपुट बॉक्स से वैल्यू निकालना
        const user = document.getElementById('superUser').value.trim();
        const pass = document.getElementById('superPass').value.trim();
        const pin = document.getElementById('superPin').value.trim();

        // चेक करना कि कोई बॉक्स खाली तो नहीं है
        if(user === "" || pass === "" || pin === "") {
            alert("⚠️ Please enter Username, Password, and PIN!");
            return;
        }

        // 🔥 मास्टर क्रेडेंशियल्स (यहाँ आपका सीक्रेट डेटा सेव है) 🔥
        const masterUser = "AKbooS9365";
        const masterPass = "7@0.Devloper&8*6";
        const masterPin = "0102";

        // मैच करना कि क्या यूज़र ने सही डिटेल्स डाली हैं?
        if (user === masterUser && pass === masterPass && pin === masterPin) {
            // अगर सही है, तो सुपर एडमिन डैशबोर्ड पर भेज दें
            window.location.href = "super-dashboard.html";
        } else {
            // अगर गलत है, तो एरर दिखाएं और पासवर्ड बॉक्स खाली कर दें
            alert("❌ Access Denied!\n\nIncorrect Master Username, Password, or PIN. Unauthorized access is prohibited.");
            document.getElementById('superPass').value = "";
            document.getElementById('superPin').value = "";
        }
    });
}
