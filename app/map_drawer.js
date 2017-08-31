
import Util from "util";
import RRTDiagram from "rrt_diagram";
import TextureGenerator from "texture_generator";
import BallsGenerator from "balls_generator";
import Color from "color";

export default class MapDrawer {
  static layers() {
    // edges -- test for rivers by edges
    return [
      // cells filling
      'regions', 'geo', 'heights', 'dim_cells',
      // all items, objects, all that 'upon' the ground
      'borders', 'water', 'rrt_links', 'arrows', 'edges', 'roads', 'errors',
      // interaction routines
      'selection', 'under_cursor',
      // other
      'dim'
    ];
  }

  init(diagram, rrt, width, height) {
    let PIXI = require('pixi.js');
    this.map = new PIXI.Application(width, height, {
      backgroundColor : Color.to_pixi([0, 0, 0]),
      antialias: true,
      view: document.getElementById('map'),
    });
    console.log('renderer', this.map.renderer);
    this.layers = {};
    MapDrawer.layers().forEach(layer => {
      this.layers[layer] = new PIXI.Container();
      this.map.stage.addChild(this.layers[layer]);
    });
    document.getElementById('map_container').appendChild(this.map.view);
    this.diagram = diagram;
    this.rrt = rrt;
  }

  
  draw() {
    let draw_voronoi_diagram = true;
    let draw_rrt_links = true;
    let draw_arrows = false;
    let draw_height = false;
    let draw_rivers = true;
    let draw_geo_types = true;
    let water_color = [0, 50, 200];
    let dark_mode = false; // DEBUG MODE

    this.draw_heights();
    this.draw_geo_types();
    this.draw_arrows();
    this.draw_rrt();
    this.draw_rivers(water_color);
    
    let rg = new PIXI.Graphics();
    this.layers['water'].addChild(rg);
    this.diagram.cells.forEach(cell => {
      if (cell.geo_type == 'lake') {
        MapDrawer.draw_smoothed_polygon(rg, cell.nodes, cell, water_color);
      }
    });
    this.dark_mode();

    this.layers['heights'].visible = draw_height;
    this.layers['geo'].visible = draw_geo_types;
    this.layers['arrows'].visible = draw_arrows;
    this.layers['rrt_links'].visible = draw_rrt_links;
    this.layers['water'].visible = draw_rivers;
    if (!draw_voronoi_diagram) {
      this.layers['regions'].visible = false;
      this.layers['geo'].visible = false;
      this.layers['heights'].visible = false;
    }
    this.layers['dim_cells'].visible = dark_mode;
    this.layers['dim'].visible = dark_mode;
  }



  clear_cell_under_cursor() {
    this.layers['under_cursor'].removeChildren();
  }

  highlight_cell_under_cursor(cell) {
    this.clear_cell_under_cursor();
    let polygon = cell.nodes.map(node => new PIXI.Point(node.x, node.y));
    let border_graphics = new PIXI.Graphics();
    border_graphics.alpha = 0.75;
    border_graphics.lineStyle(3, Color.to_pixi([218,165,32]));
    border_graphics.drawPolygon(polygon);
    border_graphics.closePath(); // strange, but it needed here. some edges are thin without it
    let inner_graphics = new PIXI.Graphics();
    inner_graphics.alpha = 0.35;
    inner_graphics.beginFill(Color.to_pixi([255, 255, 255]));
    inner_graphics.drawPolygon(polygon);
    inner_graphics.closePath(); // strange, but it needed here. some edges are thin without it
    inner_graphics.endFill();
    
    this.layers['under_cursor'].addChild(border_graphics);
    this.layers['under_cursor'].addChild(inner_graphics);
  }


  draw_rivers(water_color, draw_arrows = false) {
    let graphics = new PIXI.Graphics();
    let graphics_arrows = new PIXI.Graphics();
    graphics_arrows.alpha = 0.5;
    this.diagram.nodes.forEach(node => {
      if (!node.river) return;
      if (node.river.strength === 0) {
        //let dry_river_color = [121, 96, 76];
        let dry_river_color = [87, 65, 47];
        graphics.lineStyle(2, Color.to_pixi(dry_river_color));
      } else {
        graphics.lineStyle(MapDrawer.get_line_width_for_river(node.river.strength), Color.to_pixi(water_color));
      }
      node.river.children.forEach(child => {
        graphics.moveTo(node.x, node.y);
        graphics.lineTo(child.x, child.y);
        graphics.closePath();
        MapDrawer.draw_arrow(node, child, graphics_arrows, 1, [200, 100, 0]);
      });
    });
    this.layers['water'].addChild(graphics);
    if (draw_arrows) this.layers['water'].addChild(graphics_arrows);
  }

