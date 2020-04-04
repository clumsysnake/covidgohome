export function fetchXhr(url, onload = null, onerror = null, responseType = "json") {
  let oReq = new XMLHttpRequest();
  oReq.onload = onload
  oReq.onerror = onerror
  oReq.open("GET", url);
  oReq.responseType = responseType;
  oReq.send();
}