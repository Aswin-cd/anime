/**
 * Anime Recommendation System - Vanilla JavaScript Client
 * Manages UI interactions, REST API calls, localStorage Watchlist,
 * and Content-Based Recommendation displays.
 */

// Application State
const state = {
    allAnime: [],
    displayedAnime: [],
    genres: [],
    selectedGenre: 'ALL',
    searchQuery: '',
    sortOption: 'rating-desc',
    watchlist: new Set(),
    activeRecommendationTarget: null
};

// DOM Element References
const elements = {
    animeGrid: document.getElementById('animeGrid'),
    genreChipsContainer: document.getElementById('genreChipsContainer'),
    searchInput: document.getElementById('searchInput'),
    btnClearSearch: document.getElementById('btnClearSearch'),
    sortSelect: document.getElementById('sortSelect'),
    resultsCount: document.getElementById('resultsCount'),
    activeFilterPill: document.getElementById('activeFilterPill'),
    activeFilterText: document.getElementById('activeFilterText'),
    btnResetFilters: document.getElementById('btnResetFilters'),
    emptyState: document.getElementById('emptyState'),
    emptyMessage: document.getElementById('emptyMessage'),
    btnEmptyReset: document.getElementById('btnEmptyReset'),

    // Hero quick recommend
    heroAnimeSelect: document.getElementById('heroAnimeSelect'),
    btnHeroRecommend: document.getElementById('btnHeroRecommend'),
    btnRandomAnime: document.getElementById('btnRandomAnime'),

    // Spotlight section
    recommendationSpotlight: document.getElementById('recommendationSpotlight'),
    spotlightTitle: document.getElementById('spotlightTitle'),
    spotlightSubtitle: document.getElementById('spotlightSubtitle'),
    recommendationsGrid: document.getElementById('recommendationsGrid'),
    btnCloseSpotlight: document.getElementById('btnCloseSpotlight'),

    // Watchlist
    btnWatchlist: document.getElementById('btnWatchlist'),
    watchlistCountBadge: document.getElementById('watchlistCountBadge'),
    watchlistModal: document.getElementById('watchlistModal'),
    btnCloseWatchlist: document.getElementById('btnCloseWatchlist'),
    btnCloseWatchlistFooter: document.getElementById('btnCloseWatchlistFooter'),
    btnClearWatchlist: document.getElementById('btnClearWatchlist'),
    watchlistItemsContainer: document.getElementById('watchlistItemsContainer'),
    emptyWatchlist: document.getElementById('emptyWatchlist'),
    modalWatchlistCounter: document.getElementById('modalWatchlistCounter'),

    // Details Modal
    animeDetailModal: document.getElementById('animeDetailModal'),
    btnCloseDetail: document.getElementById('btnCloseDetail'),
    detailModalContent: document.getElementById('detailModalContent'),

    // Algo Modal
    btnAlgoInfo: document.getElementById('btnAlgoInfo'),
    algoModal: document.getElementById('algoModal'),
    btnCloseAlgo: document.getElementById('btnCloseAlgo'),
    btnCloseAlgoFooter: document.getElementById('btnCloseAlgoFooter'),

    btnBrowse: document.getElementById('btnBrowse'),
    toastContainer: document.getElementById('toastContainer')
};

// =============================================================================
// Initialization
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
    loadWatchlistFromStorage();
    setupEventListeners();
    initApp();
});

async function initApp() {
    try {
        await Promise.all([fetchGenres(), fetchAnimeList()]);
        populateHeroDropdown();
        applyFiltersAndRender();
    } catch (err) {
        console.error('Initialization error:', err);
        showToast('Error connecting to backend server', 'error');
    }
}

// =============================================================================
// API Communication
// =============================================================================

/**
 * Fetch all anime from Spring Boot backend
 */
async function fetchAnimeList() {
    try {
        const response = await fetch('/api/anime');
        if (!response.ok) throw new Error('Failed to fetch anime');
        state.allAnime = await response.json();
        state.displayedAnime = [...state.allAnime];
    } catch (error) {
        console.error('Fetch anime error:', error);
        throw error;
    }
}

/**
 * Fetch unique genres from Spring Boot backend
 */
