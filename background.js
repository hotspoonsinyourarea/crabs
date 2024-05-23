function isASearchQuery(url) {
    // Regular expression pattern to match Google search queries
    const googlePattern = /^https?:\/\/(www\.)?google\.com\/search\?q=([^&]+)&/; 
    // Regular expression pattern to match Yandex search queries
    const yandexPattern = /^https?:\/\/(www\.)?yandex\.ru\/search\?text=([^&]+)&/;
    // Check if the URL matches either Google or Yandex search query pattern
    return googlePattern.test(url) || yandexPattern.test(url);
}
let last_search_queries = [];
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
    'stepik',
    'habr'
];
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
function sendLog(url, date) {
    const data = {
        "id": getitem('id'),
        "url": url,
        "date": date
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

function sendAllSearchQueries() {
    // Iterate over each item in last_search_queries
    last_search_queries.forEach((searchQueryItem) => {
        // Extract the URL and current date/time for each item
        let url = searchQueryItem.url;
        let date = searchQueryItem.date; // Assuming this property exists
        // Call sendLog for each search query
        sendLog(url, date);
    });
}
function handleTabActivation(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        // Check if the current tab's URL is in the targetSites list
        if (targetSites.some(site => tab.url.includes(site))&&!isASearchQuery) {
            sendLog(tab.url, new Date().toISOString());
            //sendAllSearchQueries();
        }
        // else {
        //     if(isASearchQuery(tab.url)) {
        //         let searchData = {
        //         url: tab.url,
        //         date: new Date().toISOString(), 
        //         }
        //         last_search_queries.push(searchData);
        //     }
        //     else {
        //     last_search_queries = [];
        //     }
        // }
    });
}

function handleTabUpdate(tabId, changeInfo, tab) {
    // Check if we changed tab and if the new tab's URL is in the targetSites list
    if (changeInfo.url && targetSites.some(site => tab.url.includes(site))) {
        sendLog(tab.url, new Date().toISOString());
    }
}
// Listen for tab activation events
chrome.tabs.onActivated.addListener(handleTabActivation);
// Listen for tab updating events
chrome.tabs.onUpdated.addListener(handleTabUpdate);
