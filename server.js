const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message);

    if (parsedMessage.type === 'chat') {
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'chat', message: parsedMessage.message }));
        }
      });
    } else {
    }
  });
});

server.listen(3000, () => {
  console.log('Server started on port 3000');
});