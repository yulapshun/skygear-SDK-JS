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

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _user = require('./user');

var _user2 = _interopRequireDefault(_user);

var _ = require('lodash');

var Outward = 'outward';
exports.Outward = Outward;
var Inward = 'inward';
exports.Inward = Inward;
var Mutual = 'mutual';

exports.Mutual = Mutual;
var format = /^[a-zA-Z]+$/;

var Relation = (function () {
  function Relation(identifier, direction) {
    var targets = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

    _classCallCheck(this, Relation);

    if (!Relation.validName(identifier)) {
      throw new Error('Relation identifier can only be [a-zA-Z]+');
    }
    this.identifier = identifier;
    if (Relation.validDirection(direction)) {
      this.direction = direction;
    } else {
      throw new Error('Relation direction not supported.');
    }
    this.targets = targets;
    this.fails = [];
  }

  _createClass(Relation, [{
    key: 'targetsID',
    get: function get() {
      return _.map(this.targets, function (user) {
        return user.id;
      });
    }
  }], [{
    key: 'validDirection',
    value: function validDirection(direction) {
      return direction === Mutual || direction === Outward || direction === Inward;
    }
  }, {
    key: 'validName',
    value: function validName(identifier) {
      return format.test(identifier);
    }
  }]);

  return Relation;
})();

exports.Relation = Relation;

var RelationQuery = (function () {
  function RelationQuery(relationCls) {
    _classCallCheck(this, RelationQuery);

    this.identifier = relationCls.prototype.identifier;
    this.direction = relationCls.prototype.direction;
    this.limit = 50;
    this.page = 0;
  }

  _createClass(RelationQuery, [{
    key: 'toJSON',
    value: function toJSON() {
      return {
        name: this.identifier,
        direction: this.direction,
        limit: this.limit,
        page: this.page
      };
    }
  }]);

  return RelationQuery;
})();

exports.RelationQuery = RelationQuery;

var RelationResult = function RelationResult(results) {
  _classCallCheck(this, RelationResult);

  this.count = 0;
  this.success = [];
  this.fails = [];
  this.partialError = false;
  var len = results.length;
  for (var i = 0; i < len; i++) {
    if (results[i].type === 'error') {
      this.fails.push(results[i]);
      this.partialError = true;
    } else {
      this.success.push(new _user2['default'](results[i].data));
    }
  }
};

exports.RelationResult = RelationResult;

var RelationQueryResult = (function (_Array) {
  _inherits(RelationQueryResult, _Array);

  function RelationQueryResult() {
    _classCallCheck(this, RelationQueryResult);

    _get(Object.getPrototypeOf(RelationQueryResult.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(RelationQueryResult, [{
    key: 'overallCount',
    get: function get() {
      return this._overallCount;
    }
  }], [{
    key: 'createFromBody',
    value: function createFromBody(body) {
      var users = _.map(body.result, function (attrs) {
        return new _user2['default'](attrs.data);
      });
      var result = RelationQueryResult.from(users);
      var info = body.info;
      result._overallCount = info ? info.count : undefined;
      return result;
    }
  }]);

  return RelationQueryResult;
})(Array);

exports.RelationQueryResult = RelationQueryResult;

var RelationAction = (function () {
  function RelationAction(container) {
    _classCallCheck(this, RelationAction);

    this.container = container;
  }

  _createClass(RelationAction, [{
    key: 'query',
    value: function query(queryObj) {
      var relationAction = this;
      return new Promise(function (resolve, reject) {
        relationAction.container.makeRequest('relation:query', queryObj.toJSON()).then(function (body) {
          var users = RelationQueryResult.createFromBody(body);
          resolve(users);
        }, function (err) {
          reject(err);
        });
      });
    }
  }, {
    key: 'queryFriend',
    value: function queryFriend(actor) {
      if (actor === null) {
        actor = this.container.currentUser;
      }
      var query = new RelationQuery(this.Friend);
      query.user = actor;
      return this.query(query);
    }
  }, {
    key: 'queryFollower',
    value: function queryFollower(actor) {
      if (actor === null) {
        actor = this.container.currentUser;
      }
      var query = new RelationQuery(this.Follower);
      query.user = actor;
      return this.query(query);
    }
  }, {
    key: 'queryFollowing',
    value: function queryFollowing(actor) {
      if (actor === null) {
        actor = this.container.currentUser;
      }
      var query = new RelationQuery(this.Following);
      query.user = actor;
      return this.query(query);
    }
  }, {
    key: 'add',
    value: function add(relation) {
      return new Promise((function (resolve, reject) {
        this.container.makeRequest('relation:add', {
          name: relation.identifier,
          direction: relation.direction,
          targets: relation.targetsID
        }).then(function (body) {
          var result = new RelationResult(body.result);
          resolve(result);
        }, function (err) {
          reject(err);
        });
      }).bind(this));
    }
  }, {
    key: 'remove',
    value: function remove(relation) {
      return new Promise((function (resolve, reject) {
        this.container.makeRequest('relation:remove', {
          name: relation.identifier,
          direction: relation.direction,
          targets: relation.targetsID
        }).then(function (body) {
          var result = new RelationResult(body.result);
          resolve(result);
        }, function (err) {
          reject(err);
        });
      }).bind(this));
    }
  }, {
    key: 'Query',
    get: function get() {
      return RelationQuery;
    }
  }, {
    key: 'Friend',
    get: function get() {
      return RelationAction.extend('friend', Mutual);
    }
  }, {
    key: 'Follower',
    get: function get() {
      return RelationAction.extend('follow', Inward);
    }
  }, {
    key: 'Following',
    get: function get() {
      return RelationAction.extend('follow', Outward);
    }
  }], [{
    key: 'extend',
    value: function extend(identifier, direction) {
      if (!Relation.validName(identifier)) {
        throw new Error('Relation identifier can only be [a-zA-Z]+');
      }
      var RelationProto = {
        identifier: identifier,
        direction: direction
      };
      function RelationCls() {
        var targets = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        Relation.call(this, identifier, direction);
        this.targets = targets;
      }
      RelationCls.prototype = _.create(Relation.prototype, RelationProto);
      return RelationCls;
    }
  }]);

  return RelationAction;
})();

exports.RelationAction = RelationAction;