  static get_line_width_for_river(strength) {
    return 0.5 + Math.log(strength);
  }

  highlight_bad_river_links() {
    let graphics = new PIXI.Graphics();
    graphics.alpha = 0.5;
    this.diagram.nodes.forEach(node => {
      if (!node.river) return;
      node.river.children.forEach(child => {
        if (child.height > node.height) {
          console.log('river flows up', child.height, node.height);
          graphics.lineStyle(MapDrawer.get_line_width_for_river(node.river.strength), Color.to_pixi([200, 50, 0]));
          graphics.moveTo(node.x, node.y);
          graphics.lineTo(child.x, child.y);
          graphics.closePath();
        }
      });
    });

    this.layers['water'].addChild(graphics);
  }

  highlight_local_minimums() {
    this.diagram.cells.forEach(cell => {
      if (cell.geo_type == 'sea') return;
      if (cell.links.every(link => link.height > cell.height)) {
        let graphics = MapDrawer.draw_polygon(cell.nodes, [255, 0, 125]);
        graphics.alpha = 0.5;
        this.layers['errors'].addChild(graphics);
        console.log('inland local minimum', cell.x, cell.y);
      }
    })
  }



  print_text_for_each_cell(fn) {
    this.diagram.cells.forEach(cell => {
      let msg = fn(cell);
      let text = new PIXI.Text(msg, {fontFamily : 'Arial', fontSize: 10, fill : 0xff1010});
      text.x = cell.x + 2;
      text.y = cell.y;
      this.layers['errors'].addChild(text);
    });
  }  

  highlight_deleted_links(deleted_links) {
    let graphics = new PIXI.Graphics();
    deleted_links.forEach(([from, to]) => {
      graphics.lineStyle(2, Color.to_pixi([250, 125, 0]));
      graphics.moveTo(from.x, from.y);
      graphics.lineTo(to.x, to.y);
      graphics.closePath();
    });
    this.layers['errors'].addChild(graphics);
  }






  draw_heights() {
    let min_height = this.diagram.cells[0].height,
        max_height = this.diagram.cells[0].height;
    this.diagram.cells.forEach(cell => {
      if (cell.height < min_height) min_height = cell.height;
      if (cell.height > max_height) max_height = cell.height;
    });
    this.diagram.cells.forEach(cell => {
      let c = Util.normalize_value(cell.height, max_height, 255, min_height, 0);
      let graphics = MapDrawer.draw_polygon(cell.nodes, [0, c, 0]);
      this.layers['heights'].addChild(graphics); // z-index?
    });
  }

