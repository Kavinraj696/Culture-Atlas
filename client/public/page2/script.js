// search.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('searchForm');
    const input = document.getElementById('queryInput');
    const button = document.getElementById('searchButton');
    const resultsGrid = document.getElementById('resultsGrid');
    const messageArea = document.getElementById('message');
    
    // Get the modal overlay element
    const modalOverlay = document.querySelector('.modal-overlay');

    const API_BASE_URL = 'http://localhost:4000/search';

    // --- Helper function to create the HTML for a single festival card ---
    const createCardHtml = (festival) => {
        const date = festival.date || festival.month || '';
        const tagsHtml = (festival.tags || [])
            .map(tag => `<span class="tag">${tag}</span>`)
            .join('');
    
        let description = festival.description;
        if (description.length > 150) {
            const truncated = description.substring(0, 150);
            description = truncated.substring(0, Math.min(truncated.length, truncated.lastIndexOf(" "))) + '...';
        }
    
        const imageHtml = festival.imageUrl 
            ? `<img src="${festival.imageUrl}" alt="${festival.festivalName}" style="width:100%; margin-top:15px; border-radius:10px; object-fit:cover;">`
            : '';
    
        return `
            <div class="festival-card">
                <div class="card-header">
                    <h3>${festival.festivalName || 'Untitled Festival'}</h3>
                    <span class="card-country">${festival.country || 'Unknown'}</span>
                </div>
                <p class="card-date">🗓️ ${date}</p>
                ${imageHtml} <!-- 🔑 Insert image -->
                <p class="card-description">${description}</p>
                <div class="card-tags">${tagsHtml}</div>
            </div>
        `;
    };

    // --- Function to render all fetched results ---
    const renderResults = (festivals, isInitialLoad = false) => {
        if (festivals.length === 0) {
            resultsGrid.innerHTML = `<p class="no-results">No festivals found matching your query. Try a different term!</p>`;
            if (!isInitialLoad) {
                messageArea.textContent = `No results found.`;
            }
            return;
        }

        const allCardsHtml = festivals.map(createCardHtml).join('');
        resultsGrid.innerHTML = allCardsHtml;
        
        if (!isInitialLoad) {
            messageArea.textContent = `Found ${festivals.length} result(s) for your search.`;
            messageArea.style.color = 'var(--text-dark)';
        }
    };

    // --- Core Fetch Logic ---
    const fetchFestivals = async (query = '') => {
        const url = query ? `${API_BASE_URL}?q=${encodeURIComponent(query)}` : API_BASE_URL;
        messageArea.textContent = query ? 'Loading search results...' : 'Loading featured festivals...';

        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to fetch: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            messageArea.textContent = `Error: ${error.message}`;
            messageArea.style.color = '#e74c3c';
            return [];
        }
    };

    // --- Initial Load of Featured Festivals ---
    const loadInitialData = async () => {
        button.disabled = true;
        const initialFestivals = await fetchFestivals('');
        renderResults(initialFestivals, true);

        if (initialFestivals.length > 0) {
            messageArea.textContent = `Displaying ${initialFestivals.length} featured festivals.`;
            messageArea.style.color = 'var(--text-dark)';
        }
        button.disabled = false;
    };

    // --- Search Submission Logic ---
    const handleSearch = async (event) => {
        event.preventDefault();
        const query = input.value.trim();
        if (!query) {
            loadInitialData();
            return;
        }

        button.disabled = true;
        button.textContent = 'Searching...';
        const results = await fetchFestivals(query);
        renderResults(results, false);
        button.disabled = false;
        button.textContent = 'Search';
    };

    // --- LOGIC FOR CARD ZOOM ANIMATION (FLIP Technique) ---
    let activeCard = null;

    const zoomIn = (cardElement) => {
        if (activeCard) return;
    
        // Clone the card to avoid layout conflicts
        const clonedCard = cardElement.cloneNode(true);
        clonedCard.classList.add('zoomed');
        clonedCard.style.position = 'fixed';
        clonedCard.style.top = '50%';
        clonedCard.style.left = '50%';
        clonedCard.style.transform = 'translate(-50%, -50%) scale(1.1)';
        clonedCard.style.zIndex = '1002';
        clonedCard.style.margin = '0';
        clonedCard.style.overflow = 'auto';
    
        // Append to body
        document.body.appendChild(clonedCard);
        activeCard = clonedCard;
    
        modalOverlay.classList.add('active');
        document.body.classList.add('body-no-scroll');
    };
    

    
    const zoomOut = () => {
        if (!activeCard) return;
    
        modalOverlay.classList.remove('active');
        document.body.classList.remove('body-no-scroll');
    
        activeCard.classList.remove('zoomed');
    
        // Remove the cloned card from DOM
        activeCard.addEventListener('transitionend', () => {
            if (activeCard && activeCard.parentNode) {
                activeCard.parentNode.removeChild(activeCard);
            }
            activeCard = null;
        }, { once: true });
    };
    

    // --- Event Listeners ---
    
    // Use event delegation for card clicks
    resultsGrid.addEventListener('click', (event) => {
        const clickedCard = event.target.closest('.festival-card');
        if (clickedCard) {
            zoomIn(clickedCard);
        }
    });

    // Close the zoomed card by clicking the overlay
    modalOverlay.addEventListener('click', zoomOut);

    // Attach form listener and trigger initial load
    form.addEventListener('submit', handleSearch);
    loadInitialData();
});