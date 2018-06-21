// @flow
import type {id_item, item} from './item_types'

export type id_container = string

export type container = {
  id: id_container,
  items: Array<id_item>,
}

// here???
export type containers_config = {
  [id: id_container]: {
    items: Array<item>,
  },
}
