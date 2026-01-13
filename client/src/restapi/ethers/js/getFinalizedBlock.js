import { createLinkEth } from '../../../../util/utils.js';

export async function getFinalizedBlock() {
  const res = await fetch('http://127.0.0.1:3000/v1/ethers/finalized-block');
  const json = await res.json();
  console.log(res);
  console.log(json);

  const message = document.createElement('div');
  message.appendChild(document.createTextNode(JSON.stringify(json)));
  message.appendChild(document.createElement('br'));
  const link = createLinkEth(json);
  message.appendChild(link);
  message.appendChild(document.createElement('hr'));
  document.querySelector('#messages').appendChild(message);
}

// TODO Convert to event listener in the module for new code.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
window.getFinalizedBlock = getFinalizedBlock;