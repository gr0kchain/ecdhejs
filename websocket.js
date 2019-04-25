const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8090 });
const bitcoinjs = require("bitcoinjs-lib");
var zmq = require('zmq')
  , sock = zmq.socket('sub');

sock.connect('tcp://127.0.0.1:29000');
sock.subscribe('rawtx');

sock.on('message', function(topic, message) {
  wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) return ws.terminate();
        var tx = bitcoinjs.Transaction.fromHex(message);
        var addresses = [];
        tx.outs.forEach(function(v1, k1) {
        console.log(v1.script)
          addresses.push(bitcoinjs.address.fromOutputScript(v1.script, bitcoinjs.networks.regtest)) 
        });
        ws.emit("message", message.toString('hex'), addresses)
  });
});

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(msg, addresses) {
    ws.send(JSON.stringify(addresses));
  });

});
