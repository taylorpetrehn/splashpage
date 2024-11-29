
function getQueryParams() {
    const params = {};
    window.location.search.substring(1).split("&").forEach(function(pair) {
        const [key, value] = pair.split("=");
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
    return params;
}

function handleFormSubmit(event) {
    event.preventDefault();

    const checkbox = document.getElementById('agreeCheckbox');
    if (!checkbox.checked) {
        alert('You must agree to the terms and conditions to continue.');
        return false;
    }

    const params = getQueryParams();

    if (params.base_grant_url) {
        const redirectUrl = `${params.base_grant_url}?continue_url=${encodeURIComponent(params.user_continue_url || 'https://www.example.com')}`;
        window.location.href = redirectUrl;
    } else {
        alert('Unable to connect. Please try again later.');
    }
}
