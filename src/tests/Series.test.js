import Series from '../models/Series'

function make(...args) {
  return new Series(...args)
}

let frames1 = [
  {
    date: 20200201,
    positives: 4,
    negatives: 5
  },
  {
    date: 20200202,
    positives: 5,
    negatives: 8,
  }
]

let weird_keys = [
  {
    date: 20200201,
    jerome: 10,
    positives: 20
  }
]

let negative_toggle = [
  {
    date: 20200201,
    positives: 20,
    inICU: -10
  }
]

let with_derived = [
  {
    date: 20200201,
    positives: 20,
    pending: 20
  }
]

describe('Series', () => {
  describe('constructor', () => {
    it("doesn't error when given normal arguments", () => {
      make(frames1)
    })

    it('errors when given any unknown field not in Series.ALL', () => {
      expect(() => { make(weird_keys) }).toThrow(TypeError)
    })

    it('errors when given any known derived field not in Series.FUNDAMENTAL', () => {
      expect(() => { make(with_derived) }).toThrow(TypeError)
    })

    it('errors when given any field not in Series.ALL', () => {
      expect(() => { make(weird_keys) }).toThrow(TypeError)
    })

    it('errors when any toggle field is below 0', () => {
      expect(() => { make(negative_toggle) }).toThrow(TypeError)
    })

    // pending('makes a copy of frame data')

    //TODO: i *think* we should set everything to null...
    // pending('does not create any field not given it') 

    // pending('populates derived metrics')
    // pending('derived metrics are set to null if not possible to derive')
  })

  describe('scale(x)', () => {
    it('scale(1).frames returns the same frames', () => {
      let s = make(frames1)
      expect(s.frames).toEqual(s.scale(1).frames)
    })

    it('later .frames calls return all fields scaled up by scale', () => {
      let frames = make(frames1).scale(10).frames

      expect(frames[0].positives).toEqual(40)
      expect(frames[0].negatives).toEqual(50)
      expect(frames[1].positives).toEqual(50)
      expect(frames[1].negatives).toEqual(80)
    })

    it('later .frames calls same date', () => {
      let s = make(frames1)
      let origDate = s.frames[0].date
      expect(s.scale(10).frames[0].date).toEqual(origDate)
    })
  })

  describe('deltize()', () => {
    it('deltize().frames return all metrics as difference with previous', () => {
      let frames = make(frames1).deltize().frames

      expect(frames[1].positives).toEqual(1)
      expect(frames[1].negatives).toEqual(3)
    })

    it('deltize().frames return first frame as all null (no previous)', () => {
      let frames = make(frames1).deltize().frames

      expect(frames[0].positives).toEqual(null)
      expect(frames[0].negatives).toEqual(null)
    })
  })

  describe('deltaPercentize()', () => {
    it('deltaPercentize().frames return all fields as percentage difference with previous', () => {
      let frames = make(frames1).deltaPercentize().frames

      expect(frames[1].positives).toEqual(25)
      expect(frames[1].negatives).toEqual(60)
    })
    it('deltaPercentize().frames return first frames as all null (no previous)', () => {
      let frames = make(frames1).deltaPercentize().frames

      expect(frames[0].positives).toEqual(null)
      expect(frames[0].negatives).toEqual(null)
    })
  })

  //pending: for deltize and deltapercentize, test if curr and/or prev are null

  //pending: average() transform! not sure its correct!
  //pending: squared() transform test
  //pending: date exists for all frames
  //pending; each date field is sequential from the previous
  //pending: each date field is in the proper format (if we define one)
  //pending: confirm all metrics are integers
  //pending: confirm that COUNTS never goes down frame to frame
  //pending: confirm equalities and inequalities between fields.

  //TODO: again, i think maybe all metrics should just be defined, atleast as null...
  //pending('all the transforms dont create any fields that aren't defined')

  //pending('all the transforms set to null when cannot make a finite value')
  //pending: stuff about rates! I just dont know what final behavior will be yet.

  //INDEXES is an array of keys
  //TOGGLES is an array of keys
  //COUNTS is an array of keys 
})
