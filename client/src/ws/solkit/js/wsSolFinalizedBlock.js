import { WsConnect } from '../../common/wsConnect.js';
import { createLinkSol } from '../../../../util/utils.js';

const websocket = new WsConnect(
  'ws://localhost:3000',
  'solkit-subscribe-blocks',
  createLinkSol,
);

// Sending websocket message to the server
document.querySelector('#send-message-button').addEventListener('click', () => {
  console.log('Sending message to subscribe to finalized blocks');
  websocket.sendMessage('finalized-blocks');
});

// Close websocket connection
document
  .querySelector('#close-connection-button')
  .addEventListener('click', () => {
    console.log(
      'Closing finalized blocks websocket connection: User Requested',
    );
    websocket.closeConnection('User Requested');
  });
