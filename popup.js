chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {action: "getURL"}, function(response) {
    document.getElementById("url").innerText = response.url;
  });
});