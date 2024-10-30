const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET'],
    credentials: true,
    optionsSuccessStatus: 204
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/feed', async (req, res) => {
    try {
        console.log('Fetching RSS feed...');
        const response = await axios.get('https://fscollegian.com/feed/');
        console.log('RSS feed fetched successfully');
        console.log('Raw RSS data:', response.data);  // Add this line
        const parser = new xml2js.Parser({ 
            explicitArray: false, 
            mergeAttrs: true,
            explicitCharkey: true,
            charkey: 'content'
        });
        parser.parseString(response.data, (err, result) => {
            if (err) {
                console.error('Failed to parse XML:', err);
                res.status(500).json({ error: 'Failed to parse XML' });
            } else {
                console.log('XML parsed successfully');
                console.log('Parsed data:', JSON.stringify(result, null, 2));  // Add this line
                res.json(result.rss.channel);
            }
        });
    } catch (error) {
        console.error('Failed to fetch RSS feed:', error);
        res.status(500).json({ error: 'Failed to fetch RSS feed' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
