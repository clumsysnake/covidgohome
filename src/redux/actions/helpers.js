export function fetchXhr(url, onload = null, onerror = null, responseType = "json", headers = {}) {
  let oReq = new XMLHttpRequest();
  oReq.onload = onload
  oReq.onerror = onerror
  oReq.open("GET", url);
  Object.entries(headers).forEach(([k, v]) => {
  	oReq.setRequestHeader(k, v)		
  })
  oReq.responseType = responseType;
  oReq.send();
}