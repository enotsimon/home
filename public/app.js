(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var process;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("common/a_star.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 *  @param function getNeighboursFunc(point) -> [{point: neighbourPoint, weight: integer() | float()}]
 *    return list of all neighbours points with weight to move from given point to it
 *  @param function euristicFunc(pointFrom, pointTo) -> integer() | float()
 *    return estimated distance between two points
 *    for square map its a
 *    Math.abs(pointFrom.location.x - pointTo.location.x) + Math.abs(pointFrom.location.y - pointTo.location.y)
 *    for graphs without any coords representation its a very complicated task, suppose return just 0 (zero)
 *  @param int|float euristicWeight -- euristic distance weight multiplier
 *    you can set it to standard weight of one vertical|horisontal move
 */
var AStar = function () {
  function AStar(getNeighboursFunc) {
    var euristicFunc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var euristicWeight = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
    var pointIndexFunc = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    _classCallCheck(this, AStar);

    this.getNeighboursFunc = getNeighboursFunc;
    this.euristicFunc = euristicFunc ? euristicFunc : AStar.standardEuristic;
    this.euristicWeight = euristicWeight;
    this.pointIndexFunc = pointIndexFunc;
  }

  _createClass(AStar, [{
    key: 'find',
    value: function find(startPoint, finishPoint) {
      var openList = {},
          closedList = {};
      this.addToOpenList(startPoint, 0, null, openList);
      this.counter = 0; // TEMP
      return this.step(openList, closedList, finishPoint);
    }
  }, {
    key: 'step',
    value: function step(openList, closedList, finishPoint) {
      this.counter++;
      if (this.counter > 10000) {
        throw 'counter overflow';
      }
      if (this.openListIsEmpty(openList)) {
        return false; // no way to finish
      }
      var pointObj = this.popPointFromOpenList(openList);
      // TODO -- preferable way is diagonal. do it some way
      var neighbours = this.getNeighboursFunc(pointObj.point);
      for (var i = 0; i < neighbours.length; i++) {
        var e = neighbours[i];
        var weight = e.weight + pointObj.weight + this.euristicWeight * this.euristicFunc(e.point, finishPoint);

        if (e.point == finishPoint) {
          var path = [e.point, pointObj.point],
              iPointObj = pointObj;
          while (iPointObj.parent != null) {
            path.push(iPointObj.parent.point);
            iPointObj = iPointObj.parent;
          }
          return path;
        } else if (this.checkPointInClosedList(e, closedList)) {
          // just do nothing
        } else {
          var foundInOpenList = this.getFromOpenList(e, openList);
          if (foundInOpenList) {
            foundInOpenList.parent = pointObj;
            foundInOpenList.weight = weight;
          } else {
            this.addToOpenList(e.point, weight, pointObj, openList);
          }
        }
      }
      this.addToClosedList(pointObj, closedList);
      return this.step(openList, closedList, finishPoint);
    }

    // TODO -- its a hack -- we suggest some imput data structure
    // TODO -- change the whole func to call to this.pointIndexFunc thru all code

  }, {
    key: 'listKey',
    value: function listKey(pointObj) {
      if (this.pointIndexFunc) {
        return this.pointIndexFunc(pointObj.point);
      }
      return pointObj.point.location.x + '|' + pointObj.point.location.y;
    }
  }, {
    key: 'addToOpenList',
    value: function addToOpenList(point, pointWeight, parentPointObj, openList) {
      var pointObj = { point: point, weight: pointWeight, parent: parentPointObj };
      openList[this.listKey(pointObj)] = pointObj;
    }
  }, {
    key: 'openListIsEmpty',
    value: function openListIsEmpty(openList) {
      return Object.keys(openList).length == 0;
    }
  }, {
    key: 'getFromOpenList',
    value: function getFromOpenList(pointObj, openList) {
      return openList[this.listKey(pointObj)];
    }
  }, {
    key: 'popPointFromOpenList',
    value: function popPointFromOpenList(openList) {
      var cur = {},
          index = void 0;
      for (var i in openList) {
        if (openList[i].weight < cur.weight || !cur.weight) {
          cur = openList[i];
          index = i;
        }
      }
      delete openList[index];
      return cur;
    }
  }, {
    key: 'addToClosedList',
    value: function addToClosedList(pointObj, closedList) {
      closedList[this.listKey(pointObj)] = pointObj;
    }
  }, {
    key: 'checkPointInClosedList',
    value: function checkPointInClosedList(pointObj, closedList) {
      return closedList[this.listKey(pointObj)] != undefined;
    }
  }], [{
    key: 'standardEuristic',
    value: function standardEuristic(pointFrom, pointTo) {
      return Math.abs(pointFrom.x - pointTo.x) + Math.abs(pointFrom.y - pointTo.y);
    }
  }]);

  return AStar;
}();

exports.default = AStar;

});

require.register("common/color.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Color = function () {
  function Color() {
    _classCallCheck(this, Color);
  }

  _createClass(Color, null, [{
    key: "random_near",
    value: function random_near(_ref) {
      var _ref2 = _slicedToArray(_ref, 3),
          r = _ref2[0],
          g = _ref2[1],
          b = _ref2[2];

      var step = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;
      var count = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;

      return Color.for_rgb([r, g, b], function (e) {
        return Color.random_channel(e, step, count);
      });
    }
  }, {
    key: "random",
    value: function random(_ref3) {
      var _ref4 = _slicedToArray(_ref3, 3),
          r = _ref4[0],
          g = _ref4[1],
          b = _ref4[2];

      var step = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

      return Color.for_rgb([r, g, b], function (e) {
        return Color.random_by_floor(e, step);
      });
    }
  }, {
    key: "brighter",
    value: function brighter(_ref5) {
      var _ref6 = _slicedToArray(_ref5, 3),
          r = _ref6[0],
          g = _ref6[1],
          b = _ref6[2];

      var step = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

      return [r, g, b].map(function (e) {
        return Math.min(e + step, 255);
      });
    }
  }, {
    key: "darker",
    value: function darker(_ref7) {
      var _ref8 = _slicedToArray(_ref7, 3),
          r = _ref8[0],
          g = _ref8[1],
          b = _ref8[2];

      var step = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

      return [r, g, b].map(function (e) {
        return Math.max(e - step, 0);
      });
    }
  }, {
    key: "to_pixi",
    value: function to_pixi(_ref9) {
      var _ref10 = _slicedToArray(_ref9, 3),
          r = _ref10[0],
          g = _ref10[1],
          b = _ref10[2];

      return (r << 16) + (g << 8) + b;
    }

    // PRIVATE

  }, {
    key: "for_rgb",
    value: function for_rgb(_ref11, func) {
      var _ref12 = _slicedToArray(_ref11, 3),
          r = _ref12[0],
          g = _ref12[1],
          b = _ref12[2];

      return [func(r), func(g), func(b)];
    }

    // PRIVATE

  }, {
    key: "random_channel",
    value: function random_channel(base, step, count) {
      var rand = step * _util2.default.rand(-count, count);
      var res = base + rand;
      return res > 255 ? 255 : res < 0 ? 0 : res;
    }

    // PRIVATE

  }, {
    key: "random_by_floor",
    value: function random_by_floor(floor, step) {
      return floor - step * _util2.default.rand(0, floor / step | 0);
    }
  }]);

  return Color;
}();

exports.default = Color;

});

require.register("common/components/active_checkbox.jsx", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ActiveCheckbox = function (_React$Component) {
  _inherits(ActiveCheckbox, _React$Component);

  function ActiveCheckbox(props) {
    _classCallCheck(this, ActiveCheckbox);

    var _this = _possibleConstructorReturn(this, (ActiveCheckbox.__proto__ || Object.getPrototypeOf(ActiveCheckbox)).call(this, props));

    _this.state = { checked: props.checked };
    console.log('SUKA', _this.state);
    return _this;
  }

  _createClass(ActiveCheckbox, [{
    key: 'handler',
    value: function handler(event) {
      var value = this.props.handler(event);
      this.setState({ checked: value });
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: 'form-check' },
        _react2.default.createElement(
          'label',
          { className: 'form-check-label' },
          _react2.default.createElement('input', { className: 'form-check-input', type: 'checkbox', onChange: this.handler.bind(this), defaultChecked: this.state.checked }),
          '\xA0',
          this.props.text
        )
      );
    }
  }]);

  return ActiveCheckbox;
}(_react2.default.Component);

exports.default = ActiveCheckbox;

});

require.register("common/components/collapsible_panel.jsx", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CollapsiblePanel = function (_React$Component) {
  _inherits(CollapsiblePanel, _React$Component);

  function CollapsiblePanel(args) {
    _classCallCheck(this, CollapsiblePanel);

    var _this = _possibleConstructorReturn(this, (CollapsiblePanel.__proto__ || Object.getPrototypeOf(CollapsiblePanel)).call(this));

    _this.header = args.header;
    _this.name = args.name;
    _this.content_func = args.content_func;
    return _this;
  }

  _createClass(CollapsiblePanel, [{
    key: "render",
    value: function render() {
      return _react2.default.createElement(
        "div",
        { className: "panel panel-success" },
        _react2.default.createElement(
          "div",
          { className: "panel-heading" },
          _react2.default.createElement(
            "h4",
            { className: "panel-title" },
            _react2.default.createElement(
              "a",
              { "data-toggle": "collapse", href: '#' + this.name },
              this.header,
              " ",
              _react2.default.createElement("span", { className: "caret" })
            )
          )
        ),
        _react2.default.createElement(
          "div",
          { id: this.name, className: "panel-collapse collapse" },
          _react2.default.createElement(
            "div",
            { className: "panel-body" },
            this.content_func()
          )
        )
      );
    }
  }]);

  return CollapsiblePanel;
}(_react2.default.Component);

exports.default = CollapsiblePanel;

});

require.register("common/components/input_spinner.jsx", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var InputSpinner = function (_React$Component) {
  _inherits(InputSpinner, _React$Component);

  function InputSpinner(args) {
    _classCallCheck(this, InputSpinner);

    var _this = _possibleConstructorReturn(this, (InputSpinner.__proto__ || Object.getPrototypeOf(InputSpinner)).call(this, args));

    _this.state = { value: args.value };
    _this.name = args.name;
    _this.min = args.min ? args.min : 0;
    _this.max = args.max ? args.max : Infinity;
    return _this;
  }

  _createClass(InputSpinner, [{
    key: "click_up",
    value: function click_up(e) {
      if (this.state.value >= this.max) {
        return false;
      }
      this.update_value(this.state.value + 1);
      e.preventDefault();
    }
  }, {
    key: "click_down",
    value: function click_down(e) {
      if (this.state.value <= this.min) {
        return false;
      }
      this.update_value(this.state.value - 1);
      e.preventDefault();
    }
  }, {
    key: "manual_set",
    value: function manual_set(e) {
      this.update_value(e.target.value);
    }
  }, {
    key: "update_value",
    value: function update_value(new_value) {
      this.setState({ value: new_value });
    }
  }, {
    key: "render",
    value: function render() {
      return _react2.default.createElement(
        "div",
        { className: "input-group" },
        _react2.default.createElement(
          "span",
          { className: "input-group-btn" },
          _react2.default.createElement(
            "a",
            { className: "btn btn-danger", onClick: this.click_down.bind(this) },
            _react2.default.createElement("span", { className: "glyphicon glyphicon-minus" })
          )
        ),
        _react2.default.createElement("input", { id: this.name, type: "text", className: "form-control text-center", value: this.state.value, onChange: this.manual_set.bind(this) }),
        _react2.default.createElement(
          "span",
          { className: "input-group-btn" },
          _react2.default.createElement(
            "a",
            { className: "btn btn-info", onClick: this.click_up.bind(this) },
            _react2.default.createElement("span", { className: "glyphicon glyphicon-plus" })
          )
        )
      );
    }
  }]);

  return InputSpinner;
}(_react2.default.Component);

exports.default = InputSpinner;

});

require.register("common/util.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Util = function () {
  function Util() {
    _classCallCheck(this, Util);
  }

  _createClass(Util, null, [{
    key: 'exec_in_cycle_with_delay',
    value: function exec_in_cycle_with_delay(index, limit, delay, func) {
      var final_func = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : function () {};

      if (typeof limit === "function" && !limit() || index >= limit) {
        final_func(index);
        return;
      }
      func(index);
      setTimeout(function () {
        Util.exec_in_cycle_with_delay(index + 1, limit, delay, func, final_func);
      }, delay);
    }
  }, {
    key: 'rand',
    value: function rand(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }
  }, {
    key: 'rand_element',
    value: function rand_element(arr) {
      if (arr.length == 0) return false;
      return arr[Util.rand(0, arr.length - 1)];
    }
  }, {
    key: 'rand_float',
    value: function rand_float(min, max) {
      return Math.random() * (max - min) + min;
    }
  }, {
    key: 'normalize_value',
    value: function normalize_value(value, max, normal_max) {
      var min = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
      var normal_min = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;

      if (value > max || value < min) {
        console.log('value out of range', value, max, normal_max, min, normal_min);
        throw 'value out of range';
      }
      return (value - min) * (normal_max - normal_min) / (max - min) + normal_min;
    }

    ///////////////////////////////////
    // ARRAYS
    ///////////////////////////////////

  }, {
    key: 'last',
    value: function last(array) {
      return array.length == 0 ? false : array[array.length - 1];
    }
  }, {
    key: 'push_uniq',
    value: function push_uniq(element, arr) {
      if (arr.indexOf(element) == -1) {
        arr.push(element);
      }
    }
  }, {
    key: 'merge',
    value: function merge(arr1, arr2) {
      arr2.forEach(function (e) {
        return Util.push_uniq(e, arr1);
      });
    }
  }, {
    key: 'remove_element',
    value: function remove_element(element, arr) {
      var index = arr.indexOf(element);
      if (index !== -1) {
        arr.splice(index, 1);
        return true;
      }
      return false;
    }
  }, {
    key: 'for_all_consecutive_pairs',
    value: function for_all_consecutive_pairs(array, fun) {
      if (array.length < 2) {
        return false;
      }
      for (var i = 0; i < array.length; i++) {
        var cur = array[i];
        var next_index = i + 1 == array.length ? 0 : i + 1;
        var next = array[next_index];
        fun(cur, next, i, next_index);
      }
    }
  }, {
    key: 'find_min_and_max',
    value: function find_min_and_max(array, value_func) {
      if (!array.length) return false;
      var ret = { min: null, max: null, min_element: null, max_element: null };
      array.forEach(function (e) {
        var res = value_func(e);
        if (isNaN(res) || res === null) return;
        if (ret.min == null || ret.max == null) {
          ret.min = res;
          ret.max = res;
          ret.min_element = e;
          ret.max_element = e;
          return;
        }
        if (res < ret.min) {
          ret.min = res;
          ret.min_element = e;
        }
        if (res > ret.max) {
          ret.max = res;
          ret.max_element = e;
        }
      });
      return ret;
    }

    // ??? experimental. some standard routine for cyclic open_list processing

  }, {
    key: 'do_while_not_empty',
    value: function do_while_not_empty(open_list, func) {
      var length_before = void 0,
          step = 0;
      do {
        length_before = open_list.length;
        open_list = open_list.filter(function (element) {
          return !func(element, step++);
        });
        if (length_before == open_list.length) {
          console.log('do_while_not_empty() open_list length not chenged, bailing out', length_before, open_list);
          return false;
        }
      } while (open_list.length);
      return true;
    }

    //////////////////////////////////////////
    // geometry
    //////////////////////////////////////////

  }, {
    key: 'to_polar_coords',
    value: function to_polar_coords(x, y) {
      var radius = Math.sqrt(x * x + y * y);
      var angle = Math.atan2(y, x);
      return { angle: angle, radius: radius };
    }
  }, {
    key: 'from_polar_coords',
    value: function from_polar_coords(angle, radius) {
      var x = radius * Math.cos(angle);
      var y = radius * Math.sin(angle);
      return { x: x, y: y };
    }
  }, {
    key: 'radians',
    value: function radians(degrees) {
      return degrees * Math.PI / 180;
    }
  }, {
    key: 'degrees',
    value: function degrees(radians) {
      return radians * 180 / Math.PI;
    }
  }, {
    key: 'move_by_vector',
    value: function move_by_vector(from, to, length) {
      // why i wrote j_max + 1? thats for last gradient area -- otherwise it will be just a single dot
      return { x: from.x + (to.x - from.x) * length, y: from.y + (to.y - from.y) * length };
    }
  }, {
    key: 'convex_polygon_centroid',
    value: function convex_polygon_centroid(points) {
      var p1 = points[0];
      var square_sum = 0;
      var xc = 0,
          yc = 0;
      for (var i = 1; i < points.length - 1; i++) {
        var p2 = points[i];
        var p3 = points[i + 1];
        var square = ((p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y)) / 2; // triangle square
        square_sum += square;
        xc += square * (p1.x + p2.x + p3.x) / 3;
        yc += square * (p1.y + p2.y + p3.y) / 3;
      }
      return { x: xc / square_sum, y: yc / square_sum };
    }

    // points should be sorted by angle to center!!!

  }, {
    key: 'convex_polygon_square',
    value: function convex_polygon_square(points) {
      var p1 = points[0];
      var square = 0;
      for (var i = 1; i < points.length - 1; i++) {
        var p2 = points[i];
        var p3 = points[i + 1];
        square += Math.abs((p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y)) / 2;
      }
      return square;
    }
  }, {
    key: 'distance',
    value: function distance(p1, p2) {
      return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }
  }, {
    key: 'gauss_function',
    value: function gauss_function(x, sigma, mu) {
      return 1 / (sigma * Math.sqrt(2 * Math.PI)) * Math.pow(Math.E, -(Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2))));
    }
  }]);

  return Util;
}();

exports.default = Util;

});

