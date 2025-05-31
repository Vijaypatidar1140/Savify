// admin.js - Savify Local Admin Panel Script
// IMPORTANT: This script is for LOCAL USE ONLY. Do NOT deploy publicly.
// Password protection has been removed assuming local-only execution.

document.addEventListener('DOMContentLoaded', () => {
    console.log("Savify Admin Panel Script Loaded.");

    // --- Global Admin Configuration ---
    // Option 1: If public script.js is loaded and SavifyApp exists
    const studentSheetPublicCsvUrl = (window.SavifyApp && window.SavifyApp.studentSheetUrl)
        ? window.SavifyApp.studentSheetUrl
        : 'YOUR_STUDENT_SHEET_CSV_URL_HERE'; // FALLBACK: Replace if not using SavifyApp
    const generalSheetPublicCsvUrl = (window.SavifyApp && window.SavifyApp.generalSheetUrl)
        ? window.SavifyApp.generalSheetUrl
        : 'YOUR_GENERAL_SHEET_CSV_URL_HERE'; // FALLBACK: Replace if not using SavifyApp
    const sharedParseCSV = (window.SavifyApp && window.SavifyApp.parseCSV)
        ? window.SavifyApp.parseCSV
        : localParseCSV; // Use local fallback
    const sharedPlaceholderImage = (window.SavifyApp && window.SavifyApp.placeholderImage)
        ? window.SavifyApp.placeholderImage
        : 'assets/images/placeholder-deal.png'; // FALLBACK placeholder for admin

    // Fallback CSV parser if SavifyApp.parseCSV is not available
    function localParseCSV(csvText) {
        const dealsArray = [];
        if (!csvText || typeof csvText !== 'string') return dealsArray;
        const rows = csvText.trim().split(/\r?\n/); // Handles different line endings
        // Skip header row (rows[0])
        for (let i = 1; i < rows.length; i++) {
            if (rows[i].trim() === "") continue; // Skip empty rows
            // Basic CSV parsing: split by comma, handle quoted fields simply
            const columns = [];
            let currentColumn = '';
            let inQuotes = false;
            for (let char of rows[i]) {
                if (char === '"' && !inQuotes) { // Start of a quoted field
                    inQuotes = true;
                    continue;
                }
                if (char === '"' && inQuotes) { // End of a quoted field
                    // Check for double quotes inside quoted field (escaped quote)
                    if (rows[i][rows[i].indexOf(char) + 1] === '"') {
                         currentColumn += '"';
                         // Skip next char as it's part of the escaped quote
                         // This is a simplification; a robust CSV parser is more complex
                         continue;
                    }
                    inQuotes = false;
                    continue;
                }
                if (char === ',' && !inQuotes) {
                    columns.push(currentColumn.trim());
                    currentColumn = '';
                } else {
                    currentColumn += char;
                }
            }
            columns.push(currentColumn.trim()); // Add the last column


            if (columns.length >= 4) {
                dealsArray.push({
                    image: columns[0] || '',
                    title: columns[1] || '',
                    description: columns[2] || '',
                    link: columns[3] || '',
                    // Add original row index for easier reference back to sheet if needed
                    originalSheetRow: i + 1 // 1-based sheet row number
                });
            }
        }
        return dealsArray;
    }


    // Immediately show the dashboard and load initial data
    loadAdminSettings();
    setupTabs();
    loadDealsForAdminView(); // Load default tab deals

    // --- Theme Customization ---
    const themeSettingsForm = document.getElementById('theme-settings-form');
    const primaryColorPicker = document.getElementById('primary-color-picker');
    const primaryColorHex = document.getElementById('primary-color-hex');
    const defaultThemeModeSelect = document.getElementById('default-theme-mode');

    function loadAdminSettings() {
        const savedColor = localStorage.getItem('primaryThemeColor') || '#6200ea'; // Default public primary
        if (primaryColorPicker) primaryColorPicker.value = savedColor;
        if (primaryColorHex) primaryColorHex.value = savedColor;
        // Note: This admin panel might not visually reflect this primary color change itself
        // unless its own CSS also uses --primary-color from localStorage (which it doesn't by default).
        // This setting is primarily for the PUBLIC site.

        const savedDefaultTheme = localStorage.getItem('defaultThemeMode') || 'dark';
        if (defaultThemeModeSelect) defaultThemeModeSelect.value = savedDefaultTheme;
    }

    if (primaryColorPicker && primaryColorHex) {
        primaryColorPicker.addEventListener('input', (e) => primaryColorHex.value = e.target.value);
        primaryColorHex.addEventListener('input', (e) => primaryColorPicker.value = e.target.value);
    }

    if (themeSettingsForm) {
        themeSettingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newPrimaryColor = primaryColorPicker.value;
            const newDefaultTheme = defaultThemeModeSelect.value;

            localStorage.setItem('primaryThemeColor', newPrimaryColor);
            localStorage.setItem('defaultThemeMode', newDefaultTheme);

            alert('Public site theme settings saved to localStorage! These will apply when the public site is visited in this browser.');
        });
    }

    // --- Deal Management (Manual Update Instructions) ---
    const dealForm = document.getElementById('admin-deal-form');
    const dealImageInput = document.getElementById('deal-image');
    const dealTitleInput = document.getElementById('deal-title');
    const dealDescriptionInput = document.getElementById('deal-description');
    const dealLinkInput = document.getElementById('deal-link');
    const dealOriginalIndexInput = document.getElementById('deal-original-index'); // 0-based index from *parsed data array*
    const dealSheetTypeInput = document.getElementById('deal-sheet-type'); // 'student' or 'general'
    const saveDealBtn = document.getElementById('save-deal-btn');
    const clearDealFormBtn = document.getElementById('clear-deal-form-btn');
    const manualUpdateInstructionsDiv = document.getElementById('manual-update-instructions');

    if (dealForm) {
        dealForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const dealData = {
                image: dealImageInput.value.trim(),
                title: dealTitleInput.value.trim(),
                description: dealDescriptionInput.value.trim(),
                link: dealLinkInput.value.trim(),
            };

            // Escape commas and quotes for CSV generation
            const escapeCsvField = (field) => {
                if (field.includes(',') || field.includes('"') || field.includes('\n')) {
                    return `"${field.replace(/"/g, '""')}"`; // Enclose in quotes, double up existing quotes
                }
                return field;
            };

            const csvRow = [
                escapeCsvField(dealData.image),
                escapeCsvField(dealData.title),
                escapeCsvField(dealData.description),
                escapeCsvField(dealData.link)
            ].join(',');

            const originalDataIndex = parseInt(dealOriginalIndexInput.value); // This is the index in the *filtered data array*
            const sheetType = dealSheetTypeInput.value;

            let instructions = '';
            if (originalDataIndex > -1) {
                // To get the actual sheet row, we'd need to map originalDataIndex back to the full sheet
                // This is complex if the sheet has blank rows or rows that were filtered out.
                // For simplicity, guide user to find by content.
                instructions = `To UPDATE the deal in the '${sheetType}' sheet:\n1. Find the deal by its title or content.\n2. Replace its row data with the following CSV line:\n\n${csvRow}\n\n(If you know the exact original sheet row number from the 'View Existing Deals' section, you can use that to find it faster.)`;
                saveDealBtn.textContent = 'Generate CSV Row for New Deal'; // Reset button
                dealOriginalIndexInput.value = -1; // Reset after edit instruction
            } else {
                instructions = `To ADD this new deal to the '${sheetType}' sheet:\nPaste the following as a new row at the end of the sheet:\n\n${csvRow}`;
            }

            manualUpdateInstructionsDiv.innerHTML = instructions.replace(/\n/g, '<br>'); // Use innerHTML for <br>
            manualUpdateInstructionsDiv.style.display = 'block';
        });
    }

    if (clearDealFormBtn) {
        clearDealFormBtn.addEventListener('click', () => {
            if (dealForm) dealForm.reset();
            if (dealOriginalIndexInput) dealOriginalIndexInput.value = -1;
            if (saveDealBtn) saveDealBtn.textContent = 'Generate CSV Row for New Deal';
            if (manualUpdateInstructionsDiv) manualUpdateInstructionsDiv.style.display = 'none';
            if (dealSheetTypeInput) dealSheetTypeInput.value = document.querySelector('.admin-tab-button.active')?.dataset.target.includes('student') ? 'student' : 'general';
        });
    }

    // --- View Existing Deals ---
    const adminStudentDealsList = document.getElementById('admin-student-deals-list');
    const adminGeneralDealsList = document.getElementById('admin-general-deals-list');
    const tabButtons = document.querySelectorAll('.admin-tab-button');
    const tabContents = document.querySelectorAll('.admin-deals-view-content');

    function setupTabs() {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                tabContents.forEach(content => content.classList.remove('active'));
                const targetContentId = button.dataset.target;
                document.getElementById(targetContentId).classList.add('active');

                // Update sheet type for "Add Deal" form based on active tab
                if(dealSheetTypeInput) {
                    dealSheetTypeInput.value = targetContentId.includes('student') ? 'student' : 'general';
                }
                loadDealsForAdminView(); // Reload deals for the newly active tab
            });
        });
    }


    async function loadDealsForAdminView() {
        const activeTab = document.querySelector('.admin-tab-button.active');
        if (!activeTab) return;

        const targetViewId = activeTab.dataset.target;
        let sheetUrl, container, sheetType;

        if (targetViewId === 'admin-student-deals-view') {
            sheetUrl = studentSheetPublicCsvUrl;
            container = adminStudentDealsList;
            sheetType = 'student';
        } else if (targetViewId === 'admin-general-deals-view') {
            sheetUrl = generalSheetPublicCsvUrl;
            container = adminGeneralDealsList;
            sheetType = 'general';
        } else {
            return;
        }
        
        if (sheetUrl.includes('YOUR_') || sheetUrl.includes('FALLBACK')) {
            if(container) container.innerHTML = `<p>Sheet URL for '${sheetType}' not configured. Please update admin.js.</p>`;
            console.warn(`Sheet URL for '${sheetType}' not configured: ${sheetUrl}`);
            return;
        }


        if (!container) return;
        container.innerHTML = '<p>Loading deals...</p>';

        try {
            const response = await fetch(sheetUrl);
            if (!response.ok) throw new Error(`Fetch error! status: ${response.status} for ${sheetUrl}`);
            const csvData = await response.text();
            const deals = sharedParseCSV(csvData); // Use shared or local parser

            container.innerHTML = '';
            if (deals.length === 0) {
                container.innerHTML = '<p>No deals found in this sheet, or sheet is empty/misformatted.</p>';
                return;
            }

            deals.forEach((deal, index) => {
                // The 'originalSheetRow' from parsed data is the actual sheet row (1-based)
                const cardHtml = `
                    <div class="admin-deal-card">
                        <img src="${deal.image || sharedPlaceholderImage}" alt="${deal.title}" class="admin-deal-card-image" onerror="this.onerror=null;this.src='${sharedPlaceholderImage}';">
                        <div class="admin-deal-card-content">
                            <h3>${deal.title || 'Untitled Deal'}</h3>
                            <p>Sheet Row: ${deal.originalSheetRow || 'N/A'}<br>${deal.description || 'No description.'}</p>
                            <div class="admin-deal-card-actions">
                                <button class="admin-button-icon edit-deal-btn" data-deal-index="${index}" data-sheet-type="${sheetType}" title="Populate form to edit this deal (Row ${deal.originalSheetRow})">
                                    <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                </button>
                                <button class="admin-button-icon delete-deal-btn" data-sheet-row="${deal.originalSheetRow}" data-sheet-type="${sheetType}" title="Generate instruction to delete this deal (Row ${deal.originalSheetRow})">
                                    <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                </button>
                            </div>
                            ${deal.link ? `<a href="${deal.link}" target="_blank" rel="noopener noreferrer" class="deal-link-button">View Deal Site</a>` : ''}
                        </div>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', cardHtml);
            });

            // Add event listeners for new edit/delete buttons
            container.querySelectorAll('.edit-deal-btn').forEach(btn => {
                btn.addEventListener('click', (event) => handlePopulateEditForm(event, deals));
            });
            container.querySelectorAll('.delete-deal-btn').forEach(btn => {
                btn.addEventListener('click', handleGenerateDeleteInstruction);
            });

        } catch (error) {
            console.error(`Error fetching/displaying ${sheetType} deals for admin:`, error);
            container.innerHTML = `<p>Could not load deals for '${sheetType}'. Check console and ensure sheet URL is correct and publicly accessible as CSV. Error: ${error.message}</p>`;
        }
    }

    function handlePopulateEditForm(event, allDealsArray) {
        const button = event.currentTarget;
        const dealDataIndex = parseInt(button.dataset.dealIndex); // This is the index in the `allDealsArray`
        // const sheetType = button.dataset.sheetType; // Already known by the form

        const dealToEdit = allDealsArray[dealDataIndex];

        if (dealToEdit) {
            if(dealImageInput) dealImageInput.value = dealToEdit.image;
            if(dealTitleInput) dealTitleInput.value = dealToEdit.title;
            if(dealDescriptionInput) dealDescriptionInput.value = dealToEdit.description;
            if(dealLinkInput) dealLinkInput.value = dealToEdit.link;
            if(dealOriginalIndexInput) dealOriginalIndexInput.value = dealDataIndex; // Store data index for context
            // dealSheetTypeInput is already set by tab

            if(saveDealBtn) saveDealBtn.textContent = `Generate Update CSV for "${dealToEdit.title.substring(0,20)}..."`;
            if(manualUpdateInstructionsDiv) manualUpdateInstructionsDiv.style.display = 'none';
            document.getElementById('deal-management-form-container').scrollIntoView({ behavior: 'smooth' });
            if(dealTitleInput) dealTitleInput.focus();
        }
    }

    function handleGenerateDeleteInstruction(event) {
        const button = event.currentTarget;
        const sheetRowNumber = button.dataset.sheetRow;
        const sheetType = button.dataset.sheetType;

        if (confirm(`Generate instruction to DELETE deal from sheet '${sheetType}', row ${sheetRowNumber}? This is a manual Google Sheet operation.`)) {
            const instructions = `To DELETE this deal from the '${sheetType}' sheet:\nManually delete row ${sheetRowNumber} in your Google Sheet.`;
            if (manualUpdateInstructionsDiv) {
                manualUpdateInstructionsDiv.innerHTML = instructions.replace(/\n/g, '<br>');
                manualUpdateInstructionsDiv.style.display = 'block';
                document.getElementById('deal-management-form-container').scrollIntoView({ behavior: 'smooth' });
            }
        }
    }
});