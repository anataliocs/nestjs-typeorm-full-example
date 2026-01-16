import { WsConnect } from '../../common/wsConnect.js';
import { createLinkEth } from '../../../../util/utils.js';

const websocket = new WsConnect(
  'ws://localhost:81',
  'ethers-subscribe-blocks',
  createLinkEth,
);

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
