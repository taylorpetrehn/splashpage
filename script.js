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

// Handle initial connect button click
function handleConnect() {
    storeParams();
    
    // Calculate window dimensions based on screen size
    const minWidth = 600;
    const minHeight = 800;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    
    // For desktop, use 80% of screen width/height with minimum sizes
    const width = Math.max(minWidth, Math.min(screenWidth * 0.8, 1200));
    const height = Math.max(minHeight, Math.min(screenHeight * 0.8, 1000));
    
    // Calculate position for center of screen
    const left = (screenWidth - width) / 2;
    const top = (screenHeight - height) / 2;
    
    // Debug logging
    console.log('Opening window with dimensions:', {
        width,
        height,
        left,
        top,
        screenWidth,
        screenHeight
    });
    
    // Construct the signin URL with all parameters
    const params = getUrlParams();
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            searchParams.append(key, value);
        }
    });
    
    const signinUrl = 'signin.html' + (searchParams.toString() ? '?' + searchParams.toString() : '');
    console.log('Opening signin URL:', signinUrl);
    
    // Try to open in a new window first
    try {
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
        
        const signInWindow = window.open(signinUrl, '_blank', windowFeatures);
        
        if (signInWindow) {
            signInWindow.focus();
            console.log('Successfully opened sign-in window');
        } else {
            // If popup is blocked, redirect in same window
            console.log('Popup blocked, redirecting in same window');
            window.location.href = signinUrl;
        }
    } catch (error) {
        // If there's any error, fall back to same-window redirect
        console.error('Error opening window:', error);
        window.location.href = signinUrl;
    }
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
    
    // Calculate window dimensions based on screen size
    const minWidth = 600;
    const minHeight = 800;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    
    // For desktop, use 80% of screen width/height with minimum sizes
    const width = Math.max(minWidth, Math.min(screenWidth * 0.8, 1200));
    const height = Math.max(minHeight, Math.min(screenHeight * 0.8, 1000));
    
    // Calculate position for center of screen
    const left = (screenWidth - width) / 2;
    const top = (screenHeight - height) / 2;
    
    // Debug logging
    console.log('Opening window with dimensions:', {
        width,
        height,
        left,
        top,
        screenWidth,
        screenHeight
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

    // Create the form in the main window (captive portal context)
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = params.base_grant_url;
    form.target = '_self'; // Force same window submission
    
    // Add success URL first
    if (params.user_continue_url) {
        const successUrl = document.createElement('input');
        successUrl.type = 'hidden';
        successUrl.name = 'success_url';
        successUrl.value = params.user_continue_url;
        form.appendChild(successUrl);
    }
    
    // Add all Meraki parameters to the form
    Object.entries(params).forEach(([key, value]) => {
        if (value && key !== 'user_continue_url') { // Skip user_continue_url as it's handled above
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
    
    // Append form to body and submit in the main window context
    if (window.opener) {
        window.opener.document.body.appendChild(form);
    } else {
        document.body.appendChild(form);
    }
    
    try {
        // Submit the form
        form.submit();
        console.log('Form submitted successfully');
        
        // Close the popup window after a short delay if it exists
        if (window.opener) {
            setTimeout(() => {
                window.close();
            }, 500);
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Error connecting to WiFi. Please try again.');
    }
}