  draw_geo_types() {
    let geo_types_colors = {
      sea: [0, 50, 100],
      rock: [60, 60, 50],
      //ITS A HACK! its only a background, we draw lake lower with c draw_smoothed_polygon() and blue color
      lake: [0, 150, 0],
      bog: [50, 100, 0],
      grass: [0, 150, 0],
      steppe: [150, 150, 0],
      desert: [200, 150, 0],
    };
    this.diagram.cells.forEach(cell => {
      if (!geo_types_colors[cell.geo_type]) {
        throw('no geo_type color for '.cell.geo_type);
      }
      let fill_color = geo_types_colors[cell.geo_type];
      let graphics = MapDrawer.draw_polygon(cell.nodes, fill_color);
      this.layers['geo'].addChild(graphics);
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

  draw_arrows() {
    let graphics = new PIXI.Graphics();
    this.layers['arrows'].addChild(graphics);
    this.diagram.cells.forEach(cell => MapDrawer.draw_arrow(cell, cell.closest_link, graphics, 3, [50, 50, 0]));
  }

  draw_rrt() {
    let color = ([0, 125, 255]).sort((e1, e2) => 0.5 - Math.random());
    let graphics = new PIXI.Graphics();
    this.layers['rrt_links'].addChild(graphics);
    let bla = Util.find_min_and_max(this.rrt.nodes, (e) => e.height);

    // TODO add diff colors for isolated graphs, use Utildo_while_not_empty() for that
    this.diagram.cells.forEach(cell => {
      graphics.lineStyle(0, Color.to_pixi([0, 0, 0]));
      let color_by_height = [
        Util.normalize_value(cell.height, bla.max, color[0], bla.min, 25),
        Util.normalize_value(cell.height, bla.max, color[1], bla.min, 25),
        Util.normalize_value(cell.height, bla.max, color[2], bla.min, 25)
      ];
      graphics.beginFill(Color.to_pixi(color_by_height));
      graphics.drawCircle(cell.x, cell.y, 4);
      graphics.endFill();
      // all links are drawen twice, but i dont care!
      cell.rrt_links.forEach(link => {
        graphics.lineStyle(3, Color.to_pixi(color_by_height));
        graphics.moveTo(cell.x, cell.y);
        graphics.lineTo(link.x, link.y);
      });
    });
  }

  dark_mode() {
    this.diagram.cells.forEach(cell => {
      let color = cell.geo_type == 'sea' || cell.geo_type == 'lake' ? [0, 0, 100] : [0, 0, 0];
      let graphics = MapDrawer.draw_polygon(cell.nodes, color);
      this.layers['dim_cells'].addChild(graphics); // z-index?
    });
    let g = new PIXI.Graphics();
    this.layers['dim'].addChild(g);
    g.alpha = 0.75;
    g.beginFill = Color.to_pixi([0, 0, 0]);
    g.drawRect(0, 0, this.map.view.width, this.map.view.height);
    g.endFill();
  }


  static draw_polygon(polygon, fill_color) {
    let graphics = new PIXI.Graphics();
    graphics.lineStyle(1, Color.to_pixi([0, 30, 0]));
    graphics.beginFill(Color.to_pixi(fill_color));
    graphics.drawPolygon(polygon.map(node => new PIXI.Point(node.x, node.y)));
    graphics.closePath(); // strange, but it needed here. some edges are thin without it
    graphics.endFill();
    return graphics;
  }

  // TODO
  static draw_arrow(from, to, graphics, line_width, color) {
    graphics.lineStyle(line_width, Color.to_pixi(color));
    graphics.moveTo(from.x, from.y);
    graphics.lineTo(to.x, to.y);
    graphics.closePath();

    let angle = Util.to_polar_coords(from.x - to.x, from.y - to.y).angle;
    let p1 = Util.from_polar_coords(angle - Util.radians(15), 7*line_width);
    let p2 = Util.from_polar_coords(angle + Util.radians(15), 7*line_width);
    graphics.beginFill(Color.to_pixi(color));
    graphics.moveTo(p1.x + to.x, p1.y + to.y);
    graphics.lineTo(to.x, to.y);
    graphics.lineTo(p2.x + to.x, p2.y + to.y);
    graphics.closePath();
    graphics.endFill();
  }


  static draw_smoothed_polygon(graphics, polygon, center, water_color) {
    polygon = polygon.map(node => MapDrawer.move_by_vector(node, center, Util.rand_float(0.1, 0.3)));
    let mid_radius = polygon.reduce((sum, e) => sum + Util.distance(e, center), 0)/polygon.length;
    polygon = polygon.filter((node, i) => {
      let next_i = (i + 1 == polygon.length) ? 0 : i + 1;
      let next_node = polygon[next_i];
      return Util.distance(node, next_node) >= 0.2*mid_radius;
    });

    graphics.beginFill(Color.to_pixi(water_color));
    let fl_mid = {x: (polygon[0].x + Util.last(polygon).x)/2, y: (polygon[0].y + Util.last(polygon).y)/2};
    graphics.moveTo(fl_mid.x, fl_mid.y);
    Util.for_all_consecutive_pairs(polygon, (cur, next) => {
      let pc_mid = {x: (next.x + cur.x)/2, y: (next.y + cur.y)/2};
      graphics.quadraticCurveTo(cur.x, cur.y, pc_mid.x, pc_mid.y);
    });
    graphics.endFill();
  }


  static draw_broken_line_between_two_cells(c1, c2, graphics, diagram, color, width = 1) {
    let mid_point = MapDrawer.two_cells_edge_midpoint(diagram, c1, c2);
    graphics.lineStyle(width, Color.to_pixi(color));
    graphics.moveTo(c1.x, c1.y);
    graphics.lineTo(mid_point.x, mid_point.y);
    graphics.moveTo(mid_point.x, mid_point.y);
    graphics.lineTo(c2.x, c2.y);
  }



  static move_by_vector(from, to, length) {
    let bla = Util.move_by_vector(from.x, from.y, to.x, to.y, length);
    return {x: bla[0], y: bla[1]};
  }


  static two_cells_edge_midpoint(diagram, c1, c2) {
    let my_edge;
    for (let i in c2.halfedges) {
      let edge = diagram.edges[c2.halfedges[i]];
      if (edge.left == c1 || edge.right == c1) {
        my_edge = edge;
        break;
      }
    }
    if (!my_edge) {
      console.log('two_cells_edge_midpoint not linked cells', c1, c2);
      throw('two_cells_edge_midpoint not linked cells');
    }
    return {x: (my_edge.from.x + my_edge.to.x)/2, y: (my_edge.from.y + my_edge.to.y)/2};
  }
}
