// This function remains unchanged as it doesn't interact with the DOM
function generateLargeRandomNumber() {
    return Math.floor(Math.random() * 1000000000);
}

// Since cookies cannot be accessed directly in the background page, consider storing them in localStorage instead
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    localStorage.setItem(name, value + expires);
}

function getCookie(name) {
    let value = localStorage.getItem(name);
    if (value) {
        let parts = value.split('; ');
        for (let i = 0; i < parts.length; i++) {
            let part = parts[i];
            if (part.startsWith(name)) {
                return part.split('=')[1];
            }
        }
    }
    return null;
}

// Listen for tab updates to detect when the active tab changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        // Check if the "id" cookie exists
        let id = getCookie('id');
        if (!id) {
            // If the "id" cookie does not exist, generate a new random number and set it as a cookie
            let randomNumber = generateLargeRandomNumber();
            setCookie('id', randomNumber.toString(), 30); // Set the cookie to expire in 30 days
        }

        // Function to handle tab activation events
        function handleTabActivation(activeInfo) {
            chrome.tabs.get(activeInfo.tabId, function(tab) {
                let data = {
                    "id": getCookie('id'),
                    "url": tab.url,
                    "date": new Date().toISOString()
                };

                // Send POST request to local server
                fetch('http://127.0.0.1:5000/log', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
              .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
              .then(text => console.log(text))
              .catch(error => console.error('Error:', error));
            });
        }
    }
});
