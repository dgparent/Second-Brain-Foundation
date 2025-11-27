import Aedes from 'aedes';
import { createServer } from 'net';
import { WebSocketServer, createWebSocketStream } from 'ws';
import { config } from 'dotenv';
import { logger } from '@sbf/logging';

config();

const PORT = parseInt(process.env.PORT || '1883');
const WS_PORT = parseInt(process.env.WS_PORT || '8883');

const broker = new Aedes();

// MQTT over TCP
const server = createServer(broker.handle);

// MQTT over WebSocket
const ws = new WebSocketServer({ port: WS_PORT });
ws.on('connection', (socket) => {
  const stream = createWebSocketStream(socket);
  broker.handle(stream as any);
});

// Client authentication
broker.authenticate = (client, username, password, callback) => {
  const tenantId = username?.toString().split(':')[0];
  const deviceId = username?.toString().split(':')[1];
  
  logger.info({ 
    event: 'device_auth', 
    tenantId, 
    deviceId,
    clientId: client.id 
  });
  
  // TODO: Validate credentials against database
  // TODO: Check tenant membership
  
  callback(null, true);
};

// Authorization for pub/sub
broker.authorizePublish = (client, packet, callback) => {
  const topic = packet.topic;
  
  // TODO: Check if client can publish to this topic
  // TODO: Enforce tenant isolation in topic hierarchy
  
  logger.info({ 
    event: 'mqtt_publish', 
    clientId: client.id, 
    topic 
  });
  
  callback(null);
};

broker.authorizeSubscribe = (client, subscription, callback) => {
  const topic = subscription.topic;
  
  // TODO: Check if client can subscribe to this topic
  // TODO: Enforce tenant isolation
  
  logger.info({ 
    event: 'mqtt_subscribe', 
    clientId: client.id, 
    topic 
  });
  
  callback(null, subscription);
};

// Handle published messages
broker.on('publish', (packet, client) => {
  if (client) {
    logger.info({ 
      event: 'message_published', 
      clientId: client.id, 
      topic: packet.topic,
      payloadSize: packet.payload.length 
    });
    
    // TODO: Process IoT telemetry
    // TODO: Store in time-series database
    // TODO: Trigger analytics updates
  }
});

server.listen(PORT, () => {
  logger.info(`SBF IoT Core - MQTT broker listening on port ${PORT}`);
  logger.info(`SBF IoT Core - WebSocket listening on port ${WS_PORT}`);
});

export { broker };
