export async function fetchResponse(url) {
  const res = await fetch(url);
  const json = await res.json();
  console.log(res);
  console.log(json);
  return json;
}
export function createResultsDiv(response) {
  const message = document.createElement('div');
  message.appendChild(document.createTextNode(JSON.stringify(response)));
  message.appendChild(document.createElement('br'));
  return message;
}
export function displayResults(response, link) {
  const message = createResultsDiv(response);
  message.appendChild(link);
  message.appendChild(document.createElement('hr'));
  document.querySelector('#messages').appendChild(message);
}