document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const themeToggleBtn = document.getElementById('theme-toggle');
  const mobileMenuIcon = document.getElementById('mobile-menu-icon');
  const navUl = document.querySelector('header nav ul');
  
  // --- Theme Management ---
  const applyTheme = (theme) => {
    if (theme === 'light') {
      body.classList.add('light-mode');
      if (themeToggleBtn) themeToggleBtn.innerHTML = `<img src="assets/icons/moon.svg" alt="Dark Mode">`;
    } else {
      body.classList.remove('light-mode');
      if (themeToggleBtn) themeToggleBtn.innerHTML = `<img src="assets/icons/sun.svg" alt="Light Mode">`;
    }
  };
  
  const toggleTheme = () => {
    const currentThemeIsLight = body.classList.contains('light-mode');
    const newTheme = currentThemeIsLight ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };
  
  // Load saved theme or default
  const savedTheme = localStorage.getItem('theme') || (localStorage.getItem('defaultThemeMode') || 'dark');
  applyTheme(savedTheme);
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }
  
  // Apply custom primary color
  const savedPrimaryColor = localStorage.getItem('primaryThemeColor');
  if (savedPrimaryColor) {
    document.documentElement.style.setProperty('--primary-color', savedPrimaryColor);
  }
  
  
  // --- Mobile Menu ---
  if (mobileMenuIcon && navUl) {
    mobileMenuIcon.addEventListener('click', () => {
      navUl.classList.toggle('active');
    });
  }
  
  // --- Active Nav Link ---
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll('header nav ul li a');
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });
  
  
  // --- Deal Fetching and Display ---
  const dealsContainer = document.getElementById('deals-grid');
  const placeholderImage = 'assets/images/placeholder-deal.png';
  
  async function fetchAndDisplayDeals(sheetUrl, container) {
    if (!container) return;
    container.innerHTML = '<p>Loading deals...</p>'; // Loading message
    
    try {
      const response = await fetch(sheetUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const csvData = await response.text();
      const deals = parseCSV(csvData);
      
      container.innerHTML = ''; // Clear loading message
      if (deals.length === 0) {
        container.innerHTML = '<p>No deals available at the moment. Check back soon!</p>';
        return;
      }
      
      deals.forEach(deal => {
        const dealCard = `
                    <div class="deal-card">
                        <img src="${deal.image || placeholderImage}" alt="${deal.title}" class="deal-card-image" onerror="this.onerror=null;this.src='${placeholderImage}';">
                        <div class="deal-card-content">
                            <h3>${deal.title || 'Untitled Deal'}</h3>
                            <p>${deal.description || 'No description available.'}</p>
                            <a href="${deal.link}" target="_blank" rel="noopener noreferrer" class="deal-button">Get Deal</a>
                        </div>
                    </div>
                `;
        container.insertAdjacentHTML('beforeend', dealCard);
      });
      
    } catch (error) {
      console.error('Error fetching deals:', error);
      container.innerHTML = '<p>Sorry, we couldn\'t load the deals right now. Please try again later.</p>';
    }
  }
  
  function parseCSV(csvText) {
    const rows = csvText.trim().split('\n');
    const dealsArray = [];
    // Skip header row (rows[0])
    for (let i = 1; i < rows.length; i++) {
      const columns = rows[i].split(',');
      if (columns.length >= 4) { // Expecting Image, Title, Description, Link
        dealsArray.push({
          image: columns[0] ? columns[0].trim() : '',
          title: columns[1] ? columns[1].trim() : '',
          description: columns[2] ? columns[2].trim() : '',
          link: columns[3] ? columns[3].trim() : ''
          // Add more columns if your sheet has them
        });
      }
    }
    return dealsArray;
  }
  
  // --- Page Specific Logic ---
  const studentSheetUrl = 'https://docs.google.com/spreadsheets/d/1pNz5I_5FnDcHTY2tsc30GBHMlDPZfIrCrUZge3Q2VK0/edit?usp=drivesdk'; // REPLACE THIS
  const generalSheetUrl = 'https://docs.google.com/spreadsheets/d/1a7C4wGcUABmf9ZTkrBdbR-XnYZolbO7C539FEq6V1AA/edit?usp=drivesdk'; // REPLACE THIS
  
  if (document.getElementById('student-deals-grid')) {
    fetchAndDisplayDeals(studentSheetUrl, document.getElementById('student-deals-grid'));
  }
  if (document.getElementById('general-deals-grid')) {
    fetchAndDisplayDeals(generalSheetUrl, document.getElementById('general-deals-grid'));
  }
  
  // Expose for admin page if needed (though admin.js will have its own)
  window.SavifyApp = {
    fetchAndDisplayDeals,
    parseCSV,
    placeholderImage,
    studentSheetUrl,
    generalSheetUrl
  };
});