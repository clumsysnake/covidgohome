import AreaModel from '../models/AreaModel'

const areaModel1 = new AreaModel({
  name: 'bar',
  population: 100000,
  frames: [
    {
      date: 20200201,
      positives: 4,
      negatives: 5,
      collections: 1
    },
    {
      date: 20200202,
      positives: 5,
      negatives: 4,
      collections: 6
    }
  ],
})

const areaModel2 = new AreaModel({
  name: 'baz',
  population: 1000000,
  frames: [{
    date: 20200201,
    positives: 1,
    negatives: 2,
    collections: 0
  }],
})

const unknownPopulationModel = new AreaModel({
  name: 'baz',
  population: null,
  frames: [{
    date: 20200201,
    positives: 1,
    negatives: 1,
    collections: 0
  }],
})


it('creates aggregate with correct values', () => {
  let model = AreaModel.createAggregate('foo', [areaModel1, areaModel2])
  let frames = model.series.frames


  expect(model.name).toEqual('foo');
  expect(frames[0].date).toEqual(20200201);
  expect(frames[0].positives).toEqual(5);
  expect(frames[0].negatives).toEqual(7);
  expect(frames[1].date).toEqual(20200202);
  expect(frames[1].positives).toEqual(5);
  expect(frames[1].negatives).toEqual(4);
})

// describe('.fieldMax(areas, field, perMillion)', () => {
//   it('returns max field in areas', () => {
//     expect(AreaModel.fieldMax([areaModel1, areaModel2], 'positives')).toEqual(5)
//   })

//   it('returns max field in areas when perMillion with some areas not having listed population', () => {
//     expect(AreaModel.fieldMax([areaModel1, unknownPopulationModel], 'positives', 'per-1m')).toEqual(50)
//   })
// })