require.register("common/voronoi_diagram.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

var _d = require("d3");

var d3 = _interopRequireWildcard(_d);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 *  we take original voronoi diagram from d3,
 *  add lloyd relaxation
 *  and then reorganize its internal structure, cause its annoying and awful, for my taste
 *  and to each cell we add array of links to neig nodes, sorted by distance
 */
var VoronoiDiagram = function () {
  function VoronoiDiagram() {
    _classCallCheck(this, VoronoiDiagram);
  }

  _createClass(VoronoiDiagram, null, [{
    key: "generate",
    value: function generate(nodes, width, height) {
      var lloyd_relaxation_steps = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

      var voronoi = d3.voronoi().x(function (p) {
        return p.x;
      }).y(function (p) {
        return p.y;
      }).size([width, height]);
      var original_diagram = voronoi(nodes);
      for (var i = 0; i < lloyd_relaxation_steps; i++) {
        original_diagram = VoronoiDiagram.lloyd_relaxation(original_diagram, voronoi);
      }
      var diagram = {};
      // rewrite edges and nodes
      // the problem with original d3 diagram is not only that node is array(2), but also is that
      // it has nodes duplicates! we are to "regather" all nodes
      diagram.nodes = [];
      diagram.edges = original_diagram.edges.map(function (edge) {
        var node_from = void 0,
            node_to = void 0;
        diagram.nodes.forEach(function (node) {
          if (VoronoiDiagram.seems_like_nodes_are_equal(node, edge[0])) {
            node_from = node;
          }
          if (VoronoiDiagram.seems_like_nodes_are_equal(node, edge[1])) {
            node_to = node;
          }
        });
        if (!node_from) {
          node_from = { x: edge[0][0], y: edge[0][1], cells: [], links: [] };
          diagram.nodes.push(node_from);
        }
        if (!node_to) {
          node_to = { x: edge[1][0], y: edge[1][1], cells: [], links: [] };
          diagram.nodes.push(node_to);
        }
        //node_from.links.push(node_to);
        _util2.default.push_uniq(node_to, node_from.links);
        node_to.links.push(node_from);
        _util2.default.push_uniq(node_from, node_to.links);

        _util2.default.push_uniq(edge.left.data, node_from.cells);
        _util2.default.push_uniq(edge.left.data, node_to.cells);
        if (edge.right) {
          _util2.default.push_uniq(edge.right.data, node_from.cells);
          _util2.default.push_uniq(edge.right.data, node_to.cells);
        }
        return {
          from: node_from,
          to: node_to,
          left: edge.left.data,
          right: edge.right ? edge.right.data : undefined
        };
      });
      // rewrite cells
      diagram.cells = original_diagram.cells.map(function (orig_cell) {
        var cell = orig_cell.site.data; // original object!!! and we change it here!!!
        cell.nodes = diagram.nodes.filter(function (node) {
          return node.cells.indexOf(cell) != -1;
        });
        cell.nodes.sort(function (n1, n2) {
          var angle1 = _util2.default.to_polar_coords(n1.x - cell.x, n1.y - cell.y).angle;
          var angle2 = _util2.default.to_polar_coords(n2.x - cell.x, n2.y - cell.y).angle;
          return angle1 - angle2;
        });
        cell.halfedges = orig_cell.halfedges;
        cell.index = orig_cell.site.index;
        // !!! we rewrite origin coordinates that COULD change (after lloyd relaxation)
        cell.x = orig_cell.site[0];
        cell.y = orig_cell.site[1];
        return cell;
      });
      diagram.cells.forEach(function (cell) {
        var links = [];
        cell.halfedges.forEach(function (halfedge_index) {
          var halfedge = diagram.edges[halfedge_index];
          var link_site = halfedge.left == cell ? halfedge.right : halfedge.left;
          // near-border halfedges dont have right or left cell 
          if (!link_site) {
            return;
          }
          _util2.default.push_uniq(diagram.cells[link_site.index], links);
        });
        // links sorted by distance -- from lowest to highest!
        links.sort(function (e1, e2) {
          return _util2.default.distance(cell, e1) - _util2.default.distance(cell, e2);
        });
        cell.links = links;
      });
      diagram.width = width;
      diagram.height = height;

      // final checks
      diagram.nodes.forEach(function (node) {
        /* its normal -- 4 or more nodes lie on circle
        if (node.links.length > 3) {
          console.log("ITS TOTAL DISASTER", node.x, node.y);
          node.links.forEach(e => console.log("DISASTER", e.x, e.y));
          //throw('ITS TOTAL DISASTER voronoi diagram');
        }
        */
        if (node.links.length < 2) {
          console.log("a little split", node.x, node.y, node.links);
          throw 'ITS TOTAL DISASTER voronoi diagram';
        }
        /* its normal too
        if (node.cells.length > 3 || node.cells.length == 0) {
          console.log("BAD cells", node.x, node.y, node.cells.length);
          //throw('ITS TOTAL DISASTER voronoi diagram');
        }
        */
      });

      return diagram;
    }

    // TODO binary tree search

  }, {
    key: "find",
    value: function find(point, diagram) {
      return _util2.default.find_min_and_max(diagram.cells, function (e) {
        return _util2.default.distance(point, e);
      }).min_element;
    }
  }, {
    key: "lloyd_relaxation",
    value: function lloyd_relaxation(diagram, voronoi) {
      var to_move = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

      var new_points = diagram.polygons().map(function (p) {
        // well, its not real lloyd relaxation, we move new cell center not to centroid, but move
        // it by value of 'to_move' to direction to centroid
        var poly = p.map(function (e) {
          return { x: e[0], y: e[1] };
        });
        var pf = _util2.default.convex_polygon_centroid(poly);
        return _util2.default.move_by_vector(p.data, pf, to_move);
      });
      return voronoi(new_points);
    }

    // PRIVATE. TRY to heal shizophrenia -- different, but very close nodes
    // but it can lead us to total 

  }, {
    key: "seems_like_nodes_are_equal",
    value: function seems_like_nodes_are_equal(node, old_node) {
      var very_close_is = 0.0000000000001;
      return Math.abs(node.x - old_node[0]) < very_close_is && Math.abs(node.y - old_node[1]) < very_close_is;
      //return node.x == old_node[0] && node.y == old_node[1];
    }
  }]);

  return VoronoiDiagram;
}();

exports.default = VoronoiDiagram;

});

require.register("experimental/basic_drawer.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

var _color = require("common/color");

var _color2 = _interopRequireDefault(_color);

var _d = require("d3");

var d3 = _interopRequireWildcard(_d);

var _app = require("experimental/components/app");

var _app2 = _interopRequireDefault(_app);

var _reactDom = require("react-dom");

var _reactDom2 = _interopRequireDefault(_reactDom);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pixi = require("pixi.js");

var PIXI = _interopRequireWildcard(_pixi);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BasicDrawer = function () {
  function BasicDrawer(regime) {
    var _this = this;

    var debug_additional = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    _classCallCheck(this, BasicDrawer);

    this.real_size = 800;
    this.regime = regime;
    this.ticks = 0;
    this.tick_speed = 1;
    this.react_app = _react2.default.createElement(_app2.default, { additional: debug_additional });
    document.addEventListener('DOMContentLoaded', function () {
      _reactDom2.default.render(_this.react_app, document.querySelector('#app'));
      _this.init();
    });
  }

  // TODO update debug info not directly, but from setState()


  _createClass(BasicDrawer, [{
    key: "init",
    value: function init() {
      var _this2 = this;

      this.pixi = new PIXI.Application(this.real_size, this.real_size, {
        backgroundColor: _color2.default.to_pixi([0, 0, 0]),
        antialias: true,
        view: document.getElementById('view')
      });
      this.pixi.stage.interactive = true; // ??
      console.log('renderer', this.pixi.renderer);

      this.base_container = new PIXI.Container();
      if (this.regime == 'square') {
        // square map is 100x100 size
        this.size = 100;
        var scale = this.real_size / this.size | 0;
        this.base_container.scale = { x: scale, y: scale };
      } else if (this.regime == 'circle') {
        // circle map is circle with radils=100, coords from -100 to 100
        this.size = 200;
        var _scale = this.real_size / this.size | 0;
        this.base_container.scale = { x: _scale, y: _scale };
        this.base_container.position.x = this.real_size / 2 | 0;
        this.base_container.position.y = this.real_size / 2 | 0;
      } else if (!this.regime) {
        throw 'regime is not set';
      } else {
        throw 'unknown regime: ' + regime;
      }

      this.pixi.stage.addChild(this.base_container);
      document.getElementById('view_container').appendChild(this.pixi.view);

      // copy-paste from Interation
      document.addEventListener('mousemove', this.mouse_move_handler.bind(this), false);

      this.ticks = 0; // here?
      this.pixi.ticker.add(function (delta) {
        _this2.ticks++;
        if (_this2.ticks % 10 == 0) {
          d3.select('#fps_counter').html(_this2.pixi.ticker.FPS | 0);
        }
        _this2.tick_delta = delta;
        _this2.redraw();
      });
      //////////////////////////////////
      this.init_graphics();
    }
  }, {
    key: "clear_all",
    value: function clear_all() {
      this.base_container.removeChildren();
    }
  }, {
    key: "init_graphics",
    value: function init_graphics() {}
  }, {
    key: "redraw",
    value: function redraw() {}
  }, {
    key: "mouse_move_handler",
    value: function mouse_move_handler(event) {
      if (event.target != this.pixi.view) {
        return false;
      }
      var mouse_coords = this.get_mouse_coords(event);
      d3.select('#mouse_pos').html('{x: ' + mouse_coords.x + ', y: ' + mouse_coords.y + '}');
    }
  }, {
    key: "get_mouse_coords",
    value: function get_mouse_coords(event) {
      return { x: event.offsetX, y: event.offsetY };
    }
  }]);

  return BasicDrawer;
}();

exports.default = BasicDrawer;

});

require.register("experimental/components/app.jsx", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug_info = require('experimental/components/debug_info');

var _debug_info2 = _interopRequireDefault(_debug_info);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App = function (_React$Component) {
  _inherits(App, _React$Component);

  function App(props) {
    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

    _this.state = { additional: props.additional ? props.additional : [] };
    return _this;
  }

  _createClass(App, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: 'panel-group' },
        _react2.default.createElement(
          'div',
          { className: 'panel panel-success' },
          _react2.default.createElement(
            'div',
            { className: 'panel-body' },
            _react2.default.createElement(
              'div',
              { className: '', id: 'view_container' },
              _react2.default.createElement('canvas', { id: 'view', width: '800', height: '800' })
            )
          )
        ),
        _react2.default.createElement(
          'div',
          { className: 'panel panel-success' },
          _react2.default.createElement(
            'div',
            { className: 'panel-body' },
            _react2.default.createElement(
              'div',
              null,
              _react2.default.createElement(
                'div',
                null,
                'FPS: ',
                _react2.default.createElement('span', { id: 'fps_counter' })
              ),
              _react2.default.createElement(
                'div',
                null,
                'mouse position: ',
                _react2.default.createElement(
                  'span',
                  { id: 'mouse_pos' },
                  (0, 0)
                )
              ),
              this.state.additional.map(function (e) {
                return _react2.default.createElement(
                  'div',
                  { key: e.id },
                  e.text,
                  ': ',
                  _react2.default.createElement(
                    'span',
                    { id: e.id },
                    e.value
                  )
                );
              })
            )
          )
        )
      );
    }
  }]);

  return App;
}(_react2.default.Component);

exports.default = App;

});

require.register("experimental/components/debug_info.jsx", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DebugInfo = function (_React$Component) {
  _inherits(DebugInfo, _React$Component);

  function DebugInfo() {
    _classCallCheck(this, DebugInfo);

    return _possibleConstructorReturn(this, (DebugInfo.__proto__ || Object.getPrototypeOf(DebugInfo)).apply(this, arguments));
  }

  _createClass(DebugInfo, [{
    key: "render",
    value: function render() {
      return _react2.default.createElement(
        "div",
        null,
        _react2.default.createElement(
          "div",
          null,
          "FPS: ",
          _react2.default.createElement("span", { id: "fps_counter" })
        ),
        _react2.default.createElement(
          "div",
          null,
          "map scale: ",
          _react2.default.createElement("span", { id: "map_scale" })
        ),
        _react2.default.createElement(
          "div",
          null,
          "mouse position: ",
          _react2.default.createElement(
            "span",
            { id: "mouse_pos" },
            (0, 0)
          )
        ),
        _react2.default.createElement(
          "div",
          null,
          "world point: ",
          _react2.default.createElement(
            "span",
            { id: "world_pos" },
            (0, 0)
          )
        )
      );
    }
  }]);

  return DebugInfo;
}(_react2.default.Component);

exports.default = DebugInfo;

});

require.register("experimental/components/sample_preview.jsx", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SamplePreview = function (_React$Component) {
  _inherits(SamplePreview, _React$Component);

  function SamplePreview(props) {
    _classCallCheck(this, SamplePreview);

    var _this = _possibleConstructorReturn(this, (SamplePreview.__proto__ || Object.getPrototypeOf(SamplePreview)).call(this));

    var valid_statuses = ['draft', 'in_progress', 'almost_ready', 'ready'];

    if (!props.name || !props.description || !props.sample_url || !props.img_path || !props.status) {
      console.log('some params missing', props);
      throw 'some params missing';
    }
    if (valid_statuses.indexOf(props.status) == -1) {
      console.log('wrong status', props.status);
      throw 'wrong status';
    }
    _this.state = { status_text: props.status.replace(/_/g, ' ') };
    return _this;
  }

  _createClass(SamplePreview, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: 'sample_preview' },
        _react2.default.createElement(
          'div',
          { className: 'panel panel-success' },
          _react2.default.createElement(
            'div',
            { className: 'panel-heading' },
            _react2.default.createElement(
              'div',
              { className: 'panel-title navbar-text' },
              this.props.name
            ),
            _react2.default.createElement(
              'span',
              { className: 'label label-primary status_' + this.props.status },
              this.state.status_text
            )
          ),
          _react2.default.createElement(
            'div',
            { className: 'panel-body' },
            _react2.default.createElement(
              'a',
              { href: this.props.sample_url, className: 'thumbnail' },
              _react2.default.createElement('img', { width: '200', height: '200', src: this.props.img_path })
            ),
            _react2.default.createElement(
              'div',
              { className: 'width200' },
              _react2.default.createElement(
                'p',
                null,
                this.props.description
              )
            )
          )
        )
      );
    }
  }]);

  return SamplePreview;
}(_react2.default.Component);

exports.default = SamplePreview;

});

require.register("experimental/components/samples_collection.jsx", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sample_preview = require("experimental/components/sample_preview");

var _sample_preview2 = _interopRequireDefault(_sample_preview);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SamplesCollecton = function (_React$Component) {
  _inherits(SamplesCollecton, _React$Component);

  function SamplesCollecton() {
    _classCallCheck(this, SamplesCollecton);

    return _possibleConstructorReturn(this, (SamplesCollecton.__proto__ || Object.getPrototypeOf(SamplesCollecton)).apply(this, arguments));
  }

  _createClass(SamplesCollecton, [{
    key: "render",
    value: function render() {
      return _react2.default.createElement(
        "div",
        { className: "col-md-8 col-md-offset-2" },
        _react2.default.createElement(
          "div",
          { className: "panel panel-success" },
          _react2.default.createElement(
            "div",
            { className: "panel-heading" },
            _react2.default.createElement(
              "h4",
              { className: "panel-title" },
              "a collection of funny graphics samples"
            )
          ),
          _react2.default.createElement(
            "div",
            { className: "panel-body" },
            _react2.default.createElement(_sample_preview2.default, {
              name: 'moving arrows',
              description: "schizophreniac arrows moving all around.\n                add cosinus interpolation on arrow's turns",
              sample_url: './moving_arrows.html',
              img_path: './thumbnails/moving_arrows.png',
              status: 'almost_ready'
            }),
            _react2.default.createElement(_sample_preview2.default, {
              name: 'planets focus',
              description: "star system emulation, where we\n                dynamically change focus on random stellar body,\n                i.e. move it to the center of coordinates and make all others spin around it",
              sample_url: './planets_focus.html',
              img_path: './thumbnails/planets_focus.jpg',
              status: 'in_progress'
            })
          )
        )
      );
    }
  }]);

  return SamplesCollecton;
}(_react2.default.Component);

exports.default = SamplesCollecton;

});

require.register("experimental/moving_arrows.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

var _color = require("common/color");

var _color2 = _interopRequireDefault(_color);

var _basic_drawer = require("experimental/basic_drawer");

var _basic_drawer2 = _interopRequireDefault(_basic_drawer);

var _pixi = require("pixi.js");

var PIXI = _interopRequireWildcard(_pixi);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 *  TODO:
 *    - add debug info of angle_inc, acceleration, speed
 *    - zooming with speed change? tried, looks bad
 *    - fix graphics redraw leaps!!!
 */
var MovingArrows = function (_BasicDrawer) {
  _inherits(MovingArrows, _BasicDrawer);

  function MovingArrows() {
    _classCallCheck(this, MovingArrows);

    return _possibleConstructorReturn(this, (MovingArrows.__proto__ || Object.getPrototypeOf(MovingArrows)).call(this, 'square'));
  }

  _createClass(MovingArrows, [{
    key: "init_graphics",
    value: function init_graphics() {
      var _this2 = this;

      this.size_coef = 7;
      this.step = this.size / this.size_coef;
      this.matrix_size = 2 * this.size;
      this.arrows = [];
      this.change_angle_base_threshold = 100;
      this.change_angle_tick = this.change_angle_base_threshold;
      this.angle = 2 * Math.PI * Math.random();
      this.angle_inc = 0;
      this.angle_inc_max = 2 * Math.PI / 360;
      this.acceleration = 0;
      this.max_speed = 1.2;
      this.min_speed = 0.6;
      this.speed = (this.max_speed - this.min_speed) / 2;
      this.color = [255, 255, 255];
      this.matrix_container = new PIXI.Container();
      this.matrix_container.x = -this.step;
      this.matrix_container.y = -this.step;
      this.base_container.addChild(this.matrix_container);

      for (var y = -2 * this.step; y < this.matrix_size; y += this.step) {
        for (var x = -2 * this.step; x < this.matrix_size; x += this.step) {
          // git very bad quality on big scales, so we have to set it small and big font size
          var size = this.step * 9;
          var arrow = new PIXI.Text('➔', { fontFamily: 'Arial', fontSize: size, fill: _color2.default.to_pixi(this.color) });
          arrow.scale = { x: 0.1, y: 0.1 };
          arrow.x = x;
          arrow.y = y;
          arrow.rotation = this.angle;
          this.arrows.push(arrow);
        }
      }
      this.arrows.forEach(function (arrow) {
        return _this2.matrix_container.addChild(arrow);
      });
    }
  }, {
    key: "redraw",
    value: function redraw() {
      var _this3 = this;

      if (--this.change_angle_tick <= 0) {
        this.change_angle_tick = this.change_angle_base_threshold * (3 * Math.random() + .2) | 0;
        var rand_angle = this.linear_interpolation(-this.angle_inc_max, this.angle_inc_max, Math.random());
        // turn and go straight
        this.angle_inc = this.angle_inc ? 0 : rand_angle;
      }
      this.angle += this.angle_inc;
      // TODO its very bad that speed depends totally on angle
      var acceleration = this.angle_inc_max / 2 - Math.abs(this.angle_inc);
      var new_speed = this.speed + acceleration;
      new_speed *= this.tick_delta;
      this.speed = Math.max(this.min_speed, Math.min(new_speed, this.max_speed));

      var radius = this.speed;
      var angle = this.angle;
      var diff = _util2.default.from_polar_coords(angle, radius);
      this.arrows.forEach(function (arrow) {
        // TODO seems too complicated. is there better way?
        arrow.x = (arrow.x + diff.x) % _this3.matrix_size + (arrow.x < 0 ? _this3.matrix_size : 0);
        arrow.y = (arrow.y + diff.y) % _this3.matrix_size + (arrow.y < 0 ? _this3.matrix_size : 0);
        arrow.rotation = _this3.angle;
      });
    }

    // took it from http://freespace.virgin.net/hugo.elias/models/m_perlin.htm
    // russian https://habrahabr.ru/post/142592/

  }, {
    key: "cos_interpolation",
    value: function cos_interpolation(min, max, x) {
      var f = (1 - Math.cos(Math.PI * x)) * .5;
      return min * (1 - f) + max * f;
    }
  }, {
    key: "linear_interpolation",
    value: function linear_interpolation(min, max, x) {
      return min * (1 - x) + max * x;
    }
  }]);

  return MovingArrows;
}(_basic_drawer2.default);

exports.default = MovingArrows;


var app = new MovingArrows();

});

