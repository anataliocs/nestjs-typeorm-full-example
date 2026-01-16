import { createLinkEth } from '../../../util/utils.js';

export class WsConnect {
  constructor(url,eventName,linkFunction) {
    this.url = url;
    this.socket = new WebSocket(url);
    this.eventName = eventName;
    this.linkFunction = linkFunction;
    this.setEventHandlers();
  }

  setEventHandlers() {
    this.socket.onopen = () => {
      console.log(`Connected to: ${this.socket.url}`);
    };

    this.socket.onmessage = (msg) => {
      console.log(msg);
      const data = JSON.parse(msg.data).data;
      console.log(data);
      const message = document.createElement('div');
      message.appendChild(document.createTextNode(msg.data));
      message.appendChild(document.createElement('br'));
      const link = this.linkFunction(data);
      message.appendChild(link);
      message.appendChild(document.createElement('hr'));
      document.querySelector('#messages').appendChild(message);
    };
  }

  sendMessage(topic) {
    this.socket.send(
      JSON.stringify({
        event: this.eventName,
        data: {
          client: 'vanilla.js',
          topic: topic,
        },
      }),
    );

    if (this.socket.readyState === 1) {
      document
        .querySelector('#connection-status')
        .appendChild(document.createTextNode('Connected!'));
    }
  }

  closeConnection(reason) {
    this.socket.close(1000, reason);
    document.querySelector('#connection-status').innerHTML = '';
    document.querySelector('#progress-bar').value = 0;
  }
}
