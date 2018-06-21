// @flow

export type id_mobile = string

export type mobile = {
  name: string,
  race: string, // enum?
}

export type mobiles_config = {
  [id: id_mobile]: mobile
}
