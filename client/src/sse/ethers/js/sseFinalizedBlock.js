import { createLinkEth } from '../../../../util/utils.js';

const eventSource = new EventSource(
  'http://127.0.0.1:3000/ethers/sse/finalized-blocks/',
  {
    withCredentials: false,
  },
);

eventSource.onmessage = (msg) => {
  const data = JSON.parse(msg.data);
  console.log(data);
  const message = document.createElement('div');
  message.appendChild(document.createTextNode(msg.data));
  message.appendChild(document.createElement('br'));
  const link = createLinkEth(data);
  message.appendChild(link);
  message.appendChild(document.createElement('hr'));
  document.querySelector('#messages').appendChild(message);
};

eventSource.onerror = (err) => {
  console.log('Error: ' + JSON.stringify(err));
  const message = document.createElement('div');
  message.innerText = 'New Error: ' + JSON.stringify(err);
  document.body.appendChild(message);
};

eventSource.onopen = () => {
  console.log(`Event source state: ${eventSource.readyState}`);
  console.log(`Event source URL: ${eventSource.url}`);
  console.log('SSE connection opened');
  if (eventSource.readyState === 1) {
    document
      .querySelector('#connection-status')
      .appendChild(document.createTextNode('Connected!'));
  }
};

eventSource.onclose = () => {
  console.log('SSE connection closed');
};

export function closeEventSource() {
  document.querySelector('#connection-status').innerHTML = '';
  document.querySelector('#progress-bar').value = 0;
  console.log('Closing SSE connection...');
  eventSource.close();
}

// TODO Convert to event listener in the module for new code.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
window.closeEventSource = closeEventSource;