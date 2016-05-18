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

exports.toJSON = toJSON;
exports.fromJSON = fromJSON;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _asset = require('./asset');

var _asset2 = _interopRequireDefault(_asset);

var _reference = require('./reference');

var _reference2 = _interopRequireDefault(_reference);

var _geolocation = require('./geolocation');

var _geolocation2 = _interopRequireDefault(_geolocation);

function toJSON(v) {
  if (v === null) {
    return null;
  } else if (_lodash2['default'].isArray(v)) {
    return _lodash2['default'].map(v, toJSON);
  } else if (_lodash2['default'].isDate(v)) {
    return {
      $type: 'date',
      $date: v.toJSON()
    };
  } else if (v.toJSON) {
    return v.toJSON();
  } else if (_lodash2['default'].isObject(v)) {
    return _lodash2['default'].chain(v).map(function (value, key) {
      return [key, toJSON(value)];
    }).object().value();
  } else {
    return v;
  }
}

function fromJSON(attrs) {
  if (!_lodash2['default'].isObject(attrs)) {
    return attrs;
  }

  switch (attrs.$type) {
    case 'geo':
      return _geolocation2['default'].fromJSON(attrs);
    case 'asset':
      return _asset2['default'].fromJSON(attrs);
    case 'date':
      return new Date(attrs.$date);
    case 'ref':
      return new _reference2['default'](attrs);
    default:
      return attrs;
  }
}

var EventHandle = (function () {
  function EventHandle(emitter, name, listener) {
    _classCallCheck(this, EventHandle);

    this.emitter = emitter;
    this.name = name;
    this.listener = listener;
  }

  _createClass(EventHandle, [{
    key: 'cancel',
    value: function cancel() {
      this.emitter.off(this.name, this.listener);
    }
  }]);

  return EventHandle;
})();

exports.EventHandle = EventHandle;