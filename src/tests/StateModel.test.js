import StateModel from '../models/StateModel'

describe('initialization', () => {
  it('sets name when passed only name', () => {
    const model = new StateModel({name: 'foo', entries: []})
    expect(model.name).toEqual('foo')
  })

  it('sets name correctly when passed abbrev', () => {
    const model = new StateModel({abbrev: 'WA',  entries: []})
    expect(model.name).toEqual('Washington')
  })
})