require.register("experimental/planets_focus.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

var _color = require("common/color");

var _color2 = _interopRequireDefault(_color);

var _basic_drawer = require("experimental/basic_drawer");

var _basic_drawer2 = _interopRequireDefault(_basic_drawer);

var _pixi = require("pixi.js");

var PIXI = _interopRequireWildcard(_pixi);

var _d = require("d3");

var d3 = _interopRequireWildcard(_d);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 *
 */
var PlanetsFocus = function (_BasicDrawer) {
  _inherits(PlanetsFocus, _BasicDrawer);

  function PlanetsFocus() {
    _classCallCheck(this, PlanetsFocus);

    var debug_additional = [{ id: 'debug_info_focus_on', text: 'now focus on' }];
    return _possibleConstructorReturn(this, (PlanetsFocus.__proto__ || Object.getPrototypeOf(PlanetsFocus)).call(this, 'circle', debug_additional));
  }

  _createClass(PlanetsFocus, [{
    key: "init_graphics",
    value: function init_graphics() {
      this.matrix = new PIXI.Container();
      this.base_container.addChild(this.matrix);
      this.bodies = [];
      this.init_bodies();
      this.forced_focus = false;
      this.focused_body = this.bodies[0];
      this.focus_change_threshold = 300;
      this.focus_change_tick = this.focus_change_threshold;
      this.update_matrix_by_focus();
    }
  }, {
    key: "redraw",
    value: function redraw() {
      var _this2 = this;

      this.bodies.forEach(function (body) {
        body.orbital_angle += _this2.tick_delta * body.orbital_speed;
        body.angle += _this2.tick_delta * (body.orbital_speed + body.rotation_speed);
        _this2.set_graphics_transform_by_stellar_coords(body);
      });
      if (--this.focus_change_tick <= 0) {
        this.focus_change_tick = this.focus_change_threshold;
        if (!this.forced_focus) {
          var cur_index = this.bodies.indexOf(this.focused_body);
          this.focused_body = this.bodies[cur_index == this.bodies.length - 1 ? 0 : cur_index + 1];
          console.log('now focus on', this.focused_body.name);
        }
      }
      this.update_matrix_by_focus();
      d3.select('#debug_info_focus_on').html(this.focused_body.name);
    }
  }, {
    key: "update_matrix_by_focus",
    value: function update_matrix_by_focus() {
      // TODO do it second time on each frame, bad
      var coords = this.calc_coords_recursively(this.focused_body);
      this.matrix.position.x = -coords.x;
      this.matrix.position.y = -coords.y;
    }
  }, {
    key: "calc_coords_recursively",
    value: function calc_coords_recursively(body) {
      var acc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { x: 0, y: 0 };

      var coords = _util2.default.from_polar_coords(body.orbital_angle, body.orbital_radius);
      acc.x += coords.x;
      acc.y += coords.y;
      if (body.parent) {
        return this.calc_coords_recursively(body.parent, acc);
      }
      return acc;
    }
  }, {
    key: "init_bodies",
    value: function init_bodies() {
      // name, parent, orbital_radius, radius, orbital_speed, rotation_speed, [orbital_angle], [angle]
      this.star = this.init_body('star', null, 0, 10, 0, .5);
      this.planet1 = this.init_body('planet1', this.star, 20, 3, 1, 0);
      this.moon1 = this.init_body('moon1', this.planet1, 6, 1, 2, 2);
      this.planet2 = this.init_body('planet2', this.star, 40, 5, 2, 3);
      this.moon21 = this.init_body('moon21', this.planet2, 8, 2, 3, .1);
      this.moon22 = this.init_body('moon22', this.planet2, 12, 1, 4, 1);
    }
  }, {
    key: "init_body",
    value: function init_body(name, parent, orbital_radius, radius, orbital_speed, rotation_speed) {
      var body = new StellarBody(name, parent, orbital_radius, radius, orbital_speed, rotation_speed);
      this.init_body_graphics(body, parent);
      var parent_graphics = parent ? parent.base_container : this.matrix;
      parent_graphics.addChild(body.base_container);
      this.bodies.push(body);
      return body;
    }
  }, {
    key: "init_body_graphics",
    value: function init_body_graphics(body, parent) {
      // thats because base_container do not rotate with planet rotation, otherwise
      // all moons rotate with planet's self rotations
      body.base_container = new PIXI.Graphics();
      body.graphics = new PIXI.Graphics();
      body.base_container.addChild(body.graphics);
      this.set_graphics_transform_by_stellar_coords(body);
      body.graphics.lineStyle(body.radius / 10, _color2.default.to_pixi([255, 255, 255]));
      body.graphics.drawCircle(0, 0, body.radius);
      body.graphics.closePath();
      [1, 2, 3].forEach(function (i) {
        var coords = _util2.default.from_polar_coords(i * 2 * Math.PI / 3, body.radius / 2);
        body.graphics.drawCircle(coords.x, coords.y, body.radius / 4);
        body.graphics.closePath();
      });
    }
  }, {
    key: "set_graphics_transform_by_stellar_coords",
    value: function set_graphics_transform_by_stellar_coords(body) {
      var coords = _util2.default.from_polar_coords(body.orbital_angle, body.orbital_radius);
      // thats not a mistake, see comment below
      body.base_container.x = coords.x;
      body.base_container.y = coords.y;
      body.graphics.rotation = body.angle;
    }
  }]);

  return PlanetsFocus;
}(_basic_drawer2.default);

exports.default = PlanetsFocus;

var StellarBody = function StellarBody(name, parent, orbital_radius, radius, orbital_speed, rotation_speed) {
  var orbital_angle = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;
  var angle = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : false;

  _classCallCheck(this, StellarBody);

  var radius_factor = 1.5; // DEBUG!!!
  this.name = name;
  this.parent = parent;
  this.orbital_radius = radius_factor * orbital_radius;
  this.radius = radius_factor * radius;
  this.orbital_speed = _util2.default.radians(orbital_speed);
  this.rotation_speed = _util2.default.radians(rotation_speed);
  this.orbital_angle = orbital_angle ? orbital_angle : 2 * Math.PI * Math.random();
  this.angle = angle ? angle : 2 * Math.PI * Math.random();
};

var app = new PlanetsFocus();

});

require.register("experimental/samples_collection_init.js", function(exports, require, module) {
'use strict';

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _samples_collection = require('experimental/components/samples_collection');

var _samples_collection2 = _interopRequireDefault(_samples_collection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

document.addEventListener('DOMContentLoaded', function () {
  _reactDom2.default.render(_react2.default.createElement(_samples_collection2.default, null), document.querySelector('#main'));
});

});

require.register("experimental/texture_generators/blur_generator.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

var _color = require("common/color");

var _color2 = _interopRequireDefault(_color);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

////////////////////////////////////////////////
// WARNING!!! doesnt work, rewite to BasicDrawer
////////////////////////////////////////////////
var BlurGenerator = function () {
  function BlurGenerator() {
    _classCallCheck(this, BlurGenerator);

    this.map = game.map_drawer.map;
    this.exp_container = new PIXI.Container();
    this.map.stage.addChild(this.exp_container);
  }

  _createClass(BlurGenerator, [{
    key: "exp_dots",
    value: function exp_dots() {
      var _this = this;

      var points_count_coef = .0050;
      var points_count = points_count_coef * this.map.view.width * this.map.view.height;
      var radius_coef = 0.03;
      var radius = radius_coef * Math.min(this.map.view.width, this.map.view.height);
      var count_near_threshold = points_count * radius_coef;
      var steps_count = 10;

      console.log('points_count', points_count, 'radius', radius, 'count_near_threshold', count_near_threshold);
      var points = [];
      while (points_count--) {
        points.push({ x: _util2.default.rand(0, this.map.view.width), y: _util2.default.rand(0, this.map.view.height) });
      }
      var basic_color = [60, 30, 0];
      while (--steps_count) {
        basic_color = _color2.default.brighter(basic_color, 20);
        this.exp_dots_step(radius, count_near_threshold / steps_count | 0, points, basic_color);
      }
      points.forEach(function (point) {
        return _this.exp_dots_draw_circle(point.x, point.y, 2, [200, 100, 0]);
      });
    }
  }, {
    key: "exp_dots_step",
    value: function exp_dots_step(radius, count_near_threshold, points, color) {
      var _this2 = this;

      console.log('exp_dots_step radius', radius, 'threshold', count_near_threshold);
      var nears_sum = 10;
      points.forEach(function (point) {
        var count_near = _this2.exp_dots_count_near(point, radius, points);
        nears_sum += count_near;
        if (count_near >= count_near_threshold) {
          _this2.exp_dots_draw_circle(point.x, point.y, radius, color);
        }
      });
      console.log('near mid', nears_sum / points.length);
    }
  }, {
    key: "exp_dots_draw_circle",
    value: function exp_dots_draw_circle(x, y, radius, color) {
      var graphics = new PIXI.Graphics();
      graphics.beginFill(_color2.default.to_pixi(color));
      graphics.drawCircle(x, y, radius);
      graphics.closePath();
      graphics.endFill();
      this.exp_container.addChild(graphics);
    }
  }, {
    key: "exp_dots_count_near",
    value: function exp_dots_count_near(from, radius, points) {
      var filtered = points.filter(function (point) {
        return _util2.default.distance(from, point) <= radius;
      });
      return filtered.length - 1;
    }
  }]);

  return BlurGenerator;
}();

exports.default = BlurGenerator;

});

require.register("experimental/texture_generators/density_map.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

var _color = require("common/color");

var _color2 = _interopRequireDefault(_color);

var _d = require("d3");

var d3 = _interopRequireWildcard(_d);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

////////////////////////////////////////////////
// WARNING!!! doesnt work, rewite to BasicDrawer
////////////////////////////////////////////////
var DensityMap = function () {
  function DensityMap() {
    _classCallCheck(this, DensityMap);

    this.reject_limit = 500;
    this.average_distance_threshold = 0.05;
    this.zero_distance_sum = 0;
  }

  _createClass(DensityMap, [{
    key: "random_point",
    value: function random_point() {
      var initial = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      return { x: 2 * Math.random() - 1, y: 2 * Math.random() - 1, initial: initial };
    }
  }, {
    key: "generate",
    value: function generate(count) {
      var count_basic = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

      var reject_counter = this.reject_limit;
      var total_rejects = 0;
      this.points = [];
      // basic points
      while (count_basic) {
        var point = this.random_point(true);
        if (this.check_in_circle(point)) {
          this.points.push(point);
          count_basic--;
        }
      }
      // regular points
      while (this.points.length < count) {
        var _point = this.random_point(false);
        if (!this.check_in_circle(_point)) {
          continue; // do not decrement reject_counter
        }
        if (!this.check_average_distance(_point)) {
          reject_counter--;
          total_rejects++;
        } else {
          reject_counter = this.reject_limit;
          this.points.push(_point);
          this.zero_distance_sum += _util2.default.distance(_point, { x: 0, y: 0 });
        }
        if (!reject_counter) {
          console.log("DensityMap.generate() reject limit " + this.reject_limit + " reached, bailing out");
          break;
        }
      }
      console.log('done, total_rejects: ', total_rejects);
      return true;
    }
  }, {
    key: "check_in_circle",
    value: function check_in_circle(point) {
      return _util2.default.distance(point, { x: 0, y: 0 }) <= 1;
    }
  }, {
    key: "calc_distance_sum",
    value: function calc_distance_sum(point) {
      return this.points.reduce(function (acc, e) {
        return acc + _util2.default.distance(point, e);
      }, 0);
    }
  }, {
    key: "check_average_distance",
    value: function check_average_distance(point) {
      var value = _util2.default.find_min_and_max(this.points, function (p) {
        return _util2.default.distance(p, point);
      }).min;
      //console.log('value', value);
      // its like some little chanse for far points
      var rand = value * Math.pow(Math.random(), 100);
      return value < this.average_distance_threshold + rand;
    }
  }, {
    key: "draw",
    value: function draw(scale) {
      var func = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.draw_naive.bind(this);

      var graphics = new PIXI.Graphics();
      func(scale, graphics);
      return graphics;
    }
  }, {
    key: "draw_naive",
    value: function draw_naive(scale, graphics) {
      var radius = .01;
      this.points.forEach(function (point) {
        //let color = point.initial ? [125, 255, 0] : [point.channel, 0, 0];
        var color = point.initial ? [125, 255, 0] : [125, 0, 0];
        graphics.beginFill(_color2.default.to_pixi(color));
        graphics.drawCircle(scale * point.x, scale * point.y, scale * radius);
        graphics.closePath();
        graphics.endFill();
      });
    }
  }, {
    key: "draw_density_grid",
    value: function draw_density_grid(scale, graphics) {
      var _this = this;

      var size = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 100;

      var step = (1 - -1) / size;
      var grid_points = [];

      var _loop = function _loop(y) {
        var _loop2 = function _loop2(x) {
          var grid_point = { x: x, y: y, density: 0 };
          if (!_this.check_in_circle(grid_point)) {
            return "continue";
          }
          grid_point.density = _this.points.filter(function (p) {
            return p.x >= x && p.y >= y && p.x < x + step && p.y < y + step;
          }).length;
          grid_points.push(grid_point);
        };

        for (var x = -1; x < 1; x += step) {
          var _ret2 = _loop2(x);

          if (_ret2 === "continue") continue;
        }
      };

      for (var y = -1; y < 1; y += step) {
        _loop(y);
      }
      var max_density = _util2.default.find_min_and_max(grid_points, function (p) {
        return p.density;
      }).max;
      grid_points.forEach(function (point) {
        var channel = _util2.default.normalize_value(point.density, max_density, 255, 0, 20);
        graphics.beginFill(_color2.default.to_pixi([channel, 0, 0]));
        graphics.drawCircle(scale * point.x, scale * point.y, scale * (step / 2));
        graphics.closePath();
        graphics.endFill();
      });
    }
  }]);

  return DensityMap;
}();

exports.default = DensityMap;

});

require.register("experimental/texture_generators/links.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

var _color = require("common/color");

var _color2 = _interopRequireDefault(_color);

var _d = require("d3");

var d3 = _interopRequireWildcard(_d);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

////////////////////////////////////////////////
// WARNING!!! doesnt work, rewite to BasicDrawer
////////////////////////////////////////////////
var Links = function () {
  function Links() {
    _classCallCheck(this, Links);

    this.points = [];
    this.size = 10;
    var angle_divider = 1.5 * this.size | 0;
    this.angle = Math.PI / angle_divider;
    console.log("Links size: " + this.size + ", angle divider: " + angle_divider);
  }

  _createClass(Links, [{
    key: "random_point",
    value: function random_point() {
      return { x: 2 * Math.random() - 1, y: 2 * Math.random() - 1 };
    }
  }, {
    key: "generate",
    value: function generate() {
      var border_points = [];
      var grid_points = [];
      for (var a = 0; a < Math.PI * 2; a += this.angle) {
        var point = _util2.default.from_polar_coords(a, 1);
        point.on_border = true;
        this.points.push(point);
        border_points.push(point);
      }
      var step = this.calc_step();
      for (var y = -1; y < 1; y += step) {
        for (var x = -1; x < 1; x += step) {
          var _point = { x: x, y: y, on_border: false };
          if (!this.check_in_circle(_point, 1 - step / 2)) {
            continue;
          }
          this.points.push(_point);
          grid_points.push(_point);
        }
      }

      var all_points = grid_points.concat(border_points);
      grid_points.forEach(function (point) {
        return point.links = all_points.filter(function (p) {
          return _util2.default.distance(point, p) <= 1.5 * step;
        });
      });
      var open_list = grid_points.slice();
      // note that we process only grid points!
      this.process_links(open_list);
    }
  }, {
    key: "process_links",
    value: function process_links(open_list) {
      if (!open_list.length) {
        return;
      }
      var element = _util2.default.rand_element(open_list);
      if (element.links.length < 2) {
        throw 'bad element, less than 2 links';
      }
      var count_border = element.links.filter(function (e) {
        return e.on_border;
      }).length;
      // if only one link to border point left, dont delete it
      var links_to_process = count_border > 1 ? element.links : element.links.filter(function (e) {
        return !e.on_border;
      });
      var link_to_delete = _util2.default.rand_element(links_to_process);
      _util2.default.remove_element(link_to_delete, element.links);
      if (element.links.length <= 2) {
        _util2.default.remove_element(element, open_list);
      }
      // on-border points dont have links
      if (!link_to_delete.on_border) {
        if (!_util2.default.remove_element(element, link_to_delete.links)) {
          console.log('WARNING! linked element had no backlink', link_to_delete, element);
        }
        if (link_to_delete.links.length < 2 && !link_to_delete.on_border) {
          console.log('too bad but some point now has less that 2 links', link_to_delete);
        }
        if (link_to_delete.links.length <= 2) {
          _util2.default.remove_element(link_to_delete, open_list);
        }
      }
      this.process_links(open_list);
    }
  }, {
    key: "check_in_circle",
    value: function check_in_circle(point) {
      var radius = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

      return _util2.default.distance(point, { x: 0, y: 0 }) < radius;
    }
  }, {
    key: "calc_step",
    value: function calc_step() {
      return (1 - -1) / this.size;
    }
  }, {
    key: "draw",
    value: function draw(scale) {
      var func = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.draw_naive.bind(this);

      var graphics = new PIXI.Graphics();
      //graphics.scale = {x: scale, y: scale};
      func(graphics, scale);
      return graphics;
    }
  }, {
    key: "draw_naive",
    value: function draw_naive(graphics) {
      var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

      var step = this.calc_step();
      var radius = step / 6;
      var color = [30, 0, 0];

      this.points.forEach(function (point) {
        graphics.beginFill(_color2.default.to_pixi(color));
        graphics.drawCircle(scale * point.x, scale * point.y, scale * radius);
        graphics.closePath();
        graphics.endFill();

        if (point.links) {
          point.links.forEach(function (link) {
            graphics.lineStyle(scale * step / 10, _color2.default.to_pixi(color));
            graphics.moveTo(scale * point.x, scale * point.y);
            graphics.lineTo(scale * link.x, scale * link.y);
            graphics.closePath();
            graphics.lineStyle(0, _color2.default.to_pixi(color));
          });
        }
      });
    }
  }]);

  return Links;
}();

exports.default = Links;

});

require.register("experimental/texture_generators/points_in_circle.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

var _color = require("common/color");

var _color2 = _interopRequireDefault(_color);

var _d = require("d3");

var d3 = _interopRequireWildcard(_d);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

////////////////////////////////////////////////
// WARNING!!! doesnt work, rewite to BasicDrawer
////////////////////////////////////////////////
var PointsInCicrle = function () {
  function PointsInCicrle() {
    _classCallCheck(this, PointsInCicrle);
  }

  _createClass(PointsInCicrle, [{
    key: "generate",
    value: function generate(count, func) {
      this.points = [];
      while (count--) {
        var angle = Math.random() * 2 * Math.PI;
        var radius = func(Math.random());
        var coords = _util2.default.from_polar_coords(angle, radius);
        this.points.push({ angle: angle, radius: radius, x: coords.x, y: coords.y });
      }
      this.points;
      return true;
    }
  }, {
    key: "draw",
    value: function draw(scale) {
      var color = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [50, 100, 0];

      var graphics = new PIXI.Graphics();
      var radius = .01;

      this.points.forEach(function (point) {
        graphics.beginFill(_color2.default.to_pixi(_color2.default.random_near(color, 20)));
        graphics.drawCircle(scale * point.x, scale * point.y, scale * radius);
        graphics.closePath();
        graphics.endFill();
      });

      return graphics;
    }
  }, {
    key: "draw_triangles",
    value: function draw_triangles(scale) {
      var color = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [50, 100, 0];

      var voronoi = d3.voronoi().x(function (p) {
        return p.x;
      }).y(function (p) {
        return p.y;
      });
      var diagram = voronoi(this.points);
      var triangles = diagram.triangles();

      var graphics = new PIXI.Graphics();
      triangles.forEach(function (triangle) {
        graphics.beginFill(_color2.default.to_pixi(_color2.default.random_near(color, 20)));
        graphics.drawPolygon(triangle.map(function (point) {
          return new PIXI.Point(scale * point.x, scale * point.y);
        }));
        graphics.closePath();
        graphics.endFill();
      });
      graphics.lineStyle(scale * .005, _color2.default.to_pixi(_color2.default.brighter(color, 100)));
      /*
      very strange and beautiful
      diagram.edges.forEach(edge => {
        if (!edge[1]) {
          return;
        }
        graphics.moveTo(scale * edge[0][0], scale * edge[0][1]);
        graphics.lineTo(scale * edge[1][0], scale * edge[1][1]);
        graphics.closePath();
      });
      */
      triangles.forEach(function (triangle) {
        // pixi has sharp angles when joining lines in path, so do not use path
        graphics.moveTo(scale * triangle[0].x, scale * triangle[0].y);
        graphics.lineTo(scale * triangle[1].x, scale * triangle[1].y);
        graphics.moveTo(scale * triangle[1].x, scale * triangle[1].y);
        graphics.lineTo(scale * triangle[2].x, scale * triangle[2].y);
        graphics.moveTo(scale * triangle[2].x, scale * triangle[2].y);
        graphics.lineTo(scale * triangle[0].x, scale * triangle[0].y);
      });
      return graphics;
    }
  }], [{
    key: "linear",
    value: function linear(random) {
      return random;
    }
  }, {
    key: "pow",
    value: function pow(random) {
      return Math.pow(random, 0.2);
    }
  }]);

  return PointsInCicrle;
}();

exports.default = PointsInCicrle;

});

require.register("geo/balls_generator.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

var _voronoi_diagram = require("common/voronoi_diagram");

var _voronoi_diagram2 = _interopRequireDefault(_voronoi_diagram);

var _color = require("common/color");

var _color2 = _interopRequireDefault(_color);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BallsGenerator = function () {
  function BallsGenerator(diagram, color_map, drawer) {
    _classCallCheck(this, BallsGenerator);

    this.diagram = diagram;
    this.color_map = color_map;
    this.drawer = drawer;
  }

  _createClass(BallsGenerator, [{
    key: "generate",
    value: function generate() {
      var num_balls = 0.6 * this.drawer.map.view.width * this.drawer.map.view.height | 0;
      console.log('num_balls', num_balls);
      var ball_radius_min = 1;
      var ball_radius_max = 5;
      var color_step = 5;
      var color_count = 2;
      var graphics = new PIXI.Graphics();
      while (num_balls--) {
        var rx = _util2.default.rand(1, this.drawer.map.view.width - 1);
        var ry = _util2.default.rand(1, this.drawer.map.view.height - 1);
        var cell = _voronoi_diagram2.default.find({ x: rx, y: ry }, this.diagram);
        var base = this.color_map[cell.geo_type];
        var color = _color2.default.random_near(base, color_step, color_count);
        var radius = _util2.default.rand(ball_radius_min, ball_radius_max);
        graphics.beginFill(_color2.default.to_pixi(color));
        graphics.drawCircle(rx, ry, radius);
        graphics.endFill();
      }
      var texture = graphics.generateCanvasTexture(PIXI.SCALE_MODES.LINEAR);
      var sprite = new PIXI.Sprite(texture);
      this.drawer.layers['geo'].addChild(sprite);
    }
  }]);

  return BallsGenerator;
}();

exports.default = BallsGenerator;

});

