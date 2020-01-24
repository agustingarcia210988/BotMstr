// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// index.js is used to setup and configure your bot

// Import required packages
const path = require('path');
const restify = require('restify');
var WebSocketServer = require('websocket').server;


// Import required bot services. See https://aka.ms/bot-services to learn more about the different parts of a bot.
const { BotFrameworkAdapter } = require('botbuilder');

// The bot.
const { QnABot } = require('./bots/QnABot');

// Note: Ensure you have a .env file and include QnAMakerKnowledgeBaseId, QnAMakerEndpointKey and QnAMakerHost.
const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new BotFrameworkAdapter({
    /* appId: "84ed8dae-8a1a-499e-8638-54506a4fcec3",
    appPassword: "XUt@4r6Cb.r0:si.Y12k8yuEc8_5Bf61" */
});

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights.
    console.error(`\n [onTurnError]: ${ error }`);
    // Send a message to the user
    await context.sendActivity(`Oops. Something went wrong!`);
};

// Create the main dialog.
const bot = new QnABot();

// Create HTTP server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log(`\n${ server.name } listening to ${ server.url }`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
});

// Listen for incoming activities and route them to your bot main dialog.
server.post('/api/messages', (req, res) => {
    // Route received a request to adapter for processing
    adapter.processActivity(req, res, async (turnContext) => {
        // route to bot activity handler.
        await bot.run(turnContext);
    });
});
wss = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});
console.log("Starting Websockets..");
/*wss.on('connection', function connection(ws, incoming_request) {
    console.log("New websocket connection...");
    console.log(incoming_request.url);
    var url = require('url');
    var q = url.parse(incoming_request.url, true);
    var conv_id = q.query.conversation_id;
    ws.conv_id = conv_id;
    conversations[conv_id] = ws;
    //on connect message
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });
ws.on('close', function close() {
        delete(conversations[ws.conv_id]);
    });
ws.send('message from server at: ' + new Date());
});*/
function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
  }
wss.on('request', function(request) {
    console.log("La url"+ request.resourceURL);
if (!originIsAllowed(request.origin)) {
  // Make sure we only accept requests from an allowed origin
  request.reject();
  console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
  return;
}

var connection = request.accept('echo-protocol', request.origin);
console.log("el origen "+ request.origin);
console.log((new Date()) + ' Connection accepted.');
connection.on('message', function(message) {
    connection.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.sendUTF(message.utf8Data);
        }
    });
    /* if (message.type === 'utf8') {
        
        console.log('Received Message: ' + message.utf8Data);
        connection.sendUTF(message.utf8Data);
    }
    else if (message.type === 'binary') {
        console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
        connection.sendBytes(message.binaryData);
    } */
});
connection.on('close', function(reasonCode, description) {
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
});
});