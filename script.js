const API_URL = 'http://localhost:3000/feed';

const newsData = {
    mainNews: [],
    sports: [],
    pawPrint: [],
    events: [],
    trendingStories: []
};

async function fetchNews() {
    try {
        console.log('Fetching news...');
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            credentials: 'include'
        });
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Received data:', data);
        const articles = data.item;

        if (!articles || !Array.isArray(articles)) {
            throw new Error('Invalid data format received');
        }

        // Log the structure of each article
        articles.forEach((article, index) => {
            console.log(`Article ${index} structure:`, JSON.stringify(article, null, 2));
        });

        // Reset all categories
        Object.keys(newsData).forEach(key => newsData[key] = []);

        // Categorize articles
        articles.forEach(article => {
            let categories = [];
            if (article.category) {
                if (typeof article.category === 'string') {
                    categories = [article.category];
                } else if (Array.isArray(article.category)) {
                    categories = article.category.map(cat => typeof cat === 'string' ? cat : cat.content);
                } else if (typeof article.category === 'object' && article.category.content) {
                    categories = [article.category.content];
                }
            }
            
            console.log('Categories for article:', categories);

            let isMainNews = true;
            categories.forEach(category => {
                if (typeof category === 'string') {
                    category = category.toLowerCase();
                    if (['football', 'soccer', 'sports', 'volleyball', 'photo essay'].includes(category)) {
                        newsData.sports.push(article);
                        isMainNews = false;
                    } else if (category === 'the paw print') {
                        newsData.pawPrint.push(article);
                        isMainNews = false;
                    } else if (category === 'events') {
                        newsData.events.push(article);
                        isMainNews = false;
                    }
                }
            });
            
            if (isMainNews) {
                newsData.mainNews.push(article);
            }
        });

        // Limit each category to a maximum of 2 articles
        Object.keys(newsData).forEach(key => {
            if (key !== 'trendingStories') {
                newsData[key] = newsData[key].slice(0, 2);
            }
        });

        // Set trending stories
        newsData.trendingStories = articles.slice(0, 5).map(article => article.title);
        
        updateUI();
    } catch (error) {
        console.error('Error fetching news:', error);
        document.getElementById('mainNews').innerHTML = `<p>Error loading news: ${error.message}</p>`;
    }
}

function updateUI() {
    updateMainNews();
    updateSports();
    updateTrendingStories();
    updatePawPrint();
    updateEvents();
    updateQRCode();
}

function sanitizeHTML(html) {
    var temporalDivElement = document.createElement("div");
    temporalDivElement.innerHTML = html;
    return temporalDivElement.textContent || temporalDivElement.innerText || "";
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, text.lastIndexOf(' ', maxLength)) + '...';
}

function getImageUrl(article) {
    console.log('Article:', article);
    
    // Check content:encoded for image
    if (article['content:encoded']) {
        const imgMatch = article['content:encoded'].match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch) {
            console.log('Found image in content:encoded:', imgMatch[1]);
            return imgMatch[1];
        }
    }
    
    // Fallback to description if no image in content:encoded
    if (article.description) {
        const descriptionImgMatch = article.description.match(/<img[^>]+src="([^">]+)"/);
        if (descriptionImgMatch) {
            console.log('Found image in description:', descriptionImgMatch[1]);
            return descriptionImgMatch[1];
        }
    }
    
    // Check content:encoded (if it's an object with 'content' property)
    if (article['content:encoded'] && article['content:encoded'].content) {
        const contentImgMatch = article['content:encoded'].content.match(/<img[^>]+src="([^">]+)"/);
        if (contentImgMatch) {
            console.log('Found image in content:encoded content:', contentImgMatch[1]);
            return contentImgMatch[1];
        }
    }
    
    console.log('No image found for article');
    return null;
}