require.register("geo/components/app.jsx", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _collapsible_panel = require('common/components/collapsible_panel');

var _collapsible_panel2 = _interopRequireDefault(_collapsible_panel);

var _debug_info = require('geo/components/debug_info');

var _debug_info2 = _interopRequireDefault(_debug_info);

var _generate_world_form = require('geo/components/generate_world_form');

var _generate_world_form2 = _interopRequireDefault(_generate_world_form);

var _drawing_settings_form = require('geo/components/drawing_settings_form');

var _drawing_settings_form2 = _interopRequireDefault(_drawing_settings_form);

var _roads_form = require('geo/components/roads_form');

var _roads_form2 = _interopRequireDefault(_roads_form);

var _legend = require('geo/components/legend');

var _legend2 = _interopRequireDefault(_legend);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App = function (_React$Component) {
  _inherits(App, _React$Component);

  function App() {
    _classCallCheck(this, App);

    return _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).apply(this, arguments));
  }

  _createClass(App, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'table',
        { style: { margin: '5px', borderSpacing: '5px', borderCollapse: 'separate' } },
        _react2.default.createElement(
          'tbody',
          null,
          _react2.default.createElement(
            'tr',
            { style: { verticalAlign: 'top' } },
            _react2.default.createElement(
              'td',
              null,
              _react2.default.createElement(
                'div',
                { className: 'panel-group' },
                _react2.default.createElement(
                  'div',
                  { className: 'panel panel-success' },
                  _react2.default.createElement(
                    'div',
                    { className: 'panel-body' },
                    _react2.default.createElement(
                      'div',
                      { className: '', id: 'map_container' },
                      _react2.default.createElement('canvas', { id: 'map', width: '800', height: '800' })
                    )
                  )
                ),
                _react2.default.createElement(_collapsible_panel2.default, { header: 'debug', name: 'debug', content_func: function content_func() {
                    return _react2.default.createElement(_debug_info2.default);
                  } })
              )
            ),
            _react2.default.createElement(
              'td',
              { width: '100%' },
              _react2.default.createElement(
                'div',
                { className: 'panel-group' },
                _react2.default.createElement(
                  'div',
                  { className: 'panel panel-success' },
                  _react2.default.createElement(
                    'div',
                    { className: 'panel-body' },
                    _react2.default.createElement(_collapsible_panel2.default, { header: 'world generating', name: 'generate_world', content_func: function content_func() {
                        return _react2.default.createElement(_generate_world_form2.default);
                      } }),
                    _react2.default.createElement(_collapsible_panel2.default, { header: 'drawing settings', name: 'drawing_settings', content_func: function content_func() {
                        return _react2.default.createElement(_drawing_settings_form2.default);
                      } }),
                    _react2.default.createElement(_collapsible_panel2.default, { header: 'roads', name: 'roads', content_func: function content_func() {
                        return _react2.default.createElement(_roads_form2.default);
                      } })
                  ),
                  _react2.default.createElement(
                    'div',
                    { className: 'panel-footer' },
                    _react2.default.createElement(_collapsible_panel2.default, { header: 'legend', name: 'legend', content_func: function content_func() {
                        return _react2.default.createElement(_legend2.default);
                      } })
                  )
                )
              )
            )
          )
        )
      );
    }
  }]);

  return App;
}(_react2.default.Component);

exports.default = App;

});

require.register("geo/components/debug_info.jsx", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DebugInfo = function (_React$Component) {
  _inherits(DebugInfo, _React$Component);

  function DebugInfo() {
    _classCallCheck(this, DebugInfo);

    return _possibleConstructorReturn(this, (DebugInfo.__proto__ || Object.getPrototypeOf(DebugInfo)).apply(this, arguments));
  }

  _createClass(DebugInfo, [{
    key: "render",
    value: function render() {
      return _react2.default.createElement(
        "div",
        null,
        _react2.default.createElement(
          "div",
          null,
          "FPS: ",
          _react2.default.createElement("span", { id: "fps_counter" })
        ),
        _react2.default.createElement(
          "div",
          null,
          "map scale: ",
          _react2.default.createElement("span", { id: "map_scale" })
        ),
        _react2.default.createElement(
          "div",
          null,
          "mouse position: ",
          _react2.default.createElement(
            "span",
            { id: "mouse_pos" },
            (0, 0)
          )
        ),
        _react2.default.createElement(
          "div",
          null,
          "world point: ",
          _react2.default.createElement(
            "span",
            { id: "world_pos" },
            (0, 0)
          )
        )
      );
    }
  }]);

  return DebugInfo;
}(_react2.default.Component);

exports.default = DebugInfo;

});

require.register("geo/components/drawing_settings_form.jsx", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _input_spinner = require('common/components/input_spinner');

var _input_spinner2 = _interopRequireDefault(_input_spinner);

var _active_checkbox = require('common/components/active_checkbox');

var _active_checkbox2 = _interopRequireDefault(_active_checkbox);

var _game = require('geo/game');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DrawingSettingsForm = function (_React$Component) {
  _inherits(DrawingSettingsForm, _React$Component);

  _createClass(DrawingSettingsForm, [{
    key: 'submit',
    value: function submit(e) {
      e.preventDefault();
    }
  }]);

  function DrawingSettingsForm() {
    _classCallCheck(this, DrawingSettingsForm);

    return _possibleConstructorReturn(this, (DrawingSettingsForm.__proto__ || Object.getPrototypeOf(DrawingSettingsForm)).call(this));
  }

  _createClass(DrawingSettingsForm, [{
    key: 'checkbox_handler',
    value: function checkbox_handler(event, checkbox_type) {
      _game.game.map_drawer.draw_voronoi_diagram = !_game.game.map_drawer.draw_voronoi_diagram;
      _game.game.map_drawer.set_layers_visibility();
      this.setState({});
    }
  }, {
    key: 'create_checkbox',
    value: function create_checkbox(prop_name, text) {
      return _react2.default.createElement(_active_checkbox2.default, {
        checked: _game.game.map_drawer[prop_name],
        handler: function handler() {
          _game.game.map_drawer[prop_name] = !_game.game.map_drawer[prop_name];
          _game.game.map_drawer.set_layers_visibility();
          return _game.game.map_drawer[prop_name];
        },
        text: text
      });
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'form',
          { className: 'form-horizontal' },
          this.create_checkbox('draw_voronoi_diagram', 'draw voronoi diagram')
        )
      );
    }
  }]);

  return DrawingSettingsForm;
}(_react2.default.Component);

exports.default = DrawingSettingsForm;

});

require.register("geo/components/generate_world_form.jsx", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _input_spinner = require('common/components/input_spinner');

var _input_spinner2 = _interopRequireDefault(_input_spinner);

var _game = require('geo/game');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GenerateWorldForm = function (_React$Component) {
  _inherits(GenerateWorldForm, _React$Component);

  function GenerateWorldForm() {
    _classCallCheck(this, GenerateWorldForm);

    return _possibleConstructorReturn(this, (GenerateWorldForm.__proto__ || Object.getPrototypeOf(GenerateWorldForm)).apply(this, arguments));
  }

  _createClass(GenerateWorldForm, [{
    key: 'submit',
    value: function submit(e) {
      _game.game.rrt_epsilon = parseInt(document.querySelector('#gwf_rrt_epsilon').value);
      e.preventDefault();
      console.clear();
      _game.game.map_drawer.map.stage.children.forEach(function (layer) {
        return layer.removeChildren();
      });
      _game.game.generate_map();
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'form',
          { className: 'form-horizontal' },
          _react2.default.createElement(
            'div',
            { className: 'form-group' },
            _react2.default.createElement(
              'label',
              { htmlFor: 'epsilon', className: 'col-sm-4 control-label' },
              'rrt nodes distance'
            ),
            _react2.default.createElement(
              'div',
              { className: 'col-sm-8' },
              _react2.default.createElement(_input_spinner2.default, { name: 'gwf_rrt_epsilon', value: _game.game.rrt_epsilon })
            )
          ),
          _react2.default.createElement(
            'div',
            { className: 'form-group' },
            _react2.default.createElement(
              'div',
              { className: 'col-sm-offset-4 col-sm-8' },
              _react2.default.createElement(
                'button',
                { type: 'button', className: 'btn btn-default', id: 'generate_world', onClick: this.submit.bind(this) },
                'generate'
              )
            )
          )
        )
      );
    }
  }]);

  return GenerateWorldForm;
}(_react2.default.Component);

exports.default = GenerateWorldForm;

});

require.register("geo/components/legend.jsx", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Legend = function (_React$Component) {
  _inherits(Legend, _React$Component);

  function Legend() {
    _classCallCheck(this, Legend);

    return _possibleConstructorReturn(this, (Legend.__proto__ || Object.getPrototypeOf(Legend)).apply(this, arguments));
  }

  _createClass(Legend, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'p',
          null,
          'here will be map legend...'
        )
      );
    }
  }]);

  return Legend;
}(_react2.default.Component);

exports.default = Legend;

});

require.register("geo/components/roads_form.jsx", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RoadsForm = function (_React$Component) {
  _inherits(RoadsForm, _React$Component);

  function RoadsForm() {
    _classCallCheck(this, RoadsForm);

    return _possibleConstructorReturn(this, (RoadsForm.__proto__ || Object.getPrototypeOf(RoadsForm)).apply(this, arguments));
  }

  _createClass(RoadsForm, [{
    key: "render",
    value: function render() {
      return _react2.default.createElement(
        "div",
        null,
        _react2.default.createElement(
          "form",
          { className: "form-horizontal" },
          _react2.default.createElement(
            "p",
            null,
            "in test mode for now, nothing works..."
          ),
          _react2.default.createElement(
            "button",
            { type: "button", className: "btn btn-success", id: "build_road" },
            "build road"
          ),
          _react2.default.createElement("div", { id: "road_text" })
        )
      );
    }
  }]);

  return RoadsForm;
}(_react2.default.Component);

exports.default = RoadsForm;

});

require.register("geo/game.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

var _voronoi_diagram = require("common/voronoi_diagram");

var _voronoi_diagram2 = _interopRequireDefault(_voronoi_diagram);

var _regions_gatherer = require("geo/regions_gatherer");

var _regions_gatherer2 = _interopRequireDefault(_regions_gatherer);

var _rrt_diagram = require("geo/rrt_diagram");

var _rrt_diagram2 = _interopRequireDefault(_rrt_diagram);

var _geo = require("geo/geo");

var _geo2 = _interopRequireDefault(_geo);

var _a_star = require("common/a_star");

var _a_star2 = _interopRequireDefault(_a_star);

var _interaction = require("geo/interaction");

var _interaction2 = _interopRequireDefault(_interaction);

var _map_drawer = require("geo/map_drawer");

var _map_drawer2 = _interopRequireDefault(_map_drawer);

var _app = require("geo/components/app");

var _app2 = _interopRequireDefault(_app);

var _reactDom = require("react-dom");

var _reactDom2 = _interopRequireDefault(_reactDom);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Game = function () {
  function Game() {
    _classCallCheck(this, Game);

    // CONST
    this.width = 800;
    this.height = 800;
    this.cells_count = Infinity;
    this.rrt_epsilon = 35;
    this.rrt_reject_limit = 500;
    this.map_drawer = new _map_drawer2.default();
    this.interaction = new _interaction2.default();
  }

  _createClass(Game, [{
    key: "generate_map",
    value: function generate_map() {
      var _this = this;

      this.rrt = new _rrt_diagram2.default(this.width, this.height);
      this.rrt.generate(this.rrt_epsilon, this.cells_count, this.rrt_reject_limit);
      this.diagram = _voronoi_diagram2.default.generate(this.rrt.nodes, this.width, this.height);

      // find closes point
      this.diagram.cells.forEach(function (cell) {
        return cell.closest_backlinks = [];
      });
      this.diagram.cells.forEach(function (cell) {
        cell.closest_link = cell.links[0];
        _util2.default.push_uniq(cell, cell.closest_link.closest_backlinks);
      });

      // find close-to-border 
      this.diagram.cells.forEach(function (cell) {
        cell.on_border = false;
      });
      this.diagram.edges.forEach(function (edge) {
        if (!edge.right) {
          edge.on_border = true;
          edge.from.on_border = true;
          edge.to.on_border = true;
          _this.diagram.cells[edge.left.index].on_border = true;
        }
      });

      this.map_drawer.init(this.diagram, this.rrt, this.width, this.height);
      this.interaction.init();
      this.geo = new _geo2.default(this.diagram, this.rrt, this.map_drawer);
      this.map_drawer.draw();

      this.map_drawer.highlight_bad_river_links();
      this.map_drawer.highlight_local_minimums();
      //this.map_drawer.print_text_for_each_cell(cell => cell.fertility);
    }
  }]);

  return Game;
}();

var game = new Game();
module.exports.game = game; // OMG global export BAD WAY

document.addEventListener('DOMContentLoaded', function () {
  _reactDom2.default.render(_react2.default.createElement(_app2.default, null), document.querySelector('#app'));
  game.generate_map();
});

});

require.register("geo/geo.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

var _rrt_diagram = require("geo/rrt_diagram");

var _rrt_diagram2 = _interopRequireDefault(_rrt_diagram);

var _rivers_and_lakes_generator = require("geo/rivers_and_lakes_generator");

var _rivers_and_lakes_generator2 = _interopRequireDefault(_rivers_and_lakes_generator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Geo = function () {
  function Geo(diagram, rrt, map_drawer) {
    _classCallCheck(this, Geo);

    this.map_drawer = map_drawer;
    this.sea_ratio = 0.3;
    this.rock_height_ratio = 0.75;
    this.rrt_regions = 3;
    this.diagram = diagram;
    this.rrt = rrt;
    var max_branch_order = _util2.default.find_min_and_max(this.rrt.nodes, function (node) {
      return node.branch_order;
    }).max;
    console.log('WE GONNA remove_some_links_and_recalc_all', this.rrt_regions - 1);
    var deleted_links = this.rrt.remove_some_links_and_recalc_all(this.rrt_regions - 1, max_branch_order - 10, max_branch_order - 2);
    var centers = this.rrt.nodes.filter(function (node) {
      return node.generation == 0;
    });
    console.log('rrt centers', centers);
    this.init_height();
    this.generate_heights_by_rrt_generations();
    this.generate_heights_by_rrt_branches_length();
    this.height_smooth(); // experimental
    this.set_nodes_height_by_cell_height();
    this.generate_sea(this.sea_ratio);

    //this.map_drawer.print_text_for_each_cell(cell => cell.branch_order);
    this.rrt.restore_removed_links(deleted_links);
    this.map_drawer.highlight_deleted_links(deleted_links);

    this.generate_rivers();
    this.generate_rocks_by_height();
    this.calc_fertility();
    this.geo_types_by_fertility();
  }

  _createClass(Geo, [{
    key: "generate_sea",
    value: function generate_sea(sea_ratio) {
      var _this = this;

      var sea_cells_threshold = Math.floor(sea_ratio * this.diagram.cells.length);
      var count_sea_cells = 0;

      var _loop = function _loop(i) {
        if (count_sea_cells >= sea_cells_threshold) {
          return "break";
        }
        var open_list = [];
        _this.diagram.cells.forEach(function (cell) {
          if (cell.height <= i && cell.geo_type != 'sea') {
            open_list.push(cell);
          }
        });
        var length_before = void 0;
        do {
          length_before = open_list.length;
          open_list = open_list.filter(function (cell) {
            // we dont set sea type to inland regions, only to connected to other seas
            if (cell.on_border || cell.links.some(function (c) {
              return c.geo_type == 'sea';
            })) {
              cell.geo_type = 'sea';
              count_sea_cells++;
              return false;
            }
            return true;
          });
        } while (open_list.length && length_before != open_list.length);
      };

      for (var i in this.heights_stat()) {
        var _ret = _loop(i);

        if (_ret === "break") break;
      }
      // set shores
      this.diagram.cells.forEach(function (cell) {
        cell.shore = cell.geo_type != 'sea' && cell.links.some(function (c) {
          return c.geo_type == 'sea';
        });
      });
    }
  }, {
    key: "generate_rocks_by_height",
    value: function generate_rocks_by_height() {
      var _this2 = this;

      var max_height = _util2.default.find_min_and_max(this.rrt.nodes, function (e) {
        return e.height;
      }).max;
      this.rock_from_height = Math.ceil(this.rock_height_ratio * max_height);
      this.diagram.cells.forEach(function (cell) {
        if (cell.height >= _this2.rock_from_height) {
          cell.geo_type = 'rock';
        }
      });
    }
  }, {
    key: "generate_rivers",
    value: function generate_rivers() {
      _rivers_and_lakes_generator2.default.generate_by_edges(this.diagram);
    }
  }, {
    key: "calc_fertility",
    value: function calc_fertility() {
      var square_sum = 0;
      this.diagram.cells.forEach(function (cell) {
        return square_sum += _util2.default.convex_polygon_square(cell.nodes);
      });
      var fertility_multiplier = Math.round(square_sum / this.diagram.cells.length);

      this.diagram.cells.forEach(function (cell) {
        if (cell.geo_type == 'sea') {
          cell.fertility = 0;
          return;
        }
        var sum_rivers_strength = 0;
        var square = _util2.default.convex_polygon_square(cell.nodes);
        cell.nodes.forEach(function (node) {
          return sum_rivers_strength += node.river ? node.river.strength : 0;
        });
        cell.fertility = Math.ceil(fertility_multiplier * sum_rivers_strength / square);
      });
    }
  }, {
    key: "geo_types_by_fertility",
    value: function geo_types_by_fertility() {
      var stats = [];
      this.diagram.cells.forEach(function (cell) {
        return _util2.default.push_uniq(cell.fertility, stats);
      });
      stats.sort(function (e1, e2) {
        return e1 - e2;
      });
      var min = stats[0];
      var max = stats[Math.floor(0.95 * stats.length)]; // 95% persentile cause there's big gaps in the end
      var geo_type_fertility_thresholds = {
        bog: _util2.default.normalize_value(0.55, 1, max, 0, min),
        grass: _util2.default.normalize_value(0.15, 1, max, 0, min),
        steppe: _util2.default.normalize_value(0.05, 1, max, 0, min),
        desert: _util2.default.normalize_value(0.0, 1, max, 0, min)
      };

      this.diagram.cells.forEach(function (cell) {
        if (cell.geo_type) {
          return;
        }
        for (var i in geo_type_fertility_thresholds) {
          if (cell.fertility >= geo_type_fertility_thresholds[i]) {
            cell.geo_type = i;
            break;
          }
        }
      });
    }
  }, {
    key: "init_height",
    value: function init_height() {
      this.rrt.nodes.forEach(function (node) {
        return node.height = 0;
      });
    }
  }, {
    key: "generate_heights_by_rrt_branches_length",
    value: function generate_heights_by_rrt_branches_length() {
      var step = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;
      var floor_level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      this.rrt.nodes.forEach(function (node) {
        return node.height += step * node.branch_order + floor_level;
      });
    }
  }, {
    key: "height_smooth",
    value: function height_smooth() {
      var max_diff_coef = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0.3;

      var h = _util2.default.find_min_and_max(this.rrt.nodes, function (node) {
        return node.height;
      });
      var max_diff = max_diff_coef * (h.max - h.min);
      var changed = 0;
      do {
        changed = 0;
        this.diagram.cells.forEach(function (cell) {
          var max_height = _util2.default.find_min_and_max(cell.links, function (c) {
            return c.height;
          }).max;
          var height_to_max_diff = max_height - max_diff;
          if (cell.height < height_to_max_diff) {
            cell.height = height_to_max_diff;
            changed++;
          }
        });
        console.log('height smooth cycle cells changed', changed);
      } while (changed > 0);
    }
  }, {
    key: "generate_heights_by_rrt_generations",
    value: function generate_heights_by_rrt_generations() {
      var peak_max_height = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 200;
      var peak_min_height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 200;
      var step = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;

      var peak_height = _util2.default.rand(peak_min_height, peak_max_height);
      this.rrt.nodes.forEach(function (node) {
        return node.height += Math.max(node.height, peak_height - step * node.generation);
      });
    }
  }, {
    key: "set_nodes_height_by_cell_height",
    value: function set_nodes_height_by_cell_height() {
      this.diagram.nodes.forEach(function (node) {
        //node.height = Math.round(node.cells.reduce((acc, cell) => cell.height + acc, 0) / node.cells.length);
        node.height = _util2.default.find_min_and_max(node.cells, function (cell) {
          return cell.height;
        }).min;
      });
    }

    // for seas and like that

  }, {
    key: "heights_stat",
    value: function heights_stat() {
      var stat = [];
      this.diagram.cells.forEach(function (cell) {
        if (!stat[cell.height]) stat[cell.height] = 0;
        stat[cell.height]++;
      });
      //stat.forEach((e, i) => console.log('height', i, e));
      return stat;
    }
  }]);

  return Geo;
}();

exports.default = Geo;

});

