export async function graphQLRequest(query, blockNumber) {
  const res = await fetch('http://127.0.0.1:3000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      variables: { blockNumber: blockNumber },
    }),
  });

  const json = await res.json();
  console.log(res);
  console.log(json);
  return json;
}

export function displayGraphQLErrors(errors) {
  const errorMessage = document.createElement('div');
  errorMessage.style.color = 'red';
  errorMessage.appendChild(
    document.createTextNode('Error: ' + JSON.stringify(errors)),
  );
  errorMessage.appendChild(document.createElement('hr'));
  document.querySelector('#messages').appendChild(errorMessage);
}

export function displayResults(block, link) {
  const message = document.createElement('div');

  message.appendChild(document.createTextNode(JSON.stringify(block, null, 2)));
  message.appendChild(document.createElement('br'));

  message.appendChild(link);
  message.appendChild(document.createElement('hr'));

  document.querySelector('#messages').appendChild(message);
}
