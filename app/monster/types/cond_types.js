// @flow

export type cond = {
  type: "flag",
  name: string,
  what?: '==' | '!=' | '>=' | '<=' | '<' | '>', // @TODO remove ? set '==' by defaulf in the parses
  value: any, // actually string | numbler
}
