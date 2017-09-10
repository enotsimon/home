
import Util from "common/util";
import VoronoiDiagram from "common/voronoi_diagram";
import RegionsGatherer from "geo/regions_gatherer";
import RRTDiagram from "geo/rrt_diagram";
import Geo from "geo/geo";
import AStar from "common/a_star";
import Interaction from "geo/interaction";
import MapDrawer from "geo/map_drawer";
import App from 'geo/components/app';
import ReactDOM from 'react-dom';
import React from 'react';

class Game {
  constructor() {
    // CONST
    this.width = 800;
    this.height = 800;
    this.cells_count = Infinity;
    this.rrt_epsilon = 35;
    this.rrt_reject_limit = 500;
    this.map_drawer = new MapDrawer();
    this.interaction = new Interaction();
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

    this.map_drawer.init(this.diagram, this.rrt, this.width, this.height);
    this.interaction.init();
    this.geo = new Geo(this.diagram, this.rrt, this.map_drawer);
    this.map_drawer.draw();

    this.map_drawer.highlight_bad_river_links();
    this.map_drawer.highlight_local_minimums();
    //this.map_drawer.print_text_for_each_cell(cell => cell.fertility);
  }
}

let game = new Game();
module.exports.game = game; // OMG global export BAD WAY

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<App />, document.querySelector('#app'));
  game.generate_map();
});
