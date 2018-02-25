import game from '../monster'
import {check_preconditions} from './preconditions'
import {apply_consequences} from './consequences'

export const get_scene_available_links = (scene) => {
  return scene.links.filter(check_preconditions).map(link => link.id_scene)
}
