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

var _record = require('./record');

var _record2 = _interopRequireDefault(_record);

var Reference = (function () {
  function Reference(attrs) {
    _classCallCheck(this, Reference);

    var id;
    if (typeof attrs === 'string') {
      id = attrs;
    } else {
      id = attrs.$id;
      if (!id) {
        id = attrs.id;
      }
    }

    if (!id) {
      throw new Error('Empty record id');
    }

    // parse solely to test for string id validity
    _record2['default'].parseID(id);

    this._id = id;
  }

  _createClass(Reference, [{
    key: 'toJSON',
    value: function toJSON() {
      return {
        $id: this._id,
        $type: 'ref'
      };
    }
  }, {
    key: 'id',
    get: function get() {
      return this._id;
    }
  }]);

  return Reference;
})();

exports['default'] = Reference;
module.exports = exports['default'];