// ===============================
// Y+ Music - YouTube Integration
// ===============================

const YOUTUBE_API_KEY = "AIzaSyDBaybYW4uxIyaYQRKNF3og02yCoCjwes4";

async function searchYouTube(query) {
    if (!query.trim()) return [];

    const url =
        `https://www.googleapis.com/youtube/v3/search` +
        `?part=snippet&type=video&maxResults=10` +
        `&q=${encodeURIComponent(query)}` +
        `&key=${YOUTUBE_API_KEY}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("YouTube API request failed");
        }

        const data = await response.json();

        return data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.high?.url ||
                       item.snippet.thumbnails.default?.url
        }));

    } catch (error) {
        console.error("YouTube Error:", error);
        return [];
    }
}


// Search button / input ke liye
async function handleYouTubeSearch() {
    const input = document.querySelector("#searchInput");

    if (!input) return;

    const query = input.value.trim();

    if (!query) return;

    const results = await searchYouTube(query);

    displayYouTubeResults(results);
}


// YouTube results screen
function displayYouTubeResults(results) {
    const container = document.querySelector("#searchResults");

    if (!container) return;

    container.innerHTML = "";

    if (results.length === 0) {
        container.innerHTML = "<p>No YouTube results found.</p>";
        return;
    }

    results.forEach(video => {
        const item = document.createElement("div");

        item.className = "youtube-result";

        item.innerHTML = `
            <img src="${video.thumbnail}" alt="">
            <div>
                <h3>${escapeHTML(video.title)}</h3>
                <p>${escapeHTML(video.artist)}</p>
                <button onclick="playYouTube('${video.id}')">
                    ▶ Play
                </button>
            </div>
        `;

        container.appendChild(item);
    });
}


// YouTube video play
function playYouTube(videoId) {
    const player = document.querySelector("#youtubePlayer");

    if (!player) return;

    player.innerHTML = `
        <iframe
            width="100%"
            height="315"
            src="https://www.youtube.com/embed/${videoId}?autoplay=1"
            title="YouTube player"
            frameborder="0"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowfullscreen>
        </iframe>
    `;
}


// Basic HTML safety
function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
