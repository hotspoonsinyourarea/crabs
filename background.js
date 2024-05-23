
function generateLargeRandomNumber() {
    return Math.floor(Math.random() * 1000000000);
}


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

// Function to handle tab activation events
function handleTabActivation(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        let data = {
            "id": getCookie('id'), // Assuming the "id" cookie is already set elsewhere or persists across sessions
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

// Listen for tab activation events
chrome.tabs.onActivated.addListener(handleTabActivation);
