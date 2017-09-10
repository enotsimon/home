import Util from "common/util";
import * as d3 from "d3";

/**
 *  we take original voronoi diagram from d3,
 *  add lloyd relaxation
 *  and then reorganize its internal structure, cause its annoying and awful, for my taste
 *  and to each cell we add array of links to neig nodes, sorted by distance
 */
export default class VoronoiDiagram {
  static generate(nodes, width, height, lloyd_relaxation_steps = 0) {
    let voronoi = d3.voronoi().x(p => p.x).y(p => p.y).size([width, height]);
    let original_diagram = voronoi(nodes);
    for (let i = 0; i < lloyd_relaxation_steps; i++) {
      original_diagram = VoronoiDiagram.lloyd_relaxation(original_diagram, voronoi);
    }
    let diagram = {};
    // rewrite edges and nodes
    // the problem with original d3 diagram is not only that node is array(2), but also is that
    // it has nodes duplicates! we are to "regather" all nodes
    diagram.nodes = [];
    diagram.edges = original_diagram.edges.map(edge => {
      let node_from, node_to;
      diagram.nodes.forEach(node => {
        if (VoronoiDiagram.seems_like_nodes_are_equal(node, edge[0])) {
          node_from = node;
        }
        if (VoronoiDiagram.seems_like_nodes_are_equal(node, edge[1])) {
          node_to = node;
        }
      });
      if (!node_from) {
        node_from = {x: edge[0][0], y: edge[0][1], cells: [], links: []};
        diagram.nodes.push(node_from);
      }
      if (!node_to) {
        node_to = {x: edge[1][0], y: edge[1][1], cells: [], links: []};
        diagram.nodes.push(node_to);
      }
      //node_from.links.push(node_to);
      Util.push_uniq(node_to, node_from.links);
      node_to.links.push(node_from);
      Util.push_uniq(node_from, node_to.links);

      Util.push_uniq(edge.left.data, node_from.cells);
      Util.push_uniq(edge.left.data, node_to.cells);
      if (edge.right) {
        Util.push_uniq(edge.right.data, node_from.cells);
        Util.push_uniq(edge.right.data, node_to.cells);
      }
      return {
        from: node_from,
        to: node_to,
        left: edge.left.data,
        right: edge.right ? edge.right.data : undefined,
      };
    });
    // rewrite cells
    diagram.cells = original_diagram.cells.map(orig_cell => {
      let cell = orig_cell.site.data; // original object!!! and we change it here!!!
      cell.nodes = diagram.nodes.filter(node => node.cells.indexOf(cell) != -1);
      cell.nodes.sort((n1, n2) => {
        let angle1 = Util.to_polar_coords(n1.x - cell.x, n1.y - cell.y).angle;
        let angle2 = Util.to_polar_coords(n2.x - cell.x, n2.y - cell.y).angle;
        return angle1 - angle2;
      })
      cell.halfedges = orig_cell.halfedges;
      cell.index = orig_cell.site.index;
      // !!! we rewrite origin coordinates that COULD change (after lloyd relaxation)
      cell.x = orig_cell.site[0];
      cell.y = orig_cell.site[1];
      return cell;
    });
    diagram.cells.forEach(cell => {
      let links = [];
      cell.halfedges.forEach(halfedge_index => {
        let halfedge = diagram.edges[halfedge_index];
        let link_site = halfedge.left == cell ? halfedge.right : halfedge.left;
        // near-border halfedges dont have right or left cell 
        if (!link_site) {
          return;
        }
        Util.push_uniq(diagram.cells[link_site.index], links);
      });
      // links sorted by distance -- from lowest to highest!
      links.sort((e1, e2) => Util.distance(cell, e1) - Util.distance(cell, e2));
      cell.links = links;
    });
    diagram.width = width;
    diagram.height = height;

    // final checks
    diagram.nodes.forEach(node => {
      /* its normal -- 4 or more nodes lie on circle
      if (node.links.length > 3) {
        console.log("ITS TOTAL DISASTER", node.x, node.y);
        node.links.forEach(e => console.log("DISASTER", e.x, e.y));
        //throw('ITS TOTAL DISASTER voronoi diagram');
      }
      */
      if (node.links.length < 2) {
        console.log("a little split", node.x, node.y, node.links);
        throw('ITS TOTAL DISASTER voronoi diagram');
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
  static find(point, diagram) {
    return Util.find_min_and_max(diagram.cells, e => Util.distance(point, e)).min_element;
  }


  static lloyd_relaxation(diagram, voronoi, to_move = 1) {
    let new_points = diagram.polygons().map(p => {
      // well, its not real lloyd relaxation, we move new cell center not to centroid, but move
      // it by value of 'to_move' to direction to centroid
      let poly = p.map(e => { return {x: e[0], y: e[1]} });
      let pf = Util.convex_polygon_centroid(poly);
      let res = Util.move_by_vector(p.data.x, p.data.y, pf.x, pf.y, to_move);
      return {x: res[0], y: res[1]};
    });
    return voronoi(new_points);
  }


  // PRIVATE. TRY to heal shizophrenia -- different, but very close nodes
  // but it can lead us to total 
  static seems_like_nodes_are_equal(node, old_node) {
    let very_close_is = 0.0000000000001;
    return Math.abs(node.x - old_node[0]) < very_close_is
        && Math.abs(node.y - old_node[1]) < very_close_is;
    //return node.x == old_node[0] && node.y == old_node[1];
  }
}
