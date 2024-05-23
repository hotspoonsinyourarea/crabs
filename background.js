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
// Define the list of sites where the extension should work
const targetSites = [
    'stackoverflow', 
    'github', 
    'checkio', 
    'kaggle', 
    'coursera', 
    'codecademy', 
    'pythontutor', 
    'codewars', 
    'python', 
    'skillbox', 
    'wikipedia', 
    'stepik'
];

function handleTabActivation(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        // Check if the current tab's URL is in the targetSites list
        if (targetSites.includes(tab.url)) {
            let data = {
                "id": getitem('id'),
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
        }
    });
}

function handleTabUpdate(tabId, changeInfo, tab) {
    // Check if we changed tab and if the new tab's URL is in the targetSites list
    if (changeInfo.url && targetSites.includes(changeInfo.url)) {
        let data = {
            "id": getitem('id'),
            "url": tab.url,
            "date": new Date().toISOString()
        };

        // Sending data to server
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
    }
}

// Listen for tab activation events
chrome.tabs.onActivated.addListener(handleTabActivation);
// Listen for tab updating events
chrome.tabs.onUpdated.addListener(handleTabUpdate);
