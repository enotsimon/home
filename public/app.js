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
require.register("color.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("util");

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

require.register("components/app.jsx", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _collapsible_panel = require('components/collapsible_panel');

var _collapsible_panel2 = _interopRequireDefault(_collapsible_panel);

var _debug_info = require('components/debug_info');

var _debug_info2 = _interopRequireDefault(_debug_info);

var _generate_world_form = require('components/generate_world_form');

var _generate_world_form2 = _interopRequireDefault(_generate_world_form);

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

require.register("components/collapsible_panel.jsx", function(exports, require, module) {
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

require.register("components/debug_info.jsx", function(exports, require, module) {
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

require.register("components/generate_world_form.jsx", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _input_spinner = require('components/input_spinner');

var _input_spinner2 = _interopRequireDefault(_input_spinner);

var _game = require('game');

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

require.register("components/input_spinner.jsx", function(exports, require, module) {
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

require.register("game.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _star_system = require("star_system");

var _star_system2 = _interopRequireDefault(_star_system);

var _interaction = require("interaction");

var _interaction2 = _interopRequireDefault(_interaction);

var _map_drawer = require("map_drawer");

var _map_drawer2 = _interopRequireDefault(_map_drawer);

var _reactDom = require("react-dom");

var _reactDom2 = _interopRequireDefault(_reactDom);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _app = require("components/app");

var _app2 = _interopRequireDefault(_app);

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

require.register("initialize.js", function(exports, require, module) {
'use strict';

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _app = require('components/app');

var _app2 = _interopRequireDefault(_app);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

document.addEventListener('DOMContentLoaded', function () {
  _reactDom2.default.render(_react2.default.createElement(_app2.default, null), document.querySelector('#app'));
});

});

require.register("interaction.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _d = require("d3");

var d3 = _interopRequireWildcard(_d);

var _game = require("game");

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

require.register("map_drawer.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _color = require("color");

var _color2 = _interopRequireDefault(_color);

var _game = require("game");

var _blur_generator = require("texture_generators/blur_generator");

var _blur_generator2 = _interopRequireDefault(_blur_generator);

var _points_in_circle = require("texture_generators/points_in_circle");

var _points_in_circle2 = _interopRequireDefault(_points_in_circle);

var _density_map = require("texture_generators/density_map");

var _density_map2 = _interopRequireDefault(_density_map);

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

      this.clear_all();
      var points_count = 5000;
      //let tg = new PointsInCicrle();
      var tg = new _density_map2.default();
      //tg.generate(points_count, PointsInCicrle.linear);
      //tg.generate(points_count, PointsInCicrle.pow);
      tg.generate(points_count);
      var container = tg.draw(50);
      //let container = tg.draw_triangles(50);
      this.layers['test'].addChild(container);
    }
  }, {
    key: "redraw",
    value: function redraw() {
      //this.bodies_graphics.forEach(graphics => this.update_stellar_body(graphics));
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

require.register("star_system.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _game = require("game");

var _stellar_body = require("stellar_body");

var _stellar_body2 = _interopRequireDefault(_stellar_body);

var _color = require("color");

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

require.register("stellar_body.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _game = require("game");

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

require.register("texture_generators/blur_generator.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _game = require("game");

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _color = require("color");

var _color2 = _interopRequireDefault(_color);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BlurGenerator = function () {
  function BlurGenerator() {
    _classCallCheck(this, BlurGenerator);

    this.map = _game.game.map_drawer.map;
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

require.register("texture_generators/density_map.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _game = require("game");

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _color = require("color");

var _color2 = _interopRequireDefault(_color);

var _d = require("d3");

var d3 = _interopRequireWildcard(_d);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
      //let sum = this.calc_distance_sum(point);
      //let value = this.zero_distance_sum / sum;
      var value = _util2.default.find_min_and_max(this.points, function (p) {
        return _util2.default.distance(p, point);
      }).min;
      console.log('value', value);
      return value < this.average_distance_threshold;
    }
  }, {
    key: "draw",
    value: function draw(scale) {
      var _this = this;

      var graphics = new PIXI.Graphics();
      var radius = .01;
      var bla = _util2.default.find_min_and_max(this.points, function (p) {
        return _this.calc_distance_sum(p);
      }).max;
      bla = _util2.default.find_min_and_max(this.points, function (p) {
        return _this.calc_distance_sum(p);
      });
      var max_distance_sum = bla.max;
      var min_distance_sum = bla.min;

      this.points.forEach(function (point) {
        point.channel = _util2.default.normalize_value(_this.calc_distance_sum(point), max_distance_sum, 255, min_distance_sum) | 0;
      });
      this.points.sort(function (p1, p2) {
        return p1.channel - p2.channel;
      });

      this.points.forEach(function (point) {
        //let color = point.initial ? [125, 255, 0] : [point.channel, 0, 0];
        var color = point.initial ? [125, 255, 0] : [125, 0, 0];
        graphics.beginFill(_color2.default.to_pixi(color));
        graphics.drawCircle(scale * point.x, scale * point.y, scale * radius);
        graphics.closePath();
        graphics.endFill();
      });

      return graphics;
    }
  }]);

  return DensityMap;
}();

exports.default = DensityMap;

});

require.register("texture_generators/points_in_circle.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _game = require("game");

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _color = require("color");

var _color2 = _interopRequireDefault(_color);

var _d = require("d3");

var d3 = _interopRequireWildcard(_d);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

require.register("util.js", function(exports, require, module) {
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
    value: function move_by_vector(xf, yf, xt, yt, length) {
      // why i wrote j_max + 1? thats for last gradient area -- otherwise it will be just a single dot
      return [xf + (xt - xf) * length, yf + (yt - yf) * length];
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
  }]);

  return Util;
}();

exports.default = Util;

});

require.alias("buffer/index.js", "buffer");
require.alias("path-browserify/index.js", "path");
require.alias("process/browser.js", "process");
require.alias("punycode/punycode.js", "punycode");
require.alias("querystring-es3/index.js", "querystring");
require.alias("url/url.js", "url");process = require('process');require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=app.js.map