import Util from 'common/util'

class RRTNode {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.rrt_links = []
    this.generation = null
    this.branch_order = null
  }
}


export default class RRTDiagram {
  constructor(x_size, y_size) {
    this.nodes = []
    this.x_size = x_size
    this.y_size = y_size
  }

  get_generation(generation) {
    return this.nodes.filter(node => node.generation == generation)
  }

  generations_count() {
    return Util.find_min_and_max(this.nodes, node => node.generation).max
  }

  static check_linked(n1, n2) {
    return n1.rrt_links.indexOf(n2) != -1
  }

  // TODO
  generate(epsilon, count = Infinity, reject_limit = 500) {
    this.epsilon = epsilon // for rrt_links rebuild
    this.nodes.push(new RRTNode(Util.rand(1, this.x_size - 1), Util.rand(1, this.y_size - 1)))
    if (count < 0) {
      throw (`bad number of nodes given: ${count}`)
    }
    let reject_counter = 0

    while (count && reject_counter < reject_limit) {
      const random = { x: Util.rand(1, this.x_size - 1), y: Util.rand(1, this.y_size - 1) }


      const nearest = RRTDiagram.find_nearest_node(random, this.nodes)

      // we calc distance second time, but i dont care...

      const distance = RRTDiagram.distance(random, nearest)
      // distance === 0 -- if we choosed existing point
      if (distance < epsilon * epsilon || distance === 0) {
        reject_counter++
        continue
      }
      const theta = Math.atan2(random.y - nearest.y, random.x - nearest.x)
      const node = new RRTNode(
        Math.round(nearest.x + epsilon * Math.cos(theta)),
        Math.round(nearest.y + epsilon * Math.sin(theta)),
      )
      this.nodes.push(node)
      RRTDiagram.link_two_nodes(node, nearest)
      reject_counter = 0
      count--
    }
    this.calc_branches_length_and_generations()
  }


  // TODO move it to Util?
  static find_nearest_node(target, nodes) {
    if (!nodes[0]) {
      throw ('no nodes')
    }
    let nearest = nodes[0]


    let nearestDistance = RRTDiagram.distance(target, nearest)
    for (const i in nodes) {
      const d = RRTDiagram.distance(nodes[i], target)
      if (d < nearestDistance) {
        nearest = nodes[i]
        nearestDistance = d
      }
    }
    return nearest
  }

  // PRIVATE
  static link_two_nodes(n1, n2) {
    Util.push_uniq(n1, n2.rrt_links)
    Util.push_uniq(n2, n1.rrt_links)
  }

  // PRIVATE
  static delink_two_nodes(n1, n2) {
    Util.remove_element(n1, n2.rrt_links)
    Util.remove_element(n2, n1.rrt_links)
  }


  static get_parent(node) {
    const ret = node.rrt_links.filter(n => n.generation < node.generation)
    if (!ret.length) return null // historically it is null
    if (ret.length != 1) {
      console.log('more than one parent', node)
      throw ('more than one parent')
    }
    return ret[0]
  }


  // PRIVATE
  static distance(a, b) {
    const dx = a.x - b.x


    const dy = a.y - b.y
    return dx * dx + dy * dy
  }


  remove_some_links_and_recalc_all(count, min, max) {
    const nodes_to_process = this.nodes.filter(node => node.branch_order >= min && node.branch_order <= max)
    if (nodes_to_process.length < count) {
      throw (`cant remove_some_links_and_recalc_all() count ${count} cause only ${nodes_to_process.length} sutable nodes`)
    }
    nodes_to_process.sort(() => 0.5 - Math.random())
    const deleted_links = []
    for (let i = 0; i < count; i++) {
      const from = nodes_to_process[i]
      const to = from.rrt_links.find(link => link.branch_order >= min - 1 && link.branch_order <= max + 1)
      if (!to) {
        throw ('strange, not found sutable link')
      }
      RRTDiagram.delink_two_nodes(from, to)
      deleted_links.push([from, to])
    }
    this.calc_branches_length_and_generations()
    return deleted_links
  }

  restore_removed_links(deleted_links) {
    deleted_links.forEach(([from, to]) => RRTDiagram.link_two_nodes(from, to))
    this.calc_branches_length_and_generations()
  }


  calc_branches_length_and_generations() {
    // reset all prev values
    this.nodes.forEach(node => {
      node.generation = null
      node.branch_order = null
      node.longest_branch = null
    })

    this.nodes.forEach(node => {
      node.branch_length = 0
      this.recursively_set_branch_length(node)
      node.longest_branch = Util.find_min_and_max(this.nodes, e => e.branch_length).max
      this.nodes.forEach(e => delete (e.branch_length))
    })

    // we choose local minimum nodes (by longest_branch) and they would be our diagram's "centers"
    const centers = []
    this.nodes.forEach(node => {
      const local_minimum = node.rrt_links.every(link => link.longest_branch >= node.longest_branch)
      const no_center_nearby = node.rrt_links.every(link => centers.indexOf(link) == -1)
      if (local_minimum && no_center_nearby) centers.push(node)
    })
    // and write path length from it to each node
    this.nodes.forEach(node => node.generation = null)
    centers.forEach(center => {
      center.generation = 0
      this.recursively_set_generation(center)
    })
    // calc branch_order ONLY after calc generations
    // FIXME sometimes diff between center and some near node is 2
    const leaf_nodes = this.nodes.filter(node => node.rrt_links.length == 1)
    leaf_nodes.forEach(node => {
      node.branch_order = 0
      this.recursively_calc_branch_order(node)
    })
  }


  recursively_set_generation(node) {
    const filtered = node.rrt_links.filter(link => link.generation == null)
    // we set link.generation and add them to closed list
    filtered.forEach(link => link.generation = node.generation + 1)
    // and AFTER we call recursively_set_generation on it!
    filtered.forEach(link => this.recursively_set_generation(link))
  }

  // TODO too bad its absolutely like recursively_set_generation()
  recursively_set_branch_length(node) {
    const filtered = node.rrt_links.filter(link => link.branch_length == null)
    filtered.forEach(link => link.branch_length = node.branch_length + 1)
    filtered.forEach(link => this.recursively_set_branch_length(link))
  }


  recursively_calc_branch_order(node) {
    // link.generation != 0 -- diagram 'center' nodes work like 'stops'
    const filtered = node.rrt_links.filter(link => {
      const parent = link.generation < node.generation
      const lesser_branch_order = link.branch_order == null || link.branch_order < node.branch_order + 1
      return parent && lesser_branch_order
    })
    if (filtered.length > 1) {
      throw ('seens like several parents')
    }
    filtered.forEach(link => link.branch_order = node.branch_order + 1)
    filtered.forEach(link => this.recursively_calc_branch_order(link))
  }
}
