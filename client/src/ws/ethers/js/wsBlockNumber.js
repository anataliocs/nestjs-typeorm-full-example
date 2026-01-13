import { createLinkEth } from '../../../../util/utils.js';

const socket = new WebSocket('ws://localhost:81');
socket.onopen = function () {
  console.log(`Connected to: ${socket.url}`);

  socket.onmessage = function (msg) {
    console.log(msg);
    const data = JSON.parse(msg.data).data;
    console.log(data);
    const message = document.createElement('div');
    message.appendChild(document.createTextNode(msg.data));
    message.appendChild(document.createElement('br'));
    const link = createLinkEth(data);
    message.appendChild(link);
    message.appendChild(document.createElement('hr'));
    document.querySelector('#messages').appendChild(message);
  };
};

// Sending websocket message to the server
function sendMessage() {
  console.log('Sending message to subscribe to block-number');
  socket.send(
    JSON.stringify({
      event: 'events',
      data: {
        client: 'vanilla.js',
        topic: 'block-number',
      },
    }),
  );

  if (socket.readyState === 1) {
    document
      .querySelector('#connection-status')
      .appendChild(
        document.createTextNode(`Websocket connected to: ${socket.url}`),
      );
  }
}

function closeConnection(reason) {
  console.log(`Closing websocket connection: ${reason}`);
  socket.close(1000, reason);
  document.querySelector('#connection-status').innerHTML = '';
  document.querySelector('#progress-bar').value = 0;
}

// TODO Convert to event listener in the module for new code.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
window.sendMessage = sendMessage;

// TODO Convert to event listener in the module for new code.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
window.closeConnection = closeConnection;