import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Test endpoint to verify API connectivity
app.get('/api/test-connection', async (req, res) => {
    try {
        const networkId = process.env.MERAKI_NETWORK_ID;
        const response = await fetch(
            `${MERAKI_API_BASE}/networks/${networkId}/clients`,
            { headers: MERAKI_HEADERS }
        );
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        const data = await response.json();
        res.json({ status: 'success', clientCount: data.length });
    } catch (error) {
        console.error('API Test Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

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
            client: clientData,
            usage: usageData
        });
    } catch (error) {
        console.error('Network Stats Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
