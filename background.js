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
    //Trying to retrieve id from localStorage
    let value = localStorage.getItem(name);
    //Checking if it exists
    if (value) {
        return value;
            }
    else {
        //Creating and storing id in localStorage
        let randomNumber = generateLargeRandomNumber();
        localStorage.setItem('id', randomNumber.toString());
        return localStorage.getItem(name);
    }
}
function sendLog(url, date) {
    //Create a data object
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
    //Look for errors
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
    last_search_queries.forEach((queryItem) => {
        sendLog(queryItem.url, queryItem.date); 
    });
} 
//Function that checks if url is a "searchquery"
function checkIfsuitable(url) {
    if(isSearchQuery(url)) {
        //Create data object
        let searchData = {
        url: url,
        date: new Date().toISOString(), 
        }
        //Add to array
        last_search_queries.push(searchData);
    }
    else {
        //If url is a newtab, then there is no need to wipe this array
        if(url!=null&&url!='chrome://newtab/') {
            //In case url is unrelated
            last_search_queries = [];
        }
    }
}
function handleTabActivation(activeInfo,tab) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        //Check if site is in targetsites
        if (targetSites.some(site => tab.url.startsWith(site))) {
            //Send data to server
            sendAllSearchQueries();
            sendLog(tab.url, new Date().toISOString());
        }
        else {
            checkIfsuitable(tab.url);
        }
    });
}

function handleTabUpdate(tabId, changeInfo, tab) {
    // Check if we changed tab and if the new tab's URL is in the targetSites list
    if (changeInfo.url && targetSites.some(site => tab.url.startsWith(site))) {
        sendAllSearchQueries();
        sendLog(tab.url, new Date().toISOString());
    }
    else {
        checkIfsuitable(tab.url); 
    }
}
// Listen for tab activation events
chrome.tabs.onActivated.addListener(handleTabActivation);
// Listen for tab updating events
chrome.tabs.onUpdated.addListener(handleTabUpdate);
