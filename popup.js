function generateLargeRandomNumber() {
    return Math.floor(Math.random() * 1000000000); 
}

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for(let i=0;i < ca.length;i++) {
        let c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

document.addEventListener('DOMContentLoaded', function() {
    // Check if the "id" cookie exists
    if (!getCookie('id')) {
        // If the "id" cookie does not exist, generate a new random number and set it as a cookie
        let randomNumber = generateLargeRandomNumber();
        setCookie('id', randomNumber.toString(), 30); // Set the cookie to expire in 30 days
    }
    
    // Listen for tab activation events
    chrome.tabs.onActivated.addListener(function(activeInfo) {
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
    });

    // Fetch the URL of the active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "getURL"}, function(response) {
            document.getElementById("url").innerText = response.url;

            // Display the stored random number in the popup
            let storedIdElement = document.getElementById('stored-id');
            if (storedIdElement) {
                storedIdElement.textContent = 'Stored ID: ' + getCookie('id');
            }
        });
    });
});
