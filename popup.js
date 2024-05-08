
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
    if (!getCookie('id')) {
        let randomNumber = generateLargeRandomNumber();
        setCookie('id', randomNumber.toString(), 30); 
    }

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "getURL"}, function(response) {
            document.getElementById("url").innerText = response.url;

            // Optionally, display the stored random number in the popup
            let storedIdElement = document.getElementById('stored-id');
            if (storedIdElement) {
                storedIdElement.textContent = 'Stored ID: ' + getCookie('id');
            }
        });
    });
});
