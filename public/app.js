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
require.register("a_star.js", function(exports, require, module) {
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

require.register("balls_generator.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _voronoi_diagram = require("voronoi_diagram");

var _voronoi_diagram2 = _interopRequireDefault(_voronoi_diagram);

var _color = require("color");

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
    key: "to_pixi",
    value: function to_pixi(_ref5) {
      var _ref6 = _slicedToArray(_ref5, 3),
          r = _ref6[0],
          g = _ref6[1],
          b = _ref6[2];

      return (r << 16) + (g << 8) + b;
    }

    // PRIVATE

  }, {
    key: "for_rgb",
    value: function for_rgb(_ref7, func) {
      var _ref8 = _slicedToArray(_ref7, 3),
          r = _ref8[0],
          g = _ref8[1],
          b = _ref8[2];

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

require.register("game.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _voronoi_diagram = require("voronoi_diagram");

var _voronoi_diagram2 = _interopRequireDefault(_voronoi_diagram);

var _regions_gatherer = require("regions_gatherer");

var _regions_gatherer2 = _interopRequireDefault(_regions_gatherer);

var _rrt_diagram = require("rrt_diagram");

var _rrt_diagram2 = _interopRequireDefault(_rrt_diagram);

var _geo = require("geo");

var _geo2 = _interopRequireDefault(_geo);

var _a_star = require("a_star");

var _a_star2 = _interopRequireDefault(_a_star);

var _interaction = require("interaction");

var _interaction2 = _interopRequireDefault(_interaction);

var _map_drawer = require("map_drawer");

var _map_drawer2 = _interopRequireDefault(_map_drawer);

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
    this.map_drawer = new _map_drawer2.default(this.width, this.height);
    this.interaction = new _interaction2.default(this);
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

      // RegionsGatherer.gather_regions(diagram);

      // find ways experiment
      /*
      let from = Util.rand_element(diagram.cells);
      let to = Util.rand_element(diagram.cells);
      let get_links_fun = (cell) => cell.links.map(e => {
        let mid_point = MapDrawer.two_cells_edge_midpoint(diagram, e, cell);
        return {
          point: e,
          weight: Util.distance(e, mid_point) + Util.distance(mid_point, cell),
        };
      });
      let index_fun = (cell) => cell.index;
      let euristic_fun = (c1, c2) => Util.distance(c1, c2);
      let euristic_weight = 1;
      let a_star = new AStar(get_links_fun, euristic_fun, euristic_weight, index_fun);
      let path = a_star.find(from, to);
      */

      this.map_drawer.world_init(this.diagram, this.rrt);
      this.geo = new _geo2.default(this.diagram, this.rrt, this.map_drawer);
      this.map_drawer.draw();
      // map_drawer.map is a pixi.js app

      this.map_drawer.highlight_bad_river_links();
      this.map_drawer.highlight_local_minimums();
      //this.map_drawer.highlight_bad_voronoi_nodes();
      //this.map_drawer.print_text_for_each_cell(cell => cell.fertility);

      console.log('RRT', this.rrt);
      console.log('DIAGRAM', this.diagram);
    }
  }]);

  return Game;
}();

exports.default = Game;


var game = new Game();
game.generate_map();

});

