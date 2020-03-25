import AreaModel from '../models/AreaModel'

const areaModel1 = new AreaModel({
  name: 'bar',
  entries: [
    {
      date: 20200201,
      positive: 4,
      negative: 5
    },
    {
      date: 20200202,
      positive: 5,
      negative: 4
    }
  ],
})

const areaModel2 = new AreaModel({
  name: 'baz',
  entries: [{
    date: 20200201,
    positive: 1,
    negative: 2 
  }],
})


it('creates aggregate with correct values', () => {
  var model = AreaModel.createAggregate('foo', [areaModel1, areaModel2])

  expect(model.name).toEqual('foo');
  expect(model.entries[0].date).toEqual(20200201);
  expect(model.entries[0].positive).toEqual(5);
  expect(model.entries[0].negative).toEqual(7);
  expect(model.entries[1].date).toEqual(20200202);
  expect(model.entries[1].positive).toEqual(5);
  expect(model.entries[1].negative).toEqual(4);
})

describe('.domainMax(areas, field)', () => {
  it('returns max field in areas', () => {
    expect(AreaModel.fieldMax([areaModel1, areaModel2], 'positive')).toEqual(5)
  })
})