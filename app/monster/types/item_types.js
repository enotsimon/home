// @flow
import type {id_mobile} from './mobile_types'
import type {id_container} from './container_types'

export type id_item = string
export type item_type = string // ?

export type item = {
  id: id_item,
  type: item_type,
  id_container: id_container, // backlink?
  owner: id_mobile,
}
