document.addEventListener('DOMContentLoaded', () => {
    // ---- DOM Elements ----
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const fileInput = document.getElementById('local-file-input');
    const localLibraryList = document.getElementById('local-library-list');
    const favoritesList = document.getElementById('favorites-list');
    const recentlyPlayedContainer = document.getElementById('recently-played-container');
    const spotifyBtn = document.getElementById('spotify-connect-btn');
    
    // Player DOM
    const audio = new Audio();
    const btnPlay = document.getElementById('btn-play');
    const iconPlay = document.getElementById('icon-play');
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const btnFav = document.getElementById('btn-fav');
    const iconFav = document.getElementById('icon-fav');
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.getElementById('progress-container');
    const volumeSlider = document.getElementById('volume-slider');
    const playerTitle = document.getElementById('player-title');
    const playerArtist = document.getElementById('player-artist');

    // ---- State ----
    let library = []; // Holds local files
    let currentPlaylist = [];
    let currentIndex = 0;
    let favorites = JSON.parse(localStorage.getItem('yplus_favorites')) || [];
    let recentTracks = JSON.parse(localStorage.getItem('yplus_recent')) || [];

    // ---- Navigation Logic ----
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            // Update nav UI
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show target tab
            const targetId = item.getAttribute('data-target');
            tabContents.forEach(tab => {
                tab.classList.remove('active');
                if(tab.id === targetId) tab.classList.add('active');
            });
            
            if(targetId === 'tab-favorites') renderFavorites();
        });
    });

    // ---- Spotify Connect Placeholder ----
    spotifyBtn.addEventListener('click', () => {
        alert("Spotify Connect feature triggered!\n\n(Developer Note: In a production environment, this will redirect to Spotify's official OAuth authorization page to securely link the user's account without exposing secret keys.)");
    });

    // ---- Local Audio Handling ----
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        files.forEach(file => {
            // Check if already in library
            if(!library.some(t => t.name === file.name)) {
                const track = {
                    id: 'local_' + Date.now() + Math.floor(Math.random()*1000),
                    name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
                    artist: 'Local File',
                    url: URL.createObjectURL(file),
                    isLocal: true
                };
                library.push(track);
            }
        });
        
        renderLibrary();
    });

    function renderLibrary() {
        if (library.length === 0) {
            localLibraryList.innerHTML = `<div class="empty-state">Your library is empty. Add some local files above.</div>`;
            return;
        }

        localLibraryList.innerHTML = '';
        library.forEach((track, index) => {
            const el = createTrackElement(track, () => {
                currentPlaylist = [...library];
                currentIndex = index;
                playTrack(track);
            });
            localLibraryList.appendChild(el);
        });
    }

    function createTrackElement(track, onClick) {
        const div = document.createElement('div');
        div.className = 'track-item';
        div.innerHTML = `
            <div class="track-item-art">
                <span class="material-symbols-rounded">music_note</span>
            </div>
            <div class="track-item-info">
                <div class="track-item-title">${track.name}</div>
                <div class="track-item-artist">${track.artist}</div>
            </div>
        `;
        div.addEventListener('click', onClick);
        return div;
    }

    // ---- Audio Player Logic ----
    function playTrack(track) {
        audio.src = track.url;
        audio.play().catch(err => alert("Error playing audio: " + err.message));
        
        playerTitle.textContent = track.name;
        playerArtist.textContent = track.artist;
        iconPlay.textContent = 'pause';
        
        updateFavoriteIcon(track);
        addToRecentlyPlayed(track);
    }

    function togglePlay() {
        if(!audio.src) return; // Nothing loaded
        if (audio.paused) {
            audio.play();
            iconPlay.textContent = 'pause';
        } else {
            audio.pause();
            iconPlay.textContent = 'play_arrow';
        }
    }

    function playNext() {
        if(currentPlaylist.length === 0) return;
        currentIndex = (currentIndex + 1) % currentPlaylist.length;
        playTrack(currentPlaylist[currentIndex]);
    }

    function playPrev() {
        if(currentPlaylist.length === 0) return;
        currentIndex = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
        playTrack(currentPlaylist[currentIndex]);
    }

    btnPlay.addEventListener('click', togglePlay);
    btnNext.addEventListener('click', playNext);
    btnPrev.addEventListener('click', playPrev);
    
    // Auto-play next when track ends
    audio.addEventListener('ended', playNext);

    // Progress Bar
    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            const progressPercent = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = `${progressPercent}%`;
        }
    });

    progressContainer.addEventListener('click', (e) => {
        if(!audio.src || !audio.duration) return;
        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        audio.currentTime = (clickX / width) * duration;
    });

    // Volume Control
    volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value;
    });

    // ---- Favorites Logic ----
    function updateFavoriteIcon(track) {
        const isFav = favorites.some(f => f.name === track.name); // compare name for local files
        iconFav.textContent = isFav ? 'favorite' : 'favorite_border';
        if(isFav) iconFav.style.color = 'var(--primary-color)';
        else iconFav.style.color = 'var(--text-primary)';
    }

    btnFav.addEventListener('click', () => {
        if(currentPlaylist.length === 0) return;
        const track = currentPlaylist[currentIndex];
        
        const existingIndex = favorites.findIndex(f => f.name === track.name);
        if(existingIndex > -1) {
            favorites.splice(existingIndex, 1); // Remove
        } else {
            // Clone track info (we don't save ObjectURLs to localStorage as they expire)
            favorites.push({ id: track.id, name: track.name, artist: track.artist });
        }
        
        localStorage.setItem('yplus_favorites', JSON.stringify(favorites));
        updateFavoriteIcon(track);
        if (document.getElementById('tab-favorites').classList.contains('active')) {
            renderFavorites();
        }
    });

    function renderFavorites() {
        if (favorites.length === 0) {
            favoritesList.innerHTML = `<div class="empty-state">You haven't liked any songs yet.</div>`;
            return;
        }

        favoritesList.innerHTML = '';
        favorites.forEach(track => {
            // Note: Since Object URLs expire on page reload, clicking a favorite 
            // across sessions won't play unless the user reloads the file.
            // For a complete app, an IndexedDB solution would be needed to persist files.
            const el = createTrackElement(track, () => {
                alert("To play local favorites across sessions, please load the file in your Library first.");
            });
            favoritesList.appendChild(el);
        });
    }

    // ---- Recently Played ----
    function addToRecentlyPlayed(track) {
        // Remove if exists to push to front
        recentTracks = recentTracks.filter(t => t.name !== track.name);
        recentTracks.unshift({ name: track.name, artist: track.artist });
        if(recentTracks.length > 10) recentTracks.pop(); // Keep max 10
        
        localStorage.setItem('yplus_recent', JSON.stringify(recentTracks));
        renderRecentlyPlayed();
    }

    function renderRecentlyPlayed() {
        if(recentTracks.length === 0) return;
        recentlyPlayedContainer.innerHTML = '';
        
        recentTracks.forEach(track => {
            const div = document.createElement('div');
            div.style.minWidth = '120px';
            div.innerHTML = `
                <div class="card-img" style="border-radius: 50%; margin-bottom: 5px;">
                    <span class="material-symbols-rounded" style="display:flex; height:100%; align-items:center; justify-content:center; color: var(--text-secondary)">history</span>
                </div>
                <div style="font-size: 0.85rem; font-weight:600; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${track.name}</div>
            `;
            recentlyPlayedContainer.appendChild(div);
        });
    }

    // Initial render
    renderRecentlyPlayed();
    renderFavorites();
});

