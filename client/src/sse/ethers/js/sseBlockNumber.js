import { SSEConnect } from '../../shared/sseConnect.js';

const eventSource = new SSEConnect(
  'http://127.0.0.1:3000/ethers/sse/block-number/',
);

// Close SSE connection
document
  .querySelector('#close-connection-button')
  .addEventListener('click', () => {
    console.log('Closing SSE connection...');
    eventSource.closeEventSource();
  });
