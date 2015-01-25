/**
 * Bothan Phantomjs Comlink
 * =========================
 *
 * The Comlink class enables direct communication, through websockets, with the
 * parent of the phantom child process.
 */
var helpers = require('../shared/helpers.js'),
    config = require('../shared/config.js'),
    EventEmitter = require('events').EventEmitter;

// Helpers
function endpoint(host, port) {
  return 'ws://' + (host || 'localhost') + ':' + (port || config.port);
}

// Main class
function Comlink() {
  var self = this;

  // Properties
  this.ws = null;
  this.messenger = null;
  this.parent = null;
  this.connected = false;
  this.ee = new EventEmitter();

  // Methods
  // TODO: implement a phantom-side timeout
  this.setup = function(params, next) {
    params = params || {};

    // Connecting to websocket server
    this.ws = new WebSocket(endpoint(params.host, params.port));

    // Waiting for effective connection
    this.ws.onopen = function() {
      self.connected = true;

      // Creating messenger
      var receptor = function(callback) {
        self.ws.onmessage = function(msg) {
          var parsedMsg = JSON.parse(msg.data);
          self.ee.emit(parsedMsg.head, parsedMsg.body);
          callback(parsedMsg);
        };
      };

      var emitter = function(data) {
        self.ws.send(JSON.stringify(data));
      };

      function delegate(name) {
        return self.ee[name].bind(self.ee);
      }

      // TODO: reconstruct the parent here
      self.parent = {
        request: helpers.request.bind(null, {
          receptor: receptor,
          emitter: emitter
        }),
        send: function(head, body) {
          emitter({
            from: params.name,
            head: head,
            body: body
          });
        },
        on: delegate('on'),
        once: delegate('once'),
        removeListener: delegate('removeListener')
      };

      // Perform tricks here
      // NOTE: executing binding here to avoid racing conditions
      if (params.bindings)
        require(params.bindings)(self.parent, params.data);

      // Performing handshake
      self.parent.request('handshake', {from: params.name}, next);
    };
  };
}

module.exports = new Comlink();
