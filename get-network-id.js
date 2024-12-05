import 'dotenv/config';
import fetch from 'node-fetch';

// Debug dotenv loading
console.log('Current working directory:', process.cwd());
console.log('Environment variables loaded:', {
    MERAKI_API_KEY: process.env.MERAKI_API_KEY ? '***exists***' : 'not found',
    NODE_ENV: process.env.NODE_ENV
});

// Check if API key is provided
const apiKey = process.env.MERAKI_API_KEY || process.argv[2];
if (!apiKey) {
    console.error('Please provide your Meraki API key either in .env file or as a command line argument');
    process.exit(1);
}

// Mask the API key for logging (show only last 4 characters)
const maskedKey = '*'.repeat(Math.max(0, apiKey.length - 4)) + apiKey.slice(-4);
console.log(`Using API key: ${maskedKey}`);

const MERAKI_API_BASE = 'https://api.meraki.com/api/v1';
const headers = {
    'X-Cisco-Meraki-API-Key': apiKey,
    'Content-Type': 'application/json'
};

async function getNetworks() {
    try {
        console.log('Making request to:', `${MERAKI_API_BASE}/organizations`);
        console.log('Headers:', {
            ...headers,
            'X-Cisco-Meraki-API-Key': maskedKey
        });

        // First, get organizations
        const orgsResponse = await fetch(`${MERAKI_API_BASE}/organizations`, { headers });
        
        if (!orgsResponse.ok) {
            const responseText = await orgsResponse.text();
            throw new Error(`Failed to fetch organizations: ${orgsResponse.status} ${orgsResponse.statusText}\nResponse: ${responseText}`);
        }
        
        const organizations = await orgsResponse.json();

        console.log('\nFound Organizations:');
        organizations.forEach((org, index) => {
            console.log(`${index + 1}. ${org.name} (${org.id})`);
        });

        // For each organization, get networks
        console.log('\nNetworks in each organization:');
        for (const org of organizations) {
            const networksResponse = await fetch(
                `${MERAKI_API_BASE}/organizations/${org.id}/networks`,
                { headers }
            );
            
            if (!networksResponse.ok) {
                console.error(`Failed to fetch networks for org ${org.name}: ${networksResponse.statusText}`);
                continue;
            }

            const networks = await networksResponse.json();
            console.log(`\nOrganization: ${org.name}`);
            
            if (networks.length === 0) {
                console.log('  No networks found');
                continue;
            }

            networks.forEach((network, index) => {
                console.log(`  ${index + 1}. ${network.name}`);
                console.log(`     Network ID: ${network.id}`);
                console.log(`     Type: ${network.productTypes.join(', ')}`);
                console.log(`     Tags: ${network.tags.join(', ') || 'None'}`);
            });
        }

    } catch (error) {
        console.error('Error:', error.message);
        if (error.message.includes('401')) {
            console.error('\nAuthentication failed. This could be because:');
            console.error('1. The API key is incorrect');
            console.error('2. The API key has not been enabled in the Meraki dashboard');
            console.error('3. The API key does not have the correct permissions');
            console.error('\nPlease verify:');
            console.error('1. You have enabled API access in your Meraki dashboard');
            console.error('2. You have generated an API key');
            console.error('3. You are using the correct, full API key');
            console.error('4. The API key has been activated (this can take a few minutes after generation)');
        }
        process.exit(1);
    }
}

console.log('Fetching Meraki networks...');
getNetworks();
