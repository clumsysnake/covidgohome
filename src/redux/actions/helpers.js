//TODO: use ENV var not hardcoded.
export const S3_BUCKET = "http://covidgohome.s3-us-west-2.amazonaws.com"

export const inDev = process.env.NODE_ENV === 'development'

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