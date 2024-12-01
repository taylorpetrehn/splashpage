window.alert = function(message) {
    showModal('Alert', message);
};

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

    // const checkbox = document.getElementById('agreeCheckbox');
    // if (!checkbox.checked) {
    //     showModal('Agreement Required', 'You must agree to the terms and conditions to continue.');
    //     return false;
    }


    const params = getQueryParams(); // Get URL query parameters

    if (params.base_grant_url) {
        // Redirect to Meraki's grant access URL
        const redirectUrl = `${params.base_grant_url}?continue_url=${encodeURIComponent(params.user_continue_url || 'https://www.example.com')}`;
        window.location.href = redirectUrl;
    } else {
        showModal('Unable to connect. Please try again later.');
    }
}

function showModal(title, message) {
    const modal = document.getElementById('customModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');

    modalTitle.textContent = title; // Set the title of the modal
    modalMessage.textContent = message; // Set the message of the modal
    modal.style.display = 'block'; // Show the modal
}

function closeModal() {
    const modal = document.getElementById('customModal');
    modal.style.display = 'none'; // Hide the modal
}

