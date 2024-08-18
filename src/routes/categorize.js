const express = require('express');
const axios = require('axios');

function categorizeRoutes(db) {
  const router = express.Router();
  const collection = db.collection('categorizedData');

  router.post('/', async (req, res) => {
    const { text } = req.body;
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Categorize the following text: ${text}`,
          },
        ],
        max_tokens: 50,
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const categorizedData = response.data.choices[0].message.content.trim();
      await collection.insertOne({ text, category: categorizedData });
      res.status(200).json({ text, category: categorizedData });
    } catch (error) {
      res.status(500).json({ error: 'Failed to categorize the text' });
    }
  });

  return router;
}

module.exports = categorizeRoutes;
