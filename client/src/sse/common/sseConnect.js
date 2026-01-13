import { createLinkEth } from '../../../util/utils.js';

export class SSEConnect {
  // Example: http://127.0.0.1:3000/ethers/sse/block-number/
  constructor(url) {
    this.eventSource = new EventSource(url, {
      withCredentials: false,
    });
    this.setEventHandlers();
  }

  setEventHandlers() {
    this.eventSource.onmessage = (msg) => {
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

    this.eventSource.onerror = (err) => {
      console.log('Error: ' + JSON.stringify(err));
      const message = document.createElement('div');
      message.innerText = 'New Error: ' + JSON.stringify(err);
      document.body.appendChild(message);
    };

    this.eventSource.onopen = () => {
      console.log(`Event source state: ${this.eventSource.readyState}`);
      console.log(`Event source URL: ${this.eventSource.url}`);
      console.log('SSE connection opened');
      if (this.eventSource.readyState === 1) {
        document
          .querySelector('#connection-status')
          .appendChild(document.createTextNode('Connected!'));
      }
    };

    this.eventSource.onclose = () => {
      console.log('SSE connection closed');
    };
  }

  closeEventSource() {
    document.querySelector('#connection-status').innerHTML = '';
    document.querySelector('#progress-bar').value = 0;
    this.eventSource.close();
  }
}
