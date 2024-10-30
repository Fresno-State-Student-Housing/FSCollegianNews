# Fresno State Collegian News Dashboard

## Description
This application is a dynamic news dashboard designed for The Collegian, Fresno State's student-run newspaper. It aggregates and displays news from various categories including main news, sports, trending stories, Paw Print (student magazine), and opinion pieces. The dashboard also features a QR code for easy access to the full website.

## Features
- Real-time news updates from multiple categories
- Responsive grid layout for optimal viewing on different devices
- Dynamic content loading with image support
- Trending stories section with individual story frames
- Auto-scrolling content with consistent scroll duration across all sections
- QR code for quick access to the main website
- Sleek, modern aesthetic with The Collegian branding

## Technologies Used
- HTML5
- CSS3 (with custom styling and grid layout)
- JavaScript (ES6+)
- Fetch API for asynchronous data retrieval

## Setup
1. Clone the repository to your local machine.
2. Ensure you have a local server set up (e.g., using Node.js with Express).
3. Update the `API_URL` in `script.js` to point to your news feed endpoint.
4. Open `index.html` in a web browser or serve it through your local server.

## Usage
The dashboard automatically fetches and updates news every 15 minutes. Users can view the latest news across different categories without needing to refresh the page manually. Content in each section auto-scrolls for easy viewing.

## Recent Updates
### 10/18/2024 - 21:45 EDT
- Improved auto-scrolling functionality for all sections except main news
- Implemented smooth scrolling with pauses at the top and bottom of content
- Added custom scroll indicators for better visual feedback
- Adjusted text sizes for improved readability from a distance
- Updated the QR code section to better fit the frame
- Changed "Paw Print" category to "Editors' picks" and "Opinion" to "Lifestyle"
- Enhanced responsiveness of article layouts within each section

### 10/18/2024 - 14:30 EDT
- Implemented CORS proxy to resolve cross-origin resource sharing issues
- Updated API endpoint to use new proxy service (fscollegianproxy.replit.app/fscollegian)
- Improved data fetching reliability and cross-browser compatibility
- Enhanced image extraction from RSS feed content
- Added author information to article cards
- Removed estimated read time due to lack of accurate data
- Refined article card layout for better information display

### 10/17/2024 - 09:15 EDT
- Implemented The Collegian branding with logo and updated header design
- Added card-style layout for all articles across different sections
- Introduced auto-scrolling feature with consistent scroll duration for all sections
- Redesigned trending stories section with individual frames for each story
- Optimized layout for better space utilization and readability
- Enhanced QR code section for improved visibility

## Contributing
Contributions to improve the dashboard are welcome. Please follow these steps:
1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
[MIT License](https://opensource.org/licenses/MIT)

