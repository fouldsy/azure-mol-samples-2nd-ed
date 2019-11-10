/*
 * IoT Gateway BLE Script - Microsoft Sample Code - Copyright (c) 2019 - Licensed MIT
 */

const { EventHubClient, EventPosition } = require('@azure/event-hubs');

class EventHubReader {
  constructor(connectionString, consumerGroup) {
    this.connectionString = connectionString;
    this.consumerGroup = consumerGroup;
    this.eventHubClient = undefined;
    this.receiveHandlers = undefined;
  }

  async startReadMessage(startReadMessageCallback) {
    try {
      const client = await EventHubClient.createFromIotHubConnectionString(this.connectionString);
      console.log('Successfully created the EventHub Client from IoT Hub connection string.');
      this.eventHubClient = client;

      const partitionIds = await this.eventHubClient.getPartitionIds();
      console.log('The partition ids are: ', partitionIds);

      const onError = (err) => {
        console.error(err.message || err);
      };

      const onMessage = (message) => {
        const deviceId = message.annotations['iothub-connection-device-id'];
        return startReadMessageCallback(message.body, message.enqueuedTimeUtc, deviceId);
      };

      this.receiveHandlers = partitionIds.map(id => this.eventHubClient.receive(id, onMessage, onError, {
        eventPosition: EventPosition.fromEnqueuedTime(Date.now()),
        consumerGroup: this.consumerGroup,
      }));
    } catch (ex) {
      console.error(ex.message || ex);
    }
  }

  // Close connection to Event Hub.
  async stopReadMessage() {
    const disposeHandlers = [];
    this.receiveHandlers.forEach((receiveHandler) => {
      disposeHandlers.push(receiveHandler.stop());
    });
    await Promise.all(disposeHandlers);

    this.eventHubClient.close();
  }
}

module.exports = EventHubReader;
