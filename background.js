function generateLargeRandomNumber() {
    return Math.floor(Math.random() * 1000000000);
}
function getitem(name) {
    let value = localStorage.getItem(name);
    if (value) {
        return value;
            }
    else {
        let randomNumber = generateLargeRandomNumber();
        localStorage.setItem('id', randomNumber.toString());
        return localStorage.getItem(name);
    }
}
function handleTabActivation(activeInfo) {
    let id = getitem('id');
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        let data = {
            "id": getitem('id'), // Assuming the "id" cookie is already set elsewhere or persists across sessions
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
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) = > {
    if (changeInfo.url) {
        const isSearchQuery = tab.url.includes("search");

        if (isSearchQuery) {
            let data = {
                "id": getCookie('id'),
                "url" : tab.url,
                "date" : new Date().toISOString(),
                "queryType" : "search"
            };

            fetch('http://127.0.0.1:5000/log', {
                method: 'POST',
                headers : {
                    'Content-Type': 'application/json'
                },
                body : JSON.stringify(data)
                })
                .then(response = > {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.text();
                    })
                        .then(text = > console.log(text))
                        .catch (error = > console.error('Error:', error));
        }
    }
});

// Listen for tab activation events
chrome.tabs.onActivated.addListener(handleTabActivation);
