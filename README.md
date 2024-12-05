# Splashpage

A secure splash page implementation for Meraki networks with Dashboard API integration.

## Security Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit the `.env` file with your secure credentials:
- `MERAKI_API_KEY`: Your Meraki Dashboard API key
- `MERAKI_NETWORK_ID`: Your Meraki network ID
- `PORT`: The port number for the server (default: 3000)

**IMPORTANT: Never commit the `.env` file to version control!**

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. For production, use:
```bash
npm start
```

## Security Best Practices

1. Environment Variables:
   - Keep `.env` file secure and local
   - Use different keys for development and production
   - Regularly rotate API keys

2. API Security:
   - All Meraki API calls are made server-side
   - CORS protection enabled
   - Rate limiting implemented
   - Error handling with graceful fallbacks

3. Development:
   - Use `.env.example` for documentation
   - Keep sensitive data out of version control
   - Use secure HTTPS in production

## Getting Meraki Credentials

1. Dashboard API Key:
   - Log in to Meraki Dashboard
   - Go to Organization > Settings
   - Enable API access
   - Generate API key
   - Copy key immediately (it won't be shown again)

2. Network ID:
   - In Dashboard, go to Network
   - Network ID is in the URL: /n/{network_id}/overview
