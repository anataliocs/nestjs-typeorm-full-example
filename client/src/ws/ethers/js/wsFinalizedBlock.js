import { WsConnect } from '../../shared/wsConnect.js';

const websocket = new WsConnect('ws://localhost:81');

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
