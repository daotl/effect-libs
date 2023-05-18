export const methods = [
  'all',
  'get',
  'post',
  'put',
  'delete',
  'patch',
  'options',
  'head',
] as const

export type Method = typeof methods[number]
