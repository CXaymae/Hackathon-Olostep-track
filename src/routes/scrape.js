const express = require('express');
const scrapeWebsite = require('../scraper');
const axios = require('axios');

function scrapeRoutes(db) {
  const router = express.Router();
  const collection = db.collection('scrapedData');

  router.post('/', async (req, res) => {
    const { url } = req.body;
    try {
      const scrapedData = await scrapeWebsite(url);

      // Extract themes from the scraped content
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Extract the main themes from the following text: ${scrapedData.content}`,
          },
        ],
        max_tokens: 100,
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const themes = response.data.choices[0].message.content.trim();
      const result = { url, ...scrapedData, themes };

      await collection.insertOne(result);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to scrape and extract themes from the website' });
    }
  });

  return router;
}

module.exports = scrapeRoutes;