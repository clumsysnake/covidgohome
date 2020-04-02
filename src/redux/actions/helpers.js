export function fetchXhr(url, onload, responseType = "json") {
  let oReq = new XMLHttpRequest();
  oReq.onload = onload
  oReq.open("GET", url);
  oReq.responseType = responseType;
  oReq.send();
}