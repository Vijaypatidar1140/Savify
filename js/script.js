
// js/script.js
document.addEventListener('DOMContentLoaded', () => {
    // Load header and footer
    async function loadHTML(filePath, elementId, callback) {
        try {
            const response = await fetch(filePath);
            const text = await response.text();
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = text;
                if (callback) callback();
            }
        } catch (error) {
            console.error('Error loading HTML:', error);
        }
    }

    if (document.getElementById('header-placeholder')) {
        loadHTML('header.html', 'header-placeholder');
    }
    if (document.getElementById('footer-placeholder')) {
        loadHTML('footer.html', 'footer-placeholder');
    }

    // Google Sheet integration with styled layout
    async function loadDeals() {
        const response = await fetch("https://docs.google.com/spreadsheets/d/1pNz5I_5FnDcHTY2tsc30GBHMlDPZfIrCrUZge3Q2VK0/gviz/tq?tqx=out:json");
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        const rows = json.table.rows;

        const container = document.getElementById("deal-container");
        container.innerHTML = "";

        rows.forEach(row => {
            const title = row.c[0]?.v || "";
            const desc = row.c[1]?.v || "";
            const img = row.c[2]?.v || "https://via.placeholder.com/400x300";
            const brand = row.c[3]?.v || "Savify Deal";
            const link = row.c[4]?.v || "#";

            const card = document.createElement("div");
            card.className = "deal-card animate-on-scroll";
            card.innerHTML = `
                <img src="${img}" alt="${title}" class="deal-img" />
                <div class="deal-card-content">
                    <span class="brand">${brand}</span>
                    <h3>${title}</h3>
                    <p class="description">${desc}</p>
                    <a href="${link}" target="_blank" class="btn btn-primary">Get Deal</a>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // Run once DOM is fully loaded
    loadDeals();
});
