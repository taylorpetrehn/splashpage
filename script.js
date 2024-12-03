// Get URL parameters
function getUrlParams() {
    const searchParams = new URLSearchParams(window.location.search);
    console.log('Raw URL:', window.location.href);
    
    const base_grant_url = searchParams.get('base_grant_url');
    console.log('base_grant_url:', base_grant_url);
    
    return { base_grant_url };
}

// Store parameters in localStorage
function storeParams() {
    const params = getUrlParams();
    if (!params.base_grant_url) {
        console.error('Warning: No base_grant_url found in parameters');
        console.log('Expected parameters from Meraki:', {
            base_grant_url: 'URL to submit credentials',
            user_continue_url: 'URL to continue to after auth',
            node_mac: 'Access point MAC',
            client_mac: 'Client device MAC',
            client_ip: 'Client IP address'
        });
    }
    localStorage.setItem('merakiParams', JSON.stringify(params));
}

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    storeParams();
    
    // Open sign-in page in a new window
    const signInWindow = window.open('signin.html', '_blank', 'width=' + window.screen.width + ',height=' + window.screen.height + ',fullscreen=yes,menubar=no,toolbar=no,location=no');
    
    // Handle window close or completion
    window.addEventListener('message', function(event) {
        if (event.data === 'signin_complete') {
            submitToMeraki();
        }
    });

    return false;
}

// Submit credentials to Meraki
function submitToMeraki() {
    const params = JSON.parse(localStorage.getItem('merakiParams'));
    console.log('Submitting to Meraki with params:', params);
    
    if (!params || !params.base_grant_url) {
        console.error('Error: Missing base_grant_url parameter');
        alert('Error: Missing network parameters. Please try reconnecting to the WiFi network.');
        return;
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = params.base_grant_url;
    
    console.log('Submitting form to:', form.action);
    document.body.appendChild(form);
    form.submit();
}