require.register("geo/interaction.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

var _voronoi_diagram = require("common/voronoi_diagram");

var _voronoi_diagram2 = _interopRequireDefault(_voronoi_diagram);

var _d = require("d3");

var d3 = _interopRequireWildcard(_d);

var _game = require("geo/game");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Interaction = function () {
  function Interaction() {
    _classCallCheck(this, Interaction);

    this.cell_under_cursor = null;
    this.state = 'initial';
  }

  _createClass(Interaction, [{
    key: "init",
    value: function init() {
      var _this = this;

      this.game = _game.game;
      document.getElementById('build_road').onclick = this.build_road_button_handler.bind(this);
      this.map = this.game.map_drawer.map;
      this.map.stage.interactive = true;

      document.addEventListener('mousemove', this.map_mouse_move_handler.bind(this), false);

      d3.select('#map').on('click', this.map_click_handler.bind(this));

      // from https://bl.ocks.org/pkerpedjiev/cf791db09ebcabaec0669362f4df1776
      d3.select('#map').call(d3.zoom().scaleExtent([1, 4]).translateExtent([[0, 0], [this.map.view.width, this.map.view.height]]).on("zoom", this.map_zoom.bind(this)));

      this.road_text_div = document.getElementById("road_text");

      this.ticks = 0; // here?
      this.fps_div = document.getElementById('fps_counter');
      this.map.ticker.add(function () {
        _this.ticks++;
        if (_this.ticks % 10 == 0) {
          d3.select('#fps_counter').html(_this.map.ticker.FPS | 0);
        }
      });
      this.update_map_scale();
    }
  }, {
    key: "change_state",
    value: function change_state(state) {
      this.state = state;
      if (state == 'initial') {
        d3.select('#road_text').html('');
        this.road_start_cell = null;
      } else if (state == 'build_road_choose_start') {
        d3.select('#road_text').html('click road start cell');
        this.road_start_cell = null;
      } else if (state == 'build_road_choose_finish') {
        d3.select('#road_text').html('click road finish cell');
      } else if (state == 'build_road') {
        //this.game.build_road(this.road_start_cell, this.road_finish_cell);
        console.log('suppose the road is built now');
        this.change_state('initial');
      }
    }

    //
    //  user actions handlers
    //

  }, {
    key: "build_road_button_handler",
    value: function build_road_button_handler(args) {
      this.change_state('build_road_choose_start');
    }
  }, {
    key: "map_mouse_move_handler",
    value: function map_mouse_move_handler(event) {
      if (event.target != this.map.view) {
        this.game.map_drawer.clear_cell_under_cursor();
        this.cell_under_cursor = null;
        return false;
      }
      var mouse_coords = this.get_mouse_coords(event);
      // TODO check if its fast enought
      var cell = this.get_cell_under_cursor(mouse_coords);
      if (!this.cell_under_cursor || this.cell_under_cursor != cell) {
        this.game.map_drawer.highlight_cell_under_cursor(cell);
        this.cell_under_cursor = cell;
      }

      d3.select('#mouse_pos').html('{x: ' + mouse_coords.x + ', y: ' + mouse_coords.y + '}');
      var world_pos = this.mouse_coords_to_world_coords(mouse_coords);
      d3.select('#world_pos').html('{x: ' + world_pos.x + ', y: ' + world_pos.y + '}');
    }
  }, {
    key: "map_click_handler",
    value: function map_click_handler() {
      var mouse_coords = this.get_mouse_coords(d3.event);
      var cell = this.get_cell_under_cursor(mouse_coords);
      if (!cell) {
        console.log('dunno why, but no cell under cursor');
        return false;
      }
      console.log('mouse click cell under cursor', cell);
      if (this.state == 'build_road_choose_start') {
        this.road_start_cell = cell;
        this.change_state('build_road_choose_finish');
      } else if (this.state == 'click road finish cell') {
        this.road_finish_cell = cell;
        this.change_state('build_road');
      }
    }
  }, {
    key: "map_zoom",
    value: function map_zoom() {
      this.map.stage.position.x = d3.event.transform.x;
      this.map.stage.position.y = d3.event.transform.y;
      this.map.stage.scale.x = d3.event.transform.k;
      this.map.stage.scale.y = d3.event.transform.k;
      this.update_map_scale();
    }
    ///////////////////////////////////////


  }, {
    key: "update_map_scale",
    value: function update_map_scale() {
      d3.select('#map_scale').html('{x: ' + this.map.stage.scale.x + ', y: ' + this.map.stage.scale.y + '}');
    }

    ///////////////////////////////////////  
    // UTILS
    ///////////////////////////////////////

  }, {
    key: "get_mouse_coords",
    value: function get_mouse_coords(event) {
      return { x: event.offsetX, y: event.offsetY };
    }
  }, {
    key: "get_cell_under_cursor",
    value: function get_cell_under_cursor(mouse_coords) {
      var world_coords = this.mouse_coords_to_world_coords(mouse_coords);
      return _voronoi_diagram2.default.find(world_coords, this.game.map_drawer.diagram);
    }
  }, {
    key: "mouse_coords_to_world_coords",
    value: function mouse_coords_to_world_coords(mouse_coords) {
      var xn = Math.floor((mouse_coords.x - this.map.stage.position.x) / this.map.stage.scale.x),
          yn = Math.floor((mouse_coords.y - this.map.stage.position.y) / this.map.stage.scale.y);
      return { x: xn, y: yn };
    }
  }]);

  return Interaction;
}();

exports.default = Interaction;

});

require.register("geo/map_drawer.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

var _rrt_diagram = require("geo/rrt_diagram");

var _rrt_diagram2 = _interopRequireDefault(_rrt_diagram);

var _texture_generator = require("geo/texture_generator");

var _texture_generator2 = _interopRequireDefault(_texture_generator);

var _balls_generator = require("geo/balls_generator");

var _balls_generator2 = _interopRequireDefault(_balls_generator);

var _color = require("common/color");

var _color2 = _interopRequireDefault(_color);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MapDrawer = function () {
  function MapDrawer() {
    _classCallCheck(this, MapDrawer);
  }

  _createClass(MapDrawer, [{
    key: "init",
    value: function init(diagram, rrt, width, height) {
      var _this = this;

      var PIXI = require('pixi.js');
      this.map = new PIXI.Application(width, height, {
        backgroundColor: _color2.default.to_pixi([0, 0, 0]),
        antialias: true,
        view: document.getElementById('map')
      });
      console.log('renderer', this.map.renderer);
      this.layers = {};
      MapDrawer.layers().forEach(function (layer) {
        _this.layers[layer] = new PIXI.Container();
        _this.map.stage.addChild(_this.layers[layer]);
      });
      document.getElementById('map_container').appendChild(this.map.view);
      this.diagram = diagram;
      this.rrt = rrt;
    }
  }, {
    key: "draw",
    value: function draw() {
      this.draw_voronoi_diagram = true;
      this.draw_rrt_links = true;
      this.draw_arrows = false;
      this.draw_height = false;
      this.draw_rivers = true;
      this.draw_geo_types = true;
      this.dark_mode = false; // DEBUG MODE
      var water_color = [0, 50, 200];

      this.init_heignts();
      this.init_geo_types();
      this.init_arrows();
      this.init_rrt();
      this.init_rivers(water_color);

      var rg = new PIXI.Graphics();
      this.layers['water'].addChild(rg);
      this.diagram.cells.forEach(function (cell) {
        if (cell.geo_type == 'lake') {
          MapDrawer.draw_smoothed_polygon(rg, cell.nodes, cell, water_color);
        }
      });
      this.init_dark_mode();

      this.set_layers_visibility();
    }
  }, {
    key: "set_layers_visibility",
    value: function set_layers_visibility() {
      this.layers['heights'].visible = this.draw_height;
      this.layers['geo'].visible = this.draw_geo_types;
      this.layers['arrows'].visible = this.draw_arrows;
      this.layers['rrt_links'].visible = this.draw_rrt_links;
      this.layers['water'].visible = this.draw_rivers;
      if (!this.draw_voronoi_diagram) {
        this.layers['regions'].visible = false;
        this.layers['geo'].visible = false;
        this.layers['heights'].visible = false;
      }
      this.layers['dim_cells'].visible = this.dark_mode;
      this.layers['dim'].visible = this.dark_mode;
    }
  }, {
    key: "clear_cell_under_cursor",
    value: function clear_cell_under_cursor() {
      this.layers['under_cursor'].removeChildren();
    }
  }, {
    key: "highlight_cell_under_cursor",
    value: function highlight_cell_under_cursor(cell) {
      this.clear_cell_under_cursor();
      var polygon = cell.nodes.map(function (node) {
        return new PIXI.Point(node.x, node.y);
      });
      var border_graphics = new PIXI.Graphics();
      border_graphics.alpha = 0.75;
      border_graphics.lineStyle(3, _color2.default.to_pixi([218, 165, 32]));
      border_graphics.drawPolygon(polygon);
      border_graphics.closePath(); // strange, but it needed here. some edges are thin without it
      var inner_graphics = new PIXI.Graphics();
      inner_graphics.alpha = 0.35;
      inner_graphics.beginFill(_color2.default.to_pixi([255, 255, 255]));
      inner_graphics.drawPolygon(polygon);
      inner_graphics.closePath(); // strange, but it needed here. some edges are thin without it
      inner_graphics.endFill();

      this.layers['under_cursor'].addChild(border_graphics);
      this.layers['under_cursor'].addChild(inner_graphics);
    }
  }, {
    key: "init_rivers",
    value: function init_rivers(water_color) {
      var draw_arrows = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var graphics = new PIXI.Graphics();
      var graphics_arrows = new PIXI.Graphics();
      graphics_arrows.alpha = 0.5;
      this.diagram.nodes.forEach(function (node) {
        if (!node.river) return;
        if (node.river.strength === 0) {
          //let dry_river_color = [121, 96, 76];
          var dry_river_color = [87, 65, 47];
          graphics.lineStyle(2, _color2.default.to_pixi(dry_river_color));
        } else {
          graphics.lineStyle(MapDrawer.get_line_width_for_river(node.river.strength), _color2.default.to_pixi(water_color));
        }
        node.river.children.forEach(function (child) {
          graphics.moveTo(node.x, node.y);
          graphics.lineTo(child.x, child.y);
          graphics.closePath();
          MapDrawer.draw_arrow(node, child, graphics_arrows, 1, [200, 100, 0]);
        });
      });
      this.layers['water'].addChild(graphics);
      if (draw_arrows) this.layers['water'].addChild(graphics_arrows);
    }
  }, {
    key: "highlight_bad_river_links",
    value: function highlight_bad_river_links() {
      var graphics = new PIXI.Graphics();
      graphics.alpha = 0.5;
      this.diagram.nodes.forEach(function (node) {
        if (!node.river) return;
        node.river.children.forEach(function (child) {
          if (child.height > node.height) {
            console.log('river flows up', child.height, node.height);
            graphics.lineStyle(MapDrawer.get_line_width_for_river(node.river.strength), _color2.default.to_pixi([200, 50, 0]));
            graphics.moveTo(node.x, node.y);
            graphics.lineTo(child.x, child.y);
            graphics.closePath();
          }
        });
      });

      this.layers['water'].addChild(graphics);
    }
  }, {
    key: "highlight_local_minimums",
    value: function highlight_local_minimums() {
      var _this2 = this;

      this.diagram.cells.forEach(function (cell) {
        if (cell.geo_type == 'sea') return;
        if (cell.links.every(function (link) {
          return link.height > cell.height;
        })) {
          var graphics = MapDrawer.draw_polygon(cell.nodes, [255, 0, 125]);
          graphics.alpha = 0.5;
          _this2.layers['errors'].addChild(graphics);
          console.log('inland local minimum', cell.x, cell.y);
        }
      });
    }
  }, {
    key: "print_text_for_each_cell",
    value: function print_text_for_each_cell(fn) {
      var _this3 = this;

      this.diagram.cells.forEach(function (cell) {
        var msg = fn(cell);
        var text = new PIXI.Text(msg, { fontFamily: 'Arial', fontSize: 10, fill: 0xff1010 });
        text.x = cell.x + 2;
        text.y = cell.y;
        _this3.layers['errors'].addChild(text);
      });
    }
  }, {
    key: "highlight_deleted_links",
    value: function highlight_deleted_links(deleted_links) {
      var graphics = new PIXI.Graphics();
      deleted_links.forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            from = _ref2[0],
            to = _ref2[1];

        graphics.lineStyle(2, _color2.default.to_pixi([250, 125, 0]));
        graphics.moveTo(from.x, from.y);
        graphics.lineTo(to.x, to.y);
        graphics.closePath();
      });
      this.layers['errors'].addChild(graphics);
    }
  }, {
    key: "init_heignts",
    value: function init_heignts() {
      var _this4 = this;

      var min_height = this.diagram.cells[0].height,
          max_height = this.diagram.cells[0].height;
      this.diagram.cells.forEach(function (cell) {
        if (cell.height < min_height) min_height = cell.height;
        if (cell.height > max_height) max_height = cell.height;
      });
      this.diagram.cells.forEach(function (cell) {
        var c = _util2.default.normalize_value(cell.height, max_height, 255, min_height, 0);
        var graphics = MapDrawer.draw_polygon(cell.nodes, [0, c, 0]);
        _this4.layers['heights'].addChild(graphics); // z-index?
      });
    }
  }, {
    key: "init_geo_types",
    value: function init_geo_types() {
      var _this5 = this;

      var geo_types_colors = {
        sea: [0, 50, 100],
        rock: [60, 60, 50],
        //ITS A HACK! its only a background, we draw lake lower with c draw_smoothed_polygon() and blue color
        lake: [0, 150, 0],
        bog: [50, 100, 0],
        grass: [0, 150, 0],
        steppe: [150, 150, 0],
        desert: [200, 150, 0]
      };
      this.diagram.cells.forEach(function (cell) {
        if (!geo_types_colors[cell.geo_type]) {
          throw 'no geo_type color for '.cell.geo_type;
        }
        var fill_color = geo_types_colors[cell.geo_type];
        var graphics = MapDrawer.draw_polygon(cell.nodes, fill_color);
        _this5.layers['geo'].addChild(graphics);
      });

      //let balls_generator = new BallsGenerator(this.diagram, geo_types_colors, this);
      //balls_generator.generate();
      /*
      let container = new PIXI.Graphics();
      let texture_generator = new TextureGenerator();
      let geo_types_textures = {
        sea: texture_generator.simple([0, 50, 100]),
        rock: texture_generator.simple([60, 60, 50]),
        //ITS A HACK! its only a background, we draw lake lower with c draw_smoothed_polygon() and blue color
        lake: texture_generator.simple([0, 150, 0]),
        bog: texture_generator.simple([50, 100, 0]),
        grass: texture_generator.simple([0, 150, 0]),
        steppe: texture_generator.simple([150, 150, 0]),
        desert: texture_generator.simple([200, 150, 0]),
      };
      
      this.diagram.cells.forEach(cell => {
        if (!geo_types_textures[cell.geo_type]) {
          throw('no geo_type color for '.cell.geo_type);
        }
        let graphics = new PIXI.Graphics();
        graphics.beginFill(0);
        graphics.drawPolygon(cell.nodes.map(node => new PIXI.Point(node.x, node.y)));
        graphics.endFill();
         let xc = Util.find_min_and_max(cell.nodes, e => e.x);
        let yc = Util.find_min_and_max(cell.nodes, e => e.y);
        let sprite = new PIXI.extras.TilingSprite(geo_types_textures[cell.geo_type], xc.max - xc.min, yc.max - yc.min);
        sprite.x = xc.min;
        sprite.y = yc.min;
        sprite.mask = graphics;
        container.addChild(sprite);
      });
      let final_texture = container.generateCanvasTexture(PIXI.SCALE_MODES.NEAREST);
      let final_sprite = new PIXI.Sprite(final_texture);
      this.layers['geo'].addChild(final_sprite);
      */
    }
  }, {
    key: "init_arrows",
    value: function init_arrows() {
      var graphics = new PIXI.Graphics();
      this.layers['arrows'].addChild(graphics);
      this.diagram.cells.forEach(function (cell) {
        return MapDrawer.draw_arrow(cell, cell.closest_link, graphics, 3, [50, 50, 0]);
      });
    }
  }, {
    key: "init_rrt",
    value: function init_rrt() {
      var color = [0, 125, 255].sort(function (e1, e2) {
        return 0.5 - Math.random();
      });
      var graphics = new PIXI.Graphics();
      this.layers['rrt_links'].addChild(graphics);
      var bla = _util2.default.find_min_and_max(this.rrt.nodes, function (e) {
        return e.height;
      });

      // TODO add diff colors for isolated graphs, use Utildo_while_not_empty() for that
      this.diagram.cells.forEach(function (cell) {
        graphics.lineStyle(0, _color2.default.to_pixi([0, 0, 0]));
        var color_by_height = [_util2.default.normalize_value(cell.height, bla.max, color[0], bla.min, 25), _util2.default.normalize_value(cell.height, bla.max, color[1], bla.min, 25), _util2.default.normalize_value(cell.height, bla.max, color[2], bla.min, 25)];
        graphics.beginFill(_color2.default.to_pixi(color_by_height));
        graphics.drawCircle(cell.x, cell.y, 4);
        graphics.endFill();
        // all links are drawen twice, but i dont care!
        cell.rrt_links.forEach(function (link) {
          graphics.lineStyle(3, _color2.default.to_pixi(color_by_height));
          graphics.moveTo(cell.x, cell.y);
          graphics.lineTo(link.x, link.y);
        });
      });
    }
  }, {
    key: "init_dark_mode",
    value: function init_dark_mode() {
      var _this6 = this;

      this.diagram.cells.forEach(function (cell) {
        var color = cell.geo_type == 'sea' || cell.geo_type == 'lake' ? [0, 0, 100] : [0, 0, 0];
        var graphics = MapDrawer.draw_polygon(cell.nodes, color);
        _this6.layers['dim_cells'].addChild(graphics); // z-index?
      });
      var g = new PIXI.Graphics();
      this.layers['dim'].addChild(g);
      g.alpha = 0.75;
      g.beginFill = _color2.default.to_pixi([0, 0, 0]);
      g.drawRect(0, 0, this.map.view.width, this.map.view.height);
      g.endFill();
    }
  }], [{
    key: "layers",
    value: function layers() {
      // edges -- test for rivers by edges
      return [
      // cells filling
      'regions', 'geo', 'heights', 'dim_cells',
      // all items, objects, all that 'upon' the ground
      'borders', 'water', 'rrt_links', 'arrows', 'edges', 'roads', 'errors',
      // interaction routines
      'selection', 'under_cursor',
      // other
      'dim'];
    }
  }, {
    key: "get_line_width_for_river",
    value: function get_line_width_for_river(strength) {
      return 0.5 + Math.log(strength);
    }
  }, {
    key: "draw_polygon",
    value: function draw_polygon(polygon, fill_color) {
      var graphics = new PIXI.Graphics();
      graphics.lineStyle(1, _color2.default.to_pixi([0, 30, 0]));
      graphics.beginFill(_color2.default.to_pixi(fill_color));
      graphics.drawPolygon(polygon.map(function (node) {
        return new PIXI.Point(node.x, node.y);
      }));
      graphics.closePath(); // strange, but it needed here. some edges are thin without it
      graphics.endFill();
      return graphics;
    }

    // TODO

  }, {
    key: "draw_arrow",
    value: function draw_arrow(from, to, graphics, line_width, color) {
      graphics.lineStyle(line_width, _color2.default.to_pixi(color));
      graphics.moveTo(from.x, from.y);
      graphics.lineTo(to.x, to.y);
      graphics.closePath();

      var angle = _util2.default.to_polar_coords(from.x - to.x, from.y - to.y).angle;
      var p1 = _util2.default.from_polar_coords(angle - _util2.default.radians(15), 7 * line_width);
      var p2 = _util2.default.from_polar_coords(angle + _util2.default.radians(15), 7 * line_width);
      graphics.beginFill(_color2.default.to_pixi(color));
      graphics.moveTo(p1.x + to.x, p1.y + to.y);
      graphics.lineTo(to.x, to.y);
      graphics.lineTo(p2.x + to.x, p2.y + to.y);
      graphics.closePath();
      graphics.endFill();
    }
  }, {
    key: "draw_smoothed_polygon",
    value: function draw_smoothed_polygon(graphics, polygon, center, water_color) {
      polygon = polygon.map(function (node) {
        return _util2.default.move_by_vector(node, center, _util2.default.rand_float(0.1, 0.3));
      });
      var mid_radius = polygon.reduce(function (sum, e) {
        return sum + _util2.default.distance(e, center);
      }, 0) / polygon.length;
      polygon = polygon.filter(function (node, i) {
        var next_i = i + 1 == polygon.length ? 0 : i + 1;
        var next_node = polygon[next_i];
        return _util2.default.distance(node, next_node) >= 0.2 * mid_radius;
      });

      graphics.beginFill(_color2.default.to_pixi(water_color));
      var fl_mid = { x: (polygon[0].x + _util2.default.last(polygon).x) / 2, y: (polygon[0].y + _util2.default.last(polygon).y) / 2 };
      graphics.moveTo(fl_mid.x, fl_mid.y);
      _util2.default.for_all_consecutive_pairs(polygon, function (cur, next) {
        var pc_mid = { x: (next.x + cur.x) / 2, y: (next.y + cur.y) / 2 };
        graphics.quadraticCurveTo(cur.x, cur.y, pc_mid.x, pc_mid.y);
      });
      graphics.endFill();
    }
  }, {
    key: "draw_broken_line_between_two_cells",
    value: function draw_broken_line_between_two_cells(c1, c2, graphics, diagram, color) {
      var width = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 1;

      var mid_point = MapDrawer.two_cells_edge_midpoint(diagram, c1, c2);
      graphics.lineStyle(width, _color2.default.to_pixi(color));
      graphics.moveTo(c1.x, c1.y);
      graphics.lineTo(mid_point.x, mid_point.y);
      graphics.moveTo(mid_point.x, mid_point.y);
      graphics.lineTo(c2.x, c2.y);
    }
  }, {
    key: "two_cells_edge_midpoint",
    value: function two_cells_edge_midpoint(diagram, c1, c2) {
      var my_edge = void 0;
      for (var i in c2.halfedges) {
        var edge = diagram.edges[c2.halfedges[i]];
        if (edge.left == c1 || edge.right == c1) {
          my_edge = edge;
          break;
        }
      }
      if (!my_edge) {
        console.log('two_cells_edge_midpoint not linked cells', c1, c2);
        throw 'two_cells_edge_midpoint not linked cells';
      }
      return { x: (my_edge.from.x + my_edge.to.x) / 2, y: (my_edge.from.y + my_edge.to.y) / 2 };
    }
  }]);

  return MapDrawer;
}();

