import { createLinkEth } from '../../../../util/utils.js';

export async function getBlockByNumber() {
  const blockNumber = parseInt(document.getElementById('blockNumber').value);

  if (!blockNumber || blockNumber < 0) {
    alert('Please enter a valid block number');
    return;
  }

  const query = `
        query GetBlockByNumber($blockNumber: Float!) {
          getBlockByNumber(blockNumber: $blockNumber) {
            blockNumber
            creationDate
            hash
            nonce
            transactionCount
          }
        }
      `;

  try {
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

    if (json.errors) {
      const errorMessage = document.createElement('div');
      errorMessage.style.color = 'red';
      errorMessage.appendChild(
        document.createTextNode('Error: ' + JSON.stringify(json.errors)),
      );
      errorMessage.appendChild(document.createElement('hr'));
      document.querySelector('#messages').appendChild(errorMessage);
      return;
    }

    const block = json.data.getBlockByNumber;
    const message = document.createElement('div');
    message.appendChild(
      document.createTextNode(JSON.stringify(block, null, 2)),
    );
    message.appendChild(document.createElement('br'));
    message.appendChild(document.createElement('br'));

    const link = createLinkEth(block);
    message.appendChild(link);
    message.appendChild(document.createElement('hr'));

    document.querySelector('#messages').appendChild(message);
  } catch (error) {
    const errorMessage = document.createElement('div');
    errorMessage.style.color = 'red';
    errorMessage.appendChild(
      document.createTextNode('Error: ' + error.message),
    );
    errorMessage.appendChild(document.createElement('hr'));
    document.querySelector('#messages').appendChild(errorMessage);
  }
}

// TODO Convert to event listener in the module for new code.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
window.getBlockByNumber = getBlockByNumber;