function updateMainNews() {
    const mainNewsElement = document.getElementById('mainNews');
    mainNewsElement.innerHTML = `
        <h2 class="text-2xl font-bold mb-4 text-accent">Main News</h2>
        ${newsData.mainNews.map((article, index) => {
            const imageUrl = getImageUrl(article);
            console.log(`Image URL for article ${index}:`, imageUrl);
            return `
                <div class="flex items-start mb-4">
                    ${imageUrl ? `
                        <img src="${imageUrl}" alt="${article.title}" class="w-1/3 h-32 object-cover rounded-lg mr-4" 
                             onerror="console.error('Image failed to load:', this.src); this.onerror=null; this.style.display='none';">
                    ` : ''}
                    <div>
                        <h3 class="text-lg font-semibold mb-2">${article.title}</h3>
                        <div class="text-sm text-gray-300 mb-2">
                            ${truncateText(sanitizeHTML(article.description), 100)}
                        </div>
                        <div class="flex items-center text-xs text-gray-400">
                            <span class="mr-4">${new Date(article.pubDate).toLocaleDateString()}</span>
                            <span>5 min read</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('')}
    `;
}

function updateSports() {
    const sportsElement = document.getElementById('sports');
    sportsElement.innerHTML = `
        <h2 class="text-2xl font-bold mb-4 text-accent">Sports</h2>
        ${newsData.sports.length > 0 ? newsData.sports.map((article, index) => `
            <div class="mb-4">
                ${getImageUrl(article) ? `
                    <img src="${getImageUrl(article)}" alt="${article.title}" class="w-full h-48 object-cover rounded-lg mb-4" onerror="this.style.display='none'">
                ` : ''}
                <h3 class="text-lg font-semibold mb-2">${article.title}</h3>
                <div class="text-sm text-gray-300 mb-2">
                    ${truncateText(sanitizeHTML(article.description), 100)}
                </div>
            </div>
        `).join('') : '<p>No sports articles available at the moment.</p>'}
    `;
}

function updateTrendingStories() {
    const trendingStoriesElement = document.getElementById('trendingStories');
    trendingStoriesElement.innerHTML = `
        <h2 class="text-2xl font-bold mb-4 text-accent">Trending Stories</h2>
        ${newsData.trendingStories.length > 0 ? `
            <ol class="space-y-2 text-sm">
                ${newsData.trendingStories.map((story, index) => `
                    <li class="flex items-start">
                        <span class="font-bold mr-2 text-accent">${index + 1}.</span>
                        <span>${sanitizeHTML(story)}</span>
                    </li>
                `).join('')}
            </ol>
        ` : '<p>No trending stories available at the moment.</p>'}
    `;
}

function updatePawPrint() {
    const pawPrintElement = document.getElementById('pawPrint');
    pawPrintElement.innerHTML = `
        <h2 class="text-2xl font-bold mb-4 text-accent">Paw Print</h2>
        ${newsData.pawPrint.length > 0 ? newsData.pawPrint.map((article, index) => `
            <div class="flex items-start mb-4">
                ${getImageUrl(article) ? `
                    <img src="${getImageUrl(article)}" alt="${article.title}" class="w-1/3 h-24 object-cover rounded-lg mr-4" onerror="this.style.display='none'">
                ` : ''}
                <div>
                    <h3 class="text-lg font-semibold mb-2">${article.title}</h3>
                    <div class="text-sm text-gray-300">
                        ${truncateText(sanitizeHTML(article.description), 75)}
                    </div>
                </div>
            </div>
        `).join('') : '<p>No Paw Print articles available at the moment.</p>'}
    `;
}

function updateEvents() {
    const eventsElement = document.getElementById('events');
    eventsElement.innerHTML = `
        <h2 class="text-2xl font-bold mb-4 text-accent">Events</h2>
        ${newsData.events.length > 0 ? newsData.events.map(article => `
            <div class="mb-4">
                ${getImageUrl(article) ? `
                    <img src="${getImageUrl(article)}" alt="${article.title}" class="w-full h-32 object-cover rounded-lg mb-4" onerror="this.style.display='none'">
                ` : ''}
                <h3 class="text-lg font-semibold mb-2">${article.title}</h3>
                <div class="text-sm text-gray-300">
                    ${truncateText(sanitizeHTML(article.description), 100)}
                </div>
            </div>
        `).join('') : '<p>No events articles available at the moment.</p>'}
    `;
}

function updateQRCode() {
    const qrCodeElement = document.getElementById('qrCode');
    qrCodeElement.innerHTML = `
        <h2 class="text-2xl font-bold mb-4 text-accent">Stay Connected</h2>
        <div class="flex items-center justify-center">
            <img src="https://fscollegian.com/wp-content/uploads/2023/09/qr-code-1.png" alt="QR Code" class="w-32 h-32">
        </div>
        <p class="text-center mt-4">Scan to visit our website</p>
    `;
}

fetchNews();
setInterval(fetchNews, 15 * 60 * 1000); // Refresh every 15 minutes
