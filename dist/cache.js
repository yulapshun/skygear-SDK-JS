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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _store2 = require('./store');

var _store3 = _interopRequireDefault(_store2);

var Cache = (function () {
  function Cache(prefix) {
    _classCallCheck(this, Cache);

    this.prefix = prefix;
    this._keyStore = this.prefix + ':keys';
    this.map = {};
    this.keys = [];
    this.store = _store3['default'];
    this.store.getItem(this._keyStore).then((function (jsonStr) {
      var ary = JSON.parse(jsonStr);
      this.keys = _lodash2['default'].union(this.keys, ary);
    }).bind(this), (function (err) {
      console.warn('Failed to get cached keys', this.prefix, err);
    }).bind(this));
  }

  _createClass(Cache, [{
    key: '_key',
    value: function _key(key) {
      return this.prefix + ':' + key;
    }
  }, {
    key: 'set',
    value: function set(key, value) {
      var prefixKey = this._key(key);
      return new Promise((function (resolve) {
        this.map[prefixKey] = value;
        this.keys = _lodash2['default'].union(this.keys, [prefixKey]);
        this.store.setItem(this._keyStore, JSON.stringify(this.keys));
        this.store.setItem(prefixKey, JSON.stringify(value));
        resolve();
      }).bind(this));
    }
  }, {
    key: 'get',
    value: function get(key) {
      var prefixKey = this._key(key);
      return new Promise((function (resolve, reject) {
        var result = this.map[prefixKey];
        if (result) {
          resolve(result);
        } else {
          this.store.getItem(prefixKey).then(function (jsonStr) {
            if (jsonStr) {
              var cachedJSON = JSON.parse(jsonStr);
              resolve(cachedJSON);
            } else {
              reject();
            }
          }, function (err) {
            reject(err);
          });
        }
      }).bind(this));
    }
  }, {
    key: 'reset',
    value: function reset() {
      var _store = this.store;
      var removal = _lodash2['default'].map(this.keys, function (key) {
        return _store.removeItem(key);
      });
      this.keys = [];
      removal.push(this.store.setItem(this._keyStore, JSON.stringify(this.keys)));
      return Promise.all(removal);
    }
  }]);

  return Cache;
})();

exports['default'] = Cache;
module.exports = exports['default'];