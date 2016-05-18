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
/* eslint camelcase: 0 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _asset = require('./asset');

var _asset2 = _interopRequireDefault(_asset);

var _user = require('./user');

var _user2 = _interopRequireDefault(_user);

var _role = require('./role');

var _role2 = _interopRequireDefault(_role);

var _acl = require('./acl');

var _acl2 = _interopRequireDefault(_acl);

var _record = require('./record');

var _record2 = _interopRequireDefault(_record);

var _reference = require('./reference');

var _reference2 = _interopRequireDefault(_reference);

var _query = require('./query');

var _query2 = _interopRequireDefault(_query);

var _database = require('./database');

var _database2 = _interopRequireDefault(_database);

var _pubsub = require('./pubsub');

var _pubsub2 = _interopRequireDefault(_pubsub);

var _relation = require('./relation');

var _geolocation = require('./geolocation');

var _geolocation2 = _interopRequireDefault(_geolocation);

var _type = require('./type');

var _error = require('./error');

var _util = require('./util');

var request = require('superagent');
var _ = require('lodash');
var store = require('./store');
var ee = require('event-emitter');

var React;
if (typeof window !== 'undefined') {
  React = require('react-native');
}

var USER_CHANGED = 'userChanged';

var Container = (function () {
  function Container() {
    _classCallCheck(this, Container);

    this.url = 'undefined';
    this.apiKey = null;
    this.token = null;
    this._accessToken = null;
    this._user = null;
    this._deviceID = null;
    this._getAccessToken();
    this._getDeviceID();
    this._privateDB = null;
    this._publicDB = null;
    this.request = request;
    this._internalPubsub = new _pubsub2['default'](this, true);
    this._relation = new _relation.RelationAction(this);
    this._pubsub = new _pubsub2['default'](this, false);
    this.autoPubsub = true;
    this.ee = ee({});
  }

  _createClass(Container, [{
    key: 'config',
    value: function config(options) {
      if (options.apiKey) {
        this.apiKey = options.apiKey;
      }
      if (options.endPoint) {
        this.endPoint = options.endPoint;
      }

      var promises = [this._getUser(), this._getAccessToken(), this._getDeviceID()];
      var self = this;
      return Promise.all(promises).then(function () {
        self.reconfigurePubsubIfNeeded();
        return self;
      }, function () {
        return self;
      });
    }
  }, {
    key: 'configApiKey',
    value: function configApiKey(ApiKey) {
      this.apiKey = ApiKey;
    }
  }, {
    key: 'clearCache',
    value: function clearCache() {
      var clear = [];
      if (this._publicDB) {
        clear.push(this._publicDB.clearCache());
      }
      if (this._privateDB) {
        clear.push(this._privateDB.clearCache());
      }
      return Promise.all(clear);
    }
  }, {
    key: 'onUserChanged',
    value: function onUserChanged(listener) {
      this.ee.on(USER_CHANGED, listener);
      return new _util.EventHandle(this.ee, USER_CHANGED, listener);
    }
  }, {
    key: 'signupWithUsername',
    value: function signupWithUsername(username, password) {
      return this._signup(username, null, password);
    }
  }, {
    key: 'signupWithEmail',
    value: function signupWithEmail(email, password) {
      return this._signup(null, email, password);
    }
  }, {
    key: '_signup',
    value: function _signup(username, email, password) {
      var container = this;
      return new Promise(function (resolve, reject) {
        container.makeRequest('auth:signup', {
          username: username,
          email: email,
          password: password
        }).then(container._authResolve.bind(container)).then(resolve, reject);
      });
    }
  }, {
    key: '_authResolve',
    value: function _authResolve(body) {
      var self = this;
      return Promise.all([this._setUser(body.result), this._setAccessToken(body.result.access_token)]).then(function () {
        self.reconfigurePubsubIfNeeded();
        return self.currentUser;
      });
    }
  }, {
    key: 'loginWithUsername',
    value: function loginWithUsername(username, password) {
      var container = this;
      return new Promise(function (resolve, reject) {
        container.makeRequest('auth:login', {
          username: username,
          password: password
        }).then(container._authResolve.bind(container)).then(resolve, reject);
      });
    }
  }, {
    key: 'loginWithEmail',
    value: function loginWithEmail(email, password) {
      var container = this;
      return new Promise(function (resolve, reject) {
        container.makeRequest('auth:login', {
          email: email,
          password: password
        }).then(container._authResolve.bind(container)).then(resolve, reject);
      });
    }
  }, {
    key: 'loginWithProvider',
    value: function loginWithProvider(provider, authData) {
      var container = this;
      return new Promise(function (resolve, reject) {
        container.makeRequest('auth:login', {
          provider: provider,
          auth_data: authData
        }).then(container._authResolve.bind(container)).then(resolve, reject);
      });
    }
  }, {
    key: 'logout',
    value: function logout() {
      var container = this;
      this.clearCache();
      return container.makeRequest('auth:logout', {}).then(function () {
        return Promise.all([container._setAccessToken(null), container._setUser(null)]).then(function () {
          return null;
        });
      }, function (err) {
        return container._setAccessToken(null).then(function () {
          return Promise.reject(err);
        });
      });
    }
  }, {
    key: 'changePassword',
    value: function changePassword(oldPassword, newPassword) {
      var invalidate = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      if (invalidate) {
        throw Error('Invalidate is not yet implements');
      }
      var container = this;
      return new Promise(function (resolve, reject) {
        container.makeRequest('auth:password', {
          old_password: oldPassword,
          password: newPassword
        }).then(function (body) {
          return container._setAccessToken(body.result.access_token);
        }).then(resolve, reject);
      });
    }
  }, {
    key: 'saveUser',
    value: function saveUser(user) {
      var container = this;
      return new Promise(function (resolve, reject) {
        container.makeRequest('user:update', {
          _id: user.id, // eslint-disable-line camelcase
          email: user.email,
          roles: _.map(user.roles, function (perRole) {
            return perRole.name;
          })
        }).then(function (body) {
          resolve(container.User.fromJSON(body.result));
        }, function (err) {
          reject(err);
        });
      });
    }
  }, {
    key: 'getUsersByEmail',
    value: function getUsersByEmail(emails) {
      var container = this;
      return new Promise(function (resolve, reject) {
        container.makeRequest('user:query', {
          emails: emails
        }).then(function (body) {
          var result = body.result;
          var length = result.length;
          var users = new Array(length);
          for (var i = 0; i < length; i++) {
            users[i] = new container.User(result[i].data);
          }
          resolve(users);
        }, function (err) {
          reject(err);
        });
      });
    }
  }, {
    key: 'setAdminRole',
    value: function setAdminRole(roles) {
      var roleNames = _.map(roles, function (perRole) {
        return perRole.name;
      });

      var container = this;
      return new Promise(function (resolve, reject) {
        container.makeRequest('role:admin', {
          roles: roleNames
        }).then(function (body) {
          resolve(body.result);
        }, function (err) {
          reject(err);
        });
      });
    }
  }, {
    key: 'setDefaultRole',
    value: function setDefaultRole(roles) {
      var roleNames = _.map(roles, function (perRole) {
        return perRole.name;
      });

      var container = this;
      return new Promise(function (resolve, reject) {
        container.makeRequest('role:default', {
          roles: roleNames
        }).then(function (body) {
          resolve(body.result);
        }, function (err) {
          reject(err);
        });
      });
    }
  }, {
    key: 'setDefaultACL',
    value: function setDefaultACL(acl) {
      this.Record.defaultACL = acl;
    }
  }, {
    key: 'setRecordCreateAccess',
    value: function setRecordCreateAccess(recordClass, roles) {
      var roleNames = _.map(roles, function (perRole) {
        return perRole.name;
      });

      var container = this;
      return new Promise(function (resolve, reject) {
        container.makeRequest('schema:access', {
          type: recordClass.recordType,
          create_roles: roleNames
        }).then(function (body) {
          resolve(body.result);
        }, function (err) {
          reject(err);
        });
      });
    }
  }, {
    key: 'registerDevice',
    value: function registerDevice(token, type) {
      if (!token) {
        throw new Error('Token cannot be empty');
      }

      if (!type) {
        if (React) {
          if (React.Platform.OS === 'ios') {
            type = 'ios';
          } else {
            type = 'android';
          }
        } else {
          // TODO: probably web / node, handle it later
          throw new Error('Failed to infer type, please supply a value');
        }
      }

      var deviceID = undefined;
      if (this.deviceID) {
        deviceID = this.deviceID;
      }

      var self = this;
      return self.makeRequest('device:register', {
        type: type,
        id: deviceID,
        device_token: token
      }).then(function (body) {
        return self._setDeviceID(body.result.id);
      }, function (error) {
        // Will set the deviceID to null and try again iff deviceID is not null.
        // The deviceID can be deleted remotely, by apns feedback.
        // If the current deviceID is already null, will regards as server fail.
        var skyerr = null;
        if (error.error) {
          skyerr = error.error.code;
        }
        if (self.deviceID && skyerr === 110) {
          return self._setDeviceID(null).then(function () {
            return self.registerDevice(token, type);
          });
        } else {
          return Promise.reject(error);
        }
      });
    }
  }, {
    key: 'lambda',
    value: function lambda(name, data) {
      var container = this;
      return new Promise(function (resolve, reject) {
        container.makeRequest(name, {
          args: data
        }).then(function (resp) {
          resolve(resp.result);
        }, reject);
      });
    }
  }, {
    key: 'makeUploadAssetRequest',
    value: function makeUploadAssetRequest(asset) {
      var self = this;
      return new Promise(function (resolve, reject) {
        self.request.put(self.url + 'files/' + encodeURIComponent(asset.name)).set('X-Skygear-API-Key', self.apiKey).set('Content-Type', asset.contentType).set('Accept', 'application/json').send(asset.file).end(function (err, res) {
          // Do an application JSON parse beacuse in some condition, the
          // content-type header will got strip and it will not deserial
          // the json for us.
          var body = getRespJSON(res);
          if (err) {
            var skyErr = body.error || err;
            reject({
              status: err.status,
              error: skyErr
            });
          } else {
            var newAsset = _asset2['default'].fromJSON(body.result);
            resolve(newAsset);
          }
        });
      });
    }
  }, {
    key: 'makeRequest',
    value: function makeRequest(action, data) {
      var container = this;
      if (this.apiKey === null) {
        throw Error('Please config ApiKey');
      }
      var _data = _.assign({
        action: action,
        api_key: this.apiKey,
        access_token: this.accessToken
      }, data);
      var _action = action.replace(':', '/');
      var _request = this.request.post(this.url + _action).set('X-Skygear-API-Key', this.apiKey).set('X-Skygear-Access-Token', this.accessToken).set('Accept', 'application/json').send(_data);
      return new Promise(function (resolve, reject) {
        _request.end(function (err, res) {
          // Do an application JSON parse beacuse in some condition, the
          // content-type header will got strip and it will not deserial
          // the json for us.
          var body = getRespJSON(res);

          if (err) {
            var _ret = (function () {
              var skyErr = body.error || err;
              if (skyErr.code === _error.AccessTokenNotAccepted) {
                return {
                  v: Promise.all([container._setAccessToken(null), container._setUser(null)]).then(function () {
                    reject({
                      status: err.status,
                      error: skyErr
                    });
                  })
                };
              }
              reject({
                status: err.status,
                error: skyErr
              });
            })();

            if (typeof _ret === 'object') return _ret.v;
          } else {
            resolve(body);
          }
        });
      });
    }
  }, {
    key: '_getUser',
    value: function _getUser() {
      var self = this;
      return store.getItem('skygear-user').then(function (userJSON) {
        var attrs = JSON.parse(userJSON);
        self._user = self.User.fromJSON(attrs);
      }, function (err) {
        console.warn('Failed to get user', err);
        self._user = null;
        return null;
      });
    }
  }, {
    key: '_setUser',
    value: function _setUser(attrs) {
      var container = this;
      var value = undefined;
      if (attrs !== null) {
        this._user = new this.User(attrs);
        value = JSON.stringify(this._user.toJSON());
      } else {
        this._user = null;
        value = null;
      }

      var setItem = value === null ? store.removeItem('skygear-user') : store.setItem('skygear-user', value);
      return setItem.then(function () {
        container.ee.emit(USER_CHANGED, container._user);
        return value;
      }, function (err) {
        console.warn('Failed to persist user', err);
        return value;
      });
    }
  }, {
    key: '_getAccessToken',
    value: function _getAccessToken() {
      var self = this;
      return store.getItem('skygear-accesstoken').then(function (token) {
        self._accessToken = token;
        return token;
      }, function (err) {
        console.warn('Failed to get access', err);
        self._accessToken = null;
        return null;
      });
    }
  }, {
    key: '_setAccessToken',
    value: function _setAccessToken(value) {
      this._accessToken = value;
      var setItem = value === null ? store.removeItem('skygear-accesstoken') : store.setItem('skygear-accesstoken', value);
      return setItem.then(function () {
        return value;
      }, function (err) {
        console.warn('Failed to persist accesstoken', err);
        return value;
      });
    }
  }, {
    key: '_getDeviceID',
    value: function _getDeviceID() {
      var self = this;
      return store.getItem('skygear-deviceid').then(function (deviceID) {
        self._deviceID = deviceID;
        return deviceID;
      }, function (err) {
        console.warn('Failed to get deviceid', err);
        self._deviceID = null;
        return null;
      });
    }
  }, {
    key: '_setDeviceID',
    value: function _setDeviceID(value) {
      var self = this;
      this._deviceID = value;
      var setItem = value === null ? store.removeItem('skygear-deviceid') : store.setItem('skygear-deviceid', value);
      return setItem.then(function () {
        return value;
      }, function (err) {
        console.warn('Failed to persist deviceid', err);
        return value;
      }).then(function (deviceID) {
        self.reconfigurePubsubIfNeeded();
        return deviceID;
      });
    }
  }, {
    key: 'reconfigurePubsubIfNeeded',
    value: function reconfigurePubsubIfNeeded() {
      if (!this.autoPubsub) {
        return;
      }

      this._internalPubsub.reset();
      if (this.deviceID !== null) {
        this._internalPubsub.subscribe('_sub_' + this.deviceID, function (data) {
          console.log('Receivied data for subscription: ' + data);
        });
      }
      this._internalPubsub.reconfigure();
      this._pubsub.reconfigure();
    }
  }, {
    key: 'on',
    value: function on(channel, callback) {
      return this.pubsub.on(channel, callback);
    }
  }, {
    key: 'off',
    value: function off(channel) {
      var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      this.pubsub.off(channel, callback);
    }
  }, {
    key: 'defaultACL',
    get: function get() {
      return this.Record.defaultACL;
    }
  }, {
    key: 'Query',
    get: function get() {
      return _query2['default'];
    }
  }, {
    key: 'User',
    get: function get() {
      return _user2['default'];
    }
  }, {
    key: 'Role',
    get: function get() {
      return _role2['default'];
    }
  }, {
    key: 'ACL',
    get: function get() {
      return _acl2['default'];
    }
  }, {
    key: 'Record',
    get: function get() {
      return _record2['default'];
    }
  }, {
    key: 'Sequence',
    get: function get() {
      return _type.Sequence;
    }
  }, {
    key: 'Asset',
    get: function get() {
      return _asset2['default'];
    }
  }, {
    key: 'Reference',
    get: function get() {
      return _reference2['default'];
    }
  }, {
    key: 'Geolocation',
    get: function get() {
      return _geolocation2['default'];
    }
  }, {
    key: 'currentUser',
    get: function get() {
      return this._user;
    }
  }, {
    key: 'accessToken',
    get: function get() {
      return this._accessToken;
    }
  }, {
    key: 'deviceID',
    get: function get() {
      return this._deviceID;
    }
  }, {
    key: 'endPoint',
    get: function get() {
      return this.url;
    },
    set: function set(newEndPoint) {
      // TODO: Check the format
      if (newEndPoint) {
        this.url = newEndPoint;
      }
    }
  }, {
    key: 'publicDB',
    get: function get() {
      if (this._publicDB === null) {
        this._publicDB = new _database2['default']('_public', this);
      }
      return this._publicDB;
    }
  }, {
    key: 'privateDB',
    get: function get() {
      if (this.accessToken === null) {
        throw new Error('You must login before access to privateDB');
      }
      if (this._privateDB === null) {
        this._privateDB = new _database2['default']('_private', this);
      }
      return this._privateDB;
    }
  }, {
    key: 'relation',
    get: function get() {
      return this._relation;
    }
  }, {
    key: 'pubsub',
    get: function get() {
      return this._pubsub;
    }
  }]);

  return Container;
})();

exports['default'] = Container;

function getRespJSON(res) {
  if (res && res.body) {
    return res.body;
  }
  if (res && res.text) {
    try {
      return JSON.parse(res.text);
    } catch (err) {
      console.log('getRespJSON error. error: ', err);
    }
  }

  return {};
}
module.exports = exports['default'];