async function fetchGenres() {
    try {
        const response = await fetch('/api/anime/genres');
        if (!response.ok) throw new Error('Failed to fetch genres');
        state.genres = await response.json();
        renderGenreChips();
    } catch (error) {
        console.error('Fetch genres error:', error);
    }
}

/**
 * Fetch recommendations for an anime using content-based filtering API
 */
async function fetchRecommendations(animeId, limit = 6) {
    try {
        const response = await fetch(`/api/anime/${animeId}/recommendations?limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch recommendations');
        return await response.json();
    } catch (error) {
        console.error('Recommendation API error:', error);
        showToast('Failed to generate recommendations', 'error');
        return [];
    }
}

// =============================================================================
// Rendering Functions
// =============================================================================

/**
 * Generates an SVG data URL fallback when a remote poster fails to load
 */
function getSvgPosterFallback(title, genre) {
    const cleanTitle = (title || 'Anime').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const primaryGenre = (genre || 'Anime').replace(/&/g, '&amp;');
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e1b4b" />
          <stop offset="50%" stop-color="#31104b" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
      </defs>
      <rect width="300" height="420" fill="url(#bg)"/>
      <circle cx="150" cy="160" r="60" fill="#6366f1" opacity="0.25"/>
      <text x="150" y="170" font-family="Arial, sans-serif" font-size="44" fill="#818cf8" font-weight="bold" text-anchor="middle">⛩️</text>
      <text x="150" y="270" font-family="Arial, sans-serif" font-size="16" fill="#f8fafc" font-weight="bold" text-anchor="middle">${cleanTitle.length > 22 ? cleanTitle.substring(0, 20) + '...' : cleanTitle}</text>
      <text x="150" y="295" font-family="Arial, sans-serif" font-size="12" fill="#ec4899" text-anchor="middle">${primaryGenre}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Render genre filter chips
 */
function renderGenreChips() {
    elements.genreChipsContainer.innerHTML = '';

    // "All" chip
    const allChip = document.createElement('button');
    allChip.className = `genre-chip ${state.selectedGenre === 'ALL' ? 'active' : ''}`;
    allChip.textContent = 'All Genres';
    allChip.addEventListener('click', () => setGenreFilter('ALL'));
    elements.genreChipsContainer.appendChild(allChip);

    // Individual genre chips
    state.genres.forEach(genre => {
        const chip = document.createElement('button');
        chip.className = `genre-chip ${state.selectedGenre === genre ? 'active' : ''}`;
        chip.textContent = genre;
        chip.addEventListener('click', () => setGenreFilter(genre));
        elements.genreChipsContainer.appendChild(chip);
    });
}

/**
 * Populate Hero section select dropdown
 */
function populateHeroDropdown() {
    elements.heroAnimeSelect.innerHTML = '<option value="">⚡ Quick Recommend: Select an anime...</option>';
    const sorted = [...state.allAnime].sort((a, b) => a.title.localeCompare(b.title));
    sorted.forEach(anime => {
        const opt = document.createElement('option');
        opt.value = anime.id;
        opt.textContent = `${anime.title} (${anime.genres.slice(0, 2).join(', ')})`;
        elements.heroAnimeSelect.appendChild(opt);
    });
}

/**
 * Render the main catalog grid
 */
function renderAnimeGrid() {
    elements.animeGrid.innerHTML = '';

    if (state.displayedAnime.length === 0) {
        elements.animeGrid.style.display = 'none';
        elements.emptyState.style.display = 'block';
        elements.emptyMessage.textContent = state.searchQuery
            ? `No anime found matching "${state.searchQuery}" in genre "${state.selectedGenre}".`
            : `No anime found for selected genre "${state.selectedGenre}".`;
        elements.resultsCount.textContent = '0 anime found';
        return;
    }

    elements.animeGrid.style.display = 'grid';
    elements.emptyState.style.display = 'none';
    elements.resultsCount.textContent = `Showing ${state.displayedAnime.length} of ${state.allAnime.length} anime`;

    state.displayedAnime.forEach(anime => {
        const card = createAnimeCard(anime);
        elements.animeGrid.appendChild(card);
    });
}

/**
 * Build an anime card DOM element
 */
function createAnimeCard(anime, isRecommendation = false, recData = null) {
    const card = document.createElement('article');
    card.className = 'anime-card';

    const isSaved = state.watchlist.has(anime.id);
    const fallbackSrc = getSvgPosterFallback(anime.title, anime.genres?.[0]);

    // Matching genres highlighting for recommendation mode
    const sharedGenresSet = new Set(recData?.matchingGenres?.map(g => g.toLowerCase()) || []);

    const genreBadgesHtml = anime.genres ? anime.genres.map(g => {
        const isShared = sharedGenresSet.has(g.toLowerCase());
        return `<span class="genre-tag ${isShared ? 'highlight-genre' : ''}">${isShared ? '✓ ' : ''}${g}</span>`;
    }).join('') : '';

    card.innerHTML = `
        <div class="card-poster-wrapper">
            <img class="card-poster-img"
                 src="${anime.posterUrl || fallbackSrc}"
                 alt="${anime.title} Poster"
                 loading="lazy"
                 referrerpolicy="no-referrer"
                 onerror="this.onerror=null; this.src='${fallbackSrc}';">
            <div class="card-poster-overlay"></div>

            <div class="card-badges">
                <span class="rating-badge">★ ${anime.rating ? anime.rating.toFixed(1) : 'N/A'}</span>
                <span class="year-badge">${anime.year || 'N/A'}</span>
            </div>

            ${isRecommendation && recData ? `
                <div class="match-score-badge" title="Composite Similarity: ${recData.similarityScore}">
                    <span>🎯</span>
                    <span>${recData.matchPercentage}% Match</span>
                </div>
            ` : ''}

            <button class="watchlist-toggle-btn ${isSaved ? 'active' : ''}"
                    title="${isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}"
                    data-anime-id="${anime.id}">
                ${isSaved ? '♥' : '♡'}
            </button>
        </div>

        <div class="card-content">
            <h4 class="card-title">${anime.title}</h4>
            <div class="card-jp-title">${anime.japaneseTitle || ''}</div>
            <div class="card-genres">${genreBadgesHtml}</div>
            
            ${isRecommendation && recData ? `
                <div class="card-match-reason">
                    <strong>Why Recommended:</strong> ${recData.explanation}
                </div>
            ` : `
                <p class="card-synopsis">${anime.synopsis || 'No description available.'}</p>
            `}

            <div class="card-actions">
                <button class="btn-card-recommend" data-anime-id="${anime.id}">
                    <span>✨</span>
                    <span>Find Similar</span>
                </button>
                <button class="btn-card-details" data-anime-id="${anime.id}">
                    Details
                </button>
            </div>
        </div>
    `;

    // Watchlist toggle button
    const watchlistBtn = card.querySelector('.watchlist-toggle-btn');
    watchlistBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleWatchlist(anime.id);
    });

    // Recommend button
    const recommendBtn = card.querySelector('.btn-card-recommend');
    recommendBtn.addEventListener('click', () => {
        triggerRecommendation(anime.id);
    });

    // Details button
    const detailsBtn = card.querySelector('.btn-card-details');
    detailsBtn.addEventListener('click', () => {
        showAnimeDetail(anime);
    });

    return card;
}

/**
 * Render Recommendation Spotlight results
 */
function renderRecommendations(targetAnime, recommendations) {
    if (!recommendations || recommendations.length === 0) {
        showToast('No similar anime found with shared genres', 'info');
        return;
    }

    state.activeRecommendationTarget = targetAnime;
    elements.spotlightTitle.innerHTML = `Similar Anime based on: <span>${targetAnime.title}</span>`;
    elements.spotlightSubtitle.textContent = `Target genres: [${targetAnime.genres.join(', ')}] • Algorithm: Jaccard Similarity (85%) + Quality Rating (15%)`;

    elements.recommendationsGrid.innerHTML = '';
    recommendations.forEach(rec => {
        const card = createAnimeCard(rec.anime, true, rec);
        elements.recommendationsGrid.appendChild(card);
    });

    elements.recommendationSpotlight.style.display = 'block';
    elements.recommendationSpotlight.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast(`Found ${recommendations.length} similar anime for "${targetAnime.title}"!`, 'success');
}

// =============================================================================
// Filters, Search & Sorting
// =============================================================================

function applyFiltersAndRender() {
    let result = [...state.allAnime];

    // Filter by Genre
    if (state.selectedGenre !== 'ALL') {
        const lowerGenre = state.selectedGenre.toLowerCase();
        result = result.filter(anime =>
            anime.genres && anime.genres.some(g => g.toLowerCase() === lowerGenre)
        );
    }

    // Filter by Search Query
    if (state.searchQuery.trim() !== '') {
        const q = state.searchQuery.toLowerCase().trim();
        result = result.filter(anime =>
            (anime.title && anime.title.toLowerCase().includes(q)) ||
            (anime.japaneseTitle && anime.japaneseTitle.toLowerCase().includes(q)) ||
            (anime.studio && anime.studio.toLowerCase().includes(q))
        );
        elements.btnClearSearch.style.display = 'block';
    } else {
        elements.btnClearSearch.style.display = 'none';
    }

    // Sort Results
    result.sort((a, b) => {
        switch (state.sortOption) {
            case 'rating-desc':
                return (b.rating || 0) - (a.rating || 0);
            case 'title-asc':
                return (a.title || '').localeCompare(b.title || '');
            case 'year-desc':
                return (b.year || 0) - (a.year || 0);
            case 'episodes-desc':
                return (b.episodes || 0) - (a.episodes || 0);
            default:
                return 0;
        }
    });

    state.displayedAnime = result;

    // Update active filters pill
    const isFiltered = state.selectedGenre !== 'ALL' || state.searchQuery.trim() !== '';
    if (isFiltered) {
        elements.activeFilterPill.style.display = 'flex';
        const parts = [];
        if (state.selectedGenre !== 'ALL') parts.push(`Genre: ${state.selectedGenre}`);
        if (state.searchQuery.trim()) parts.push(`Search: "${state.searchQuery}"`);
        elements.activeFilterText.textContent = parts.join(' | ');
    } else {
        elements.activeFilterPill.style.display = 'none';
    }

    renderAnimeGrid();
}

function setGenreFilter(genre) {
    state.selectedGenre = genre;
    // Update active class on chips
    const chips = elements.genreChipsContainer.querySelectorAll('.genre-chip');
    chips.forEach(chip => {
        if (chip.textContent === (genre === 'ALL' ? 'All Genres' : genre)) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });
    applyFiltersAndRender();
}

function resetAllFilters() {
    state.selectedGenre = 'ALL';
    state.searchQuery = '';
    elements.searchInput.value = '';
    elements.btnClearSearch.style.display = 'none';
    const chips = elements.genreChipsContainer.querySelectorAll('.genre-chip');
    chips.forEach(c => c.classList.remove('active'));
    if (chips[0]) chips[0].classList.add('active');
    applyFiltersAndRender();
}

// =============================================================================
// Recommendations Workflow
// =============================================================================

async function triggerRecommendation(animeId) {
    const target = state.allAnime.find(a => a.id === Number(animeId));
    if (!target) return;

    showToast(`Calculating similarity for ${target.title}...`, 'info');
    const recs = await fetchRecommendations(target.id, 6);
    renderRecommendations(target, recs);
}

// =============================================================================
// Watchlist (localStorage)
// =============================================================================

function loadWatchlistFromStorage() {
    try {
        const stored = localStorage.getItem('ani_watchlist');
        if (stored) {
            const parsed = JSON.parse(stored);
            state.watchlist = new Set(parsed);
        }
    } catch (e) {
        console.warn('Could not read watchlist from localStorage', e);
        state.watchlist = new Set();
    }
    updateWatchlistBadge();
}

function saveWatchlistToStorage() {
    try {
        localStorage.setItem('ani_watchlist', JSON.stringify([...state.watchlist]));
    } catch (e) {
        console.warn('Could not save watchlist to localStorage', e);
    }
    updateWatchlistBadge();
}

function updateWatchlistBadge() {
    elements.watchlistCountBadge.textContent = state.watchlist.size;
}

function toggleWatchlist(animeId) {
    const numId = Number(animeId);
    const anime = state.allAnime.find(a => a.id === numId);
    const title = anime ? anime.title : 'Anime';

    if (state.watchlist.has(numId)) {
        state.watchlist.delete(numId);
        showToast(`Removed "${title}" from Watchlist`, 'info');
    } else {
        state.watchlist.add(numId);
        showToast(`Added "${title}" to Watchlist!`, 'success');
    }

    saveWatchlistToStorage();
    applyFiltersAndRender(); // Re-render active card hearts

    // If watchlist modal is currently open, refresh it
    if (elements.watchlistModal.style.display === 'flex') {
        renderWatchlistModal();
    }
}

function renderWatchlistModal() {
    elements.watchlistItemsContainer.innerHTML = '';
    const savedAnimeList = state.allAnime.filter(a => state.watchlist.has(a.id));

    elements.modalWatchlistCounter.textContent = `(${savedAnimeList.length} items)`;

    if (savedAnimeList.length === 0) {
        elements.emptyWatchlist.style.display = 'block';
        elements.watchlistItemsContainer.style.display = 'none';
        return;
    }

    elements.emptyWatchlist.style.display = 'none';
    elements.watchlistItemsContainer.style.display = 'flex';

    savedAnimeList.forEach(anime => {
        const fallbackSrc = getSvgPosterFallback(anime.title, anime.genres?.[0]);
        const item = document.createElement('div');
        item.className = 'watchlist-item';
        item.innerHTML = `
            <img class="watchlist-item-poster"
                 src="${anime.posterUrl || fallbackSrc}"
                 alt="${anime.title}"
                 referrerpolicy="no-referrer"
                 onerror="this.onerror=null; this.src='${fallbackSrc}';">
            <div class="watchlist-item-info">
                <div class="watchlist-item-title">${anime.title}</div>
                <div class="watchlist-item-meta">★ ${anime.rating} &bull; ${anime.year} &bull; ${anime.genres ? anime.genres.slice(0, 2).join(', ') : ''}</div>
            </div>
            <div class="watchlist-item-actions">
                <button class="btn-item-rec" data-anime-id="${anime.id}">✨ Similar</button>
                <button class="btn-item-remove" data-anime-id="${anime.id}">Remove</button>
            </div>
        `;

        item.querySelector('.btn-item-rec').addEventListener('click', () => {
            closeModal(elements.watchlistModal);
            triggerRecommendation(anime.id);
        });

        item.querySelector('.btn-item-remove').addEventListener('click', () => {
            toggleWatchlist(anime.id);
        });

        elements.watchlistItemsContainer.appendChild(item);
    });
}

// =============================================================================
// Modals & Popups
// =============================================================================

function showAnimeDetail(anime) {
    const fallbackSrc = getSvgPosterFallback(anime.title, anime.genres?.[0]);
    const isSaved = state.watchlist.has(anime.id);

    elements.detailModalContent.innerHTML = `
        <div class="detail-poster-col">
            <img class="detail-poster-img"
                 src="${anime.posterUrl || fallbackSrc}"
                 alt="${anime.title}"
                 referrerpolicy="no-referrer"
                 onerror="this.onerror=null; this.src='${fallbackSrc}';">
        </div>
        <div class="detail-info-col">
            <div class="detail-header">
                <h3 class="detail-title">${anime.title}</h3>
                <div class="detail-jp-title">${anime.japaneseTitle || ''}</div>
            </div>

            <div class="detail-meta-grid">
                <div class="meta-item">
                    <strong>Rating</strong>
                    <span>★ ${anime.rating ? anime.rating.toFixed(1) : 'N/A'} / 10</span>
                </div>
                <div class="meta-item">
                    <strong>Release Year</strong>
                    <span>${anime.year || 'N/A'}</span>
                </div>
                <div class="meta-item">
                    <strong>Episodes</strong>
                    <span>${anime.episodes ? anime.episodes + ' eps' : 'N/A'}</span>
                </div>
                <div class="meta-item">
                    <strong>Studio</strong>
                    <span>${anime.studio || 'Unknown'}</span>
                </div>
            </div>

            <div class="card-genres" style="margin-bottom: 1.25rem;">
                ${anime.genres ? anime.genres.map(g => `<span class="genre-tag">${g}</span>`).join('') : ''}
            </div>

            <div class="detail-synopsis-box">
                <h4>Synopsis</h4>
                <p>${anime.synopsis || 'No detailed synopsis available.'}</p>
            </div>

            <div class="detail-actions">
                <button class="btn btn-primary" id="btnModalRecommend">
                    <span>✨ Get Similar Anime</span>
                </button>
                <button class="btn btn-secondary" id="btnModalWatchlist">
                    <span>${isSaved ? '♥ In Watchlist' : '🔖 Add to Watchlist'}</span>
                </button>
            </div>
        </div>
    `;

    document.getElementById('btnModalRecommend').addEventListener('click', () => {
        closeModal(elements.animeDetailModal);
        triggerRecommendation(anime.id);
    });

    document.getElementById('btnModalWatchlist').addEventListener('click', () => {
        toggleWatchlist(anime.id);
        const btn = document.getElementById('btnModalWatchlist');
        const nowSaved = state.watchlist.has(anime.id);
        btn.innerHTML = `<span>${nowSaved ? '♥ In Watchlist' : '🔖 Add to Watchlist'}</span>`;
    });

    openModal(elements.animeDetailModal);
}

function openModal(modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = '0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

// =============================================================================
// Event Listeners
// =============================================================================

function setupEventListeners() {
    // Search input (immediate on typing)
    elements.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        applyFiltersAndRender();
    });

    // Clear search button
    elements.btnClearSearch.addEventListener('click', () => {
        state.searchQuery = '';
        elements.searchInput.value = '';
        elements.btnClearSearch.style.display = 'none';
        applyFiltersAndRender();
        elements.searchInput.focus();
    });

    // Sort dropdown
    elements.sortSelect.addEventListener('change', (e) => {
        state.sortOption = e.target.value;
        applyFiltersAndRender();
    });

    // Reset filters buttons
    elements.btnResetFilters.addEventListener('click', resetAllFilters);
    elements.btnEmptyReset.addEventListener('click', resetAllFilters);

    // Hero quick recommend button
    elements.btnHeroRecommend.addEventListener('click', () => {
        const val = elements.heroAnimeSelect.value;
        if (!val) {
            showToast('Please select an anime from the dropdown first', 'info');
            return;
        }
        triggerRecommendation(val);
    });

    // Random anime (Surprise Me)
    elements.btnRandomAnime.addEventListener('click', () => {
        if (state.allAnime.length === 0) return;
        const randomAnime = state.allAnime[Math.floor(Math.random() * state.allAnime.length)];
        elements.heroAnimeSelect.value = randomAnime.id;
        triggerRecommendation(randomAnime.id);
    });

    // Close Spotlight
    elements.btnCloseSpotlight.addEventListener('click', () => {
        elements.recommendationSpotlight.style.display = 'none';
    });

    // Watchlist Modal triggers
    elements.btnWatchlist.addEventListener('click', () => {
        renderWatchlistModal();
        openModal(elements.watchlistModal);
    });
    elements.btnCloseWatchlist.addEventListener('click', () => closeModal(elements.watchlistModal));
    elements.btnCloseWatchlistFooter.addEventListener('click', () => closeModal(elements.watchlistModal));

    // Clear all watchlist items
    elements.btnClearWatchlist.addEventListener('click', () => {
        if (state.watchlist.size === 0) return;
        state.watchlist.clear();
        saveWatchlistToStorage();
        renderWatchlistModal();
        applyFiltersAndRender();
        showToast('Watchlist cleared', 'info');
    });

    // Details Modal Close
    elements.btnCloseDetail.addEventListener('click', () => closeModal(elements.animeDetailModal));

    // Algo Info Modal
    elements.btnAlgoInfo.addEventListener('click', () => openModal(elements.algoModal));
    elements.btnCloseAlgo.addEventListener('click', () => closeModal(elements.algoModal));
    elements.btnCloseAlgoFooter.addEventListener('click', () => closeModal(elements.algoModal));

    // Navigation browse button
    elements.btnBrowse.addEventListener('click', () => {
        document.getElementById('catalogControls').scrollIntoView({ behavior: 'smooth' });
    });

    // Close modals on clicking outer backdrop
    [elements.watchlistModal, elements.animeDetailModal, elements.algoModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal(elements.watchlistModal);
            closeModal(elements.animeDetailModal);
            closeModal(elements.algoModal);
        }
    });
}
