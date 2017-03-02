/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	exports.parser = parser;
	exports.generate = generate;
	exports.string = string;
	exports.regex = regex;
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function getType(obj) {
	  return Object.prototype.toString.call(obj).slice(8, -1);
	}
	
	function count(arr, item, start, end) {
	  var c = 0;
	  for (var i = 0, l = arr.length; i < Math.min(l, end); i++) {
	    if (arr[i] === item) {
	      c++;
	    }
	  }
	  return c;
	}
	
	function lineInfoAt(stream, index) {
	  if (index > stream.length) {
	    throw Error('invalid index');
	  }
	  var cs = stream.split('');
	  var line = count(cs, '\n', index);
	  var lastNl = count(cs.reverse(), '\n', index) || -1;
	  var col = index - (lastNl + 1);
	  return [line, col];
	}
	
	var Result = function () {
	  function Result(status, index, value, furthest, expected) {
	    _classCallCheck(this, Result);
	
	    this.status = status;
	    this.index = index;
	    this.value = value;
	    this.furthest = furthest;
	    this.expected = expected;
	  }
	
	  _createClass(Result, [{
	    key: 'aggregate',
	    value: function aggregate(other) {
	      if (!other) {
	        return this;
	      }
	      if (this.furthest >= other.furthest) {
	        return this;
	      }
	      return new Result(this.status, this.index, this.value, other.furthest, other.expected);
	    }
	  }], [{
	    key: 'success',
	    value: function success(index, value) {
	      return new Result(true, index, value, -1, void 0);
	    }
	  }, {
	    key: 'failure',
	    value: function failure(index, expected) {
	      return new Result(false, -1, void 0, index, expected);
	    }
	  }]);
	
	  return Result;
	}();
	
	var ParseError = function (_Error) {
	  _inherits(ParseError, _Error);
	
	  function ParseError(expected, stream, index) {
	    _classCallCheck(this, ParseError);
	
	    var s = '';
	    try {
	      var _lineInfoAt = lineInfoAt(stream, index),
	          _lineInfoAt2 = _slicedToArray(_lineInfoAt, 2),
	          line = _lineInfoAt2[0],
	          col = _lineInfoAt2[1];
	
	      s = line + ':' + col;
	    } catch (e) {
	      s = 'error';
	    }
	
	    var _this = _possibleConstructorReturn(this, (ParseError.__proto__ || Object.getPrototypeOf(ParseError)).call(this, 'Expected ' + expected + ' at ' + s));
	
	    _this.expected = expected;
	    _this.stream = stream;
	    _this.index = index;
	    return _this;
	  }
	
	  return ParseError;
	}(Error);
	
	var Parser = function () {
	  function Parser(func) {
	    _classCallCheck(this, Parser);
	
	    this.func = func;
	  }
	
	  _createClass(Parser, [{
	    key: 'call',
	    value: function call(stream, index) {
	      return this.func(stream, index);
	    }
	  }, {
	    key: 'parse',
	    value: function parse(str) {
	      var res = this.lshift(eof).parsePartial(str);
	      return res[0];
	    }
	  }, {
	    key: 'parsePartial',
	    value: function parsePartial(str) {
	      var t = getType(str);
	      if (t !== 'String') {
	        throw Error('Only parse string, ' + t + ' found!');
	      }
	      var res = this.call(str, 0);
	      if (res.status) {
	        return [res.value, str.slice(res.index)];
	      }
	      throw new ParseError(res.expected, str, res.furthest);
	    }
	  }, {
	    key: 'bind',
	    value: function bind(boundFun) {
	      var _this2 = this;
	
	      return parser(function (stream, index) {
	        var res = _this2.call(stream, index);
	        if (res.status) {
	          var nextParser = boundFun(res.value);
	          return nextParser.call(stream, res.index).aggregate(res);
	        }
	        return res;
	      });
	    }
	  }, {
	    key: 'map',
	    value: function map(mapFun) {
	      return this.bind(function (res) {
	        return success(mapFun(res));
	      });
	    }
	  }, {
	    key: 'then',
	    value: function then(other) {
	      return seq(this, other).map(function (r) {
	        return r[1];
	      });
	    }
	  }, {
	    key: 'skip',
	    value: function skip(other) {
	      return seq(this, other).map(function (r) {
	        return r[0];
	      });
	    }
	  }, {
	    key: 'result',
	    value: function result(res) {
	      return this >> success(res);
	    }
	  }, {
	    key: 'many',
	    value: function many() {
	      return this.times(0, Infinity);
	    }
	  }, {
	    key: 'times',
	    value: function times(min, max) {
	      var _this3 = this;
	
	      max = max || min;
	
	      return parser(function (stream, index) {
	        var values = [];
	        var times = 0;
	        var res = void 0;
	
	        while (times < max) {
	          res = _this3.call(stream, index).aggregate(res);
	          if (res.status) {
	            values.push(res.value);
	            index = res.index;
	            times += 1;
	          } else if (times >= min) {
	            break;
	          }
	          return res;
	        }
	
	        return Result.success(index, values).aggregate(res);
	      });
	    }
	  }, {
	    key: 'atMost',
	    value: function atMost(n) {
	      return this.times(0, n);
	    }
	  }, {
	    key: 'atLeast',
	    value: function atLeast(n) {
	      return this.times(n) + this.many();
	    }
	  }, {
	    key: 'desc',
	    value: function desc(_desc) {
	      var f = fail(_desc);
	      return this.or(f);
	    }
	  }, {
	    key: 'mark',
	    value: function mark() {
	      var self = this;
	      return generate(regeneratorRuntime.mark(function _callee() {
	        var start, body, end;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                _context.next = 2;
	                return lineInfo;
	
	              case 2:
	                start = _context.sent;
	                _context.next = 5;
	                return self;
	
	              case 5:
	                body = _context.sent;
	                _context.next = 8;
	                return lineInfo;
	
	              case 8:
	                end = _context.sent;
	                return _context.abrupt('return', [start, body, end]);
	
	              case 10:
	              case 'end':
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));
	    }
	  }, {
	    key: 'plus',
	    value: function plus(right) {
	      return seq(this, right).map(function (res) {
	        return res[0] + res[1];
	      });
	    }
	  }, {
	    key: 'multiply',
	    value: function multiply(right) {
	      return this.times(right);
	    }
	  }, {
	    key: 'or',
	    value: function or(right) {
	      return alt(this, right);
	    }
	  }, {
	    key: 'rshift',
	    value: function rshift(right) {
	      return this.then(right);
	    }
	  }, {
	    key: 'lshift',
	    value: function lshift(right) {
	      return this.skip(right);
	    }
	  }]);
	
	  return Parser;
	}();
	
	function alt() {
	  for (var _len = arguments.length, parsers = Array(_len), _key = 0; _key < _len; _key++) {
	    parsers[_key] = arguments[_key];
	  }
	
	  if (!parsers) {
	    return fail('<Empty alt>');
	  }
	
	  return parser(function (stream, index) {
	    var res = void 0;
	    for (var i = 0, l = parsers.length; i < l; i++) {
	      var _parser = parsers[i];
	      res = _parser.call(stream, index).aggregate(res);
	      if (res.status) {
	        return res;
	      }
	    }
	    return res;
	  });
	}
	
	function seq() {
	  for (var _len2 = arguments.length, parsers = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	    parsers[_key2] = arguments[_key2];
	  }
	
	  if (!parsers) {
	    return success([]);
	  }
	
	  return parser(function (stream, index) {
	    var res = void 0;
	    var values = [];
	
	    for (var i = 0, l = parsers.length; i < l; i++) {
	      var _parser = parsers[i];
	      res = _parser.call(stream, index).aggregate(res);
	      if (!res.status) {
	        return res;
	      }
	      index = res.index;
	      values.push(res.value);
	    }
	    return Result.success(index, values).aggregate(res);
	  });
	}
	
	function parser(fun) {
	  return new Parser(fun);
	}
	
	function generate(fun) {
	  if (getType(fun) === 'String') {
	    return function (f) {
	      return generate(f).desc(fun);
	    };
	  }
	
	  return parser(function (stream, index) {
	    var g = fun();
	
	    var res = void 0;
	    var value = void 0;
	    var nextParser = void 0;
	
	    while (!(nextParser = g.next(value)).done) {
	      res = nextParser.value.call(stream, index).aggregate(res);
	      if (!res.status) {
	        return res;
	      }
	      value = res.value;
	      index = res.index;
	    }
	
	    var returnVal = nextParser.value;
	    if (returnVal instanceof Parser) {
	      return returnVal(stream, index).aggregate(res);
	    }
	
	    return Result.success(index, returnVal).aggregate(res);
	  }).desc(fun.name);
	}
	
	var index = exports.index = new Parser(function (_, index) {
	  return Result.success(index, index);
	});
	var lineInfo = exports.lineInfo = new Parser(function (stream, index) {
	  return Result.success(index, lineInfoAt(stream, index));
	});
	
	function success(val) {
	  return new Parser(function (_, index) {
	    return Result.success(index, val);
	  });
	}
	
	function fail(expected) {
	  return new Parser(function (_, index) {
	    return Result.failure(index, expected);
	  });
	}
	
	function string(s) {
	  var sl = s.length;
	
	  var stringParser = parser(function (stream, index) {
	    if (stream.slice(index, index + sl) === s) {
	      return Result.success(index + sl, s);
	    } else {
	      return Result.failure(index, s);
	    }
	  });
	
	  stringParser.name = 'stringParser<' + s + '>';
	
	  return stringParser;
	}
	
	function regex(exp) {
	  if (getType(exp) === 'String') {
	    exp = new RegExp(exp);
	  }
	
	  var regexParser = parser(function (stream, index) {
	    var _stream = stream.slice(index);
	    var match = _stream.match(exp);
	    if (match) {
	      index = match.index + match[0].length + index;
	      return Result.success(index, match[0]);
	    }
	    return Result.failure(index, exp.toString());
	  });
	
	  regexParser.name = 'regexParser<' + exp.toString() + '>';
	
	  return regexParser;
	}
	
	var whitespace = exports.whitespace = regex('\s+');
	
	var eof = exports.eof = parser(function (stream, index) {
	  if (index >= stream.length) {
	    return Result.success(index, void 0);
	  }
	  return Result.failure(index, 'EOF');
	});
	
	var or = exports.or = function or(left, right) {
	  if (left instanceof Parser) {
	    return left.or(right);
	  }
	  return left | right;
	};
	
	var plus = exports.plus = function plus(left, right) {
	  if (left instanceof Parser) {
	    return left.plus(right);
	  }
	  return left + right;
	};
	
	var lshift = exports.lshift = function lshift(left, right) {
	  if (left instanceof Parser) {
	    return left.lshift(right);
	  }
	  return left << right;
	};
	
	var rshift = exports.rshift = function rshift(left, right) {
	  if (left instanceof Parser) {
	    return left.rshift(right);
	  }
	  return left >> right;
	};

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map