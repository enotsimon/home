// @flow
import type {id_mobile} from './mobile_types'
import type {cond} from './cond_types'
import type {id_dialog_cell} from './dialog_types'

export type id_scene = string

export type scene_name = string

export type scene_link = {
  id_scene: id_scene, // TODO maybe change it to 'id'?
  cond?: cond,
}

export type scene_dialogs = {
  talkers: Array<id_mobile>,
  node: id_dialog_cell, // TODO rename to id_cell or just id
}

export type scene = {
  name: scene_name,
  mobiles: Array<id_mobile>,
  furniture: Array<string>, // @FIXME Array<id_furniture>
  links: Array<scene_link>,
  dialogs: Array<scene_dialogs>,
}

export type scenes_config = {
  [id: id_scene]: scene
}
