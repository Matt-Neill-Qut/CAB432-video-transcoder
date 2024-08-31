const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_KEY = '';
const NEWS_API_URL = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}`;

router.get('/news', async (req, res) => {
    try {
        const response = await axios.get(NEWS_API_URL);
        res.json(response.data.articles);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

module.exports = router;
