// This script sample is part of "Learn Azure in a Month of Lunches - 2nd edition" (Manning
// Publications) by Iain Foulds.
//
// This sample script covers the exercises from chapter 20 of the book. For more
// information and context to these commands, read a sample of the book and
// purchase at https://www.manning.com/books/learn-azure-in-a-month-of-lunches-2nd-edition
//
// This script sample is released under the MIT license. For more information,
// see https://github.com/fouldsy/azure-mol-samples-2nd-ed/blob/master/LICENSE
//
// This sample is based on https://github.com/Azure-Samples/web-apps-node-iot-hub-data-visualization

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const EventHubReader = require('./scripts/event-hub-reader.js');

const iotHubConnectionString = process.env.iot;
const eventHubConsumerGroup = process.env.consumergroup;

// Redirect requests to the public subdirectory to the root
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res /* , next */) => {
  res.redirect('/');
});

const server = http.createServer(app);

// Create Web Sockets server
const wss = new WebSocket.Server({ server });

// Broadcast data to all WebSockets clients
wss.broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        console.log(`Broadcasting data ${data}`);
        client.send(data);
      } catch (e) {
        console.error(e);
      }
    }
  });
};

server.listen(process.env.PORT || '3000', () => {
  console.log('Listening on %d.', server.address().port);
});

// Read in data from IoT Hub and then create broadcast to WebSockets client as new data is received from device
const eventHubReader = new EventHubReader(iotHubConnectionString, eventHubConsumerGroup);

(async () => {
  await eventHubReader.startReadMessage((message, date, deviceId) => {
    try {
      const payload = {
        IotData: message,
        MessageDate: date || Date.now().toString(),
        DeviceId: deviceId,
      };

      wss.broadcast(JSON.stringify(payload));
    } catch (err) {
      console.error('Error broadcasting: [%s] from [%s].', err, message);
    }
  });
})().catch();