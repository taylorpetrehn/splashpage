import 'dotenv/config';
import fetch from 'node-fetch';

// Check if API key is provided
const apiKey = process.env.MERAKI_API_KEY || process.argv[2];
if (!apiKey) {
    console.error('Please provide your Meraki API key either in .env file or as a command line argument');
    process.exit(1);
}

const MERAKI_API_BASE = 'https://api.meraki.com/api/v1';
const headers = {
    'X-Cisco-Meraki-API-Key': apiKey,
    'Content-Type': 'application/json'
};

async function getNetworks() {
    try {
        // First, get organizations
        const orgsResponse = await fetch(`${MERAKI_API_BASE}/organizations`, { headers });
        if (!orgsResponse.ok) {
            throw new Error(`Failed to fetch organizations: ${orgsResponse.statusText}`);
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
            console.error('\nAuthentication failed. Please check your API key.');
        }
        process.exit(1);
    }
}

console.log('Fetching Meraki networks...');
getNetworks();