require.register("geo.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _rrt_diagram = require("rrt_diagram");

var _rrt_diagram2 = _interopRequireDefault(_rrt_diagram);

var _rivers_and_lakes_generator = require("rivers_and_lakes_generator");

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

require.register("interaction.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _voronoi_diagram = require("voronoi_diagram");

var _voronoi_diagram2 = _interopRequireDefault(_voronoi_diagram);

var _d = require("d3");

var d3 = _interopRequireWildcard(_d);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Interaction = function () {
  function Interaction(game) {
    var _this = this;

    _classCallCheck(this, Interaction);

    this.game = game;
    document.getElementById('build_road').onclick = this.build_road_button_handler.bind(this);
    this.map = this.game.map_drawer.map;
    this.map.stage.interactive = true;

    document.addEventListener('mousemove', this.map_mouse_move_handler.bind(this), false);

    d3.select('#generate_world').on('click', this.trigger_generate_world.bind(this));

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

    this.cell_under_cursor = null;
    this.state = 'initial';
  }

  _createClass(Interaction, [{
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
  }, {
    key: "trigger_generate_world",
    value: function trigger_generate_world() {
      console.clear();
      this.map.stage.children.forEach(function (layer) {
        return layer.removeChildren();
      });
      this.game.generate_map();
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

require.register("map_drawer.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _rrt_diagram = require("rrt_diagram");

var _rrt_diagram2 = _interopRequireDefault(_rrt_diagram);

var _texture_generator = require("texture_generator");

var _texture_generator2 = _interopRequireDefault(_texture_generator);

var _balls_generator = require("balls_generator");

var _balls_generator2 = _interopRequireDefault(_balls_generator);

var _color = require("color");

var _color2 = _interopRequireDefault(_color);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MapDrawer = function () {
  function MapDrawer(width, height) {
    var _this = this;

    _classCallCheck(this, MapDrawer);

    var PIXI = require('pixi.js');
    this.map = new PIXI.Application(width, height, {
      backgroundColor: _color2.default.to_pixi([0, 0, 0]),
      antialias: true,
      view: document.getElementById('map')
    });
    console.log('renderer', this.map.renderer);
    document.getElementById('map_container').appendChild(this.map.view);
    this.layers = {};
    MapDrawer.layers().forEach(function (layer) {
      _this.layers[layer] = new PIXI.Container();
      _this.map.stage.addChild(_this.layers[layer]);
    });
  }

  _createClass(MapDrawer, [{
    key: "world_init",
    value: function world_init(diagram, rrt) {
      this.diagram = diagram;
      this.rrt = rrt;
    }
  }, {
    key: "draw",
    value: function draw() {
      var draw_voronoi_diagram = true;
      var draw_rrt_links = true;
      var draw_arrows = false;
      //let draw_regions = false;
      //let draw_region_borders = false;
      var draw_height = false;
      var draw_rivers = true;
      var draw_geo_types = true;
      var water_color = [0, 50, 200];
      var dark_mode = false; // DEBUG MODE

      this.draw_heights();
      //this.draw_regions();
      this.draw_geo_types();
      this.draw_arrows();
      this.draw_rrt();
      //this.draw_region_borders();
      this.draw_rivers(water_color);
      // temp
      var rg = new PIXI.Graphics();
      this.layers['water'].addChild(rg);
      this.diagram.cells.forEach(function (cell) {
        if (cell.geo_type == 'lake') {
          MapDrawer.draw_smoothed_polygon(rg, cell.nodes, cell, water_color);
        }
      });
      this.dark_mode();

      this.layers['heights'].visible = draw_height;
      //this.layers['regions'].visible = draw_regions;
      this.layers['geo'].visible = draw_geo_types;
      this.layers['arrows'].visible = draw_arrows;
      this.layers['rrt_links'].visible = draw_rrt_links;
      //this.layers['borders'].visible = draw_region_borders;
      this.layers['water'].visible = draw_rivers;
      if (!draw_voronoi_diagram) {
        this.layers['regions'].visible = false;
        this.layers['geo'].visible = false;
        this.layers['heights'].visible = false;
      }
      this.layers['dim_cells'].visible = dark_mode;
      this.layers['dim'].visible = dark_mode;

      // draw exp path
      /*
      let test_from = MapDrawer.draw_polygon(this.path[0].nodes, [50 , 0, 0]);
      this.layers['roads'].addChild(test_from);
      let test_to = MapDrawer.draw_polygon(Util.last(this.path).nodes, [50, 50, 0]);
      this.layers['roads'].addChild(test_to);
      let road_g = new PIXI.Graphics();
      this.layers['roads'].addChild(road_g);
      for (let i = 1; i < this.path.length; i++) {
        let from = this.path[i-1], to = this.path[i];
        MapDrawer.draw_broken_line_between_two_cells(from, to, road_g, diagram, [50, 50, 0], 3);
      }*/
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
    key: "draw_rivers",
    value: function draw_rivers(water_color) {
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
    key: "highlight_bad_voronoi_nodes",
    value: function highlight_bad_voronoi_nodes() {
      var _this4 = this;

      this.diagram.nodes.forEach(function (node) {
        if (node.links.length > 3) {
          var graphics = new PIXI.Graphics();
          graphics.lineStyle(2, _color2.default.to_pixi([200, 50, 0]));
          graphics.drawCircle(node.x, node.y, 3);
          node.links.forEach(function (e) {
            graphics.moveTo(node.x, node.y);
            graphics.lineTo(e.x, e.y);
            graphics.closePath();
          });
          _this4.layers['errors'].addChild(graphics);
        }
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
    key: "draw_heights",
    value: function draw_heights() {
      var _this5 = this;

      var min_height = this.diagram.cells[0].height,
          max_height = this.diagram.cells[0].height;
      this.diagram.cells.forEach(function (cell) {
        if (cell.height < min_height) min_height = cell.height;
        if (cell.height > max_height) max_height = cell.height;
      });
      this.diagram.cells.forEach(function (cell) {
        var c = _util2.default.normalize_value(cell.height, max_height, 255, min_height, 0);
        var graphics = MapDrawer.draw_polygon(cell.nodes, [0, c, 0]);
        _this5.layers['heights'].addChild(graphics); // z-index?
      });
    }
  }, {
    key: "draw_regions",
    value: function draw_regions() {
      var _this6 = this;

      this.diagram.cells.forEach(function (cell) {
        var fill_color = cell.region.color;
        var graphics = MapDrawer.draw_polygon(cell.nodes, fill_color);
        _this6.layers['regions'].addChild(graphics);
      });
    }
  }, {
    key: "draw_geo_types",
    value: function draw_geo_types() {
      var _this7 = this;

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
        _this7.layers['geo'].addChild(graphics);
      });

      //let balls_generator = new BallsGenerator(this.diagram, geo_types_colors, this);
      //balls_generator.generate();
      // DEBUG works EXTREMELY SLOW
      /*
      let geo_sprite = new PIXI.Sprite();
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
        let sprite = new PIXI.extras.TilingSprite(geo_types_textures[cell.geo_type], this.map.view.width, this.map.view.height);
        sprite.mask = graphics;
        geo_sprite.addChild(sprite);
      });
      //this.layers['geo'].addChild(geo_sprite);
      */
    }
  }, {
    key: "draw_arrows",
    value: function draw_arrows() {
      var graphics = new PIXI.Graphics();
      this.layers['arrows'].addChild(graphics);
      this.diagram.cells.forEach(function (cell) {
        return MapDrawer.draw_arrow(cell, cell.closest_link, graphics, 3, [50, 50, 0]);
      });
    }
  }, {
    key: "draw_rrt",
    value: function draw_rrt() {
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
    key: "draw_region_borders",
    value: function draw_region_borders() {
      var _this8 = this;

      var bg = new PIXI.Graphics();
      bg.lineStyle(4, _color2.default.to_pixi([0, 60, 0]));
      this.diagram.edges.forEach(function (edge) {
        var left_region = edge.left ? _this8.diagram.cells[edge.left.index].region : null;
        var right_region = edge.right ? _this8.diagram.cells[edge.right.index].region : null;
        if (left_region != right_region) {
          bg.moveTo(edge.from.x, edge.from.y);
          bg.lineTo(edge.to.x, edge.to.y);
          bg.closePath();
        }
      });
      this.layers['borders'].addChild(bg);
    }
  }, {
    key: "dark_mode",
    value: function dark_mode() {
      var _this9 = this;

      this.diagram.cells.forEach(function (cell) {
        var color = cell.geo_type == 'sea' || cell.geo_type == 'lake' ? [0, 0, 100] : [0, 0, 0];
        var graphics = MapDrawer.draw_polygon(cell.nodes, color);
        _this9.layers['dim_cells'].addChild(graphics); // z-index?
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
        return MapDrawer.move_by_vector(node, center, _util2.default.rand_float(0.1, 0.3));
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
    key: "move_by_vector",
    value: function move_by_vector(from, to, length) {
      var bla = _util2.default.move_by_vector(from.x, from.y, to.x, to.y, length);
      return { x: bla[0], y: bla[1] };
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
  }, {
    key: "color",
    value: function color(_ref3) {
      var _ref4 = _slicedToArray(_ref3, 3),
          r = _ref4[0],
          g = _ref4[1],
          b = _ref4[2];

      return (r << 16) + (g << 8) + b;
    }
  }]);

  return MapDrawer;
}();

exports.default = MapDrawer;

});

require.register("regions_gatherer.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('util');

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

require.register("rivers_and_lakes_generator.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _rrt_diagram = require("rrt_diagram");

var _rrt_diagram2 = _interopRequireDefault(_rrt_diagram);

var _map_drawer = require("map_drawer");

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

require.register("rrt_diagram.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('util');

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

require.register("texture_generator.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _map_drawer = require("map_drawer");

var _map_drawer2 = _interopRequireDefault(_map_drawer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TextureGenerator = function () {
  function TextureGenerator() {
    _classCallCheck(this, TextureGenerator);
  }

  _createClass(TextureGenerator, [{
    key: "simple",
    value: function simple(base) {
      var step = 10;
      var lower = [this.color_channel(base[0], -step), this.color_channel(base[1], -step), this.color_channel(base[2], -step)];
      var upper = [this.color_channel(base[0], step), this.color_channel(base[1], step), this.color_channel(base[2], step)];
      return this.generate(lower, upper, step, 400, 2);
    }
  }, {
    key: "color_channel",
    value: function color_channel(base, step) {
      if (base == 0) {
        return 0;
      }
      var res = base + step;
      if (res < 0 || res > 255) {
        throw 'color channel out of border';
      }
      return res;
    }
  }, {
    key: "generate",
    value: function generate(lower, upper, step, tiles_count, tile_size) {
      var graphics = new PIXI.Graphics();
      for (var y = 0; y < tiles_count; y++) {
        for (var x = 0; x < tiles_count; x++) {
          graphics.beginFill(_map_drawer2.default.color(this.random_color(lower, upper, step)));
          graphics.drawRect(tile_size * x, tile_size * y, tile_size, tile_size);
          graphics.endFill();
        }
      }
      var texture = graphics.generateCanvasTexture(PIXI.SCALE_MODES.NEAREST, 1);
      return texture;
    }
  }, {
    key: "random_color",
    value: function random_color(lower, upper) {
      var step = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

      return [this.rand(lower[0], upper[0], step), this.rand(lower[1], upper[1], step), this.rand(lower[2], upper[2], step)];
    }
  }, {
    key: "rand",
    value: function rand(lower, upper) {
      var step = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

      return step * _util2.default.rand(lower / step | 0, upper / step | 0);
    }
  }]);

  return TextureGenerator;
}();

exports.default = TextureGenerator;

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

require.register("voronoi_diagram.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("util");

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
        var res = _util2.default.move_by_vector(p.data.x, p.data.y, pf.x, pf.y, to_move);
        return { x: res[0], y: res[1] };
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

require.alias("buffer/index.js", "buffer");
require.alias("path-browserify/index.js", "path");
require.alias("process/browser.js", "process");
require.alias("punycode/punycode.js", "punycode");
require.alias("querystring-es3/index.js", "querystring");
require.alias("url/url.js", "url");process = require('process');require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=app.js.map