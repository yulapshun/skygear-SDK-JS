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

var _Base64 = require('Base64');

var _w3cBlob = require('w3c-blob');

var _w3cBlob2 = _interopRequireDefault(_w3cBlob);

var Asset = (function () {
  function Asset(attrs) {
    _classCallCheck(this, Asset);

    attrs = attrs || {};

    var name = attrs.name;
    var file = attrs.file;
    var contentType = attrs.contentType;
    var url = attrs.url;
    var base64 = attrs.base64;

    if (!name) {
      throw new Error('Name should not be empty');
    }
    if (file) {
      if (!contentType && file.type) {
        contentType = file.type;
      }
      if (!contentType) {
        throw new Error('ContentType cannot be inferred from file, ' + 'please provide a content type manually');
      }
    } else if (url) {
      // do nothing
    } else if (base64) {
        file = base64StringtoBlob(base64);
      } else {
        throw new Error('Either file or url should present');
      }

    this.name = name;
    this.file = file;
    this.contentType = contentType;
    this.url = url;
  }

  // adapted from https://gist.github.com/fupslot/5015897

  _createClass(Asset, [{
    key: 'toJSON',
    value: function toJSON() {
      return {
        $type: 'asset',
        $name: this.name
      };
    }
  }], [{
    key: 'fromJSON',
    value: function fromJSON(attrs) {
      return new Asset({
        name: attrs.$name,
        url: attrs.$url
      });
    }
  }]);

  return Asset;
})();

exports['default'] = Asset;
function base64StringtoBlob(base64) {
  var byteString = (0, _Base64.atob)(base64);

  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  var bb = new _w3cBlob2['default']([ab]);
  return bb;
}
module.exports = exports['default'];