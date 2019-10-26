import Util from 'common/util'
import RRTDiagram from 'geo/rrt_diagram'
import MapDrawer from 'geo/map_drawer'


/**
 *  generates rivers on graph
 */
export default class RiversAndLakesGenerator {
  static generate_by_edges(diagram, dry_factor = 0.5) {
    // only edges between non-linked rrt nodes
    const edges = diagram.edges.filter(edge => {
      if (!edge.right) return false
      const rrt_linked = RRTDiagram.check_linked(edge.right, edge.left)
      const sea_side = edge.right.geo_type == 'sea' || edge.left.geo_type == 'sea'
      return !rrt_linked && !sea_side
    })
    // gather river nodes and links between them
    const nodes = []; const river_roots = []; const
      river_ends = []
    // here we only gather links between nodes, nothing more
    edges.forEach(edge => {
      Util.for_all_consecutive_pairs([edge.from, edge.to], (node, link) => {
        Util.push_uniq(node, nodes)
        if (!node.river_links) node.river_links = []
        Util.push_uniq(link, node.river_links)
      })
    })
    // here we create rivers from river root nodes, add them to closed list, all others go to open list
    nodes.forEach(node => {
      node.river = {
        strength: 0,
        parents: [],
        children: [],
      }
      if (node.on_border) {
        river_ends.push(node)
      } else if (node.cells.some(cell => cell.geo_type == 'sea')) {
        river_ends.push(node)
      } else if (node.river_links.length == 1) {
        node.river.strength = Math.random() > dry_factor ? Util.rand(1, 10) : 0,
        river_roots.push(node)
      } else {
      }
    })

    river_ends.forEach(node => {
      RiversAndLakesGenerator.recursively_walk_from_ends(node, null)
    })

    river_roots.forEach(node => RiversAndLakesGenerator.recursively_add_strength(node, node.river.strength))

    // here we only delete temporary river_links prop!
    nodes.forEach(node => delete (node.river_links))

    return true
  }


  static recursively_walk_from_ends(node, from) {
    if (from) {
      Util.remove_element(node, from.river.children)
      from.river.parents.push(node)
      Util.remove_element(from, node.river.parents)
      node.river.children.push(from)
    }
    const all_but_from = node.river_links.filter(l => l != from)
    if (all_but_from.length > 1 && all_but_from.every(link => link.river.children.length)) {
      return
    }
    all_but_from.forEach(link => {
      RiversAndLakesGenerator.recursively_walk_from_ends(link, node)
    })
  }

  static recursively_add_strength(node, strength) {
    node.river.children.forEach(child => {
      child.river.strength += strength
      RiversAndLakesGenerator.recursively_add_strength(child, strength)
    })
  }
}
