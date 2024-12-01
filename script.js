// Override the default alert to use the custom modal
window.alert = function (message) {
    showModal('Alert', message);
};

// Redirect from the mini-browser to the default browser
if (navigator.userAgent.includes('CaptiveNetworkSupport')) {
    window.location.href = "https://taylorpetrehn.github.io/splashpage/";
}

// Function to parse query parameters from the URL
function getQueryParams() {
    const params = {};
    window.location.search.substring(1).split("&").forEach(function (pair) {
        const [key, value] = pair.split("=");
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
    return params;
}

// Function to handle form submission
function handleFormSubmit(event) {
    event.preventDefault(); // Prevent default form submission behavior

    const params = getQueryParams(); // Get URL query parameters

    if (params.base_grant_url) {
        // Redirect to Meraki's grant access URL
        const redirectUrl = `${params.base_grant_url}?continue_url=${encodeURIComponent(params.user_continue_url || 'https://www.example.com')}`;
        window.location.href = redirectUrl;
    } else {
        alert('Unable to connect. Please try again later.');
    }
}

// Custom modal functionality
function showModal(title, message) {
    const modal = document.getElementById('customModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');

    if (modal) {
        modalTitle.textContent = title; // Set the modal title
        modalMessage.textContent = message; // Set the modal message
        modal.style.display = 'block'; // Show the modal
    } else {
        console.error('Custom modal element not found.');
    }
}

function closeModal() {
    const modal = document.getElementById('customModal');
    if (modal) {
        modal.style.display = 'none'; // Hide the modal
    } else {
        console.error('Custom modal element not found.');
    }
}

document.getElementById('connectButton').addEventListener('click', function () {
    const params = new URLSearchParams(window.location.search);
    const baseGrantUrl = params.get('base_grant_url');
    const userContinueUrl = params.get('user_continue_url') || 'https://1900barker.com';

    if (baseGrantUrl) {
        // Open a new browser window with the base grant URL and user continue URL
        const redirectUrl = `${baseGrantUrl}?continue_url=${encodeURIComponent(userContinueUrl)}`;
        window.open(redirectUrl, '_blank');
    } else {
        // If base grant URL is missing, fall back to the main site
        window.open('https://1900barker.com', '_blank');
    }
});
