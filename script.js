// Redirect from the mini-browser to the default browser
if (navigator.userAgent.includes('CaptiveNetworkSupport')) {
    window.location.href = "https://taylorpetrehn.github.io/splashpage/";
}

// Function to parse query parameters from the URL
function getQueryParams() {
    const params = {};
    window.location.search.substring(1).split("&").forEach(function(pair) {
        const [key, value] = pair.split("=");
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
    return params;
}

// Handle the form submission
function handleFormSubmit(event) {
    event.preventDefault(); // Prevent default form submission behavior

    const checkbox = document.getElementById('agreeCheckbox');
    if (!checkbox.checked) {
        alert('You must agree to the terms and conditions to continue.');
        return false; // Stop further processing if checkbox is not checked
    }

    const params = getQueryParams(); // Get URL query parameters

    if (params.base_grant_url) {
        // Redirect to Meraki's grant access URL
        const redirectUrl = `${params.base_grant_url}?continue_url=${encodeURIComponent(params.user_continue_url || 'https://www.example.com')}`;
        window.location.href = redirectUrl;
    } else {
        alert('Unable to connect. Please try again later.');
    }
}
