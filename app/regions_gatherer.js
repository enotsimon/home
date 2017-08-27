import Util from "util";

export default class RegionsGatherer {
  static gather_regions(diagram) {
    let regions_mode = 'rrt_leafs'; // 'closest'
    const regions_min_cells = 5;
    //const regions_opt_cells = 15; // kinda optimum, not max

    // gather regions
    diagram.regions = [];
    if (regions_mode == 'rrt_leafs') {
      let starters = diagram.cells.filter(cell => cell.rrt_links.length != 2);
      starters.forEach(cell => {
        let region = {color: MapDrawer.random_color(), cells: [cell]};
        diagram.regions.push(region);
        cell.region = region;
      });
      starters.forEach(cell => RegionsGatherer.gather_all_parents_to_my_region(cell));
      RegionsGatherer.recursively_merge_small_regions(diagram);
      diagram.regions.forEach((region, i) => region.index = i);
    } else {
      let get_linked_cells_func;
      if (regions_mode == 'closest') {
        get_linked_cells_func = (cell) => cell.closest_backlinks.concat([cell.closest_link]);
      } else if (regions_mode == 'rrt') {
        get_linked_cells_func = (cell) => cell.rrt_links;
      } else if (regions_mode == 'rrt_generations') {
        let generations_per_regions = 5;
        get_linked_cells_func = (cell) => {
          let my_region_index = Math.floor(cell.generation/generations_per_regions);
          return cell.rrt_links.filter(link => Math.floor(link.generation/generations_per_regions) == my_region_index);
        };
      } else {
        throw("unknown regions_mode: " + regions_mode);
      }
      diagram.cells.forEach(cell => RegionsGatherer.diagram_collect_regions(diagram, cell, get_linked_cells_func));
    }

    // after set cells on_border prop
    diagram.regions.forEach(region => {
      region.on_border = false;
      for (let i = 0; i < region.cells.length; i++) {
        if (region.cells[i].on_border) {
          region.on_border = true;
          break;
        }
      }
    });
  }



  static diagram_collect_regions(diagram, cell, get_linked_cells_func) {
    if (cell.region) {
      return;
    }
    let linked_cells = get_linked_cells_func(cell); // cell.closest_backlinks.concat([cell.closest_link]);
    let region;
    for (let i = 0; i < linked_cells.length; i++) {
      if (linked_cells[i].region) {
        region = linked_cells[i].region;
        break;
      }
    }
    if (!region) {
      region = {color: MapDrawer.random_color(), index: diagram.regions.length, cells: []};
      diagram.regions.push(region);
    }
    cell.region = region; // index?
    region.cells.push(cell); // wont be dublicates???

    linked_cells.forEach(link => diagram_collect_regions(diagram, cell, get_linked_cells_func));
  }




  static gather_all_parents_to_my_region(cell) {
    let parent = RRTDiagram.get_parent(cell);
    if (!parent || parent.region) {
      return;
    }
    parent.region = cell.region;
    cell.region.cells.push(parent);
    return RegionsGatherer.gather_all_parents_to_my_region(parent);
  }

  static rrt_leafs_move_all_cells_from_region_to_another_and_delete_it(from, to, diagram) {
    from.cells.forEach(cell => {
      cell.region = to;
      to.cells.push(cell);
    });
    from.cells.splice(0, from.cells.length);
    Util.remove_element(from, diagram.regions);
  }


  static recursively_merge_small_regions(diagram) {
    let small_regions = diagram.regions.filter(region => region.cells.length < regions_min_cells);
    if (!small_regions.length) {
      return;
    }
    // smallest first. actually, we need only first one
    let region = RegionsGatherer.sort_regions_by_size(small_regions)[0]; //small_regions.shift();
    let linked_regions = RegionsGatherer.gather_all_linked_regions(region);
    RegionsGatherer.sort_regions_by_size(linked_regions);
    let target_region = linked_regions[0];
    /*if (target_region.cells.length > regions_opt_cells) {
      console.log('too bad merge with big one, size '+region.cells.length+' with size '+target_region.cells.length);
    }*/
    RegionsGatherer.rrt_leafs_move_all_cells_from_region_to_another_and_delete_it(region, target_region, diagram);
    RegionsGatherer.recursively_merge_small_regions(diagram);
  }

  static gather_all_linked_regions(region) {
    let linked_regions = [];
    region.cells.forEach(cell => {
      cell.rrt_links.forEach(link => { if (link.region && link.region != region) Util.push_uniq(link.region, linked_regions) });
    });
    return linked_regions;
  }

  static sort_regions_by_size(regions) {
    return regions.sort((e1, e2) => e1.cells.length - e2.cells.length);
  }
}
