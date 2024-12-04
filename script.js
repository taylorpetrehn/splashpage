// Get URL parameters
function getUrlParams() {
    const searchParams = new URLSearchParams(window.location.search);
    console.log('Raw URL:', window.location.href);
    
    return {
        base_grant_url: searchParams.get('base_grant_url'),
        user_continue_url: searchParams.get('user_continue_url'),
        node_mac: searchParams.get('node_mac'),
        client_mac: searchParams.get('client_mac'),
        client_ip: searchParams.get('client_ip')
    };
}

// Store parameters in localStorage
function storeParams() {
    const params = getUrlParams();
    if (!params.base_grant_url || !params.user_continue_url) {
        console.error('Warning: Missing required Meraki parameters');
        console.log('Current parameters:', params);
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
    
    // Calculate window dimensions for full screen
    const width = window.screen.width;
    const height = window.screen.height;
    
    // Calculate position for center of screen
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    // Open sign-in page in a new window with specific dimensions and features
    const windowFeatures = `
        width=${width},
        height=${height},
        left=${left},
        top=${top},
        fullscreen=yes,
        menubar=no,
        toolbar=no,
        location=no,
        status=no,
        resizable=yes,
        scrollbars=yes
    `.replace(/\s+/g, '');
    
    const signInWindow = window.open('signin.html', '_blank', windowFeatures);
    
    if (signInWindow) {
        signInWindow.focus();
    } else {
        console.error('Failed to open popup window - it may have been blocked by the browser');
        alert('Please allow popups for this site to continue with WiFi authentication');
    }
    
    // Handle window close or completion
    window.addEventListener('message', function(event) {
        if (event.data === 'signin_complete') {
            submitToMeraki(event.data);
        }
    });

    return false;
}

// Submit credentials to Meraki
function submitToMeraki(formData) {
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
    
    // Add all Meraki parameters to the form
    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            form.appendChild(input);
        }
    });
    
    // Add form data from sign-in
    Object.entries(formData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
    });
    
    console.log('Submitting form to:', form.action);
    document.body.appendChild(form);
    form.submit();
}
