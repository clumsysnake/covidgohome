import AreaModel from '../models/AreaModel'

const areaModel1 = new AreaModel({
  name: 'bar',
  population: 100000,
  entries: [
    {
      date: 20200201,
      positive: 4,
      negative: 5,
      pending: 1
    },
    {
      date: 20200202,
      positive: 5,
      negative: 4,
      pending: 6
    }
  ],
})

const areaModel2 = new AreaModel({
  name: 'baz',
  population: 1000000,
  entries: [{
    date: 20200201,
    positive: 1,
    negative: 2,
    pending: 0
  }],
})

const unknownPopulationModel = new AreaModel({
  name: 'baz',
  population: null,
  entries: [{
    date: 20200201,
    positive: 1,
    negative: 1,
    pending: 0
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

describe('.fieldMax(areas, field, perMillion)', () => {
  it('returns max field in areas', () => {
    expect(AreaModel.fieldMax([areaModel1, areaModel2], 'positive')).toEqual(5)
  })

  it('returns max field in areas when perMillion with some areas not having listed population', () => {
    expect(AreaModel.fieldMax([areaModel1, unknownPopulationModel], 'positive', true)).toEqual(50)
  })
})

describe('#scaledSeries(scale)', () => {
  it('returns scaled series', () => {
    let scaled = areaModel2.scaledSeries(10)

    expect(scaled[0].positive).toEqual(0.1)
    expect(scaled[0].negative).toEqual(0.2)
  })

  it('returns correct scaled series on successive calls', () => {
    areaModel2.scaledSeries(5)
    areaModel2.scaledSeries(20)
    let scaled = areaModel2.scaledSeries(100)

    expect(scaled[0].positive).toEqual(0.01)
    expect(scaled[0].negative).toEqual(0.02)
  })
})

describe('#scaledToPercentage', () => {
  it('scales each entry such that pending+positive+negative = 100 ', () => {
    let series = areaModel1.scaledToPercentage()

    expect(series[0].positive).toEqual(40)
    expect(series[0].negative).toEqual(50)
    expect(series[0].pending).toEqual(10)
    expect(series[1].positive).toEqual(500/15)
    expect(series[1].negative).toEqual(400/15)
    expect(series[1].pending).toEqual(600/15)
    
  })
})