exports.default = MapDrawer;

});

require.register("geo/regions_gatherer.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('common/util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RegionsGatherer = function () {
  function RegionsGatherer() {
    _classCallCheck(this, RegionsGatherer);
  }

  _createClass(RegionsGatherer, null, [{
    key: 'gather_regions',
    value: function gather_regions(diagram) {
      var regions_mode = 'rrt_leafs'; // 'closest'
      var regions_min_cells = 5;
      //const regions_opt_cells = 15; // kinda optimum, not max

      // gather regions
      diagram.regions = [];
      if (regions_mode == 'rrt_leafs') {
        var starters = diagram.cells.filter(function (cell) {
          return cell.rrt_links.length != 2;
        });
        starters.forEach(function (cell) {
          var region = { color: MapDrawer.random_color(), cells: [cell] };
          diagram.regions.push(region);
          cell.region = region;
        });
        starters.forEach(function (cell) {
          return RegionsGatherer.gather_all_parents_to_my_region(cell);
        });
        RegionsGatherer.recursively_merge_small_regions(diagram);
        diagram.regions.forEach(function (region, i) {
          return region.index = i;
        });
      } else {
        var get_linked_cells_func = void 0;
        if (regions_mode == 'closest') {
          get_linked_cells_func = function get_linked_cells_func(cell) {
            return cell.closest_backlinks.concat([cell.closest_link]);
          };
        } else if (regions_mode == 'rrt') {
          get_linked_cells_func = function get_linked_cells_func(cell) {
            return cell.rrt_links;
          };
        } else if (regions_mode == 'rrt_generations') {
          var generations_per_regions = 5;
          get_linked_cells_func = function get_linked_cells_func(cell) {
            var my_region_index = Math.floor(cell.generation / generations_per_regions);
            return cell.rrt_links.filter(function (link) {
              return Math.floor(link.generation / generations_per_regions) == my_region_index;
            });
          };
        } else {
          throw "unknown regions_mode: " + regions_mode;
        }
        diagram.cells.forEach(function (cell) {
          return RegionsGatherer.diagram_collect_regions(diagram, cell, get_linked_cells_func);
        });
      }

      // after set cells on_border prop
      diagram.regions.forEach(function (region) {
        region.on_border = false;
        for (var i = 0; i < region.cells.length; i++) {
          if (region.cells[i].on_border) {
            region.on_border = true;
            break;
          }
        }
      });
    }
  }, {
    key: 'diagram_collect_regions',
    value: function (_diagram_collect_regions) {
      function diagram_collect_regions(_x, _x2, _x3) {
        return _diagram_collect_regions.apply(this, arguments);
      }

      diagram_collect_regions.toString = function () {
        return _diagram_collect_regions.toString();
      };

      return diagram_collect_regions;
    }(function (diagram, cell, get_linked_cells_func) {
      if (cell.region) {
        return;
      }
      var linked_cells = get_linked_cells_func(cell); // cell.closest_backlinks.concat([cell.closest_link]);
      var region = void 0;
      for (var i = 0; i < linked_cells.length; i++) {
        if (linked_cells[i].region) {
          region = linked_cells[i].region;
          break;
        }
      }
      if (!region) {
        region = { color: MapDrawer.random_color(), index: diagram.regions.length, cells: [] };
        diagram.regions.push(region);
      }
      cell.region = region; // index?
      region.cells.push(cell); // wont be dublicates???

      linked_cells.forEach(function (link) {
        return diagram_collect_regions(diagram, cell, get_linked_cells_func);
      });
    })
  }, {
    key: 'gather_all_parents_to_my_region',
    value: function gather_all_parents_to_my_region(cell) {
      var parent = RRTDiagram.get_parent(cell);
      if (!parent || parent.region) {
        return;
      }
      parent.region = cell.region;
      cell.region.cells.push(parent);
      return RegionsGatherer.gather_all_parents_to_my_region(parent);
    }
  }, {
    key: 'rrt_leafs_move_all_cells_from_region_to_another_and_delete_it',
    value: function rrt_leafs_move_all_cells_from_region_to_another_and_delete_it(from, to, diagram) {
      from.cells.forEach(function (cell) {
        cell.region = to;
        to.cells.push(cell);
      });
      from.cells.splice(0, from.cells.length);
      _util2.default.remove_element(from, diagram.regions);
    }
  }, {
    key: 'recursively_merge_small_regions',
    value: function recursively_merge_small_regions(diagram) {
      var small_regions = diagram.regions.filter(function (region) {
        return region.cells.length < regions_min_cells;
      });
      if (!small_regions.length) {
        return;
      }
      // smallest first. actually, we need only first one
      var region = RegionsGatherer.sort_regions_by_size(small_regions)[0]; //small_regions.shift();
      var linked_regions = RegionsGatherer.gather_all_linked_regions(region);
      RegionsGatherer.sort_regions_by_size(linked_regions);
      var target_region = linked_regions[0];
      /*if (target_region.cells.length > regions_opt_cells) {
        console.log('too bad merge with big one, size '+region.cells.length+' with size '+target_region.cells.length);
      }*/
      RegionsGatherer.rrt_leafs_move_all_cells_from_region_to_another_and_delete_it(region, target_region, diagram);
      RegionsGatherer.recursively_merge_small_regions(diagram);
    }
  }, {
    key: 'gather_all_linked_regions',
    value: function gather_all_linked_regions(region) {
      var linked_regions = [];
      region.cells.forEach(function (cell) {
        cell.rrt_links.forEach(function (link) {
          if (link.region && link.region != region) _util2.default.push_uniq(link.region, linked_regions);
        });
      });
      return linked_regions;
    }
  }, {
    key: 'sort_regions_by_size',
    value: function sort_regions_by_size(regions) {
      return regions.sort(function (e1, e2) {
        return e1.cells.length - e2.cells.length;
      });
    }
  }]);

  return RegionsGatherer;
}();

exports.default = RegionsGatherer;

});

require.register("geo/rivers_and_lakes_generator.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

var _rrt_diagram = require("geo/rrt_diagram");

var _rrt_diagram2 = _interopRequireDefault(_rrt_diagram);

var _map_drawer = require("geo/map_drawer");

var _map_drawer2 = _interopRequireDefault(_map_drawer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 *  generates rivers on graph
 */
var RiversAndLakesGenerator = function () {
  function RiversAndLakesGenerator() {
    _classCallCheck(this, RiversAndLakesGenerator);
  }

  _createClass(RiversAndLakesGenerator, null, [{
    key: "generate_by_edges",
    value: function generate_by_edges(diagram) {
      var dry_factor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.5;

      // only edges between non-linked rrt nodes
      var edges = diagram.edges.filter(function (edge) {
        if (!edge.right) return false;
        var rrt_linked = _rrt_diagram2.default.check_linked(edge.right, edge.left);
        var sea_side = edge.right.geo_type == 'sea' || edge.left.geo_type == 'sea';
        return !rrt_linked && !sea_side;
      });
      // gather river nodes and links between them
      var nodes = [],
          river_roots = [],
          river_ends = [];
      // here we only gather links between nodes, nothing more
      edges.forEach(function (edge) {
        _util2.default.for_all_consecutive_pairs([edge.from, edge.to], function (node, link) {
          _util2.default.push_uniq(node, nodes);
          if (!node.river_links) node.river_links = [];
          _util2.default.push_uniq(link, node.river_links);
        });
      });
      // here we create rivers from river root nodes, add them to closed list, all others go to open list
      nodes.forEach(function (node) {
        node.river = {
          strength: 0,
          parents: [],
          children: []
        };
        if (node.on_border) {
          river_ends.push(node);
        } else if (node.cells.some(function (cell) {
          return cell.geo_type == 'sea';
        })) {
          river_ends.push(node);
        } else if (node.river_links.length == 1) {
          node.river.strength = Math.random() > dry_factor ? _util2.default.rand(1, 10) : 0, river_roots.push(node);
        } else {}
      });

      river_ends.forEach(function (node) {
        RiversAndLakesGenerator.recursively_walk_from_ends(node, null);
      });

      river_roots.forEach(function (node) {
        return RiversAndLakesGenerator.recursively_add_strength(node, node.river.strength);
      });

      // here we only delete temporary river_links prop!
      nodes.forEach(function (node) {
        return delete node.river_links;
      });

      return true;
    }
  }, {
    key: "recursively_walk_from_ends",
    value: function recursively_walk_from_ends(node, from) {
      if (from) {
        _util2.default.remove_element(node, from.river.children);
        from.river.parents.push(node);
        _util2.default.remove_element(from, node.river.parents);
        node.river.children.push(from);
      }
      var all_but_from = node.river_links.filter(function (l) {
        return l != from;
      });
      if (all_but_from.length > 1 && all_but_from.every(function (link) {
        return link.river.children.length;
      })) {
        return;
      }
      all_but_from.forEach(function (link) {
        RiversAndLakesGenerator.recursively_walk_from_ends(link, node);
      });
    }
  }, {
    key: "recursively_add_strength",
    value: function recursively_add_strength(node, strength) {
      node.river.children.forEach(function (child) {
        child.river.strength += strength;
        RiversAndLakesGenerator.recursively_add_strength(child, strength);
      });
    }
  }]);

  return RiversAndLakesGenerator;
}();

exports.default = RiversAndLakesGenerator;

});

require.register("geo/rrt_diagram.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('common/util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RRTNode = function RRTNode(x, y) {
  _classCallCheck(this, RRTNode);

  this.x = x;
  this.y = y;
  this.rrt_links = [];
  this.generation = null;
  this.branch_order = null;
};

var RRTDiagram = function () {
  function RRTDiagram(x_size, y_size) {
    _classCallCheck(this, RRTDiagram);

    this.nodes = [];
    this.x_size = x_size;
    this.y_size = y_size;
  }

  _createClass(RRTDiagram, [{
    key: 'get_generation',
    value: function get_generation(generation) {
      return this.nodes.filter(function (node) {
        return node.generation == generation;
      });
    }
  }, {
    key: 'generations_count',
    value: function generations_count() {
      return _util2.default.find_min_and_max(this.nodes, function (node) {
        return node.generation;
      }).max;
    }
  }, {
    key: 'generate',


    // TODO
    value: function generate(epsilon) {
      var count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Infinity;
      var reject_limit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 500;

      this.epsilon = epsilon; // for rrt_links rebuild
      this.nodes.push(new RRTNode(_util2.default.rand(1, this.x_size - 1), _util2.default.rand(1, this.y_size - 1)));
      if (count < 0) {
        throw 'bad number of nodes given: ' + count;
      }
      var reject_counter = 0;

      while (count && reject_counter < reject_limit) {
        var random = { x: _util2.default.rand(1, this.x_size - 1), y: _util2.default.rand(1, this.y_size - 1) },
            nearest = RRTDiagram.find_nearest_node(random, this.nodes),

        // we calc distance second time, but i dont care...
        distance = RRTDiagram.distance(random, nearest);
        // distance === 0 -- if we choosed existing point
        if (distance < epsilon * epsilon || distance === 0) {
          reject_counter++;
          continue;
        }
        var theta = Math.atan2(random.y - nearest.y, random.x - nearest.x);
        var node = new RRTNode(Math.round(nearest.x + epsilon * Math.cos(theta)), Math.round(nearest.y + epsilon * Math.sin(theta)));
        this.nodes.push(node);
        RRTDiagram.link_two_nodes(node, nearest);
        reject_counter = 0;
        count--;
      }
      this.calc_branches_length_and_generations();
    }

    // TODO move it to Util?

  }, {
    key: 'remove_some_links_and_recalc_all',
    value: function remove_some_links_and_recalc_all(count, min, max) {
      var nodes_to_process = this.nodes.filter(function (node) {
        return node.branch_order >= min && node.branch_order <= max;
      });
      if (nodes_to_process.length < count) {
        throw 'cant remove_some_links_and_recalc_all() count ' + count + ' cause only ' + nodes_to_process.length + ' sutable nodes';
      }
      nodes_to_process.sort(function () {
        return .5 - Math.random();
      });
      var deleted_links = [];
      for (var i = 0; i < count; i++) {
        var from = nodes_to_process[i];
        var to = from.rrt_links.find(function (link) {
          return link.branch_order >= min - 1 && link.branch_order <= max + 1;
        });
        if (!to) {
          throw 'strange, not found sutable link';
        }
        RRTDiagram.delink_two_nodes(from, to);
        deleted_links.push([from, to]);
      }
      this.calc_branches_length_and_generations();
      return deleted_links;
    }
  }, {
    key: 'restore_removed_links',
    value: function restore_removed_links(deleted_links) {
      deleted_links.forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            from = _ref2[0],
            to = _ref2[1];

        return RRTDiagram.link_two_nodes(from, to);
      });
      this.calc_branches_length_and_generations();
    }
  }, {
    key: 'calc_branches_length_and_generations',
    value: function calc_branches_length_and_generations() {
      var _this = this;

      // reset all prev values
      this.nodes.forEach(function (node) {
        node.generation = null;
        node.branch_order = null;
        node.longest_branch = null;
      });

      this.nodes.forEach(function (node) {
        node.branch_length = 0;
        _this.recursively_set_branch_length(node);
        node.longest_branch = _util2.default.find_min_and_max(_this.nodes, function (e) {
          return e.branch_length;
        }).max;
        _this.nodes.forEach(function (e) {
          return delete e.branch_length;
        });
      });

      // we choose local minimum nodes (by longest_branch) and they would be our diagram's "centers"
      var centers = [];
      this.nodes.forEach(function (node) {
        var local_minimum = node.rrt_links.every(function (link) {
          return link.longest_branch >= node.longest_branch;
        });
        var no_center_nearby = node.rrt_links.every(function (link) {
          return centers.indexOf(link) == -1;
        });
        if (local_minimum && no_center_nearby) centers.push(node);
      });
      // and write path length from it to each node
      this.nodes.forEach(function (node) {
        return node.generation = null;
      });
      centers.forEach(function (center) {
        center.generation = 0;
        _this.recursively_set_generation(center);
      });
      // calc branch_order ONLY after calc generations
      // FIXME sometimes diff between center and some near node is 2
      var leaf_nodes = this.nodes.filter(function (node) {
        return node.rrt_links.length == 1;
      });
      leaf_nodes.forEach(function (node) {
        node.branch_order = 0;
        _this.recursively_calc_branch_order(node);
      });
    }
  }, {
    key: 'recursively_set_generation',
    value: function recursively_set_generation(node) {
      var _this2 = this;

      var filtered = node.rrt_links.filter(function (link) {
        return link.generation == null;
      });
      // we set link.generation and add them to closed list
      filtered.forEach(function (link) {
        return link.generation = node.generation + 1;
      });
      // and AFTER we call recursively_set_generation on it!
      filtered.forEach(function (link) {
        return _this2.recursively_set_generation(link);
      });
    }

    // TODO too bad its absolutely like recursively_set_generation()

  }, {
    key: 'recursively_set_branch_length',
    value: function recursively_set_branch_length(node) {
      var _this3 = this;

      var filtered = node.rrt_links.filter(function (link) {
        return link.branch_length == null;
      });
      filtered.forEach(function (link) {
        return link.branch_length = node.branch_length + 1;
      });
      filtered.forEach(function (link) {
        return _this3.recursively_set_branch_length(link);
      });
    }
  }, {
    key: 'recursively_calc_branch_order',
    value: function recursively_calc_branch_order(node) {
      var _this4 = this;

      // link.generation != 0 -- diagram 'center' nodes work like 'stops'
      var filtered = node.rrt_links.filter(function (link) {
        var parent = link.generation < node.generation;
        var lesser_branch_order = link.branch_order == null || link.branch_order < node.branch_order + 1;
        return parent && lesser_branch_order;
      });
      if (filtered.length > 1) {
        throw 'seens like several parents';
      }
      filtered.forEach(function (link) {
        return link.branch_order = node.branch_order + 1;
      });
      filtered.forEach(function (link) {
        return _this4.recursively_calc_branch_order(link);
      });
    }
  }], [{
    key: 'check_linked',
    value: function check_linked(n1, n2) {
      return n1.rrt_links.indexOf(n2) != -1;
    }
  }, {
    key: 'find_nearest_node',
    value: function find_nearest_node(target, nodes) {
      if (!nodes[0]) {
        throw 'no nodes';
      }
      var nearest = nodes[0],
          nearestDistance = RRTDiagram.distance(target, nearest);
      for (var i in nodes) {
        var d = RRTDiagram.distance(nodes[i], target);
        if (d < nearestDistance) {
          nearest = nodes[i];
          nearestDistance = d;
        }
      }
      return nearest;
    }

    // PRIVATE

  }, {
    key: 'link_two_nodes',
    value: function link_two_nodes(n1, n2) {
      _util2.default.push_uniq(n1, n2.rrt_links);
      _util2.default.push_uniq(n2, n1.rrt_links);
    }

    // PRIVATE

  }, {
    key: 'delink_two_nodes',
    value: function delink_two_nodes(n1, n2) {
      _util2.default.remove_element(n1, n2.rrt_links);
      _util2.default.remove_element(n2, n1.rrt_links);
    }
  }, {
    key: 'get_parent',
    value: function get_parent(node) {
      var ret = node.rrt_links.filter(function (n) {
        return n.generation < node.generation;
      });
      if (!ret.length) return null; // historically it is null
      if (ret.length != 1) {
        console.log('more than one parent', node);
        throw 'more than one parent';
      }
      return ret[0];
    }

    // PRIVATE

  }, {
    key: 'distance',
    value: function distance(a, b) {
      var dx = a.x - b.x,
          dy = a.y - b.y;
      return dx * dx + dy * dy;
    }
  }]);

  return RRTDiagram;
}();

