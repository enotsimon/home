// @flow
import type {id_item} from './item_types'

export type id_container = string

export type container = {
  id: id_container,
  items: Array<id_item>,
}
