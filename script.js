// Get URL parameters
function getUrlParams() {
    const searchParams = new URLSearchParams(window.location.search);
    console.log('Raw URL:', window.location.href);
    
    const params = {
        base_grant_url: searchParams.get('base_grant_url'),
        user_continue_url: searchParams.get('user_continue_url'),
        node_mac: searchParams.get('node_mac'),
        client_mac: searchParams.get('client_mac'),
        client_ip: searchParams.get('client_ip')
    };
    
    // Debug logging
    console.log('Meraki Parameters:', {
        base_grant_url: params.base_grant_url || 'NOT PROVIDED',
        user_continue_url: params.user_continue_url || 'NOT PROVIDED',
        node_mac: params.node_mac || 'NOT PROVIDED',
        client_mac: params.client_mac || 'NOT PROVIDED',
        client_ip: params.client_ip || 'NOT PROVIDED'
    });
    
    return params;
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

// Message handler for sign-in window
function handleSignInMessage(event) {
    console.log('Received message from sign-in window:', event.data);
    if (event.data.type === 'signin_complete' && event.data.data) {
        submitToMeraki(event.data.data);
    }
}

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    storeParams();
    
    // Remove any existing message listeners
    window.removeEventListener('message', handleSignInMessage);
    
    // Add new message listener
    window.addEventListener('message', handleSignInMessage);
    
    // Calculate window dimensions for full screen
    const width = Math.min(600, window.screen.width);
    const height = Math.min(800, window.screen.height);
    
    // Calculate position for center of screen
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    // Debug logging
    console.log('Opening window with dimensions:', {
        width,
        height,
        left,
        top
    });
    
    // Open sign-in page in a new window with specific dimensions and features
    const windowFeatures = `
        width=${width},
        height=${height},
        left=${left},
        top=${top},
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
        console.log('Successfully opened sign-in window');
    } else {
        console.error('Failed to open popup window - it may have been blocked by the browser');
        alert('Please allow popups for this site to continue with WiFi authentication');
    }

    return false;
}

// Submit credentials to Meraki
function submitToMeraki(formData) {
    const params = JSON.parse(localStorage.getItem('merakiParams'));
    console.log('Retrieved Meraki params from storage:', params);
    console.log('Form data to submit:', formData);
    
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
    console.log('Final form data:', Object.fromEntries(new FormData(form)));
    
    document.body.appendChild(form);
    form.submit();
}
