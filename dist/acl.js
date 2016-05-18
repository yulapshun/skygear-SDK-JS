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

var _AccessLevelMap;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _role = require('./role');

var _role2 = _interopRequireDefault(_role);

var _user = require('./user');

var _user2 = _interopRequireDefault(_user);

var AccessLevel = {
  NoAccessLevel: null,
  ReadOnlyLevel: 'read',
  ReadWriteLevel: 'write'
};

exports.AccessLevel = AccessLevel;
var AccessLevelMap = (_AccessLevelMap = {}, _defineProperty(_AccessLevelMap, AccessLevel.NoAccessLevel, 0), _defineProperty(_AccessLevelMap, AccessLevel.ReadOnlyLevel, 1), _defineProperty(_AccessLevelMap, AccessLevel.ReadWriteLevel, 2), _AccessLevelMap);

function accessLevelNumber(level) {
  return AccessLevelMap[level] || 0;
}

var ACL = (function () {
  function ACL(attrs) {
    var _this = this;

    _classCallCheck(this, ACL);

    // default ACL: public read only
    this['public'] = AccessLevel.ReadOnlyLevel;
    this.roles = {};
    this.users = {};

    if (attrs) {
      (function () {
        _this['public'] = AccessLevel.NoAccessLevel;

        var self = _this;
        _lodash2['default'].forEach(attrs, function (perAttr) {
          perAttr.level = perAttr.level || AccessLevel.ReadOnlyLevel;
          if (perAttr['public']) {
            if (accessLevelNumber(perAttr.level) > accessLevelNumber(self['public'])) {
              self['public'] = perAttr.level;
            }
          } else if (perAttr.role) {
            var theRole = _role2['default'].define(perAttr.role);
            var currentLevel = self.roles[theRole.name];
            if (accessLevelNumber(perAttr.level) > accessLevelNumber(currentLevel)) {
              self.roles[theRole.name] = perAttr.level;
            }
          } else if (perAttr.user_id) {
            var theUser = new _user2['default']({ user_id: perAttr.user_id }); //eslint-disable-line
            var currentLevel = self.users[theUser.id];
            if (accessLevelNumber(perAttr.level) > accessLevelNumber(currentLevel)) {
              self.users[theUser.id] = perAttr.level;
            }
          } else {
            throw new Error('Invalid ACL Entry: ' + JSON.stringify(perAttr));
          }
        });
      })();
    }
  }

  _createClass(ACL, [{
    key: 'toJSON',
    value: function toJSON() {
      var json = [];
      if (this['public']) {
        json.push({
          'public': true,
          level: this['public']
        });
      }

      _lodash2['default'].map(this.roles, function (perRoleLevel, perRoleName) {
        if (perRoleLevel) {
          json.push({
            role: perRoleName,
            level: perRoleLevel
          });
        }
      });

      _lodash2['default'].map(this.users, function (perUserLevel, perUserId) {
        if (perUserLevel) {
          json.push({
            user_id: perUserId, //eslint-disable-line
            level: perUserLevel
          });
        }
      });

      return json;
    }
  }, {
    key: 'setPublicNoAccess',
    value: function setPublicNoAccess() {
      this['public'] = AccessLevel.NoAccessLevel;
    }
  }, {
    key: 'setPublicReadOnly',
    value: function setPublicReadOnly() {
      this['public'] = AccessLevel.ReadOnlyLevel;
    }
  }, {
    key: 'setPublicReadWriteAccess',
    value: function setPublicReadWriteAccess() {
      this['public'] = AccessLevel.ReadWriteLevel;
    }
  }, {
    key: 'setNoAccessForRole',
    value: function setNoAccessForRole(role) {
      if (!role || !(role instanceof _role2['default'])) {
        throw new Error(role + ' is not a role.');
      }

      this.roles[role.name] = AccessLevel.NoAccessLevel;
    }
  }, {
    key: 'setReadOnlyForRole',
    value: function setReadOnlyForRole(role) {
      if (!role || !(role instanceof _role2['default'])) {
        throw new Error(role + ' is not a role.');
      }

      this.roles[role.name] = AccessLevel.ReadOnlyLevel;
    }
  }, {
    key: 'setReadWriteAccessForRole',
    value: function setReadWriteAccessForRole(role) {
      if (!role || !(role instanceof _role2['default'])) {
        throw new Error(role + ' is not a role.');
      }

      this.roles[role.name] = AccessLevel.ReadWriteLevel;
    }
  }, {
    key: 'setNoAccessForUser',
    value: function setNoAccessForUser(user) {
      if (!user || !(user instanceof _user2['default'])) {
        throw new Error(user + ' is not a user.');
      }

      this.users[user.id] = AccessLevel.NoAccessLevel;
    }
  }, {
    key: 'setReadOnlyForUser',
    value: function setReadOnlyForUser(user) {
      if (!user || !(user instanceof _user2['default'])) {
        throw new Error(user + ' is not a user.');
      }

      this.users[user.id] = AccessLevel.ReadOnlyLevel;
    }
  }, {
    key: 'setReadWriteAccessForUser',
    value: function setReadWriteAccessForUser(user) {
      if (!user || !(user instanceof _user2['default'])) {
        throw new Error(user + ' is not a user.');
      }

      this.users[user.id] = AccessLevel.ReadWriteLevel;
    }
  }, {
    key: 'hasPublicReadAccess',
    value: function hasPublicReadAccess() {
      return accessLevelNumber(this['public']) >= accessLevelNumber(AccessLevel.ReadOnlyLevel);
    }
  }, {
    key: 'hasPublicWriteAccess',
    value: function hasPublicWriteAccess() {
      return accessLevelNumber(this['public']) === accessLevelNumber(AccessLevel.ReadWriteLevel);
    }
  }, {
    key: 'hasReadAccess',
    value: function hasReadAccess(role) {
      return this.hasReadAccessForRole(role);
    }
  }, {
    key: 'hasWriteAccess',
    value: function hasWriteAccess(role) {
      return this.hasWriteAccessForRole(role);
    }
  }, {
    key: 'hasReadAccessForRole',
    value: function hasReadAccessForRole(role) {
      if (!role || !(role instanceof _role2['default'])) {
        throw new Error(role + ' is not a role.');
      }

      return this.hasPublicReadAccess() || accessLevelNumber(this.roles[role.name]) >= accessLevelNumber(AccessLevel.ReadOnlyLevel);
    }
  }, {
    key: 'hasWriteAccessForRole',
    value: function hasWriteAccessForRole(role) {
      if (!role || !(role instanceof _role2['default'])) {
        throw new Error(role + ' is not a role.');
      }

      return this.hasPublicWriteAccess() || accessLevelNumber(this.roles[role.name]) >= accessLevelNumber(AccessLevel.ReadWriteLevel);
    }
  }, {
    key: 'hasReadAccessForUser',
    value: function hasReadAccessForUser(user) {
      if (!user || !(user instanceof _user2['default'])) {
        throw new Error(user + ' is not a user.');
      }

      var roles = user.roles;

      if (this.hasPublicReadAccess() || accessLevelNumber(this.users[user.id]) >= accessLevelNumber(AccessLevel.ReadOnlyLevel)) {
        return true;
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = roles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var role = _step.value;

          if (this.hasReadAccessForRole(role)) {
            return true;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return false;
    }
  }, {
    key: 'hasWriteAccessForUser',
    value: function hasWriteAccessForUser(user) {
      if (!user || !(user instanceof _user2['default'])) {
        throw new Error(user + ' is not a user.');
      }

      var roles = user.roles;

      if (this.hasPublicWriteAccess() || accessLevelNumber(this.users[user.id]) >= accessLevelNumber(AccessLevel.ReadWriteLevel)) {
        return true;
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = roles[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var role = _step2.value;

          if (this.hasWriteAccessForRole(role)) {
            return true;
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2['return']) {
            _iterator2['return']();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return false;
    }
  }], [{
    key: 'fromJSON',
    value: function fromJSON(attrs) {
      return new ACL(attrs);
    }
  }]);

  return ACL;
})();

exports['default'] = ACL;