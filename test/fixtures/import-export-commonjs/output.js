'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BabelStore2 = exports.empty2 = exports.Utils2 = exports.test2 = exports.something = exports.SubHeader2 = undefined;

var _SubHeader = require('../../testproject/src/components/Header/SubHeader');

Object.defineProperty(exports, 'SubHeader2', {
  enumerable: true,
  get: function () {
    return _SubHeader.SubHeader2;
  }
});

var _test = require('../../testproject/test');

Object.defineProperty(exports, 'test2', {
  enumerable: true,
  get: function () {
    return _test.test2;
  }
});

var _utils = require('./utils');

Object.defineProperty(exports, 'Utils2', {
  enumerable: true,
  get: function () {
    return _utils.Utils2;
  }
});

var _ = require('');

Object.defineProperty(exports, 'empty2', {
  enumerable: true,
  get: function () {
    return _.empty2;
  }
});

var _store = require('babel-core/lib/store');

Object.defineProperty(exports, 'BabelStore2', {
  enumerable: true,
  get: function () {
    return _store.BabelStore2;
  }
});
exports.something = something;

// should alias the path


// should not change a relative path


// should handle an empty path


// should only apply the alias once
// babel-core/store should becore babel-core/lib/store, not babel-core/lib/lib/store
