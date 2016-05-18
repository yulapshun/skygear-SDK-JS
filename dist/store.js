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
var store;

if (typeof window !== 'undefined') {
  var localforage = require('localforage');

  var rn = require('react-native');

  if (rn && rn.AsyncStorage) {
    var AsyncStorage = rn.AsyncStorage;
    var ReactNativeDriver = {
      _driver: 'ReactNativeAsyncStorage',
      _support: true,
      _initStorage: function _initStorage(options) {
        //eslint-disable-line
        console.log('Init ReactNativeAsyncStorage');
        return;
      },
      clear: function clear(callback) {
        return AsyncStorage.clear(callback);
      },
      getItem: function getItem(key, callback) {
        return AsyncStorage.getItem(key, callback);
      },
      setItem: function setItem(key, value, callback) {
        return AsyncStorage.setItem(key, value, callback);
      },
      removeItem: function removeItem(key, callback) {
        return AsyncStorage.removeItem(key, callback);
      },
      key: function key(n, callback) {
        //eslint-disable-line
        throw Error('Not support key in ReactNativeAsyncStorage');
      },
      keys: function keys(callback) {
        AsyncStorage.getAllKeys(callback);
      },
      length: function length(callback) {
        //eslint-disable-line
        throw Error('Not support length in ReactNativeAsyncStorage');
      },
      iterate: function iterate(iterator, callback) {
        //eslint-disable-line
        // localForage doc is incorrect,
        // https://mozilla.github.io/localForage/#config
        throw Error('Not support iterate in ReactNativeAsyncStorage');
      }
    };

    store = ReactNativeDriver;
  } else {
    store = localforage;
  }
} else {
  var localStorage = require('localStorage');

  store = {
    clear: function clear(callback) {
      return new Promise(function (resolve) {
        localStorage.clear();
        if (callback) {
          callback();
        }
        resolve();
      });
    },
    getItem: function getItem(key, callback) {
      return new Promise(function (resolve) {
        var value = localStorage.getItem(key);
        if (callback) {
          callback(null, value);
        }
        resolve(value);
      });
    },
    setItem: function setItem(key, value, callback) {
      return new Promise(function (resolve) {
        localStorage.setItem(key, value);
        if (callback) {
          callback(value);
        }
        resolve(value);
      });
    },
    removeItem: function removeItem(key, callback) {
      return new Promise(function (resolve) {
        localStorage.removeItem(key);
        if (callback) {
          callback();
        }
        resolve();
      });
    }
  };
}

exports['default'] = store;
module.exports = exports['default'];