import { WsConnect } from '../../common/wsConnect.js';

const websocket = new WsConnect('ws://localhost:81');

// Sending websocket message to the server
document.querySelector('#send-message-button').addEventListener('click', () => {
  console.log('Sending message to subscribe to block-number');
  websocket.sendMessage('block-number');
});

// Close websocket connection
document
  .querySelector('#close-connection-button')
  .addEventListener('click', () => {
    console.log('Closing block number websocket connection: User Requested');
    websocket.closeConnection('User Requested');
  });
