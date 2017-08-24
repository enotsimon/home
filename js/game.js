
import Util from "js/util";
import VoronoiDiagram from "js/voronoi_diagram";
import RegionsGatherer from "js/regions_gatherer";
import RRTDiagram from "js/rrt_diagram";
import Geo from "js/geo";
import AStar from "js/a_star";

import Interaction from "js/interaction";
import MapDrawer from "js/map_drawer";

export default class Game {
  constructor() {
    // CONST
    this.width = 800;
    this.height = 800;
    this.cells_count = Infinity;
    this.rrt_epsilon = 35;
    this.rrt_reject_limit = 500;
  }

  generate_map() {
    this.rrt = new RRTDiagram(this.width, this.height);
    this.rrt.generate(this.rrt_epsilon, this.cells_count, this.rrt_reject_limit);
    this.diagram = VoronoiDiagram.generate(this.rrt.nodes, this.width, this.height);

    // find closes point
    this.diagram.cells.forEach(cell => cell.closest_backlinks = []);
    this.diagram.cells.forEach(cell => {
      cell.closest_link = cell.links[0];
      Util.push_uniq(cell, cell.closest_link.closest_backlinks);
    });

    // find close-to-border 
    this.diagram.cells.forEach(cell => { cell.on_border = false; });
    this.diagram.edges.forEach(edge => {
      if (!edge.right) {
        edge.on_border = true;
        edge.from.on_border = true;
        edge.to.on_border = true;
        this.diagram.cells[edge.left.index].on_border = true;
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


    this.map_drawer = new MapDrawer(this.diagram, this.rrt, [], this.width, this.height);
    this.geo = new Geo(this.diagram, this.rrt, this.map_drawer);
    this.map_drawer.draw();
    // map_drawer.map is a pixi.js app
    this.interaction = new Interaction(this.map_drawer.map, this.diagram, this.map_drawer);

    this.map_drawer.highlight_bad_river_links();
    this.map_drawer.highlight_local_minimums();
    //this.map_drawer.highlight_bad_voronoi_nodes();
    //this.map_drawer.print_text_for_each_cell(cell => cell.fertility);

    console.log('RRT', this.rrt);
    console.log('DIAGRAM', this.diagram);
  }
}


let game = new Game();
game.generate_map();
