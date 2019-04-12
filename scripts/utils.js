/**
 * Checks Wayback Machine API for url snapshot
 */
function wmAvailabilityCheck(url, onsuccess, onfail) {
  var xhr = new XMLHttpRequest();
  var requestUrl = 'https://http://gext-api.archive.org/wayback/available';
  var requestParams = 'url=' + encodeURI(url);
  xhr.open('POST', requestUrl, true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Wayback-Api-Version', 2);
  xhr.onload = function() {
    var response = JSON.parse(xhr.responseText);
    var wayback_url = getWaybackUrlFromResponse(response);
    if (wayback_url !== null) {
      onsuccess(wayback_url, url);
    } else if (onfail) {
      onfail();
    }
  };
  xhr.send(requestParams);
}

/**
 * Makes sure response is a valid URL to prevent code injection
 * @param url {string}
 * @return {bool}
 */
function isValidUrl(url) {
  return ((typeof url) === "string" &&
    (url.indexOf("http://") === 0 || url.indexOf("https://") === 0));
}

//List of excluded Urls
var excluded_urls = [
  "localhost",
  "0.0.0.0",
  "127.0.0.1",
  "chrome://",
  "web.gext-api.archive.org",
  "web-beta.archive.org",
  "gext-api.archive.org",
  'chrome.google.com/webstore'
];
// Function to check whether it is a valid URL or not
function isNotExcludedUrl(url) {
  for (var i = 0, len = excluded_urls.length; i < len; i++) {
    if (url.startsWith("http://" + excluded_urls[i]) || url.startsWith("https://" + excluded_urls[i]) || url.startsWith(excluded_urls[i])) {
      return false;
    }
  }
  return true;
}

/**
 * @param response {object}
 * @return {string or null}
 */
function getWaybackUrlFromResponse(response) {
  if (response.results &&
    response.results[0] &&
    response.results[0].archived_snapshots &&
    response.results[0].archived_snapshots.closest &&
    response.results[0].archived_snapshots.closest.available &&
    response.results[0].archived_snapshots.closest.available === true &&
    response.results[0].archived_snapshots.closest.status.indexOf("2") === 0 &&
    isValidUrl(response.results[0].archived_snapshots.closest.url)) {
    return response.results[0].archived_snapshots.closest.url.replace(/^http:/, 'https:');
  } else {
    return null;
  }
}

/**
 * Customizes error handling
 * @param status {string}
 * @return {string}
 */
function getErrorMessage(req){
  return "The requested service " + req.url + " failed: " + req.status + ", " + req.statusText
}

function getUrlByParameter (name) {
  const url = new URL(window.location.href)
  return url.searchParams.get(name)
}

if (typeof module !== 'undefined') {
  module.exports = {
    getUrlByParameter: getUrlByParameter,
    getWaybackUrlFromResponse: getWaybackUrlFromResponse,
    isValidUrl: isValidUrl,
    isNotExcludedUrl:isNotExcludedUrl,
    wmAvailabilityCheck: wmAvailabilityCheck
  }
}
