import { SSEConnect } from '../../common/sseConnect.js';
import { createLinkSol } from '../../../../util/utils.js';

const eventSource = new SSEConnect(
  'http://127.0.0.1:3000/solkit/sse/block-number/',
  createLinkSol,
);

// Close SSE connection
document
  .querySelector('#close-connection-button')
  .addEventListener('click', () => {
    console.log('Closing SSE connection...');
    eventSource.closeEventSource();
  });
