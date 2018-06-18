// @flow
import type {id_mobile} from './mobile_types'
import type {cond} from './cond_types'

export type id_dialog_cell = string

export type dialog_cell_car =
  null
  | id_dialog_cell
  | dialog_cell_car_phrase
  | dialog_cell_car_choose

export type dialog_cell_car_phrase = {type: 'phrase', mobile: id_mobile, phrase: string}
export type dialog_cell_car_choose = {type: 'choose', ids: Array<id_dialog_cell>}

export type dialog_cell_cdr = null | id_dialog_cell

export type dialog_cell_after = {
  type: 'flag',
  name: string,
  value: any,
}

export type dialog_cell = {
  id: id_dialog_cell,
  cond: ?cond,
  car: dialog_cell_car,
  cdr: dialog_cell_cdr,
  before: string, // TODO
  after: dialog_cell_after,
}

export type dialogs_config = Array<dialog_cell>

// 
export type dialogs_raw_config_element = any // @FIXME!!! Array<Object> | Object
