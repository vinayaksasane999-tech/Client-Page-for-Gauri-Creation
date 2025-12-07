/* =====================================================
   PAYMENT VERIFICATION + ANIMATION CONTROLLER
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    // Read orderId from URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("orderId");
    const customerPhone = urlParams.get("phone");

    // UI elements
    const btn = document.getElementById("confirmButton");
    const waitArea = document.getElementById("waitArea");
    const glassTrack = document.getElementById("glassTrack");
    const sliderLabel = document.getElementById("sliderLabel");

    const sheetId = "1W0CvU_5nbodRgwxfSNtNZ-eMUNFuVHqSG3vJ1UibJLw"; 
    const sheetName = "Sheet1";
    const sheetURL = `https://opensheet.elk.sh/${sheetId}/${sheetName}`;

    if (!btn) return;

    /* ============================
       WHEN USER CLICKS "PAYMENT DONE"
       ============================ */
    btn.addEventListener("click", function () {

        // Hide button, show animation
        btn.style.display = "none";
        waitArea.style.display = "block";
        glassTrack.classList.add("visible");

        sliderLabel.textContent = "Waiting for seller to confirm payment…";

        // Poll Google Sheet every 3 seconds
        const poll = setInterval(async () => {

            try {
                const res = await fetch(sheetURL);
                const rows = await res.json();

                // Try match: orderId
                let entry = rows.find(row => row["Order ID"] == orderId);

                // Fallback: match phone
                if (!entry && customerPhone) {
                    entry = rows.find(row => row["Phone"] == customerPhone);
                }

                if (!entry) return; // keep waiting

                if (entry["Status"] === "PAID") {
                    clearInterval(poll);
                    playSuccess(orderId);
                }

            } catch (err) {
                console.error("Sheet check error:", err);
            }

        }, 3000);
    });

    /* ============================
       SUCCESS ANIMATION + REDIRECT
       ============================ */
    function playSuccess(orderId) {

        sliderLabel.textContent = "Payment received • Thank you ✨";
        glassTrack.classList.add("success");

        // Replace sliding arrow with tick
        const thumb = glassTrack.querySelector(".glass-thumb");
        thumb.innerHTML = "";
        thumb.style.animation = "none";
        thumb.innerHTML = `<div class="checkmark">✓</div>`;

        // Glitter effect
        launchGlitter(glassTrack);

        // Redirect after animation
        setTimeout(() => {
            window.location.href = `confirmation.html?orderId=${orderId}`;
        }, 1600);
    }

    /* ============================
       GLITTER ANIMATION
       ============================ */
    function launchGlitter(anchor) {

        const rect = anchor.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 18; i++) {
            const spark = document.createElement("div");
            spark.className = "glitter";

            const angle = (Math.PI * 2 * i) / 18;
            const dist = 40 + Math.random() * 25;

            spark.style.left = `${centerX}px`;
            spark.style.top = `${centerY}px`;
            spark.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
            spark.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);

            document.body.appendChild(spark);

            spark.addEventListener("animationend", () => spark.remove());
        }
    }

});