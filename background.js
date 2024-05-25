function isSearchQuery(url) {
    const pattern = /^(https:\/\/(www\.)?(google\.com|yandex\.ru)(\/search)?).*$/;
    // Check if the URL matches the pattern
    return pattern.test(url);
}

let last_search_queries = [];
const targetSites = [
  'https://stackoverflow',
  'https://github',
  'https://checkio',
  'https://kaggle',
  'https://coursera',
  'https://codecademy',
  'https://pythontutor',
  'https://codewars',
  'https://python',
  'https://skillbox',
  'https://wikipedia',
  'https://stepik'
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
    //sendLog("start sendAllSearchQueries", new Date().toISOString()); 
    // Iterate over each item in last_search_queries
    last_search_queries.forEach((queryItem) => {
        //sendLog("started for each", queryItem.date);
        sendLog(queryItem.url, queryItem.date); 
        //sendLog("started for each", ""); 
        //sendLog(queryItem, ""); 
    });
} 
function checkIfsuitable(url) {
    if(isSearchQuery(url)) {
        let searchData = {
        url: url,
        date: new Date().toISOString(), 
        }
        last_search_queries.push(searchData);
        //sendLog("seacrh query added", new Date().toISOString());
    }
    else {
        if(url!=null&&url!='chrome://newtab/') {
            sendLog("this isn't null", new Date().toISOString());
            sendLog(tab.url, new Date().toISOString());
            last_search_queries = [];
        }
    }
}
function handleTabActivation(activeInfo,tab) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        if (targetSites.some(site => tab.url.startsWith(site))) {
            //sendLog("tabactive if", new Date().toISOString());
            sendAllSearchQueries();
            sendLog(tab.url, new Date().toISOString());
        }
        else {
            //sendLog("tabactive else", new Date().toISOString());
            //sendLog(tab.url, new Date().toISOString());
            checkIfsuitable(tab.url);
        }
    });
}

function handleTabUpdate(tabId, changeInfo, tab) {
    // Check if we changed tab and if the new tab's URL is in the targetSites list
    if (changeInfo.url && targetSites.some(site => tab.url.startsWith(site))) {
        //sendLog("tabupdate if", new Date().toISOString());
        sendAllSearchQueries();
        sendLog(tab.url, new Date().toISOString());
    }
    else {
        //sendLog("tabupdate else", new Date().toISOString());
        checkIfsuitable(tab.url); 
    }
}
// Listen for tab activation events
chrome.tabs.onActivated.addListener(handleTabActivation);
// Listen for tab updating events
chrome.tabs.onUpdated.addListener(handleTabUpdate);
