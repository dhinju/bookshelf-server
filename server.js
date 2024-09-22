const express = require('express');
const axios = require('axios');
const { parse } = require('node-html-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to handle CORS for requests to the proxy server
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Route to proxy the HTML page request
app.get('/fetch-isbn', async (req, res) => {
    try {
        const targetUrl = 'https://www.goodreads.com/book/isbn/' + req.query.isbn;

        // Fetch the HTML from the remote server using Axios
        const response = await axios.get(targetUrl);
        const html = response.data;

        // Parse the HTML using Cheerio (jQuery-like)
        const root = parse(html);

        // Extract the <script type="application/ld+json"> content
        const scriptTag = root.querySelector('script[type="application/ld+json"]');

        if (scriptTag) {
            const jsonLdData = JSON.parse(scriptTag.innerHTML);
            res.json({
                message: 'JSON-LD extracted successfully!',
                data: jsonLdData
            });
        } else {
            res.status(404).json({ message: 'No JSON-LD script found on the page.' });
        }
    } catch (error) {
        console.error('Error fetching or parsing the HTML:', error);
        res.status(500).json({ message: 'Error fetching the HTML.', error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Proxy server is running on http://localhost:${PORT}`);
});