exports.default = RRTDiagram;

});

require.register("geo/texture_generator.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

var _color = require("common/color");

var _color2 = _interopRequireDefault(_color);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TextureGenerator = function () {
  function TextureGenerator() {
    _classCallCheck(this, TextureGenerator);
  }

  _createClass(TextureGenerator, [{
    key: "simple",
    value: function simple(base) {
      return this.generate(base, 400, 2);
    }
  }, {
    key: "generate",
    value: function generate(base, tiles_count, tile_size) {
      var graphics = new PIXI.Graphics();
      for (var y = 0; y < tiles_count; y++) {
        for (var x = 0; x < tiles_count; x++) {
          graphics.beginFill(_color2.default.to_pixi(_color2.default.random_near(base)));
          graphics.drawRect(tile_size * x, tile_size * y, tile_size, tile_size);
          graphics.endFill();
        }
      }
      var texture = graphics.generateCanvasTexture(PIXI.SCALE_MODES.NEAREST, 1);
      return texture;
    }
  }]);

  return TextureGenerator;
}();

exports.default = TextureGenerator;

});

require.register("planets/components/app.jsx", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _collapsible_panel = require('common/components/collapsible_panel');

var _collapsible_panel2 = _interopRequireDefault(_collapsible_panel);

var _debug_info = require('planets/components/debug_info');

var _debug_info2 = _interopRequireDefault(_debug_info);

var _generate_world_form = require('planets/components/generate_world_form');

var _generate_world_form2 = _interopRequireDefault(_generate_world_form);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App = function (_React$Component) {
  _inherits(App, _React$Component);

  function App() {
    _classCallCheck(this, App);

    return _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).apply(this, arguments));
  }

  _createClass(App, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'table',
        { style: { margin: '5px', borderSpacing: '5px', borderCollapse: 'separate' } },
        _react2.default.createElement(
          'tbody',
          null,
          _react2.default.createElement(
            'tr',
            { style: { verticalAlign: 'top' } },
            _react2.default.createElement(
              'td',
              null,
              _react2.default.createElement(
                'div',
                { className: 'panel-group' },
                _react2.default.createElement(
                  'div',
                  { className: 'panel panel-success' },
                  _react2.default.createElement(
                    'div',
                    { className: 'panel-body' },
                    _react2.default.createElement(
                      'div',
                      { className: '', id: 'map_container' },
                      _react2.default.createElement('canvas', { id: 'map', width: '800', height: '800' })
                    )
                  )
                ),
                _react2.default.createElement(_collapsible_panel2.default, { header: 'debug', name: 'debug', content_func: function content_func() {
                    return _react2.default.createElement(_debug_info2.default);
                  } })
              )
            ),
            _react2.default.createElement(
              'td',
              { width: '100%' },
              _react2.default.createElement(
                'div',
                { className: 'panel-group' },
                _react2.default.createElement(
                  'div',
                  { className: 'panel panel-success' },
                  _react2.default.createElement(
                    'div',
                    { className: 'panel-body' },
                    _react2.default.createElement(_collapsible_panel2.default, { header: 'world generating', name: 'generate_world', content_func: function content_func() {
                        return _react2.default.createElement(_generate_world_form2.default);
                      } })
                  ),
                  _react2.default.createElement('div', { className: 'panel-footer' })
                )
              )
            )
          )
        )
      );
    }
  }]);

  return App;
}(_react2.default.Component);

exports.default = App;

});

require.register("planets/components/debug_info.jsx", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DebugInfo = function (_React$Component) {
  _inherits(DebugInfo, _React$Component);

  function DebugInfo() {
    _classCallCheck(this, DebugInfo);

    return _possibleConstructorReturn(this, (DebugInfo.__proto__ || Object.getPrototypeOf(DebugInfo)).apply(this, arguments));
  }

  _createClass(DebugInfo, [{
    key: "render",
    value: function render() {
      return _react2.default.createElement(
        "div",
        null,
        _react2.default.createElement(
          "div",
          null,
          "FPS: ",
          _react2.default.createElement("span", { id: "fps_counter" })
        ),
        _react2.default.createElement(
          "div",
          null,
          "map scale: ",
          _react2.default.createElement("span", { id: "map_scale" })
        ),
        _react2.default.createElement(
          "div",
          null,
          "mouse position: ",
          _react2.default.createElement(
            "span",
            { id: "mouse_pos" },
            (0, 0)
          )
        ),
        _react2.default.createElement(
          "div",
          null,
          "world point: ",
          _react2.default.createElement(
            "span",
            { id: "world_pos" },
            (0, 0)
          )
        )
      );
    }
  }]);

  return DebugInfo;
}(_react2.default.Component);

exports.default = DebugInfo;

});

require.register("planets/components/generate_world_form.jsx", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _input_spinner = require('common/components/input_spinner');

var _input_spinner2 = _interopRequireDefault(_input_spinner);

var _game = require('planets/game');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GenerateWorldForm = function (_React$Component) {
  _inherits(GenerateWorldForm, _React$Component);

  function GenerateWorldForm() {
    _classCallCheck(this, GenerateWorldForm);

    return _possibleConstructorReturn(this, (GenerateWorldForm.__proto__ || Object.getPrototypeOf(GenerateWorldForm)).apply(this, arguments));
  }

  _createClass(GenerateWorldForm, [{
    key: 'submit',
    value: function submit(e) {
      e.preventDefault();
      console.clear();
      _game.game.map_drawer.map.stage.children.forEach(function (layer) {
        return layer.removeChildren();
      });
      _game.game.generate_world();
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'form',
          { className: 'form-horizontal' },
          _react2.default.createElement(
            'div',
            { className: 'form-group' },
            _react2.default.createElement(
              'div',
              { className: 'col-sm-offset-4 col-sm-8' },
              _react2.default.createElement(
                'button',
                { type: 'button', className: 'btn btn-default', id: 'generate_world', onClick: this.submit.bind(this) },
                'generate'
              )
            )
          )
        )
      );
    }
  }]);

  return GenerateWorldForm;
}(_react2.default.Component);

exports.default = GenerateWorldForm;

});

require.register("planets/game.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

var _star_system = require("planets/star_system");

var _star_system2 = _interopRequireDefault(_star_system);

var _interaction = require("planets/interaction");

var _interaction2 = _interopRequireDefault(_interaction);

var _map_drawer = require("planets/map_drawer");

var _map_drawer2 = _interopRequireDefault(_map_drawer);

var _app = require("planets/components/app");

var _app2 = _interopRequireDefault(_app);

var _reactDom = require("react-dom");

var _reactDom2 = _interopRequireDefault(_reactDom);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Game = function () {
  function Game() {
    _classCallCheck(this, Game);

    // CONST
    this.width = 800;
    this.height = 800;

    this.map_drawer = new _map_drawer2.default();
    this.interaction = new _interaction2.default();
  }

  _createClass(Game, [{
    key: "generate_world",
    value: function generate_world() {
      this.star_system = new _star_system2.default();
      this.star_system.generate();

      this.ticks = 0;

      this.map_drawer.init(this.width, this.height);
      this.interaction.init();

      this.map_drawer.map.ticker.add(this.handle_tick.bind(this));

      this.map_drawer.init_graphics();
    }
  }, {
    key: "handle_tick",
    value: function handle_tick() {
      this.ticks++;
      this.star_system.tick();
      this.map_drawer.redraw();
    }
  }]);

  return Game;
}();

var game = new Game();
module.exports.game = game;

document.addEventListener('DOMContentLoaded', function () {
  _reactDom2.default.render(_react2.default.createElement(_app2.default, null), document.querySelector('#app'));
  game.generate_world();
});

});

require.register("planets/interaction.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

var _game = require("planets/game");

var _d = require("d3");

var d3 = _interopRequireWildcard(_d);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Interaction = function () {
  function Interaction() {
    _classCallCheck(this, Interaction);

    this.state = 'initial';
  }

  _createClass(Interaction, [{
    key: "init",
    value: function init() {
      var _this = this;

      this.game = _game.game;
      this.map = this.game.map_drawer.map;
      this.map.stage.interactive = true;

      document.addEventListener('mousemove', this.map_mouse_move_handler.bind(this), false);

      d3.select('#map').on('click', this.map_click_handler.bind(this));

      // from https://bl.ocks.org/pkerpedjiev/cf791db09ebcabaec0669362f4df1776
      d3.select('#map').call(d3.zoom().scaleExtent([1, 4]).translateExtent([[0, 0], [this.map.view.width, this.map.view.height]]).on("zoom", this.map_zoom.bind(this)));

      this.ticks = 0; // here?
      this.fps_div = document.getElementById('fps_counter');
      this.map.ticker.add(function () {
        _this.ticks++;
        if (_this.ticks % 10 == 0) {
          d3.select('#fps_counter').html(_this.map.ticker.FPS | 0);
        }
      });
      this.update_map_scale();
    }
  }, {
    key: "map_mouse_move_handler",
    value: function map_mouse_move_handler(event) {
      if (event.target != this.map.view) {
        //this.game.map_drawer.clear_cell_under_cursor();
        //this.cell_under_cursor = null;
        return false;
      }
      var mouse_coords = this.get_mouse_coords(event);

      d3.select('#mouse_pos').html('{x: ' + mouse_coords.x + ', y: ' + mouse_coords.y + '}');
      var world_pos = this.mouse_coords_to_world_coords(mouse_coords);
      d3.select('#world_pos').html('{x: ' + world_pos.x + ', y: ' + world_pos.y + '}');
    }
  }, {
    key: "map_click_handler",
    value: function map_click_handler() {
      var mouse_coords = this.get_mouse_coords(d3.event);
    }
  }, {
    key: "map_zoom",
    value: function map_zoom() {
      this.map.stage.position.x = d3.event.transform.x;
      this.map.stage.position.y = d3.event.transform.y;
      this.map.stage.scale.x = d3.event.transform.k;
      this.map.stage.scale.y = d3.event.transform.k;
      this.update_map_scale();
    }
    ///////////////////////////////////////


  }, {
    key: "update_map_scale",
    value: function update_map_scale() {
      d3.select('#map_scale').html('{x: ' + this.map.stage.scale.x + ', y: ' + this.map.stage.scale.y + '}');
    }

    ///////////////////////////////////////  
    // UTILS
    ///////////////////////////////////////

  }, {
    key: "get_mouse_coords",
    value: function get_mouse_coords(event) {
      return { x: event.offsetX, y: event.offsetY };
    }
  }, {
    key: "mouse_coords_to_world_coords",
    value: function mouse_coords_to_world_coords(mouse_coords) {
      var xn = Math.floor((mouse_coords.x - this.map.stage.position.x) / this.map.stage.scale.x),
          yn = Math.floor((mouse_coords.y - this.map.stage.position.y) / this.map.stage.scale.y);
      return { x: xn, y: yn };
    }
  }]);

  return Interaction;
}();

exports.default = Interaction;

});

require.register("planets/map_drawer.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

var _color = require("common/color");

var _color2 = _interopRequireDefault(_color);

var _game = require("planets/game");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MapDrawer = function () {
  function MapDrawer() {
    _classCallCheck(this, MapDrawer);
  }

  _createClass(MapDrawer, [{
    key: "init",
    value: function init(width, height) {
      var _this = this;

      var PIXI = require('pixi.js');
      this.map = new PIXI.Application(width, height, {
        backgroundColor: _color2.default.to_pixi([0, 0, 0]),
        antialias: true,
        view: document.getElementById('map')
      });
      console.log('renderer', this.map.renderer);

      this.base_container = new PIXI.Container();
      this.base_container.scale = { x: 6, y: 6 };
      this.map.stage.addChild(this.base_container);
      this.base_container.position.x = width / 2 | 0;
      this.base_container.position.y = height / 2 | 0;

      this.layers = {};
      MapDrawer.layers().forEach(function (layer) {
        _this.layers[layer] = new PIXI.Container();
        _this.base_container.addChild(_this.layers[layer]);
      });
      document.getElementById('map_container').appendChild(this.map.view);
      this.bodies_graphics = [];
    }
  }, {
    key: "clear_all",
    value: function clear_all() {
      this.base_container.children.forEach(function (layer) {
        return layer.removeChildren();
      });
    }
  }, {
    key: "init_graphics",
    value: function init_graphics() {
      var _this2 = this;

      this.init_stellar_body(_game.game.star_system.star);
      _game.game.star_system.planets.forEach(function (planet) {
        return _this2.init_stellar_body(planet);
      });
    }
  }, {
    key: "redraw",
    value: function redraw() {
      var _this3 = this;

      this.bodies_graphics.forEach(function (graphics) {
        return _this3.update_stellar_body(graphics);
      });
    }
  }, {
    key: "init_stellar_body",
    value: function init_stellar_body(stellar_body) {
      var graphics = new PIXI.Graphics();
      graphics.backlink = stellar_body;

      var line_color = _color2.default.to_pixi(_color2.default.darker(stellar_body.color, 30));
      graphics.lineStyle(stellar_body.radius / 10, line_color);
      graphics.beginFill(_color2.default.to_pixi(stellar_body.color));
      graphics.drawCircle(0, 0, stellar_body.radius);
      graphics.closePath();
      graphics.endFill();

      this.small_circle(graphics, 0, 1, stellar_body, line_color);
      this.small_circle(graphics, 0, -1, stellar_body, line_color);
      this.small_circle(graphics, 1, 0, stellar_body, line_color);
      this.small_circle(graphics, -1, 0, stellar_body, line_color);

      this.layers['bodies'].addChild(graphics);
      this.bodies_graphics.push(graphics);
      this.update_stellar_body(graphics);
      //console.log('DI', coords, stellar_body.orbital_angle, stellar_body.orbital_radius);
    }
  }, {
    key: "update_stellar_body",
    value: function update_stellar_body(graphics) {
      var stellar_body = graphics.backlink;
      var coords = _util2.default.from_polar_coords(stellar_body.orbital_angle, stellar_body.orbital_radius);
      //console.log('SF', coords);
      graphics.position.x = coords.x;
      graphics.position.y = coords.y;
      graphics.rotation = stellar_body.angle;
    }
  }, {
    key: "small_circle",
    value: function small_circle(graphics, x, y, stellar_body, color) {
      graphics.lineStyle(stellar_body.radius / 10, _color2.default.to_pixi([0, 0, 0]));
      graphics.beginFill(color);
      graphics.drawCircle(x * (stellar_body.radius / 2), y * (stellar_body.radius / 2), stellar_body.radius / 3);
      graphics.endFill();
    }
  }], [{
    key: "layers",
    value: function layers() {
      return ['bodies', 'errors', 'test'];
    }
  }]);

  return MapDrawer;
}();

exports.default = MapDrawer;

});

require.register("planets/star_system.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

var _game = require("planets/game");

var _stellar_body = require("planets/stellar_body");

var _stellar_body2 = _interopRequireDefault(_stellar_body);

var _color = require("common/color");

var _color2 = _interopRequireDefault(_color);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StarSystem = function () {
  function StarSystem() {
    _classCallCheck(this, StarSystem);

    this.star = null;
    this.planets = [];

    this.orbital_speed_coef = 0.0025;
    this.rotation_speed_coef = 0.01;
  }

  _createClass(StarSystem, [{
    key: "generate",
    value: function generate() {
      this.star = new _stellar_body2.default();
      this.star.radius = 8;
      this.star.rotation_speed = this.rotation_speed_coef * _util2.default.rand(1, 10);
      this.star.color = _color2.default.random_near([250, 50, 50]);

      var count_planets = 5;
      while (count_planets--) {
        var planet = new _stellar_body2.default();
        planet.orbital_radius = 10 * (count_planets + 2);
        planet.radius = _util2.default.rand(1, 5);
        planet.orbital_speed = this.orbital_speed_coef * _util2.default.rand(1, 10);
        planet.rotation_speed = this.rotation_speed_coef * _util2.default.rand(1, 10);
        planet.color = _color2.default.random([200, 200, 200]);

        this.planets.push(planet);
      }
    }
  }, {
    key: "tick",
    value: function tick() {
      var _this = this;

      this.update_stellar_body(this.star);
      this.planets.forEach(function (planet) {
        return _this.update_stellar_body(planet);
      });
    }
  }, {
    key: "update_stellar_body",
    value: function update_stellar_body(body) {
      body.orbital_angle += body.orbital_speed;
      body.angle += body.rotation_speed;
    }
  }]);

  return StarSystem;
}();

exports.default = StarSystem;

});

require.register("planets/stellar_body.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

var _game = require("planets/game");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StellarBody = function StellarBody() {
  _classCallCheck(this, StellarBody);

  this.orbital_radius = 0;
  this.radius = 0;
  this.orbital_speed = 0;
  this.rotation_speed = 0;
  // temp
  this.color = [0, 0, 0];

  this.orbital_angle = 0;
  this.angle = 0;
};

exports.default = StellarBody;

});

require.register("sheepland/calendar.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

var _sheepland = require("sheepland/sheepland");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Calendar = function () {
  function Calendar() {
    _classCallCheck(this, Calendar);

    //this.ticks_per_day = 1000/game.tick_basic_delay*60*5; // day lasts 5 min
    this.ticks_per_day = 1000 / _sheepland.game.tick_basic_delay * 5; // day lasts 1 min
    this.basic_time_ratio = 1000 * 60 * 60 * 24 / this.ticks_per_day;

    this.date = new Date(-1346, 10, 4, 12, 5, 1, 0); // just for fun
  }

  _createClass(Calendar, [{
    key: "handle_tick",
    value: function handle_tick() {
      this.date.setTime(this.date.getTime() + this.time_ratio());
    }
  }, {
    key: "current_ts",
    value: function current_ts() {
      return this.date.getTime();
    }

    // ???

  }, {
    key: "time_ratio",
    value: function time_ratio() {
      return this.basic_time_ratio * _sheepland.game.tick_speed;
    }
  }]);

  return Calendar;
}();

exports.default = Calendar;

});

require.register("sheepland/components/app.jsx", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _collapsible_panel = require('common/components/collapsible_panel');

var _collapsible_panel2 = _interopRequireDefault(_collapsible_panel);

var _creatures_list = require('sheepland/components/creatures_list');

var _creatures_list2 = _interopRequireDefault(_creatures_list);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _sheepland = require('sheepland/sheepland');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App = function (_React$Component) {
  _inherits(App, _React$Component);

  function App(props) {
    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

    _this.state = { date: '', creatures: [] };
    // !!! im shure its not good way, but i dont know better...
    _sheepland.game.app = _this;

    return _this;
  }

  _createClass(App, [{
    key: 'set_date',
    value: function set_date(date) {
      var state = Object.assign({}, this.state, { date: date });
      this.setState(state);
    }
  }, {
    key: 'set_creatures_list',
    value: function set_creatures_list(creatures) {
      var state = Object.assign({}, this.state, { creatures: creatures });
      this.setState(state);
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'table',
        { style: { margin: '5px', borderSpacing: '5px', borderCollapse: 'separate' } },
        _react2.default.createElement(
          'tbody',
          null,
          _react2.default.createElement(
            'tr',
            { style: { verticalAlign: 'top' } },
            _react2.default.createElement(
              'td',
              null,
              _react2.default.createElement(
                'div',
                { className: 'panel-group' },
                _react2.default.createElement(
                  'div',
                  { className: 'panel panel-success' },
                  _react2.default.createElement(
                    'div',
                    { className: 'panel-heading' },
                    _react2.default.createElement(
                      'h4',
                      { className: 'panel-title' },
                      'date'
                    )
                  ),
                  _react2.default.createElement(
                    'div',
                    { className: 'panel-body' },
                    this.state.date
                  )
                ),
                _react2.default.createElement(
                  'div',
                  { className: 'panel panel-success' },
                  _react2.default.createElement(
                    'div',
                    { className: 'panel-heading' },
                    _react2.default.createElement(
                      'h4',
                      { className: 'panel-title' },
                      'creatures list'
                    )
                  ),
                  _react2.default.createElement(
                    'div',
                    { className: 'panel-body' },
                    _react2.default.createElement(_creatures_list2.default, { creatures: this.state.creatures })
                  )
                )
              )
            )
          )
        )
      );
    }
  }]);

  return App;
}(_react2.default.Component);

