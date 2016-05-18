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

var _role = require('./role');

var _role2 = _interopRequireDefault(_role);

var User = (function () {
  function User(attrs) {
    _classCallCheck(this, User);

    var id = attrs.user_id || attrs._id; //eslint-disable-line
    if (!_lodash2['default'].isString(id)) {
      throw new Error('Missing user_id.');
    }
    this.email = attrs.email;
    this.username = attrs.username;
    this.id = id;

    this.roles = [];
    if (attrs.roles) {
      this.roles = _lodash2['default'].map(attrs.roles, _role2['default'].define);
    }
  }

  _createClass(User, [{
    key: 'toJSON',
    value: function toJSON() {
      return {
        user_id: this.id, //eslint-disable-line
        username: this.username,
        email: this.email,
        roles: _lodash2['default'].map(this.roles, function (perRole) {
          return perRole.name;
        })
      };
    }
  }, {
    key: 'addRole',
    value: function addRole(role) {
      this.roles = _role2['default'].union(this.roles, role);
    }
  }, {
    key: 'removeRole',
    value: function removeRole(role) {
      this.roles = _role2['default'].subtract(this.roles, role);
    }
  }, {
    key: 'hasRole',
    value: function hasRole(role) {
      return _role2['default'].contain(this.roles, role);
    }
  }], [{
    key: 'fromJSON',
    value: function fromJSON(attrs) {
      return new User(attrs);
    }
  }]);

  return User;
})();

exports['default'] = User;
module.exports = exports['default'];