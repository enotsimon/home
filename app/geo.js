import Util from "util";
import RRTDiagram from "rrt_diagram";
import RiversAndLakesGenerator from "rivers_and_lakes_generator";


export default class Geo {
  constructor(diagram, rrt, map_drawer) {
    this.map_drawer = map_drawer;
    this.sea_ratio = 0.3;
    this.rock_height_ratio = 0.75;
    this.rrt_regions = 3;
    this.diagram = diagram;
    this.rrt = rrt;
    let max_branch_order = Util.find_min_and_max(this.rrt.nodes, node => node.branch_order).max;
    console.log('WE GONNA remove_some_links_and_recalc_all', this.rrt_regions - 1);
    let deleted_links = this.rrt.remove_some_links_and_recalc_all(this.rrt_regions - 1, max_branch_order - 10, max_branch_order - 2);
    let centers = this.rrt.nodes.filter(node => node.generation == 0);
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
    this.generate_rocks_by_height()
    this.calc_fertility();
    this.geo_types_by_fertility();
  }


  generate_sea(sea_ratio) {
    let sea_cells_threshold = Math.floor(sea_ratio * this.diagram.cells.length);
    let count_sea_cells = 0;
    for (let i in this.heights_stat()) {
      if (count_sea_cells >= sea_cells_threshold) {
        break;
      }
      let open_list = [];
      this.diagram.cells.forEach(cell => {
        if (cell.height <= i && cell.geo_type != 'sea') {
          open_list.push(cell);
        }
      });
      let length_before;
      do {
        length_before = open_list.length;
        open_list = open_list.filter(cell => {
          // we dont set sea type to inland regions, only to connected to other seas
          if (cell.on_border || cell.links.some(c => c.geo_type == 'sea')) {
            cell.geo_type = 'sea';
            count_sea_cells++;
            return false;
          }
          return true;
        });
      } while (open_list.length && length_before != open_list.length);
    }
    // set shores
    this.diagram.cells.forEach(cell => {
      cell.shore = cell.geo_type != 'sea' && cell.links.some(c => c.geo_type == 'sea');
    });
  }


  generate_rocks_by_height() {
    let max_height = Util.find_min_and_max(this.rrt.nodes, e => e.height).max;
    this.rock_from_height = Math.ceil(this.rock_height_ratio*max_height);
    this.diagram.cells.forEach(cell => {
      if (cell.height >= this.rock_from_height) {
        cell.geo_type = 'rock';
      }
    });
  }

  generate_rivers() {
    RiversAndLakesGenerator.generate_by_edges(this.diagram);
  }

  calc_fertility() {
    let square_sum = 0;
    this.diagram.cells.forEach(cell => square_sum += Util.convex_polygon_square(cell.nodes));
    let fertility_multiplier = Math.round(square_sum / this.diagram.cells.length);

    this.diagram.cells.forEach(cell => {
      if (cell.geo_type == 'sea') {
        cell.fertility = 0;
        return;
      }
      let sum_rivers_strength = 0;
      let square = Util.convex_polygon_square(cell.nodes);
      cell.nodes.forEach(node => sum_rivers_strength += node.river ? node.river.strength : 0);
      cell.fertility = Math.ceil(fertility_multiplier * sum_rivers_strength / square);
    });
  }


  geo_types_by_fertility() {
    let stats = [];
    this.diagram.cells.forEach(cell => Util.push_uniq(cell.fertility, stats));
    stats.sort((e1, e2) => e1 - e2);
    let min = stats[0];
    let max = stats[Math.floor(0.95 * stats.length)]; // 95% persentile cause there's big gaps in the end
    let geo_type_fertility_thresholds = {
      bog: Util.normalize_value(0.55, 1, max, 0, min),
      grass: Util.normalize_value(0.15, 1, max, 0, min),
      steppe: Util.normalize_value(0.05, 1, max, 0, min),
      desert: Util.normalize_value(0.0, 1, max, 0, min),
    };

    this.diagram.cells.forEach(cell => {
      if (cell.geo_type) {
        return;
      }
      for (let i in geo_type_fertility_thresholds) {
        if (cell.fertility >= geo_type_fertility_thresholds[i]) {
          cell.geo_type = i;
          break;
        }
      }
    });
  }

  init_height() {
    this.rrt.nodes.forEach(node => node.height = 0);
  }

  generate_heights_by_rrt_branches_length(step = 10, floor_level = 0) {
    this.rrt.nodes.forEach(node => node.height += step * node.branch_order + floor_level);
  }

  height_smooth(max_diff_coef = 0.3) {
    let h = Util.find_min_and_max(this.rrt.nodes, node => node.height);
    let max_diff = max_diff_coef * (h.max - h.min);
    let changed = 0;
    do {
      changed = 0;
      this.diagram.cells.forEach(cell => {
        let max_height = Util.find_min_and_max(cell.links, c => c.height).max;
        let height_to_max_diff = max_height - max_diff;
        if (cell.height < height_to_max_diff) {
          cell.height = height_to_max_diff;
          changed++;
        }
      });
      console.log('height smooth cycle cells changed', changed);
    } while (changed > 0);
  }

  
  generate_heights_by_rrt_generations(peak_max_height = 200, peak_min_height = 200, step = 2) {
    let peak_height = Util.rand(peak_min_height, peak_max_height);
    this.rrt.nodes.forEach(node => node.height += Math.max(node.height, peak_height - step * node.generation));
  }

  set_nodes_height_by_cell_height() {
    this.diagram.nodes.forEach(node => {
      //node.height = Math.round(node.cells.reduce((acc, cell) => cell.height + acc, 0) / node.cells.length);
      node.height = Util.find_min_and_max(node.cells, cell => cell.height).min;
    });
  }


  // for seas and like that
  heights_stat() {
    let stat = [];
    this.diagram.cells.forEach(cell => {
      if (!stat[cell.height]) stat[cell.height] = 0;
      stat[cell.height]++;
    });
    //stat.forEach((e, i) => console.log('height', i, e));
    return stat;
  }
}
