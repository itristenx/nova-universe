const express = require('express');
const axios = require('axios');
const router = express.Router();

// Import HelpScout tickets
router.post('/import', async (req, res) => {
  try {
    const { apiKey, mailboxId } = req.body;

    if (!apiKey || !mailboxId) {
      return res.status(400).json({ error: 'API key and Mailbox ID are required.' });
    }

    const response = await axios.get(
      `https://api.helpscout.net/v2/conversations`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        params: { mailbox: mailboxId },
      }
    );

    const tickets = response.data;

    // Process and save tickets (placeholder logic)
    tickets.forEach(ticket => {
      console.log(`Imported ticket: ${ticket.id}`);
    });

    res.status(200).json({ message: 'Tickets imported successfully.', tickets });
  } catch (error) {
    console.error('Error importing tickets:', error.message);
    res.status(500).json({ error: 'Failed to import tickets.' });
  }
});

module.exports = router;
