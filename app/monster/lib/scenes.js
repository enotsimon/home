
import {check_conds_list} from './preconditions'

export const get_scene_available_links = (scene) => {
  return scene.links.filter(e => check_conds_list(e.cond)).map(link => link.id_scene)
}
