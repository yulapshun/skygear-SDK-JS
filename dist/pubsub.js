/**
 * Copyright 2015 Oursky Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _util = require('./util');

var _ = require('lodash');
var WebSocket = require('websocket').w3cwebsocket;
var url = require('url');
var ee = require('event-emitter');

var ON_OPEN = 'onOpen';
var ON_CLOSE = 'onClose';

var Pubsub = (function () {
  function Pubsub(container) {
    var internal = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    _classCallCheck(this, Pubsub);

    this._container = container;
    this._ws = null;
    this._internal = internal;
    this._queue = [];
    this.ee = ee({});
    this._handlers = {};
    this._reconnectWait = 5000;
    this._retryCount = 0;
  }

  _createClass(Pubsub, [{
    key: 'onOpen',
    value: function onOpen(listener) {
      this.ee.on(ON_OPEN, listener);
      return new _util.EventHandle(this.ee, ON_OPEN, listener);
    }
  }, {
    key: 'onClose',
    value: function onClose(listener) {
      this.ee.on(ON_CLOSE, listener);
      return new _util.EventHandle(this.ee, ON_CLOSE, listener);
    }
  }, {
    key: '_pubsubUrl',
    value: function _pubsubUrl() {
      var internal = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      var parsedUrl = url.parse(this._container.endPoint);
      var protocol = parsedUrl.protocol === 'https:' ? 'wss:' : 'ws:';
      var path = internal ? '/_/pubsub' : '/pubsub';
      var queryString = '?api_key=' + this._container.apiKey;
      return protocol + '//' + parsedUrl.host + path + queryString;
    }
  }, {
    key: '_hasCredentials',
    value: function _hasCredentials() {
      return !!this._container.apiKey;
    }
  }, {
    key: 'reconfigure',
    value: function reconfigure() {
      if (!this._hasCredentials()) {
        this.close();
        return;
      }

      this.connect();
    }
  }, {
    key: '_onopen',
    value: function _onopen() {
      var self = this;

      // Trigger registed onOpen callback
      this.ee.emit(ON_OPEN, true);

      // Resubscribe previously subscribed channels
      _.forEach(this._handlers, function (handlers, channel) {
        self._sendSubscription(channel);
      });

      // Flushed queued messages to the server
      _.forEach(this._queue, function (data) {
        self._ws.send(JSON.stringify(data));
      });
      this._queue = [];
    }
  }, {
    key: '_onmessage',
    value: function _onmessage(data) {
      _.forEach(this._handlers[data.channel], function (handler) {
        handler(data.data);
      });
    }
  }, {
    key: 'on',
    value: function on(channel, callback) {
      return this.subscribe(channel, callback);
    }
  }, {
    key: 'publish',
    value: function publish(channel, message) {
      var data = {
        action: 'pub',
        channel: channel,
        data: message
      };
      if (this.connected) {
        this._ws.send(JSON.stringify(data));
      } else {
        this._queue.push(data);
      }
    }
  }, {
    key: '_sendSubscription',
    value: function _sendSubscription(channel) {
      if (this.connected) {
        var data = {
          action: 'sub',
          channel: channel
        };
        this._ws.send(JSON.stringify(data));
      }
    }
  }, {
    key: '_sendRemoveSubscription',
    value: function _sendRemoveSubscription(channel) {
      if (this.connected) {
        var data = {
          action: 'unsub',
          channel: channel
        };
        this._ws.send(JSON.stringify(data));
      }
    }
  }, {
    key: 'off',
    value: function off(channel) {
      var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      this.unsubscribe(channel, callback);
    }
  }, {
    key: 'subscribe',
    value: function subscribe(channel, handler) {
      var alreadyExists = this.hasHandlers(channel);
      this._register(channel, handler);
      if (!alreadyExists) {
        this._sendSubscription(channel);
      }
      return handler;
    }
  }, {
    key: 'unsubscribe',
    value: function unsubscribe(channel) {
      var handler = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      if (!this.hasHandlers(channel)) {
        return;
      }

      var handlersToRemove;
      if (handler) {
        handlersToRemove = [handler];
      } else {
        handlersToRemove = this._handlers[channel];
      }

      var self = this;
      _.forEach(handlersToRemove, function (handlerToRemove) {
        self._unregister(channel, handlerToRemove);
      });

      if (!this.hasHandlers(channel)) {
        this._sendRemoveSubscription(channel);
      }
    }
  }, {
    key: 'hasHandlers',
    value: function hasHandlers(channel) {
      var handlers = this._handlers[channel];
      return handlers ? handlers.length > 0 : false;
    }
  }, {
    key: '_register',
    value: function _register(channel, handler) {
      if (!this._handlers[channel]) {
        this._handlers[channel] = [];
      }
      this._handlers[channel].push(handler);
    }
  }, {
    key: '_unregister',
    value: function _unregister(channel, handler) {
      var handlers = this._handlers[channel];
      handlers = _.reject(handlers, function (item) {
        return item === handler;
      });
      if (handlers.length > 0) {
        this._handlers[channel] = handlers;
      } else {
        delete this._handlers[channel];
      }
    }
  }, {
    key: '_reconnect',
    value: function _reconnect() {
      var self = this;
      var interval = _.min([this._reconnectWait * this._retryCount, 60000]);
      _.delay(function () {
        self._retryCount += 1;
        self.connect();
      }, interval);
    }
  }, {
    key: 'reset',
    value: function reset() {
      this.close();
      this._handlers = {};
    }
  }, {
    key: 'close',
    value: function close() {
      if (this._ws) {
        this._ws.close();
        this._ws = null;
      }
    }
  }, {
    key: '_setWebSocket',
    value: function _setWebSocket(ws) {
      var emitter = this.ee;
      this._ws = ws;

      if (!this._ws) {
        return;
      }

      var self = this;
      this._ws.onopen = function () {
        self._retryCount = 0;
        self._onopen();
      };
      this._ws.onclose = function () {
        emitter.emit(ON_CLOSE, false);
        self._reconnect();
      };
      this._ws.onmessage = function (evt) {
        var message;
        try {
          message = JSON.parse(evt.data);
        } catch (e) {
          console.log('Receivied unrecognized data from pubsub websocket.');
          return;
        }
        self._onmessage(message);
      };
    }
  }, {
    key: 'connect',
    value: function connect() {
      if (!this._hasCredentials() || this.connected) {
        return;
      }

      var pubsubUrl = this._pubsubUrl(this._internal);
      var ws = new this.WebSocket(pubsubUrl);
      this._setWebSocket(ws);
    }
  }, {
    key: 'connected',
    get: function get() {
      return this._ws && this._ws.readyState === 1;
    }
  }, {
    key: 'WebSocket',
    get: function get() {
      return WebSocket;
    }
  }]);

  return Pubsub;
})();

exports['default'] = Pubsub;
module.exports = exports['default'];