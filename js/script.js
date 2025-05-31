// js/script.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Reusable HTML Loading ---
    async function loadHTML(filePath, elementId, callback) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
            }
            const text = await response.text();
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = text;
                if (callback) callback(); // Execute callback after HTML is loaded
            } else {
                console.warn(`Element with ID '${elementId}' not found for loading ${filePath}.`);
            }
        } catch (error) {
            console.error('Error loading HTML:', error);
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = `<p class="error-message">Error loading content for ${elementId}. Please try refreshing.</p>`;
            }
        }
    }

    // Load header and footer
    if (document.getElementById('header-placeholder')) {
        loadHTML('header.html', 'header-placeholder', initializeHeaderFeatures);
    } else {
        // If no placeholder, but header elements might exist directly, initialize them.
        // This path is less likely with the current structure but good for robustness.
        initializeHeaderFeatures();
    }

    if (document.getElementById('footer-placeholder')) {
        loadHTML('footer.html', 'footer-placeholder', initializeFooterFeatures);
    } else {
        initializeFooterFeatures();
    }


    // --- Header and Navigation Features ---
    function initializeHeaderFeatures() {
        const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
        const sidebarNav = document.querySelector('.sidebar-nav');
        const mainContent = document.querySelector('.main-content');
        const siteHeader = document.querySelector('.site-header'); // The top bar header

        // Active Nav Link
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPage || (currentPage === 'index.html' && link.dataset.page === 'index')) {
                link.classList.add('active');
            }
            // Smooth scroll for internal links (if any, not primary nav here)
            if (link.getAttribute('href').startsWith('#')) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    document.querySelector(this.getAttribute('href')).scrollIntoView({
                        behavior: 'smooth'
                    });
                    if (sidebarNav && sidebarNav.classList.contains('open')) {
                        sidebarNav.classList.remove('open');
                        mobileNavToggle.classList.remove('active');
                        mobileNavToggle.setAttribute('aria-expanded', 'false');
                    }
                });
            }
        });

        // Mobile Navigation Toggle
        if (mobileNavToggle && sidebarNav) {
            mobileNavToggle.addEventListener('click', () => {
                sidebarNav.classList.toggle('open');
                mobileNavToggle.classList.toggle('active');
                const isExpanded = sidebarNav.classList.contains('open');
                mobileNavToggle.setAttribute('aria-expanded', isExpanded);
                // Optional: Add/remove body class to prevent scroll when mobile menu is open
                // document.body.classList.toggle('no-scroll', isExpanded);
            });
        }

        // Adjust main content padding based on sidebar visibility on desktop
        function adjustLayoutForSidebar() {
            if (window.innerWidth > 992) { // Desktop
                if (sidebarNav) { // Sidebar exists
                    mainContent.style.paddingLeft = getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width-desktop').trim();
                    if (siteHeader) siteHeader.style.left = getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width-desktop').trim();
                    if (sidebarNav) sidebarNav.classList.remove('open'); // Ensure it's not in mobile 'open' state
                    if (mobileNavToggle) mobileNavToggle.classList.remove('active');
                } else { // No sidebar (e.g., a landing page without it)
                    mainContent.style.paddingLeft = '0';
                     if (siteHeader) siteHeader.style.left = '0';
                }
            } else { // Mobile/Tablet
                mainContent.style.paddingLeft = '0';
                if (siteHeader) siteHeader.style.left = '0';
                // Sidebar is handled by toggle, not fixed padding
            }
        }
        
        adjustLayoutForSidebar(); // Initial call
        window.addEventListener('resize', adjustLayoutForSidebar);
    }


    // --- Footer Features ---
    function initializeFooterFeatures() {
        const currentYearSpan = document.getElementById('current-year');
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }
    }
    

    // --- Home Page: Animated Headline ---
    const animatedHeadlineSpan = document.querySelector('.hero-section .highlight-word');
    if (animatedHeadlineSpan) {
        const words = ["Amazing", "Student", "Exclusive", "Top"];
        let wordIndex = 0;
        
        function changeWord() {
            animatedHeadlineSpan.style.opacity = 0;
            animatedHeadlineSpan.style.transform = 'translateY(-20px)';

            setTimeout(() => {
                wordIndex = (wordIndex + 1) % words.length;
                animatedHeadlineSpan.textContent = words[wordIndex];
                animatedHeadlineSpan.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    animatedHeadlineSpan.style.opacity = 1;
                    animatedHeadlineSpan.style.transform = 'translateY(0)';
                }, 100); // Brief pause before fading in
            }, 500); // Duration of fade out/transform
        }
        if (words.length > 0) { // Check if words array is not empty
           setInterval(changeWord, 3000); // Change word every 3 seconds
        }
    }

    // --- General Deals Page: Filters ---
    const filterButtons = document.querySelectorAll('.filters button');
    const dealCards = document.querySelectorAll('.deal-grid .deal-card[data-category]');

    if (filterButtons.length > 0 && dealCards.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Manage active state for buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const category = button.dataset.filter;

                dealCards.forEach(card => {
                    card.style.display = 'none'; // Hide all first
                    // Animate hide: card.style.opacity = 0; card.style.transform = 'scale(0.9)';
                    // setTimeout(() => card.style.display = 'none', 300);

                    if (category === 'all' || card.dataset.category === category) {
                        // Animate show:
                        // card.style.display = 'flex'; // or 'block' if not flex
                        // setTimeout(() => { card.style.opacity = 1; card.style.transform = 'scale(1)'; }, 50);
                        card.style.display = 'flex'; // Re-show matching cards
                    }
                });
            });
        });
    }


    // --- Contact Form Validation ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent actual submission for now
            let isValid = true;

            // Clear previous errors
            document.querySelectorAll('.form-error').forEach(el => el.textContent = '');

            // Name validation
            const nameInput = document.getElementById('name');
            if (nameInput.value.trim() === '') {
                displayError('name-error', 'Name is required.');
                isValid = false;
            }

            // Email validation
            const emailInput = document.getElementById('email');
            const emailValue = emailInput.value.trim();
            if (emailValue === '') {
                displayError('email-error', 'Email is required.');
                isValid = false;
            } else if (!isValidEmail(emailValue)) {
                displayError('email-error', 'Please enter a valid email address.');
                isValid = false;
            }

            // Message validation
            const messageInput = document.getElementById('message');
            if (messageInput.value.trim() === '') {
                displayError('message-error', 'Message is required.');
                isValid = false;
            }

            if (isValid) {
                alert('Form submitted successfully! (This is a demo)');
                contactForm.reset();
            }
        });

        function displayError(elementId, message) {
            const errorElement = document.getElementById(elementId);
            if (errorElement) {
                errorElement.textContent = message;
            }
        }

        function isValidEmail(email) {
            // Basic email validation regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }
    }

    // --- Animate elements on load/scroll (simple version) ---
    // For elements with class "animate-on-load"
    const animatedElements = document.querySelectorAll('.animate-on-load');
    
    // Simple page load animation for all elements
    // animatedElements.forEach((el, index) => {
    //     el.style.animationDelay = `${index * 0.1}s`; // Stagger slightly
    //     el.classList.add('visible'); // Assuming CSS handles the animation on 'visible' or directly
    // });

    // Intersection Observer for scroll animations
    if (window.IntersectionObserver) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible'); // Add a class to trigger animation
                                                           // CSS: .animate-on-scroll.visible { opacity: 1; transform: translateY(0); }
                    // Or directly apply animation if not using a 'visible' class state:
                    // entry.target.style.opacity = 1;
                    // entry.target.style.transform = 'translateY(0)';
                    // entry.target.style.animationPlayState = 'running'; // if animation is paused
                    observer.unobserve(entry.target); // Optional: stop observing after it's visible
                }
            });
        }, { threshold: 0.1 }); // Trigger when 10% of the element is visible

        document.querySelectorAll('.section, .deal-card, .animate-on-scroll').forEach(el => {
            // Prepare elements for animation (initially hidden/offset)
            // This should ideally be done in CSS for elements that are meant to animate on scroll
            // el.style.opacity = 0;
            // el.style.transform = 'translateY(30px)';
            // el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            observer.observe(el);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        // (e.g., animate all on load or use a scroll event listener - less performant)
        animatedElements.forEach(el => el.classList.add('visible')); // or el.style.opacity = 1;
    }

    // Add .visible class to elements that have .animate-on-load after a slight delay to ensure CSS transition applies
    // This is for the sections that are immediately visible on page load
    // The CSS already defines the animation for .animate-on-load
    // This JS just ensures it triggers by adding a class if needed, or that initial state is correct
    // But with current CSS, .animate-on-load starts automatically.

});

// Fetch deals from Google Sheet
async function loadDeals() {
  const response = await fetch("https://docs.google.com/spreadsheets/d/1pNz5I_5FnDcHTY2tsc30GBHMlDPZfIrCrUZge3Q2VK0/gviz/tq?tqx=out:json");
  const text = await response.text();
  const json = JSON.parse(text.substr(47).slice(0, -2));
  const rows = json.table.rows;

  const container = document.getElementById("deal-container");
  container.innerHTML = ""; // Clear existing

  rows.forEach(row => {
    const title = row.c[0]?.v || "";
    const desc = row.c[1]?.v || "";
    const img = row.c[2]?.v || "";
    const category = row.c[3]?.v || "";
    const link = row.c[4]?.v || "#";

    const card = document.createElement("div");
    card.className = "deal-card";
    card.innerHTML = `
      <img src="${img}" alt="${title}" class="deal-img" />
      <h3>${title}</h3>
      <p>${desc}</p>
      <a href="${link}" target="_blank" class="deal-btn">View Deal</a>
    `;
    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", loadDeals);
