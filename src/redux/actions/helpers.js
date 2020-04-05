export function fetchXhr(url, onload = null, onerror = null, responseType = "json") {
  let oReq = new XMLHttpRequest();
  oReq.onload = onload
  oReq.onerror = onerror
  oReq.open("GET", url);
  // oReq.setRequestHeader("Pragma", "no-cache");
  // oReq.setRequestHeader("Cache-control", "no-cache");
  oReq.responseType = responseType;
  oReq.send();
}