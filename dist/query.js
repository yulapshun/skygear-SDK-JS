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

var _md5 = require('md5');

var _md52 = _interopRequireDefault(_md5);

var _util = require('./util');

var _record = require('./record');

var _record2 = _interopRequireDefault(_record);

var Query = (function () {
  function Query(recordCls) {
    _classCallCheck(this, Query);

    if (!_record2['default'].validType(recordCls.recordType)) {
      throw new Error('RecordType is not valid. Please start with alphanumeric string.');
    }
    this.recordCls = recordCls;
    this.recordType = recordCls.recordType;
    this._predicate = [];
    this._orPredicate = [];
    this._sort = [];
    this._include = {};
    this._negation = false;
    this.overallCount = false;
    this.limit = 50;
    this.offset = 0;
  }

  _createClass(Query, [{
    key: 'like',
    value: function like(key, value) {
      this._predicate.push(['like', { $type: 'keypath', $val: key }, value]);
      return this;
    }
  }, {
    key: 'notLike',
    value: function notLike(key, value) {
      this._predicate.push(['not', ['like', { $type: 'keypath', $val: key }, value]]);

      return this;
    }
  }, {
    key: 'caseInsensitiveLike',
    value: function caseInsensitiveLike(key, value) {
      this._predicate.push(['ilike', { $type: 'keypath', $val: key }, value]);
      return this;
    }
  }, {
    key: 'caseInsensitiveNotLike',
    value: function caseInsensitiveNotLike(key, value) {
      this._predicate.push(['not', ['ilike', { $type: 'keypath', $val: key }, value]]);
      return this;
    }
  }, {
    key: 'equalTo',
    value: function equalTo(key, value) {
      this._predicate.push(['eq', { $type: 'keypath', $val: key }, value]);
      return this;
    }
  }, {
    key: 'notEqualTo',
    value: function notEqualTo(key, value) {
      this._predicate.push(['neq', { $type: 'keypath', $val: key }, value]);
      return this;
    }
  }, {
    key: 'greaterThan',
    value: function greaterThan(key, value) {
      this._predicate.push(['gt', { $type: 'keypath', $val: key }, value]);
      return this;
    }
  }, {
    key: 'greaterThanOrEqualTo',
    value: function greaterThanOrEqualTo(key, value) {
      this._predicate.push(['gte', { $type: 'keypath', $val: key }, value]);
      return this;
    }
  }, {
    key: 'lessThan',
    value: function lessThan(key, value) {
      this._predicate.push(['lt', { $type: 'keypath', $val: key }, value]);
      return this;
    }
  }, {
    key: 'lessThanOrEqualTo',
    value: function lessThanOrEqualTo(key, value) {
      this._predicate.push(['lte', { $type: 'keypath', $val: key }, value]);
      return this;
    }
  }, {
    key: 'distanceLessThan',
    value: function distanceLessThan(key, loc, distance) {
      this._predicate.push(['lt', ['func', 'distance', { $type: 'keypath', $val: key }, { $type: 'geo', $lng: loc.longitude, $lat: loc.latitude }], distance]);
      return this;
    }
  }, {
    key: 'distanceGreaterThan',
    value: function distanceGreaterThan(key, loc, distance) {
      this._predicate.push(['gt', ['func', 'distance', { $type: 'keypath', $val: key }, { $type: 'geo', $lng: loc.longitude, $lat: loc.latitude }], distance]);
      return this;
    }
  }, {
    key: 'contains',
    value: function contains(key, lookupArray) {
      if (!_lodash2['default'].isArray(lookupArray)) {
        throw new Error('The second argument of contains must be an array.');
      }

      this._predicate.push(['in', { $type: 'keypath', $val: key }, lookupArray]);
      return this;
    }
  }, {
    key: 'notContains',
    value: function notContains(key, lookupArray) {
      if (!_lodash2['default'].isArray(lookupArray)) {
        throw new Error('The second argument of contains must be an array.');
      }

      this._predicate.push(['not', ['in', { $type: 'keypath', $val: key }, lookupArray]]);
      return this;
    }
  }, {
    key: 'containsValue',
    value: function containsValue(key, needle) {
      if (!_lodash2['default'].isString(needle)) {
        throw new Error('The second argument of containsValue must be a string.');
      }

      this._predicate.push(['in', needle, { $type: 'keypath', $val: key }]);
      return this;
    }
  }, {
    key: 'notContainsValue',
    value: function notContainsValue(key, needle) {
      if (!_lodash2['default'].isString(needle)) {
        throw new Error('The second argument of containsValue must be a string.');
      }

      this._predicate.push(['not', ['in', needle, { $type: 'keypath', $val: key }]]);
      return this;
    }
  }, {
    key: 'havingRelation',
    value: function havingRelation(key, rel) {
      var name = rel.prototype.identifier;
      if (name === 'friend') {
        name = '_friend';
      } else if (name === 'follow') {
        name = '_follow';
      }

      this._predicate.push(['func', 'userRelation', { $type: 'keypath', $val: key }, { $type: 'relation', $name: name, $direction: rel.prototype.direction }]);
      return this;
    }
  }, {
    key: 'notHavingRelation',
    value: function notHavingRelation(key, rel) {
      var name = rel.prototype.identifier;
      if (name === 'friend') {
        name = '_friend';
      } else if (name === 'follow') {
        name = '_follow';
      }

      this._predicate.push(['not', ['func', 'userRelation', { $type: 'keypath', $val: key }, { $type: 'relation', $name: name, $direction: rel.prototype.direction }]]);
      return this;
    }
  }, {
    key: 'addDescending',
    value: function addDescending(key) {
      this._sort.push([{ $type: 'keypath', $val: key }, 'desc']);
      return this;
    }
  }, {
    key: 'addAscending',
    value: function addAscending(key) {
      this._sort.push([{ $type: 'keypath', $val: key }, 'asc']);
      return this;
    }
  }, {
    key: 'addDescendingByDistance',
    value: function addDescendingByDistance(key, loc) {
      this._sort.push([['func', 'distance', { $type: 'keypath', $val: key }, { $type: 'geo', $lng: loc.longitude, $lat: loc.latitude }], 'desc']);
      return this;
    }
  }, {
    key: 'addAscendingByDistance',
    value: function addAscendingByDistance(key, loc) {
      this._sort.push([['func', 'distance', { $type: 'keypath', $val: key }, { $type: 'geo', $lng: loc.longitude, $lat: loc.latitude }], 'asc']);
      return this;
    }
  }, {
    key: 'transientInclude',
    value: function transientInclude(key, mapToKey) {
      mapToKey = mapToKey || key;
      this._include[mapToKey] = {
        $type: 'keypath',
        $val: key
      };
      return this;
    }
  }, {
    key: 'transientIncludeDistance',
    value: function transientIncludeDistance(key, mapToKey, loc) {
      mapToKey = mapToKey || key;
      this._include[mapToKey] = ['func', 'distance', { $type: 'keypath', $val: key }, { $type: 'geo', $lng: loc.longitude, $lat: loc.latitude }];
      return this;
    }
  }, {
    key: '_orQuery',
    value: function _orQuery(queries) {
      var _this = this;

      _lodash2['default'].forEach(queries, function (query) {
        _this._orPredicate.push(query.predicate);
      });
    }
  }, {
    key: '_getOrPredicate',
    value: function _getOrPredicate() {
      var _orPredicate = _lodash2['default'].clone(this._orPredicate);
      if (_orPredicate.length === 0) {
        return [];
      } else if (_orPredicate.length === 1) {
        return _orPredicate[0];
      } else {
        _orPredicate.unshift('or');
        return _orPredicate;
      }
    }
  }, {
    key: 'toJSON',

    /* eslint camelcase: 0 */
    value: function toJSON() {
      var payload = {
        record_type: this.recordType,
        limit: this.limit,
        sort: this._sort,
        include: this._include,
        count: this.overallCount
      };
      if (this.predicate.length > 1) {
        payload.predicate = (0, _util.toJSON)(this.predicate);
      }
      if (this.offset) {
        payload.offset = this.offset;
      }
      return payload;
    }
  }, {
    key: 'predicate',
    get: function get() {
      var _predicate = _lodash2['default'].clone(this._predicate);
      if (this._orPredicate.length > 0) {
        _predicate.push(this._getOrPredicate());
      }

      var innerPredicate = [];
      if (_predicate.length === 1) {
        innerPredicate = _predicate[0];
      } else if (_predicate.length > 0) {
        _predicate.unshift('and');
        innerPredicate = _predicate;
      }

      if (this._negation) {
        return ['not', innerPredicate];
      } else {
        return innerPredicate;
      }
    }
  }, {
    key: 'hash',
    get: function get() {
      return (0, _md52['default'])(JSON.stringify(this.toJSON()));
    }
  }], [{
    key: 'clone',
    value: function clone(query) {
      return Query.fromJSON(query.toJSON());
    }
  }, {
    key: 'fromJSON',
    value: function fromJSON(payload) {
      var json = _lodash2['default'].cloneDeep(payload);
      var recordCls = _record2['default'].extend(json.record_type);
      var query = new Query(recordCls);

      query.limit = json.limit;
      query._sort = json.sort;
      query.overallCount = json.count;

      if (json.offset) {
        query.offset = json.offset;
      }

      if (json.predicate && json.predicate.length > 1) {
        (function () {
          var innerPredicate = (0, _util.fromJSON)(json.predicate);

          // unwrap 'not' operator
          if (innerPredicate[0] === 'not') {
            query._negation = true;
            innerPredicate = innerPredicate[1];
          }

          // unwrap 'and' operator
          if (innerPredicate.length > 1 && innerPredicate[0] === 'and') {
            innerPredicate.shift();
          }

          var _predicate = [];
          var _orPredicate = [];
          _lodash2['default'].each(innerPredicate, function (perPredicate) {
            if (perPredicate.length > 1 && perPredicate[0] === 'or') {
              _orPredicate = perPredicate;
            } else {
              _predicate.push(perPredicate);
            }
          });

          // unwrap 'or' operator
          if (_orPredicate.length > 1) {
            _orPredicate.shift();
          }

          // handler for single predicate
          if (_predicate.length > 1 && typeof _predicate[0] === 'string' && _predicate[0] !== 'and') {
            _predicate = [_predicate];
          }

          query._predicate = _predicate;
          query._orPredicate = _orPredicate;
        })();
      }

      return query;
    }
  }, {
    key: 'or',
    value: function or() {
      var recordType = null;
      var recordCls = null;

      for (var _len = arguments.length, queries = Array(_len), _key = 0; _key < _len; _key++) {
        queries[_key] = arguments[_key];
      }

      _lodash2['default'].forEach(queries, function (query) {
        if (!recordType) {
          recordType = query.recordType;
          recordCls = query.recordCls;
        }

        if (recordType !== query.recordType) {
          throw new Error('All queries must be for the same recordType.');
        }
      });

      var orQuery = new Query(recordCls);
      orQuery._orQuery(queries);
      return orQuery;
    }
  }, {
    key: 'not',
    value: function not(query) {
      var queryClone = Query.clone(query);
      queryClone._negation = !queryClone._negation;

      return queryClone;
    }
  }]);

  return Query;
})();

exports['default'] = Query;
module.exports = exports['default'];