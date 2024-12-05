require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '.')));

// Meraki API configuration
const MERAKI_API_BASE = 'https://api.meraki.com/api/v1';
const MERAKI_HEADERS = {
    'X-Cisco-Meraki-API-Key': process.env.MERAKI_API_KEY,
    'Content-Type': 'application/json'
};

// Network statistics endpoint
app.get('/api/network-stats', async (req, res) => {
    try {
        const networkId = process.env.MERAKI_NETWORK_ID;
        const clientMac = req.query.clientMac;

        if (!networkId || !clientMac) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Get client details
        const clientResponse = await fetch(
            `${MERAKI_API_BASE}/networks/${networkId}/clients/${clientMac}`,
            { headers: MERAKI_HEADERS }
        );
        
        if (!clientResponse.ok) {
            throw new Error('Failed to fetch client data');
        }

        const clientData = await clientResponse.json();

        // Get usage statistics
        const usageResponse = await fetch(
            `${MERAKI_API_BASE}/networks/${networkId}/clients/${clientMac}/usage`,
            { headers: MERAKI_HEADERS }
        );

        if (!usageResponse.ok) {
            throw new Error('Failed to fetch usage data');
        }

        const usageData = await usageResponse.json();

        res.json({
            status: 'success',
            data: {
                client: clientData,
                usage: usageData
            }
        });
    } catch (error) {
        console.error('Error fetching network stats:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Failed to fetch network statistics',
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