exports.default = App;

});

require.register("sheepland/components/creatures_list.jsx", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _sheepland = require('sheepland/sheepland');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CreaturesList = function (_React$Component) {
  _inherits(CreaturesList, _React$Component);

  function CreaturesList() {
    _classCallCheck(this, CreaturesList);

    return _possibleConstructorReturn(this, (CreaturesList.__proto__ || Object.getPrototypeOf(CreaturesList)).apply(this, arguments));
  }

  _createClass(CreaturesList, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        null,
        this.props.creatures.map(function (creature) {
          return _react2.default.createElement(
            'div',
            { key: creature.id },
            _react2.default.createElement(
              'span',
              null,
              creature.name
            ),
            '\xA0',
            _react2.default.createElement(
              'span',
              null,
              '(',
              creature.species,
              ' ',
              creature.sex,
              ')'
            ),
            '\xA0',
            _react2.default.createElement(
              'span',
              null,
              'age: ',
              creature.age.years,
              ' years, ',
              creature.age.months,
              ' months, ',
              creature.age.days,
              ' days'
            ),
            '\xA0',
            _react2.default.createElement(
              'span',
              null,
              '(',
              creature.life_cycle,
              ')'
            ),
            '\xA0',
            _react2.default.createElement(
              'span',
              null,
              'fertile: ',
              creature.fertile ? 'yes' : 'no'
            ),
            '\xA0',
            _react2.default.createElement(
              'span',
              null,
              'life duration: ',
              _sheepland.game.life_cycle.life_duration_in_days(creature),
              ' days (',
              _sheepland.game.life_cycle.left_to_live_in_days(creature),
              ' days left)'
            ),
            '\xA0'
          );
        })
      );
    }
  }]);

  return CreaturesList;
}(_react2.default.Component);

exports.default = CreaturesList;

});

require.register("sheepland/creatures/creature.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

var _sheepland = require("sheepland/sheepland");

var _uuid = require("uuid");

var UUID = _interopRequireWildcard(_uuid);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 *  species, sex -- should move from here
 */
var Creature = function () {
  function Creature(species) {
    var sex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    _classCallCheck(this, Creature);

    if (!sex) {
      sex = Math.random() < 0.5 ? 'male' : 'female';
    }
    this.id = UUID.v1();
    this.species = species;
    this.sex = sex;
  }

  _createClass(Creature, [{
    key: "allowed_sex",
    value: function allowed_sex() {
      return ['male', 'female'];
    }
  }, {
    key: "allowed_species",
    value: function allowed_species() {
      return ['human', 'sheep'];
    }
  }]);

  return Creature;
}();

exports.default = Creature;

});

require.register("sheepland/creatures/creature_names.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

var _sheepland = require("sheepland/sheepland");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 *  its like relation that requires some other relations + injects some
 *  REQUIRE: species, sex, id
 *  INJECT: name
 */
var CreatureNames = function () {
  function CreatureNames() {
    _classCallCheck(this, CreatureNames);

    this.names = {};
    this.named_species = ['human'];
    // ???
    this.required_props = ['species', 'sex', 'id'];
    this.strategy = 'random';
    this.init_names_stat(require('sheepland/creatures/names/male_names').list, 'human', 'male');
    this.init_names_stat(require('sheepland/creatures/names/female_names').list, 'human', 'female');
  }

  _createClass(CreatureNames, [{
    key: "init_names_stat",
    value: function init_names_stat(list, species, sex) {
      var _this = this;

      list.forEach(function (name) {
        _this.init_name_stat(name);
        _util2.default.push_uniq(species, _this.names[name].species);
        _util2.default.push_uniq(sex, _this.names[name].sex);
      });
    }
  }, {
    key: "init_name_stat",
    value: function init_name_stat(name) {
      if (!this.names[name]) {
        this.names[name] = { species: [], sex: [], creatures: [] };
        return true;
      }
      return false;
    }
  }, {
    key: "creature_link",
    value: function creature_link(creature) {
      return creature.id;
    }
  }, {
    key: "filter_names",
    value: function filter_names(func) {
      var ret = {};
      for (var i in this.names) {
        if (func(this.names[i])) {
          ret[i] = this.names[i];
        }
      }
      return ret;
    }

    //////////////////////////////////////////////////////////
    // public
    //////////////////////////////////////////////////////////

  }, {
    key: "generate",
    value: function generate(creature) {
      this.required_props.forEach(function (prop) {
        if (!creature[prop]) {
          throw "creature has no property " + prop;
        }
      });
      // animals have their species as name
      if (this.named_species.indexOf(creature.species) == -1) {
        creature.name = creature.species;
        return;
      }
      var filtered = {};
      if (this.strategy == 'random') {
        filtered = this.filter_names(function (name) {
          return name.species.indexOf(creature.species) != -1 && name.sex.indexOf(creature.sex) != -1;
        });
      } else if (this.strategy == 'evenly') {
        filtered = this.filter_names(function (name) {
          return name.species.indexOf(creature.species) != -1 && name.sex.indexOf(creature.sex) != -1;
        });
        var min = _util2.default.find_min_and_max(filtered, function (name) {
          return name.creatures.length;
        }).min;
        filtered = this.filter_names(function (name) {
          return name.creatures.length == min;
        });
      } else {
        throw 'unknown names strategy: ' + this.strategy;
      }
      filtered = Object.keys(filtered);
      if (!filtered.length) {
        throw 'dunno wly, but no names for choose, bad species?';
      }
      var name = _util2.default.rand_element(filtered);
      this.set_name(creature, name);
    }
  }, {
    key: "set_name",
    value: function set_name(creature, name) {
      this.init_name_stat(name);
      _util2.default.push_uniq(this.creature_link(creature), this.names[name].creatures);
      creature.name = name;
    }
  }, {
    key: "clear_name",
    value: function clear_name(creature) {
      if (!creature.name) {
        return false;
      }
      if (!this.names[creature.name]) {
        if (creature.name != creature.species) {
          throw 'creature has name, its not its species, and theres no name stat';
        }
        return false;
      }
      _util2.default.remove_element(this.creature_link(creature), this.names[creature.name].creatures);
      creature.name = null;
      return true;
    }
  }]);

  return CreatureNames;
}();

exports.default = CreatureNames;

});

require.register("sheepland/creatures/life_cycle.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

var _sheepland = require("sheepland/sheepland");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 *  REQUIRE: species, sex, birth_ts
 *  INJECT: fertile, life_cycle, life_duration
 */
var LifeCycle = function () {
  function LifeCycle() {
    _classCallCheck(this, LifeCycle);

    this.config = this.get_config();
  }

  // different


  _createClass(LifeCycle, [{
    key: "get_config",
    value: function get_config() {
      return {
        human: {
          life_duration: 75,
          adult_from: 15,
          old_from: 45
          //female_fertile_till: 35,
        },
        sheep: {
          life_duration: 10,
          adult_from: 1,
          old_from: 6
          //female_fertile_till: 6,
        }
      };
    }
  }, {
    key: "generate",
    value: function generate(creature) {
      var birth_ts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (!this.config[creature.species]) {
        console.log("unknown creature species", creature);
        throw 'unknown creature species: ' + creature.species;
      }

      creature.birth_ts = this.calc_birth_ts(creature, birth_ts);
      creature.life_duration = this.calc_life_duration(creature);
      this.update_creature_status(creature);
    }
  }, {
    key: "life_duration_in_days",
    value: function life_duration_in_days(creature) {
      return Math.floor(creature.life_duration / (1000 * 60 * 60 * 24));
    }
  }, {
    key: "left_to_live_in_days",
    value: function left_to_live_in_days(creature) {
      return Math.floor((creature.life_duration - Math.abs(_sheepland.game.calendar.current_ts() - creature.birth_ts)) / (1000 * 60 * 60 * 24));
    }

    // incorrect, but we dont care
    // slow, ineffective?

  }, {
    key: "get_age",
    value: function get_age(creature) {
      var diff = Math.abs(creature.birth_ts - _sheepland.game.calendar.current_ts());
      var date = new Date();
      date.setTime(diff);
      return { years: date.getFullYear() - 1970, months: date.getUTCMonth() + 1, days: date.getUTCDate() };
    }

    ///////////////////////////////////////
    // private
    ///////////////////////////////////////

  }, {
    key: "calc_birth_ts",
    value: function calc_birth_ts(creature, birth_ts) {
      var max_random_age = 1000 * 60 * 60 * 24 * 365 * Math.ceil(this.config[creature.species].life_duration / 2);
      if (birth_ts && birth_ts > _sheepland.game.calendar.current_ts()) {
        console.log('creature birth_ts greater than current ts', birth_ts, _sheepland.game.calendar.current_ts());
        return false;
      }
      if (!birth_ts) {
        birth_ts = _sheepland.game.calendar.current_ts() - _util2.default.rand(0, max_random_age);
      }
      return birth_ts;
    }
  }, {
    key: "calc_life_duration",
    value: function calc_life_duration(creature) {
      var basic_duration = this.config[creature.species].life_duration;
      var diff = Math.round(basic_duration / 3);
      var cur_life_duration = Math.abs(_sheepland.game.calendar.current_ts() - creature.birth_ts);
      var years_lived = this.get_age(creature).years;
      // in ticks
      var life_duration = cur_life_duration + _util2.default.rand(0, (basic_duration + diff - years_lived) * 1000 * 60 * 60 * 24 * 365);
      return life_duration;
    }
  }, {
    key: "handle_tick",
    value: function handle_tick() {
      var _this = this;

      // TODO maybe not every tick?
      _sheepland.game.creatures.forEach(function (creature) {
        return _this.update_creature_status(creature);
      });
    }
  }, {
    key: "update_creature_status",
    value: function update_creature_status(creature) {
      creature.life_cycle = this.calc_life_cycle(creature);
      creature.fertile = this.calc_fertility(creature);
    }
  }, {
    key: "calc_life_cycle",
    value: function calc_life_cycle(creature) {
      var spec = this.config[creature.species];
      var creature_age = this.get_age(creature).years;
      if (_sheepland.game.calendar.current_ts() > creature.birth_ts + creature.life_duration) {
        return 'dead';
      } else if (creature_age < spec.adult_from) {
        return 'child';
      } else if (creature_age < spec.old_from) {
        return 'adult';
      } else {
        return 'old';
      }
    }
  }, {
    key: "calc_fertility",
    value: function calc_fertility(creature) {
      if (creature.sex == 'male') {
        return creature.life_cycle == 'adult' || creature.life_cycle == 'old';
      } else if (creature.sex == 'female') {
        return creature.life_cycle == 'adult';
      } else {
        console.log("bad sex for calc_fertility", creature);
        throw 'bad sex for calc_fertility: ' + creature.sex;
      }
    }
  }]);

  return LifeCycle;
}();

exports.default = LifeCycle;

});

require.register("sheepland/creatures/names/female_names.js", function(exports, require, module) {
"use strict";

var list = ["agrona", "andraste", "angharad", "aoife", "arianrhod", "bébhinn", "bébinn", "béibhinn", "bláthnat", "blodeuwedd", "boudicca", "branwen", "bríd", "brighid", "brigit", "britannia", "brittania", "brittany", "céibhfhionn", "ciannait", "clídna", "clíodhna", "derdriu", "doireann", "eadan", "éadaoin", "eigyr", "éimhear", "emer", "enid", "epona", "ériu", "étaín", "feidelm", "feidlimid", "finnguala", "fionnuala", "gobnait", "gráinne", "gwenhwyfar", "laoise", "luigsech", "luíseach", "méabh", "meadhbh", "medb", "morgaine", "morgan", "morgen", "morrigan", "mórríghan", "mór", "muirgen", "muirín", "muirne", "neas", "neasa", "niamh", "rigantona", "ríoghnach", "sadb", "sadhbh", "shannon", "sionann"];

//export $list;
module.exports.list = list;

});

require.register("sheepland/creatures/names/male_names.js", function(exports, require, module) {
"use strict";

var list = ["áed", "áedán", "aengus", "ailill", "arawn", "arthfael", "bedivere", "bedwyr", "belenus", "bradán", "bran", "bréanainn", "brennus", "bricius", "cadeyrn", "cáel", "caiside", "caomh", "caomhán", "caratacos", "cathasach", "cernunnos", "cian", "cianán", "coilean", "conchobhar", "conchúr", "conlaoch", "corraidhín", "cúchulainn", "cuidightheach", "culhwch", "cunobelinus", "cynbel", "cynwrig", "dagda", "dáire", "diarmaid", "donnchad", "donndubhán", "drust", "drustan", "dubhán", "dubhshláine", "dubhthach", "dwyn", "éber", "éibhear", "elisedd", "fachtna", "fáelán", "faolán", "feidhlim", "feidhlimidh", "feidlimid", "fiachra", "finnagán", "finnán", "fintan", "fionn", "fionnán", "galchobhar", "gobán", "goibniu", "goronwy", "gwalchmei", "gwrtheyrn", "gwydion", "haerviu", "iudicael", "laoghaire", "llyr", "lóegaire", "lugus", "mabon", "máedóc", "math", "mathghamhain", "mathúin", "medraut", "mochán", "morcant", "myrddin", "nuada", "nuallán", "nynniaw", "óengus", "oisín", "perceval", "peredur", "pryderi", "pwyll", "seanán", "senán", "shannon", "sluaghadhán", "suibne", "taranis", "urien", "uthyr", "vercingetorix", "walganus"];

//export $list;
module.exports.list = list;

});

require.register("sheepland/relation.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

var _sheepland = require("sheepland/sheepland");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 *
 */
var Relation = function () {
  function Relation() {
    _classCallCheck(this, Relation);

    this.data = {};
  }

  _createClass(Relation, [{
    key: "exports",
    value: function exports() {
      return {};
    }
  }, {
    key: "deps",
    value: function deps() {
      return [];
    }
  }, {
    key: "generate",
    value: function generate(client) {
      if (!client.id) {
        console.log('no client id', client);
        throw 'no client id';
      }

      this.deps().forEach(function (dep_class) {
        var instance = new dep_class();
        for (var name in instance.exports()) {
          if (!client[name]) {
            console.log('dependency method does not present', name, dep);
            throw 'dependency method does not present';
          }
        }
      });
      this.init(client);
      var exports = this.exports();
      for (var name in exports) {
        client[name] = exports[name].bind(client, this);
      }
    }
  }, {
    key: "init",
    value: function init(client) {}
  }]);

  return Relation;
}();

exports.default = Relation;

});

require.register("sheepland/sheepland.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

var _calendar = require("sheepland/calendar");

var _calendar2 = _interopRequireDefault(_calendar);

var _creature2 = require("sheepland/creatures/creature");

var _creature3 = _interopRequireDefault(_creature2);

var _creature_names = require("sheepland/creatures/creature_names");

var _creature_names2 = _interopRequireDefault(_creature_names);

var _life_cycle = require("sheepland/creatures/life_cycle");

var _life_cycle2 = _interopRequireDefault(_life_cycle);

var _app = require("sheepland/components/app");

var _app2 = _interopRequireDefault(_app);

var _reactDom = require("react-dom");

var _reactDom2 = _interopRequireDefault(_reactDom);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _test_relation_ = require("sheepland/test_relation_1");

var _test_relation_2 = _interopRequireDefault(_test_relation_);

var _test_relation_3 = require("sheepland/test_relation_2");

var _test_relation_4 = _interopRequireDefault(_test_relation_3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Sheepland = function () {
  function Sheepland() {
    _classCallCheck(this, Sheepland);

    this.ticks = 0;
    this.tick_basic_delay = 10;
    this.tick_speed = 1;
    this.tick_handlers = [];
  }

  _createClass(Sheepland, [{
    key: "generate_world",
    value: function generate_world() {
      this.creatures = []; // TEMP
      this.calendar = new _calendar2.default();
      this.creature_names = new _creature_names2.default();
      this.life_cycle = new _life_cycle2.default();

      this.test_relation_1 = new _test_relation_2.default();
      this.test_relation_2 = new _test_relation_4.default();

      this.test(); // TEMP

      this.tick();
    }
  }, {
    key: "test",
    value: function test() {
      var count = 15;
      while (--count) {
        var creature = this.generate_creature("human");
        this.creatures.push(creature);
      }
      count = 15;
      while (--count) {
        var _creature = this.generate_creature("sheep");
        this.creatures.push(_creature);
      }
    }
  }, {
    key: "generate_creature",
    value: function generate_creature(species) {
      var sex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var birth_ts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      var creature = new _creature3.default(species, sex);
      this.creature_names.generate(creature);
      this.life_cycle.generate(creature);

      this.test_relation_1.generate(creature);
      this.test_relation_2.generate(creature);
      console.log('test_relation', creature.test_val(), creature.test_val_2());

      return creature;
    }
  }, {
    key: "tick",
    value: function tick() {
      this.calendar.handle_tick();
      this.life_cycle.handle_tick();

      if (this.ticks % 10 == 0) {
        this.app.set_date(this.calendar.date.toUTCString());
      }
      if (this.ticks % 100 == 0) {
        var creature_list = this.creatures.map(function (creature) {
          var copy = Object.assign({}, creature);
          copy.age = game.life_cycle.get_age(creature);
          return copy;
        });
        this.app.set_creatures_list(creature_list);
      }

      this.ticks++;
      setTimeout(this.tick.bind(this), this.tick_basic_delay * this.tick_speed);
    }
  }]);

  return Sheepland;
}();

var game = new Sheepland();
module.exports.game = game;

document.addEventListener('DOMContentLoaded', function () {
  _reactDom2.default.render(_react2.default.createElement(_app2.default, null), document.querySelector('#app'));
  game.generate_world();
});

});

require.register("sheepland/test_relation_1.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

var _sheepland = require("sheepland/sheepland");

var _relation = require("sheepland/relation");

var _relation2 = _interopRequireDefault(_relation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 *
 */
var TestRelation1 = function (_Relation) {
  _inherits(TestRelation1, _Relation);

  function TestRelation1() {
    _classCallCheck(this, TestRelation1);

    return _possibleConstructorReturn(this, (TestRelation1.__proto__ || Object.getPrototypeOf(TestRelation1)).apply(this, arguments));
  }

  _createClass(TestRelation1, [{
    key: "deps",
    value: function deps() {
      return [];
    }
  }, {
    key: "exports",
    value: function exports() {
      return {
        test_val: this.test_val
      };
    }
  }, {
    key: "init",
    value: function init(client) {
      this.data[client.id] = { test_val: _util2.default.rand(1, 10) };
    }
  }, {
    key: "test_val",
    value: function test_val(registry) {
      return registry.data[this.id].test_val;
    }
  }]);

  return TestRelation1;
}(_relation2.default);

exports.default = TestRelation1;

});

require.register("sheepland/test_relation_2.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("common/util");

var _util2 = _interopRequireDefault(_util);

var _sheepland = require("sheepland/sheepland");

var _relation = require("sheepland/relation");

var _relation2 = _interopRequireDefault(_relation);

var _test_relation_ = require("sheepland/test_relation_1");

var _test_relation_2 = _interopRequireDefault(_test_relation_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 *
 */
var TestRelation2 = function (_Relation) {
  _inherits(TestRelation2, _Relation);

  function TestRelation2() {
    _classCallCheck(this, TestRelation2);

    return _possibleConstructorReturn(this, (TestRelation2.__proto__ || Object.getPrototypeOf(TestRelation2)).apply(this, arguments));
  }

  _createClass(TestRelation2, [{
    key: "deps",
    value: function deps() {
      return [_test_relation_2.default];
    }
  }, {
    key: "exports",
    value: function exports() {
      return {
        test_val_2: this.test_val_2
      };
    }
  }, {
    key: "init",
    value: function init(client) {
      this.data[client.id] = { test_val_2: _util2.default.rand(1, 10) };
    }
  }, {
    key: "test_val_2",
    value: function test_val_2(registry) {
      return registry.data[this.id].test_val_2;
    }
  }]);

  return TestRelation2;
}(_relation2.default);

exports.default = TestRelation2;

});

require.alias("buffer/index.js", "buffer");
require.alias("path-browserify/index.js", "path");
require.alias("process/browser.js", "process");
require.alias("punycode/punycode.js", "punycode");
require.alias("querystring-es3/index.js", "querystring");
require.alias("url/url.js", "url");process = require('process');require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=app.js.map