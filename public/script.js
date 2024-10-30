const API_URL = 'https://fshousingproxy.replit.app/fscollegian';

const newsData = {
    mainNews: [],
    sports: [],
    pawPrint: [],
    events: [],
    trendingStories: [],
    opinion: []
};

const DEFAULT_IMAGE_URL = 'https://fscollegian.com/wp-content/uploads/2023/02/CollegainWhite2.png';

function categoryIncludes(category, searchTerm) {
    if (Array.isArray(category)) {
        return category.some(cat => {
            if (typeof cat === 'string') {
                return cat.toLowerCase().includes(searchTerm.toLowerCase());
            } else if (cat && typeof cat === 'object' && cat.content) {
                return cat.content.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return false;
        });
    } else if (typeof category === 'string') {
        return category.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (category && typeof category === 'object' && category.content) {
        return category.content.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return false;
}

let currentMainNewsIndex = 0;

async function fetchNews() {
    try {
        console.log('Fetching news...');
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Accept': 'application/rss+xml'
            },
        });
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        console.log('Received data:', xmlDoc);
        
        const items = xmlDoc.getElementsByTagName('item');
        const articles = Array.from(items).map(item => ({
            title: item.getElementsByTagName('title')[0].textContent,
            description: item.getElementsByTagName('description')[0].textContent,
            pubDate: item.getElementsByTagName('pubDate')[0].textContent,
            category: Array.from(item.getElementsByTagName('category')).map(cat => cat.textContent),
            link: item.getElementsByTagName('link')[0].textContent,
            content: item.getElementsByTagName('content:encoded')[0].textContent,
            creator: item.getElementsByTagName('dc:creator')[0].textContent
        }));

        if (!articles || !Array.isArray(articles)) {
            throw new Error('Invalid data format received');
        }

        newsData.mainNews = articles.filter(article => !categoryIncludes(article.category, 'Sports') && !categoryIncludes(article.category, 'Editors\' picks') && !categoryIncludes(article.category, 'Lifestyle'));
        newsData.sports = articles.filter(article => categoryIncludes(article.category, 'Sports'));
        newsData.pawPrint = articles.filter(article => categoryIncludes(article.category, 'Editors\' picks'));
        newsData.opinion = articles.filter(article => categoryIncludes(article.category, 'Lifestyle'));
        newsData.trendingStories = articles.map(article => article.title);
        
        updateUI();
        setupAutoScroll();
        setupMainNewsRotation();
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
    updateOpinion();
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

function getContent(obj) {
    return obj && obj.content ? obj.content : obj;
}

function updateMainNews() {
    const mainNewsElement = document.getElementById('mainNews');
    if (newsData.mainNews.length > 0) {
        const article = newsData.mainNews[currentMainNewsIndex];
        mainNewsElement.innerHTML = `
            <h2 class="text-2xl font-bold mb-4 text-accent">Main News</h2>
            <div class="main-news-content fade-in">
                ${createArticleCard(article, true)}
            </div>
        `;
        currentMainNewsIndex = (currentMainNewsIndex + 1) % newsData.mainNews.length;
    } else {
        mainNewsElement.innerHTML = `
            <h2 class="text-2xl font-bold mb-4 text-accent">Main News</h2>
            <p>No main news available at the moment.</p>
        `;
    }
}

function updateSports() {
    const sportsElement = document.getElementById('sports');
    sportsElement.innerHTML = `
        <h2 class="text-2xl font-bold mb-4 text-accent">Sports</h2>
        <div>
            ${newsData.sports.map(article => createArticleCard(article)).join('')}
        </div>
    `;
}

function updateTrendingStories() {
    const trendingStoriesElement = document.getElementById('trendingStories');
    trendingStoriesElement.innerHTML = `
        <h2 class="text-2xl font-bold mb-4 text-accent">Trending Stories</h2>
        <div>
            ${newsData.trendingStories.length > 0 ? `
                <ol>
                    ${newsData.trendingStories.slice(0, 10).map((story, index) => `
                        <li>
                            <span class="story-number">${index + 1}</span>
                            <span class="story-title">${sanitizeHTML(getContent(story))}</span>
                        </li>
                    `).join('')}
                </ol>
            ` : '<p>No trending stories available at the moment.</p>'}
        </div>
    `;
}

function updatePawPrint() {
    const pawPrintElement = document.getElementById('pawPrint');
    pawPrintElement.innerHTML = `
        <h2 class="text-2xl font-bold mb-4 text-accent">Editors' Picks</h2>
        <div>
            ${newsData.pawPrint.map(article => createArticleCard(article)).join('')}
        </div>
    `;
}

function updateOpinion() {
    const opinionElement = document.getElementById('opinion');
    opinionElement.innerHTML = `
        <h2 class="text-2xl font-bold mb-4 text-accent">Lifestyle</h2>
        <div>
            ${newsData.opinion.map(article => createArticleCard(article)).join('')}
        </div>
    `;
}

function createArticleCard(article, isFullSize = false) {
    const imageUrl = getImageUrl(article) || DEFAULT_IMAGE_URL;
    const description = sanitizeHTML(getContent(article.description));
    return `
        <div class="article-card ${isFullSize ? 'full-size' : ''}">
            <img src="${imageUrl}" alt="${getContent(article.title)}" onerror="this.src='${DEFAULT_IMAGE_URL}'">
            <h3>${getContent(article.title)}</h3>
            ${description ? `
                <div class="article-description">
                    ${isFullSize ? description : truncateText(description, 100)}
                </div>
            ` : ''}
            <div class="article-meta">
                <span><i class="far fa-calendar-alt"></i> ${new Date(getContent(article.pubDate)).toLocaleDateString()}</span>
                <span><i class="far fa-user"></i> ${article.creator}</span>
            </div>
        </div>
    `;
}

function updateQRCode() {
    const qrCodeElement = document.getElementById('qrCode');
    qrCodeElement.innerHTML = `
        <h2 class="text-2xl font-bold mb-4 text-accent">QR Code:</h2>
        <div class="flex items-center justify-center">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://fscollegian.com" alt="QR Code" class="w-32 h-32">
        </div>
        <p class="text-center mt-4">Scan to visit our website</p>
    `;
}

function getImageUrl(article) {
    console.log('Searching for image in article:', article);

    // Check for image in content:encoded
    if (article.content) {
        const parser = new DOMParser();
        const contentDoc = parser.parseFromString(article.content, 'text/html');
        const imgElement = contentDoc.querySelector('img[decoding="async"]');
        if (imgElement && imgElement.src) {
            console.log('Found image in content:encoded:', imgElement.src);
            return imgElement.src;
        }
    }

    // Fallback to description if no image found in content:encoded
    if (article.description) {
        const descriptionImgMatch = article.description.match(/<img[^>]+src="([^">]+)"/);
        if (descriptionImgMatch) {
            console.log('Found image in description:', descriptionImgMatch[1]);
            return descriptionImgMatch[1];
        }
    }

    console.log('No image found for article');
    return null;
}

function setupAutoScroll() {
    const sections = ['sports', 'pawPrint', 'opinion', 'trendingStories'];
    sections.forEach((sectionId, index) => {
        const section = document.getElementById(sectionId);
        if (section) {
            const content = section.querySelector('div');
            if (content && content.scrollHeight > content.clientHeight) {
                // Add scroll indicator
                const indicator = document.createElement('div');
                indicator.className = 'scroll-indicator';
                section.appendChild(indicator);

                // Stagger the start of scrolling and initial scroll percentage
                const delay = index * 2000; // 2 seconds delay between each section
                const initialScrollPercentage = (index * 20) % 100; // Stagger initial scroll positions

                setTimeout(() => {
                    autoScroll(content, indicator, initialScrollPercentage);
                }, delay);
            }
        }
    });
}

function autoScroll(element, indicator, initialScrollPercentage) {
    if (!element) return;
    
    const scrollDuration = 60000; // Total time for one complete scroll cycle (20 seconds)
    const pauseDuration = 2000; // 2 seconds pause at top and bottom
    const fps = 60; // Frames per second
    const totalFrames = (scrollDuration + pauseDuration * 2) / 1000 * fps;
    let currentFrame = Math.floor((initialScrollPercentage / 100) * totalFrames);
    let direction = 1; // 1 for scrolling down, -1 for scrolling up
    
    function scroll() {
        if (!element) return;
        
        const progress = (currentFrame % totalFrames) / totalFrames;
        const scrollHeight = element.scrollHeight - element.clientHeight;
        
        let scrollPosition;
        if (progress < pauseDuration / (scrollDuration + pauseDuration * 2)) {
            // Pause at the top
            scrollPosition = direction > 0 ? 0 : scrollHeight;
        } else if (progress > (scrollDuration + pauseDuration) / (scrollDuration + pauseDuration * 2)) {
            // Pause at the bottom
            scrollPosition = direction > 0 ? scrollHeight : 0;
        } else {
            // Scrolling
            const scrollProgress = (progress - pauseDuration / (scrollDuration + pauseDuration * 2)) / 
                                   (scrollDuration / (scrollDuration + pauseDuration * 2));
            scrollPosition = direction > 0 ? scrollHeight * scrollProgress : scrollHeight * (1 - scrollProgress);
        }
        
        element.scrollTop = scrollPosition;
        
        // Update scroll indicator
        if (indicator) {
            const indicatorScale = (element.scrollTop / scrollHeight);
            indicator.style.transform = `scaleY(${indicatorScale})`;
        }
        
        currentFrame = (currentFrame + 1) % totalFrames;
        
        // Change direction when reaching the end of a cycle
        if (currentFrame === 0) {
            direction *= -1;
        }
        
        requestAnimationFrame(scroll);
    }
    
    scroll();
}

function setupMainNewsRotation() {
    setInterval(() => {
        const mainNewsContent = document.querySelector('.main-news-content');
        mainNewsContent.classList.remove('fade-in');
        mainNewsContent.classList.add('fade-out');
        
        setTimeout(() => {
            updateMainNews();
            mainNewsContent.classList.remove('fade-out');
            mainNewsContent.classList.add('fade-in');
        }, 500); // Half a second for fade out effect
    }, 5000); // 5 seconds interval
}

fetchNews();
setInterval(fetchNews, 15 * 60 * 1000); // Refresh every 15 minutes
